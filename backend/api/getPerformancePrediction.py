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


class GetPerformancePredictionException(Exception):
    def __init__(self, message):
        super().__init__(message)
        self.message = message


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
        'body': body,
        'headers': get_headers(),
    }


def get_prediction(endpointName, body):
    response = sagemaker_runtime_client.invoke_endpoint(
        EndpointName=endpointName,
        ContentType='text/csv',
        Body=body
    )['Body'].read().decode()
    return round(float(response) / 2.5) * 2.5


def to_text_csv(features_dict):
    return ','.join([str(value) if value else '' for key, value in sorted(features_dict.items())])


def get_predictions(squat_features, bench_features, deadlift_features):
    with concurrent.futures.ThreadPoolExecutor() as executor:
        squat_future = executor.submit(
            get_prediction, 'jakeshape-performance-predictor-squat-endpoint', to_text_csv(squat_features))
        bench_future = executor.submit(
            get_prediction, 'jakeshape-performance-predictor-bench-endpoint', to_text_csv(bench_features))
        deadlift_future = executor.submit(
            get_prediction, 'jakeshape-performance-predictor-deadlift-endpoint', to_text_csv(deadlift_features))

        squat_response = squat_future.result()
        bench_response = bench_future.result()
        deadlift_response = deadlift_future.result()

    return squat_response, bench_response, deadlift_response


