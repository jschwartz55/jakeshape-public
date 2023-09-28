import json
import boto3
import traceback
from datetime import datetime, timedelta
import os
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3_client = boto3.client('s3')
dynamodb_client = boto3.client('dynamodb')
dynamodb_resource = boto3.resource('dynamodb')
scheduler_client = boto3.client('scheduler')
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


def delete_old_dynamo_db_table(old_table_version):
    table_name = f'jakeshape-open-powerlifting-v{old_table_version}-{os.environ["ENV"]}'
    table = dynamodb_resource.Table(table_name)
    dynamodb_client.delete_table(
        TableName=table_name
    )
    table.wait_until_not_exists()


def delete_old_csv_file(old_table_version):
    s3_client.delete_object(
        Bucket=os.environ['S3_BUCKET_NAME'],
        Key=f'open-powerlifting-v{old_table_version}.csv'
    )


def check_dynamo_db_count():
    open_powerlifting_tables = [table_name for table_name in dynamodb_client.list_tables(
    )['TableNames'] if table_name.startswith('jakeshape-open-powerlifting-v') and table_name.endswith(os.environ["ENV"])]
    if len(open_powerlifting_tables) != 2:
        raise Exception(
            'Did not find exactly two OpenPowerlifting DynamoDB tables')


def wait_for_successful_import(newest_table_version):
    table_name = f'jakeshape-open-powerlifting-v{newest_table_version}-{os.environ["ENV"]}'
    table = dynamodb_resource.Table(table_name)
    table.wait_until_exists()


def get_newest_table_version():
    response = s3_client.list_objects_v2(Bucket=os.environ['S3_BUCKET_NAME'])
    if 'Contents' in response:
        open_powerlifting_table_versions = [int(data['Key'].split(
            '-v')[1].split('.csv')[0]) for data in response['Contents']]
        if len(open_powerlifting_table_versions) != 2:
            raise Exception(
                'There were not exactly two OpenPowerlifting csv files found')
        return max(open_powerlifting_table_versions)
    raise Exception(
        'Old OpenPowerlifting table could not be found')


def disable_scheduler():
    scheduled_time = (datetime.now() + timedelta(minutes=-5)
                      ).strftime('%Y-%m-%dT%H:%M:%S')

    scheduler_client.update_schedule(
        FlexibleTimeWindow={
            'Mode': 'OFF'
        },
        Name=os.environ['SCHEDULER_NAME'],
        ScheduleExpression=f'at({scheduled_time})',
        Target={
            'Arn': os.environ['TARGET_ARN'],
            'RoleArn': os.environ['TARGET_ROLE_ARN'],
        },
        State='DISABLED'
    )


def handler(event, context):
    try:
        if os.environ['ENV'] == 'prod':
            logger.info('Disabling scheduler...')
            disable_scheduler()
            logger.info('Disabled scheduler')

            logger.info('Getting newest table version...')
            newest_table_version = get_newest_table_version()
            old_table_version = newest_table_version - 1
            logger.info(f'Got newest table name version: {newest_table_version}')

            logger.info('Checking for creation of new DynamoDB table...')
            wait_for_successful_import(newest_table_version)
            logger.info(
                f'New DynamoDB table open-powerlifing-v{newest_table_version} created successfully')

            logger.info('Checking for two OpenPowerlifting DynamoDB tables')
            check_dynamo_db_count()
            logger.info('Found two OpenPowerlifting DynamoDB tables')

            logger.info('Deleting old csv files in s3...')
            delete_old_csv_file(old_table_version)
            logger.info(
                f'Done deleting old csv file openpowerlifting-v{old_table_version}.csv in s3')

            logger.info('Deleting old DynamoDB table...')
            delete_old_dynamo_db_table(old_table_version)
            logger.info(
                f'Done deleting old DynamoDB table openpowerlifting-v{old_table_version}')

        return get_response(200, json.dumps('Success'))

    except Exception as e:
        logger.error(f'An error occurred: {str(e)}')
        logger.error(traceback.format_exc())

        sns_client.publish(
            TopicArn=os.environ['TOPIC_ARN'],
            Subject='Jakeshape OpenPowerlifting Data Update Error',
            Message=f'Error in cleanupOpenPowerliftingData function: {str(e)}'
        )

        return get_response(500, json.dumps('Error'))
