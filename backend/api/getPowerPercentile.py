import json
import boto3
import traceback
import logging
import os
import awswrangler as wr
import pandas as pd

logger = logging.getLogger()
logger.setLevel(logging.INFO)


s3_client = boto3.client('s3')


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


def get_newest_power_percentile_data():
    objects = s3_client.list_objects_v2(Bucket=os.environ['S3_BUCKET_NAME'])

    highest_version_value = -1 
    highest_version_object_name = None

    for obj in objects.get('Contents', []):
        object_key = obj['Key']
        try:
            version_value = int(object_key.split('-v')[1].split('.parquet')[0])
        except (ValueError, IndexError):
            continue  

        if version_value > highest_version_value:
            highest_version_value = version_value
            highest_version_object_name = object_key

    if highest_version_object_name:
        return highest_version_object_name
    else:
        raise Exception('Data not found')


def get_percentiles(squat, bench, deadlift, total, sex_include, equipment_include, age_range, bodyweight_range, federation_include, date_range):
    logger.info('Getting newest power percentile data...')
    power_percentile_data = get_newest_power_percentile_data()
    logger.info(f'Got latest power percentile data named {power_percentile_data}')
    
    logger.info('Reading parquet file from s3...')
    df = wr.s3.read_parquet(
        path=f's3://{os.environ["S3_BUCKET_NAME"]}/{power_percentile_data}'
    )
    logger.info('Got parquet file from s3')

    logger.info('Filtering data...')
    df = df[
        (df['Sex'].isin(sex_include)) &
        (df['Equipment'].isin(equipment_include)) &
        (df['Age'] >= age_range[0]) & (df['Age'] <= age_range[1]) &
        (df['BodyweightKg'] >= bodyweight_range[0]) & (df['BodyweightKg'] <= bodyweight_range[1]) &
        (df['Federation'].isin(federation_include)) &
        (df['Date'].between(date_range[0], date_range[1]))
    ]
    logger.info('Done filtering data')

    logger.info('Removing null and negative values...')
    squat_mask = (df['Best3SquatKg'].notna()) & (df['Best3SquatKg'] > 0)
    squat_values = df[squat_mask].groupby('Name')['Best3SquatKg'].max()

    bench_mask = (df['Best3BenchKg'].notna()) & (df['Best3BenchKg'] > 0)
    bench_values = df[bench_mask].groupby('Name')['Best3BenchKg'].max()

    deadlift_mask = (df['Best3DeadliftKg'].notna()) & (df['Best3DeadliftKg'] > 0)
    deadlift_values = df[deadlift_mask].groupby('Name')['Best3DeadliftKg'].max()

    total_mask = (df['TotalKg'].notna()) & (df['TotalKg'] > 0)
    total_values = df[total_mask].groupby('Name')['TotalKg'].max()
    logger.info('Done removing null and negative values...')
    
    logger.info('Returning percentiles')
    return (squat_values <= squat).mean(), (bench_values <= bench).mean(), (deadlift_values <= deadlift).mean(), (total_values <= total).mean()


def handler(event, context):
    try:
        filters = json.loads(event['body'])
        logger.info(filters)
        sex_include = list(filters['sexInclude'])
        equipment_include = list(filters['equipmentInclude'])
        age_range = [float(age) for age in filters['ageRange']]
        bodyweight_range = [float(bodyweight) for bodyweight in filters['bodyweightRange']]
        federation_include = list(filters['federationInclude'])
        date_range = [pd.to_datetime(date, format='%Y-%m-%d') for date in filters['dateRange']]

        squat = float(filters['squat'])
        bench = float(filters['bench'])
        deadlift = float(filters['deadlift'])
        total = float(filters['total'])

        squat_percentile, bench_percentile, deadlift_percentile, total_percentile = get_percentiles(squat, bench, deadlift, total, sex_include, equipment_include, age_range, bodyweight_range, federation_include, date_range)

        return get_response(200, json.dumps(
            {
                'squat': squat_percentile,
                'bench': bench_percentile,
                'deadlift': deadlift_percentile,
                'total': total_percentile
            }
        ))

    except Exception as e:
        logger.error(f'An error occurred: {str(e)}')
        logger.error(traceback.format_exc())

        return get_response(500, json.dumps(f'Error: An unknown error occured'))
    