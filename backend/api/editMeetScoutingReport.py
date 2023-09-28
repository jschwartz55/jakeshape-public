import json
import boto3
from datetime import datetime
from statistics import mean
import concurrent.futures
import traceback
import logging
import os

logger = logging.getLogger()
logger.setLevel(logging.INFO)


dynamodb_client = boto3.client('dynamodb')
sagemaker_runtime_client = boto3.client('sagemaker-runtime')


def get_headers():
    return {
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    }


def get_response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': get_headers(),
        'body': body
    }


def get_DOTS(total, bw, is_female):
    maleCoeff = [
        -307.75076,
        24.0900756,
        -0.1918759221,
        0.0007391293,
        -0.000001093,
    ]
    femaleCoeff = [
        -57.96288,
        13.6175032,
        -0.1126655495,
        0.0005158568,
        -0.0000010706,
    ]

    coeff = femaleCoeff if is_female else maleCoeff
    denominator = coeff[0]

    for i in range(1, len(coeff)):
        denominator += coeff[i] * bw ** i

    return round((500 / denominator) * total, 2)


def to_text_csv(features_dict):
    return ','.join([str(value) if value else '' for key, value in sorted(features_dict.items())])


def get_prediction(endpointName, body):
    response = sagemaker_runtime_client.invoke_endpoint(
        EndpointName=endpointName,
        ContentType='text/csv',
        Body=body
    )['Body'].read().decode()

    return round(float(response) / 2.5) * 2.5 if endpointName != 'jakeshape-performance-predictor-bodyweight-endpoint' else round(float(response), 2)


def get_predictions(squat_features, bench_features, deadlift_features, bodyweight_features):
    with concurrent.futures.ThreadPoolExecutor() as executor:
        squat_future = executor.submit(
            get_prediction, 'jakeshape-performance-predictor-squat-endpoint', to_text_csv(squat_features))
        bench_future = executor.submit(
            get_prediction, 'jakeshape-performance-predictor-bench-endpoint', to_text_csv(bench_features))
        deadlift_future = executor.submit(
            get_prediction, 'jakeshape-performance-predictor-deadlift-endpoint', to_text_csv(deadlift_features))
        bodyweight_future = executor.submit(
            get_prediction, 'jakeshape-performance-predictor-bodyweight-endpoint', to_text_csv(bodyweight_features))

        squat_response = squat_future.result()
        bench_response = bench_future.result()
        deadlift_response = deadlift_future.result()
        bodyweight_response = bodyweight_future.result()

    return squat_response, bench_response, deadlift_response, bodyweight_response


def split_features(target_meet_features):

    base_features = {key: value for key, value in target_meet_features.items() if key in ['Age', 'WeightClassKg', 'AgeSquared'] or 'DaysSincePreviousMeet' in key or
                     'PreviousMeetBodyweight' in key or
                     'PreviousMeetWeightClass' in key or
                     'NumberOfPreviousMeets' in key or
                     'AverageBodyweight' in key or
                     'Sex' in key or
                     'Dots' in key or
                     'Total' in key}

    squat_features = base_features.copy()
    bench_features = base_features.copy()
    deadlift_features = base_features.copy()

    for feature in target_meet_features:
        if 'Squat' in feature:
            squat_features[feature] = target_meet_features[feature]
        if 'Bench' in feature:
            bench_features[feature] = target_meet_features[feature]
        if 'Deadlift' in feature:
            deadlift_features[feature] = target_meet_features[feature]

    return squat_features, bench_features, deadlift_features, base_features


def set_target_meet_columns(target_meet, metrics):
    filters = ['_N', '_W', '_WE']

    for filter in filters:
        target_meet[f'DaysSincePreviousMeet{filter}'] = None
        target_meet[f'PreviousMeetBodyweight{filter}'] = None
        target_meet[f'PreviousMeetWeightClass{filter}'] = None
        target_meet[f'NumberOfPreviousMeets{filter}'] = None
        target_meet[f'AverageBodyweight{filter}'] = None
        for metric in metrics:
            target_meet[f'BestPrevious{metric}{filter}'] = None
            target_meet[f'DaysSinceBestPrevious{metric}{filter}'] = None
            target_meet[f'Average{metric}{filter}'] = None
            target_meet[f'PreviousMeet{metric}{filter}'] = None
            if metric != 'Dots':
                target_meet[f'PreviousMeetWeighted{metric}{filter}'] = None
                target_meet[f'BestPreviousWeighted{metric}{filter}'] = None
                target_meet[f'DaysSinceBestPreviousWeighted{metric}{filter}'] = None
                target_meet[f'PreviousMeetWeightedChange{metric}{filter}'] = None
                target_meet[f'PreviousMeetAverageWeightedChange{metric}{filter}'] = None


