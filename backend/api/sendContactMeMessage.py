import json
import boto3
import traceback
import logging
import os

logger = logging.getLogger()
logger.setLevel(logging.INFO)

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


def send_message(name, email, message):
    logger.info('Sending message...')
    sns_client.publish(
        TopicArn=os.environ['TOPIC_ARN'],
        Subject=f'Message from {name}',
        Message=f'Name: {name}\nEmail: {email}\nMessage: {message}'
    )
    logger.info('Message sent')


def handler(event, context):
    try:
        name = event['queryStringParameters']['name']
        email = event['queryStringParameters']['email']
        message = event['queryStringParameters']['message']

        send_message(name, email, message)

        return get_response(200, json.dumps('Success'))
    except Exception as e:
        logger.error(f'An error occurred: {str(e)}')
        logger.error(traceback.format_exc())

        return get_response(500, json.dumps('Error'))
