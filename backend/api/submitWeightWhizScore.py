import json
import boto3
import traceback
import logging
import os
import uuid
import random

logger = logging.getLogger()
logger.setLevel(logging.INFO)


dynamodb_client = boto3.client('dynamodb')


LEADERBOARD_NAMES = [
    'Overshooter',
    'Slack Puller',
    'High Bar Squatter',
    'Poverty Bencher',
    'Conventional King',
    'Acessory Skipper',
    'Cardio Hater'
]


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


def remove_low_leaderboard_score(game_mode, leaderboard):
    if len(leaderboard) >= int(os.environ['LEADERBOARD_LIMIT']):
        dynamodb_client.delete_item(
            TableName=os.environ['STORAGE_WEIGHTWHIZLEADERBOARDS_NAME'],
            Key={
                'gameMode': {'S': game_mode},
                'scoreID': {'S': f"{str(leaderboard[0]['score']).zfill(3)}#{leaderboard[0]['id']}"}
            }
        )


def get_random_name():
    return 'Anonymous ' + random.choice(LEADERBOARD_NAMES)


def add_score_to_leaderboard(score, game_mode):

    formatted_score = str(score).zfill(3)

    dynamodb_client.put_item(
            TableName=os.environ['STORAGE_WEIGHTWHIZLEADERBOARDS_NAME'],
            Item={
                'gameMode': {'S': game_mode},
                'scoreID': {'S': f"{formatted_score}#{str(uuid.uuid4())}"},
                'name': {'S' : get_random_name()}
            }
        )


def adjust_leaderboard(score, game_mode, leaderboard):
    add_score_to_leaderboard(score, game_mode)
    remove_low_leaderboard_score(game_mode, leaderboard)


def is_high_score(score, leaderboard):
 return  len(leaderboard) < int(os.environ['LEADERBOARD_LIMIT']) or score >= leaderboard[0]['score']


def get_leaderboard(game_mode):
    response = dynamodb_client.query(
        TableName=os.environ['STORAGE_WEIGHTWHIZLEADERBOARDS_NAME'],
        KeyConditionExpression="#gm = :gm",
        ExpressionAttributeNames={"#gm": "gameMode"},
        ExpressionAttributeValues={":gm": {"S": game_mode}},
        ScanIndexForward=True, 
    )

    existing_scores = []

    if 'Items' in response:
        for item in response['Items']:
            score, id = item['scoreID']['S'].split('#')
            existing_scores.append({'score': int(score), 'id': id})

    if existing_scores:
        existing_scores.sort(key=lambda x: x['score'])
        return existing_scores
    return []


def submit_score(score, game_mode):

    logger.info('Getting leaderbords...')
    leaderboard = get_leaderboard(game_mode)
    logger.info('Got leaderboards')

    logger.info('Checking for high score...')
    if is_high_score(score, leaderboard):

        logger.info(f'{score} made the leaderboard')

        logger.info('Adjusting leaderboards...')
        adjust_leaderboard(score, game_mode, leaderboard)
        logger.info('Adjusted leaderboard')

        return True

    logger.info('Not a high score')
    return False

def handler(event, context):
    try:
        score = event['queryStringParameters']['score']
        game_mode = event['queryStringParameters']['gameMode']

        result = submit_score(min(999, int(score)), game_mode)

        return get_response(200, json.dumps(result))

    except Exception as e:
        logger.error(f'An error occurred: {str(e)}')
        logger.error(traceback.format_exc())

        return get_response(500, json.dumps(f'Error: An unknown error occured'))
    