def engineer_features(target_meet, past_meets, target_meet_date):

    metrics = ['Squat', 'Bench', 'Deadlift', 'Total', 'Dots']

    past_meets_N = past_meets
    past_meets_W = [
        meet for meet in past_meets if meet['WeightClassKg'] == target_meet['WeightClassKg']]
    past_meets_WE = [meet for meet in past_meets if meet['WeightClassKg'] ==
                     target_meet['WeightClassKg'] and meet['Equipment'] == target_meet['Equipment']]

    past_meets = {
        '_N': past_meets_N,
        '_W': past_meets_W,
        '_WE': past_meets_WE
    }

    set_target_meet_columns(target_meet, metrics)

    for filter in past_meets:

        if not past_meets[filter]:
            continue

        previous_meet = past_meets[filter][0]

        target_meet[f'DaysSincePreviousMeet{filter}'] = float(
            (target_meet_date - previous_meet['Date']).days)
        target_meet[f'PreviousMeetBodyweight{filter}'] = previous_meet['BodyweightKg']
        target_meet[f'PreviousMeetWeightClass{filter}'] = previous_meet['WeightClassKg']
        target_meet[f'NumberOfPreviousMeets{filter}'] = len(past_meets[filter])
        target_meet[f'AverageBodyweight{filter}'] = mean(
            [meet['BodyweightKg'] for meet in past_meets[filter]])

        for metric in metrics:
            metric_col = metric if metric == 'Dots' else f'Best3{metric}Kg'

            best_previous_metric_meet = max(
                past_meets[filter], key=lambda meet: meet[metric_col])
            target_meet[f'BestPrevious{metric}{filter}'] = best_previous_metric_meet[metric_col]
            target_meet[f'DaysSinceBestPrevious{metric}{filter}'] = (
                target_meet_date - best_previous_metric_meet['Date']).days

            target_meet[f'Average{metric}{filter}'] = mean(
                [meet[metric_col] for meet in past_meets[filter]])

            target_meet[f'PreviousMeet{metric}{filter}'] = previous_meet[metric_col]

            if metric != 'Dots':
                target_meet[f'PreviousMeetWeighted{metric}{filter}'] = previous_meet[metric_col] / \
                    previous_meet['BodyweightKg']

                best_previous_weighted_metric = max(
                    past_meets[filter], key=lambda meet: meet[metric_col] / meet['BodyweightKg'])
                target_meet[f'BestPreviousWeighted{metric}{filter}'] = best_previous_weighted_metric[metric_col] / \
                    best_previous_weighted_metric['BodyweightKg']
                target_meet[f'DaysSinceBestPreviousWeighted{metric}{filter}'] = (
                    target_meet_date - best_previous_weighted_metric['Date']).days

                target_meet[f'PreviousMeetWeightedChange{metric}{filter}'] = ((previous_meet[metric_col] / previous_meet['BodyweightKg']) - (
                    past_meets[filter][1][metric_col] / past_meets[filter][1]['BodyweightKg'])) if len(past_meets[filter]) > 1 else None

                weighted_metric_changes = []
                for i in range(1, len(past_meets[filter])):
                    current_weighted_metric = past_meets[filter][i -
                                                                 1][metric_col] / past_meets[filter][i-1]['BodyweightKg']
                    previous_weighted_metric = past_meets[filter][i][metric_col] / \
                        past_meets[filter][i]['BodyweightKg']
                    weighted_metric_changes.append(
                        current_weighted_metric - previous_weighted_metric)

                target_meet[f'PreviousMeetAverageWeightedChange{metric}{filter}'] = mean(
                    weighted_metric_changes) if weighted_metric_changes else None

    previous_meet = past_meets['_N'][0]

    age_difference_years = target_meet_date.year - previous_meet['Date'].year

    if (target_meet_date.month, target_meet_date.day) < (previous_meet['Date'].month, previous_meet['Date'].day):
        age_difference_years -= 1

    target_meet['Age'] = float(
        float(previous_meet['Age']) + age_difference_years)
    target_meet['AgeSquared'] = target_meet['Age']**2
    target_meet['Sex_M'] = 1 if previous_meet['Sex'] == 'M' else 0
    target_meet['Sex_F'] = 1 if previous_meet['Sex'] == 'F' else 0

    drop_columns = ['OpenPowerliftingId', 'Equipment']
    for column in drop_columns:
        del target_meet[column]
    return target_meet


def get_weight_class_numeric(weight_class):
    return float(weight_class[:-1]) + 10 if weight_class.endswith('+') else float(weight_class)


def process_past_meets(past_meets):

    for meet in past_meets:
        meet['Date'] = datetime.strptime(str(meet['Date']), '%Y-%m-%d').date()

    past_meets.sort(key=lambda meet: meet['Date'], reverse=True)

    for meet in past_meets:
        meet['WeightClassString'] = meet['WeightClassKg']
        meet['WeightClassKg'] = get_weight_class_numeric(meet['WeightClassKg'])

    numeric_columns = ['Best3SquatKg', 'Best3BenchKg', 'Best3DeadliftKg',
                       'Best3TotalKg', 'Dots', 'BodyweightKg', 'Age']

    for column in numeric_columns:
        for meet in past_meets:
            meet[column] = float(meet[column])


