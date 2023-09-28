import json
import boto3
import requests
import fnmatch
import io
import zipfile
import traceback
import pandas as pd
import numpy as np
import awswrangler as wr
import logging
import os

logger = logging.getLogger()
logger.setLevel(logging.INFO)


s3_client = boto3.client('s3')
dynamodb_client = boto3.client('dynamodb')
sns_client = boto3.client('sns')


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


def upload_new_data_to_s3(new_table_version, open_powerlifting_table):
    response = s3_client.put_object(
        Bucket=os.environ['OPEN_POWERLIFTING_BUCKET_NAME'], Key=f'open-powerlifting-v{new_table_version}.csv', Body=open_powerlifting_table)
    if not response:
        raise Exception('Failed to create object in s3')


def process_open_powerlifting_data(open_powerlifting_data):
    df = pd.read_csv(io.BytesIO(open_powerlifting_data))

    df = df[df['Event'] == 'SBD']

    df = df.rename(columns={'TotalKg': 'Best3TotalKg'})

    df = df[~(df['Place'].isin(['DD', 'DQ', 'G', 'NS']) | df['Place'].isnull())]

    df.dropna(subset=['BodyweightKg'], inplace=True)

    df.dropna(subset=['Best3SquatKg', 'Best3BenchKg',
              'Best3DeadliftKg', 'Best3TotalKg'], inplace=True)

    df = df.drop_duplicates(subset=['MeetName', 'Date', 'Name'], keep='first')

    def calculate_average_age(age_range):
        if age_range == 'nan':
            return np.nan
        min_age, max_age = map(int, age_range.split('-'))
        return (min_age + max_age) / 2 if min_age != 80 else min_age

    df['AgeClass'] = df['AgeClass'].astype(str)
    df['Age'] = df.apply(lambda row: calculate_average_age(
        row['AgeClass']) if (pd.isnull(row['Age'])) else row['Age'], axis=1)
    df['Age'] = df['Age'].fillna(df['Age'].mean())

    df = df.drop(df[df['WeightClassKg'] == '+'].index)

    df.dropna(subset=['WeightClassKg'], inplace=True)
    df['WeightClassKg'] = df['WeightClassKg'].astype(str)
    df['WeightClassKg'] = df['WeightClassKg'].apply(
        lambda x: str(float(x[:-1]) + 10) if x.endswith('+') else x)
    df['WeightClassKg'] = pd.to_numeric(df['WeightClassKg'])

    drop_columns = ['Event', 'AgeClass', 'Place', 'BirthYearClass', 'Country',
                    'State', 'MeetCountry', 'MeetState', 'MeetTown', 'MeetName',
                    'ParentFederation', 'Division', 'Squat4Kg', 'Bench4Kg',
                    'Deadlift4Kg', 'Tested', 'Goodlift', 'Squat1Kg', 'Squat2Kg',
                    'Squat3Kg', 'Bench1Kg', 'Bench2Kg', 'Bench3Kg', 'Deadlift1Kg',
                    'Deadlift2Kg', 'Deadlift3Kg', 'Federation', 'Wilks', 'Glossbrenner']
    df = df.drop(drop_columns, axis=1)

    df = df.sort_values(by='Best3TotalKg', ascending=False)
    df = df.drop_duplicates(subset=['Name', 'Date'], keep='first')

    df['OpenPowerliftingId'] = df['Name'].str.lower().str.replace(
        ' ', '').str.replace('#', '').str.replace('.', '')

    return df.to_csv(index=False)


