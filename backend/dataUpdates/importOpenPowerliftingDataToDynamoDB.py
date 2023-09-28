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


def schedule_cleanup():
    scheduled_time = (datetime.now() + timedelta(minutes=20)
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
        State='ENABLED'
    )


def import_open_powerlifting_data_to_dynamo_DB(newest_version_number):
    response = dynamodb_client.import_table(
        S3BucketSource={
            'S3Bucket': os.environ['S3_BUCKET_NAME'],
            'S3KeyPrefix': f'open-powerlifting-v{newest_version_number}.csv'
        },
        InputFormat='CSV',
        InputFormatOptions={
            'Csv': {
                'Delimiter': ','
            }
        },
        TableCreationParameters={
            'TableName': f'jakeshape-open-powerlifting-v{newest_version_number}-{os.environ["ENV"]}',
            'AttributeDefinitions': [
                {
                    'AttributeName': 'OpenPowerliftingId',
                    'AttributeType': 'S'
                },
                {
                    'AttributeName': 'Date',
                    'AttributeType': 'S'
                }
            ],
            'KeySchema': [
                {
                    'AttributeName': 'OpenPowerliftingId',
                    'KeyType': 'HASH'
                },
                {
                    'AttributeName': 'Date',
                    'KeyType': 'RANGE'
                }
            ],
            'BillingMode': 'PAY_PER_REQUEST',
        },
    )

    if not response:
        raise Exception(
            'Failed to import table')


def get_open_powerlifting_version():
    response = s3_client.list_objects_v2(Bucket=os.environ['S3_BUCKET_NAME'])
    if 'Contents' in response:
        open_powerlifting_table_versions = [int(data['Key'].split(
            '-v')[1].split('.csv')[0]) for data in response['Contents']]
        if len(open_powerlifting_table_versions) != 2:
            raise Exception(
                'There were not exactly 2 OpenPowerlifting csv files found')
        return max(open_powerlifting_table_versions)
    raise Exception(
        'New OpenPowerlifting table could not be found')


def handler(event, context):

    try:
        if os.environ['ENV'] == 'prod':
            logger.info('Getting OpenPowerlifting version...')
            newest_version_number = get_open_powerlifting_version()
            logger.info('Done getting OpenPowerlifting version')

            logger.info('Importing OpenPowerlifting data from S3 to DynamoDB...')
            import_open_powerlifting_data_to_dynamo_DB(
                newest_version_number)
            logger.info('Data is being imported')

            logger.info('Scheduling cleanup...')
            schedule_cleanup()
            logger.info('Done scheduling cleanup')

        return get_response(200, json.dumps('Success'))
    except Exception as e:
        logger.error(f'An error occurred: {str(e)}')
        logger.error(traceback.format_exc())

        sns_client.publish(
            TopicArn=os.environ['TOPIC_ARN'],
            Subject='Jakeshape OpenPowerlifting Data Update Error',
            Message=f'Error in importOpenPowerliftingDataToDynamoDB function: {str(e)}'
        )
        return get_response(500, json.dumps('Error'))
