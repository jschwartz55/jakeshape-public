import json
import traceback
import logging
import os
import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb_client = boto3.client('dynamodb')

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

def process_leaderboards(leaderboards):
    leaderboard_dict = {}

    for item in leaderboards['Items']:
        game_mode = item['gameMode']['S']
        score, _ = item['scoreID']['S'].split('#')
        name = item['name']['S']

        item_dict = {
            'score': int(score),
            'name': name
        }

        if game_mode not in leaderboard_dict:
            leaderboard_dict[game_mode] = []

        leaderboard_dict[game_mode].append(item_dict)

    for game_mode in leaderboard_dict:
        leaderboard_dict[game_mode].sort(key=lambda x: x['score'], reverse=True)

    return leaderboard_dict


def scan_table():
   return dynamodb_client.scan(TableName=os.environ['STORAGE_WEIGHTWHIZLEADERBOARDS_NAME'])


def get_weight_whiz_leaderboards():
    logger.info('Getting leaderboards...')
    leaderboards = scan_table()
    logger.info('Got leaderboards')

    logger.info('Processing leaderboards')
    leaderboard_dict = process_leaderboards(leaderboards)
    logger.info('Done procesing leaderboards')
    
    return leaderboard_dict


def handler(event, context):
  try:
    weight_whiz_leaderboards = get_weight_whiz_leaderboards()

    return get_response(200, json.dumps(weight_whiz_leaderboards))
  
  except Exception as e:
    logger.error(f'An error occurred: {str(e)}')
    logger.error(traceback.format_exc())

    return get_response(500, json.dumps(f'Error: An unknown error occured'))
  
  