def split_features(next_meet):

    base_features = {key: value for key, value in next_meet.items() if key in ['Age', 'WeightClassKg', 'AgeSquared'] or 'DaysSincePreviousMeet' in key or
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

    for feature in next_meet:
        if 'Squat' in feature:
            squat_features[feature] = next_meet[feature]
        if 'Bench' in feature:
            bench_features[feature] = next_meet[feature]
        if 'Deadlift' in feature:
            deadlift_features[feature] = next_meet[feature]

    return squat_features, bench_features, deadlift_features


def set_next_meet_columns(next_meet, metrics):
    filters = ['_N', '_W', '_WE']

    for filter in filters:
        next_meet[f'DaysSincePreviousMeet{filter}'] = None
        next_meet[f'PreviousMeetBodyweight{filter}'] = None
        next_meet[f'PreviousMeetWeightClass{filter}'] = None
        next_meet[f'NumberOfPreviousMeets{filter}'] = None
        next_meet[f'AverageBodyweight{filter}'] = None
        for metric in metrics:
            next_meet[f'BestPrevious{metric}{filter}'] = None
            next_meet[f'DaysSinceBestPrevious{metric}{filter}'] = None
            next_meet[f'Average{metric}{filter}'] = None
            next_meet[f'PreviousMeet{metric}{filter}'] = None
            if metric != 'Dots':
                next_meet[f'PreviousMeetWeighted{metric}{filter}'] = None
                next_meet[f'BestPreviousWeighted{metric}{filter}'] = None
                next_meet[f'DaysSinceBestPreviousWeighted{metric}{filter}'] = None
                next_meet[f'PreviousMeetWeightedChange{metric}{filter}'] = None
                next_meet[f'PreviousMeetAverageWeightedChange{metric}{filter}'] = None
    return next_meet


def engineer_features(next_meet, past_meets):

    metrics = ['Squat', 'Bench', 'Deadlift', 'Total', 'Dots']

    past_meets_N = past_meets
    past_meets_W = [
        meet for meet in past_meets if meet['WeightClassKg'] == next_meet['WeightClassKg']]
    past_meets_WE = [meet for meet in past_meets if meet['WeightClassKg'] ==
                     next_meet['WeightClassKg'] and meet['Equipment'] == next_meet['Equipment']]

    past_meets = {
        '_N': past_meets_N,
        '_W': past_meets_W,
        '_WE': past_meets_WE
    }

    next_meet = set_next_meet_columns(next_meet, metrics)

    for filter in past_meets:

        if not past_meets[filter]:
            continue

        previous_meet = past_meets[filter][0]

        next_meet[f'DaysSincePreviousMeet{filter}'] = float(
            (next_meet['Date'] - previous_meet['Date']).days)
        next_meet[f'PreviousMeetBodyweight{filter}'] = previous_meet['BodyweightKg']
        next_meet[f'PreviousMeetWeightClass{filter}'] = previous_meet['WeightClassKg']
        next_meet[f'NumberOfPreviousMeets{filter}'] = len(past_meets[filter])
        next_meet[f'AverageBodyweight{filter}'] = mean(
            [meet['BodyweightKg'] for meet in past_meets[filter]])

        for metric in metrics:
            metric_col = metric if metric == 'Dots' else f'Best3{metric}Kg'

            best_previous_metric_meet = max(
                past_meets[filter], key=lambda meet: meet[metric_col])
            next_meet[f'BestPrevious{metric}{filter}'] = best_previous_metric_meet[metric_col]
            next_meet[f'DaysSinceBestPrevious{metric}{filter}'] = (
                next_meet['Date'] - best_previous_metric_meet['Date']).days

            next_meet[f'Average{metric}{filter}'] = mean(
                [meet[metric_col] for meet in past_meets[filter]])

            next_meet[f'PreviousMeet{metric}{filter}'] = previous_meet[metric_col]

            if metric != 'Dots':
                next_meet[f'PreviousMeetWeighted{metric}{filter}'] = previous_meet[metric_col] / \
                    previous_meet['BodyweightKg']

                best_previous_weighted_metric = max(
                    past_meets[filter], key=lambda meet: meet[metric_col] / meet['BodyweightKg'])
                next_meet[f'BestPreviousWeighted{metric}{filter}'] = best_previous_weighted_metric[metric_col] / \
                    best_previous_weighted_metric['BodyweightKg']
                next_meet[f'DaysSinceBestPreviousWeighted{metric}{filter}'] = (
                    next_meet['Date'] - best_previous_weighted_metric['Date']).days

                next_meet[f'PreviousMeetWeightedChange{metric}{filter}'] = ((previous_meet[metric_col] / previous_meet['BodyweightKg']) - (
                    past_meets[filter][1][metric_col] / past_meets[filter][1]['BodyweightKg'])) if len(past_meets[filter]) > 1 else None

                weighted_metric_changes = []
                for i in range(1, len(past_meets[filter])):
                    current_weighted_metric = past_meets[filter][i -
                                                                 1][metric_col] / past_meets[filter][i-1]['BodyweightKg']
                    previous_weighted_metric = past_meets[filter][i][metric_col] / \
                        past_meets[filter][i]['BodyweightKg']
                    weighted_metric_changes.append(
                        current_weighted_metric - previous_weighted_metric)

                next_meet[f'PreviousMeetAverageWeightedChange{metric}{filter}'] = mean(
                    weighted_metric_changes) if weighted_metric_changes else None

    previous_meet = past_meets['_N'][0]

    age_difference_years = next_meet['Date'].year - previous_meet['Date'].year

    if (next_meet['Date'].month, next_meet['Date'].day) < (previous_meet['Date'].month, previous_meet['Date'].day):
        age_difference_years -= 1

    next_meet['Age'] = float(
        float(previous_meet['Age']) + age_difference_years)
    next_meet['AgeSquared'] = next_meet['Age']**2
    next_meet['Sex_M'] = 1 if previous_meet['Sex'] == 'M' else 0
    next_meet['Sex_F'] = 1 if previous_meet['Sex'] == 'F' else 0

    drop_columns = ['OpenPowerliftingId', 'Date', 'Equipment']
    for column in drop_columns:
        del next_meet[column]

    return next_meet


def process_meets(next_meet, past_meets):
    for meet in past_meets:
        meet['Date'] = datetime.strptime(str(meet['Date']), '%Y-%m-%d').date()
    next_meet['Date'] = datetime.strptime(
        str(next_meet['Date']), '%Y-%m-%d').date()

    past_meets = sorted(
        past_meets, key=lambda meet: meet['Date'], reverse=True)

    if next_meet['Date'] <= past_meets[0]['Date']:
        raise GetPerformancePredictionException(
            f'Meet date must be after the date of the previous meet for lifter with OpenPowerliftingId {next_meet["OpenPowerliftingId"]}')

    for meet in past_meets:
        meet['WeightClassKg'] = str(float(meet['WeightClassKg'][:-1]) +
                                    10) if meet['WeightClassKg'].endswith('+') else meet['WeightClassKg']
    next_meet['WeightClassKg'] = str(float(next_meet['WeightClassKg'][:-1]) +
                                     10) if next_meet['WeightClassKg'].endswith('+') else next_meet['WeightClassKg']

    numeric_columns = ['Best3SquatKg', 'Best3BenchKg', 'Best3DeadliftKg',
                       'Best3TotalKg', 'Dots', 'BodyweightKg', 'WeightClassKg']

    for column in numeric_columns:
        for meet in past_meets:
            meet[column] = float(meet[column])
    next_meet['WeightClassKg'] = float(next_meet['WeightClassKg'])

    return next_meet, past_meets


def get_open_powerlifting_table_name():
    table_names = dynamodb_client.list_tables()['TableNames']

    filtered_table_names = [
        name for name in table_names if name.startswith('jakeshape-open-powerlifting-v') and name.endswith(os.environ['ENV'])]

    return max(
        filtered_table_names, key=lambda name: int(name.split('-v')[1].split('-')[0]))


def get_past_meets(openPowerliftingId):
    past_meets = dynamodb_client.query(
        TableName=get_open_powerlifting_table_name(),
        KeyConditionExpression='OpenPowerliftingId = :value',
        ExpressionAttributeValues={
            ':value': {'S': openPowerliftingId}
        }
    )['Items']

    for meet in past_meets:
        for key, value in meet.items():
            if isinstance(value, dict) and 'S' in value:
                meet[key] = value['S']

    if len(past_meets) < 1:
        raise GetPerformancePredictionException(
            f'Lifter with OpenPowerliftingId {openPowerliftingId} could not be found')

    return past_meets


def handler(event, context):
    try:
        next_meet = event['queryStringParameters']

        logger.info('Getting past meets...')
        past_meets = get_past_meets(next_meet['OpenPowerliftingId'])
        logger.info('Got past meets')

        logger.info('Processing meets...')
        next_meet, past_meets = process_meets(next_meet, past_meets)
        logger.info('Processed meets')

        logger.info('Engineering features...')
        next_meet = engineer_features(next_meet, past_meets)
        logger.info('Finished engineering features')

        logger.info('Splitting features...')
        squat_features, bench_features, deadlift_features = split_features(
            next_meet)
        logger.info('Finished splitting features')

        logger.info('Getting predictions...')
        squat_response, bench_response, deadlift_response = get_predictions(
            squat_features, bench_features, deadlift_features)
        logger.info('Got predictions')

        return get_response(200, json.dumps(
            {
                'predictions': {
                    'squat': squat_response,
                    'bench': bench_response,
                    'deadlift': deadlift_response,
                }

            }))

    except GetPerformancePredictionException as e:
        logger.error(f'An error occurred: {str(e)}')

        return get_response(400, json.dumps(f'Error: {str(e)}'))

    except Exception as e:
        logger.error(f'An error occurred: {str(e)}')
        logger.error(traceback.format_exc())

        return get_response(500, json.dumps(f'Error: An unknown error occured'))
