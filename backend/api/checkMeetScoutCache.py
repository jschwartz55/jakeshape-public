import json
import boto3
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


def warm_prediction_endpoint(endpoint_name, body):
    sagemaker_runtime_client.invoke_endpoint(
        EndpointName=endpoint_name,
        ContentType='text/csv',
        Body=body
    )['Body'].read().decode()


def warm_prediction_endpoints():
    with concurrent.futures.ThreadPoolExecutor() as executor:
        executor.submit(
            warm_prediction_endpoint, 'jakeshape-performance-predictor-squat-endpoint', ','*85)
        executor.submit(
            warm_prediction_endpoint, 'jakeshape-performance-predictor-bench-endpoint', ','*85)
        executor.submit(
            warm_prediction_endpoint, 'jakeshape-performance-predictor-deadlift-endpoint', ','*85)
        executor.submit(
            warm_prediction_endpoint, 'jakeshape-performance-predictor-bodyweight-endpoint', ','*58)


def get_athlete_details_from_cache(lifting_cast_meet_id):
    response = dynamodb_client.get_item(
        TableName= os.environ['STORAGE_JAKESHAPEMEETSCOUTCACHE_NAME'],
        Key={
            'LiftingCastMeetId': {'S': lifting_cast_meet_id}
        }
    )

    if 'Item' in response:
        return json.loads(response['Item']['AthleteDetails']['S'])

    return None


def handler(event, context):
    try:

        lifting_cast_meet_id = event['queryStringParameters']['liftingCastMeetId']

        logger.info(f'Checking cache for {lifting_cast_meet_id}...')
        athlete_details = get_athlete_details_from_cache(
            lifting_cast_meet_id)

        if athlete_details:
            logger.info('Athlete details found in cache...')
        else:
            logger.info('Athlete details not found in cache')

            logger.info('Warming up prediction endpoints...')
            warm_prediction_endpoints()
            logger.info('Done warming up prediction endpoints')

        return get_response(200, json.dumps(athlete_details))

    except Exception as e:
        logger.error(f'An error occurred: {str(e)}')
        logger.error(traceback.format_exc())

        return get_response(500, json.dumps(f'Error: An unknown error occured'))