def get_past_meets_details(open_powerlifting_id, target_meet_date, open_powerlifting_table_name):
    past_meets = dynamodb_client.query(
        TableName=open_powerlifting_table_name,
        KeyConditionExpression='OpenPowerliftingId = :value',
        ExpressionAttributeValues={
            ':value': {'S': open_powerlifting_id}
        }
    )['Items']

    for meet in past_meets:
        for key, value in meet.items():
            if isinstance(value, dict) and 'S' in value:
                meet[key] = value['S']

    def get_past_meets_error(error_type):
        error_message_map = {
            'DIS': 'Athlete disambiguation required',
            'MIS': 'Athlete could not be found',
            'DAT': 'Athlete prediction could not be made'
        }
        return [], error_type, error_message_map[error_type]

    if not past_meets:
        past_meets = dynamodb_client.query(
            TableName=open_powerlifting_table_name,
            KeyConditionExpression='OpenPowerliftingId = :value',
            ExpressionAttributeValues={
                ':value': {'S': open_powerlifting_id + '1'}
            }
        )['Items']
        if past_meets:
            return get_past_meets_error('DIS')

        return get_past_meets_error('MIS')

    if target_meet_date <= datetime.strptime(str(past_meets[0]['Date']), '%Y-%m-%d').date():
        return get_past_meets_error('DAT')

    return past_meets, None, None


def get_athlete_details(target_meet, target_meet_date, open_powerlifting_table_name):

    logger.info('Getting past meets...')
    past_meets, error_type, message = get_past_meets_details(
        target_meet['openPowerliftingId'], target_meet_date, open_powerlifting_table_name)

    if past_meets:
        logger.info('Got past meets')
        process_past_meets(past_meets)

        logger.info('Engineering features...')
        target_meet_features = engineer_features({'OpenPowerliftingId': target_meet['openPowerliftingId'], 'WeightClassKg': get_weight_class_numeric(
            target_meet['weightClass']), 'Equipment': target_meet['equipment']}, past_meets, target_meet_date)
        logger.info('Successfully engineered features')

        logger.info('Splitting features...')
        squat_features, bench_features, deadlift_features, bodyweight_features = split_features(
            target_meet_features)
        logger.info('Done splitting features')

        logger.info('Getting predictions...')
        squat_response, bench_response, deadlift_response, bodyweight_response = get_predictions(
            squat_features, bench_features, deadlift_features, bodyweight_features)
        logger.info('Done getting predictions')

        past_meets = [{
            'date': past_meet['Date'].strftime('%m/%d/%Y'),
            'age': round(past_meet['Age'] * 2) / 2,
            'bestSquat': past_meet['Best3SquatKg'],
            'bestBench': past_meet['Best3BenchKg'],
            'bestDeadlift': past_meet['Best3DeadliftKg'],
            'total': past_meet['Best3TotalKg'],
            'dots': past_meet['Dots'],
            'bodyweight': past_meet['BodyweightKg'],
            'equipment': past_meet['Equipment'],
            'weightClass': past_meet['WeightClassString']} for past_meet in past_meets]

        total = squat_response + bench_response + deadlift_response

        target_meet.update({
            'age': round(target_meet_features['Age'] * 2) / 2,
            'pastMeets': past_meets,
            'squat': squat_response,
            'bench': bench_response,
            'deadlift': deadlift_response,
            'total': total,
            'dots': get_DOTS(total, bodyweight_response, target_meet_features['Sex_F']),
            'bodyweight': bodyweight_response,
            'sex': 'F' if target_meet_features['Sex_F'] else 'M',
            'dataFound': True,
            'errorType': None,
            'message': 'Found past meets'
        })
    else:
        logger.info('Could not find past meets')
        target_meet.update({
            'message': message,
            'errorType': error_type,
            'dataFound': False
        })

    return target_meet


def get_open_powerlifting_table_name():
    table_names = dynamodb_client.list_tables()['TableNames']

    filtered_table_names = [
        name for name in table_names if name.startswith('jakeshape-open-powerlifting-v') and name.endswith(os.environ['ENV'])]

    return max(
        filtered_table_names, key=lambda name: int(name.split('-v')[1].split('-')[0]))


def handler(event, context):
    try:
        open_powerlifting_id = event['queryStringParameters']['openPowerliftingId']
        weight_class = event['queryStringParameters']['weightClass']
        equipment = event['queryStringParameters']['equipment']
        target_meet_date = event['queryStringParameters']['meetDate']

        logger.info('Getting OpenPowerlifting DynamoDB table name...')
        open_powerlifting_table_name = get_open_powerlifting_table_name()
        logger.info(f'Found DynamoDB table {open_powerlifting_table_name}')

        logger.info('Getting athlete details...')
        athlete_details = get_athlete_details({
            'openPowerliftingId': open_powerlifting_id,
            'weightClass': weight_class,
            'equipment': equipment
        }, datetime.strptime(
            target_meet_date, '%m/%d/%Y').date(), open_powerlifting_table_name)
        logger.info('Successfully retreived athlete information')

        return get_response(200, json.dumps(athlete_details))

    except Exception as e:
        logger.error(f'An error occurred: {str(e)}')
        logger.error(traceback.format_exc())

        return get_response(500, json.dumps(f'Error: An unknown error occured'))
