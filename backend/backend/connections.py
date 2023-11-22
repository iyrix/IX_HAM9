from boto3.dynamodb.types import TypeDeserializer, TypeSerializer
import boto3
from typing import List
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Set up DynamoDB client
ENDPOINT_URL = os.getenv("ENDPOINT_URL")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_ORIGIN_KEY = os.getenv("AWS_ORIGIN_KEY")


dynamodb = boto3.resource('dynamodb', region_name=AWS_ORIGIN_KEY, aws_access_key_id=AWS_ACCESS_KEY_ID,
                          aws_secret_access_key=AWS_SECRET_ACCESS_KEY, endpoint_url=ENDPOINT_URL)

table_name = "CardTable"
table = dynamodb.Table(table_name)

def create_table():
    try:
        dynamodb.create_table(
            TableName=table_name,
            KeySchema=[
                {
                    'AttributeName': 'id',
                    'KeyType': 'HASH'
                }
            ],
            AttributeDefinitions=[
                {
                    'AttributeName': 'id',
                    'AttributeType': 'S'  # S for String
                }
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        print("Table created successfully.")
    except Exception as e:
        print(f"Error creating table: {e}")