def update_power_percentile_data(open_powerlifting_data, new_table_version):
    df = pd.read_csv(io.BytesIO(open_powerlifting_data))

    #remove duplicate meets -> if an athlete competes in 2 divisions it will count as 2 entries in the db. It doesnt matter what entry we keep b/c we will remove division column
    df = df.drop_duplicates(subset=['MeetName', 'Date', 'Name'], keep='first')

    # Drop duplicate rows based on 'Name' and 'Date', keeping the first occurrence (highest 'Best3TotalKg')
    df = df.sort_values(by='TotalKg', ascending=False)
    df = df.drop_duplicates(subset=['Name', 'Date'], keep='first')

    #remove unused columns
    drop_columns = ['Event', 'AgeClass', 'Place', 'BirthYearClass', 'Country',
                    'State', 'MeetCountry', 'MeetState', 'MeetTown', 'MeetName',
                    'ParentFederation', 'Division', 'Squat4Kg', 'Bench4Kg',
                    'Deadlift4Kg', 'Tested', 'Goodlift', 'Squat1Kg', 'Squat2Kg',
                    'Squat3Kg', 'Bench1Kg', 'Bench2Kg', 'Bench3Kg', 'Deadlift1Kg',
                    'Deadlift2Kg', 'Deadlift3Kg', 'Wilks', 'Glossbrenner', 'Dots',
                    'WeightClassKg']
    df = df.drop(drop_columns, axis=1)

    #remove missing data rows
    df.dropna(subset=['Sex', 'Equipment', 'Age', 'BodyweightKg', 'Federation', 'Date', 'TotalKg'], inplace = True)

    #convert datatypes
    df['Date'] = pd.to_datetime(df['Date'])
    df['Name'] = pd.factorize(df['Name'])[0]

    wr.s3.to_parquet(
        df=df,
        path=f's3://{os.environ["POWER_PERCENTILE_BUCKET_NAME"]}/power-percentile-v{new_table_version}.parquet',
    )

    s3_client.delete_object(
        Bucket=os.environ["POWER_PERCENTILE_BUCKET_NAME"],
        Key=f'power-percentile-v{new_table_version-1}.parquet'
    )

    
def get_data_from_open_powerlifting():

    response = requests.get(os.environ['OPEN_POWERLIFTING_URL'])

    if response.status_code == 200:

        with zipfile.ZipFile(io.BytesIO(response.content), 'r') as zip_file:
            matching_csv_files = [filename for filename in zip_file.namelist(
            ) if fnmatch.fnmatch(filename, 'openpowerlifting*/openpowerlifting*.csv')]

            if matching_csv_files:
                return zip_file.read(matching_csv_files[0])

    raise Exception(
        'Failed to get data from OpenPowerlifting')


def get_open_powerlifting_version_from_dynamo_db():
    response = dynamodb_client.list_tables()

    if 'TableNames' in response:
        filtered_table_names = [
            name for name in response['TableNames'] if name.startswith('jakeshape-open-powerlifting-v') and name.endswith(os.environ['ENV'])]
        if len(filtered_table_names) != 1:
            raise Exception(
                'Multiple Dynamo DB table versions found')
        return max(int(table_name.split('-v')[1].split('-')[0]) for table_name in filtered_table_names) + 1
    raise Exception(
        'Failed to get tables'
    )


def get_open_powerlifting_version_from_s3():
    response = s3_client.list_objects_v2(Bucket=f'{os.environ["OPEN_POWERLIFTING_BUCKET_NAME"]}')

    if 'Contents' in response:
        open_powerlifting_table_versions = [int(data['Key'].split(
            '-v')[1].split('.csv')[0]) for data in response['Contents']]
        if len(open_powerlifting_table_versions) != 1:
            raise Exception(
                'Multiple csv file versions found')
        return max(open_powerlifting_table_versions) + 1
    raise Exception(
        'Old OpenPowerlifting table could not be found')


def check_data_synchronization():
    s3_version = get_open_powerlifting_version_from_s3()
    dynamodb_version = get_open_powerlifting_version_from_dynamo_db()

    if s3_version == dynamodb_version:
        return s3_version

    raise Exception(
        f'Data version of S3 ({s3_version}) does not match data version of DynamoDB ({dynamodb_version})')


def handler(event, context):
    try:
        if os.environ['ENV'] == 'prod':
            logger.info('Checking OpenPowerlifting data synchronization..')
            new_table_version = check_data_synchronization()
            logger.info('Data is synchronized')

            logger.info('Getting OpenPowerlifting data...')
            open_powerlifting_data = get_data_from_open_powerlifting()
            logger.info('Done getting OpenPowerlifting data')

            logger.info('Updating Power Percentile data...')
            update_power_percentile_data(open_powerlifting_data, new_table_version)
            logger.info('Done updating Power Percentile data')

            logger.info('Processing OpenPowerlifting data...')
            open_powerlifting_data = process_open_powerlifting_data(
                open_powerlifting_data)
            logger.info('Done processing OpenPowerlifting data')

            logger.info('Outputting data to s3...')
            upload_new_data_to_s3(new_table_version, open_powerlifting_data)
            logger.info('Done outputting data to s3')

        return get_response(200, json.dumps('Success'))

    except Exception as e:
        logger.error(f'An error occurred: {str(e)}')
        logger.error(traceback.format_exc())

        sns_client.publish(
            TopicArn=os.environ['TOPIC_ARN'],
            Subject='Jakeshape OpenPowerlifting Data Update Error',
            Message=f'Error in getOpenPowerliftingData function: {str(e)}'
        )

        return get_response(500, json.dumps('Error'))
