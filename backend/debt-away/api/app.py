import os
import boto3
import json
import plaid
import experian_handler
import plaid_handler

from plaid.api import plaid_api
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.products import Products
from plaid.model.country_code import CountryCode


from fastapi import FastAPI, Request, Query, HTTPException
from mangum import Mangum  # type: ignore
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from config import PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV


# Global Variable Cache
# dynamodb = boto3.resource(
#    'dynamodb', endpoint_url="http://host.docker.internal:8000")
#
#
# def ensure_table_exists():
#    table_name = "PlaidTokenTable"
#
#    existing_tables = dynamodb.meta.client.list_tables()["TableNames"]
#    if table_name in existing_tables:
#        print(f"Table '{table_name}' already exists.")
#        return dynamodb.Table(table_name)
#
#    # Create the table if it doesn't exist
#    print(f"Table '{table_name}' does not exist. Creating...")
#    table = dynamodb.create_table(
#        TableName=table_name,
#        KeySchema=[
#            {
#                "AttributeName": "client_id",  # Partition key
#                "KeyType": "HASH"
#            },
#            {
#                "AttributeName": "sk",  # Sort Key
#                "KeyType": "RANGE"
#            }
#        ],
#        AttributeDefinitions=[
#            {
#                "AttributeName": "client_id",
#                "AttributeType": "S"  # 'S' for String
#            },
#            {
#                "AttributeName": "sk",
#                "AttributeType": "S"  # 'S' for String
#            }
#        ],
#        ProvisionedThroughput={
#            "ReadCapacityUnits": 5,
#            "WriteCapacityUnits": 5
#        }
#    )
#
#    # Wait until the table becomes active
#    print(f"Creating table '{table_name}'...")
#    table.meta.client.get_waiter("table_exists").wait(TableName=table_name)
#    print(f"Table '{table_name}' created successfully!")
#    return table
#
#
# PlaidTokenTable = ensure_table_exists()

plaid_env = plaid.Environment.Sandbox if PLAID_ENV == "sandbox" else (
    plaid.Environment.Development if PLAID_ENV == "development" else plaid.Environment.Production
)

plaid_client = plaid_api.PlaidApi(plaid.ApiClient(plaid.Configuration(
    host=plaid_env,
    api_key={
        "clientId": PLAID_CLIENT_ID,
        "secret": PLAID_SECRET,
    }
)))

access_token = None
item_id = None


'''
API Definition
'''

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    # allow_origins=["*"],
    allow_origins=["http://localhost:3000",
                   "https://main.d3a19hn400g7xw.amplifyapp.com"],
    allow_credentials=True,
    allow_methods=["OPTIONS", "POST", "GET"],  # Ensure OPTIONS is included
    # Include necessary headers
    allow_headers=["Content-Type", "Authorization"],
    # allow_methods=["*"],
    # allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request, call_next):
    print(f"Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    return response


@app.post("/create-link-token")
async def create_link_token(request: Request):
    body = await request.json()
    user_id = body.get("userId")
    client_id = user_id
    print(f"client_id: {client_id}")

    try:
        # Generate a link_token
        link_request = LinkTokenCreateRequest(
            client_name="Debt Away",
            products=[Products("auth")],
            # products=[Products("auth"), Products("layer")],
            country_codes=[CountryCode('US')],
            language="en",
            user=LinkTokenCreateRequestUser(
                # client_user_id=client_id
                client_user_id="+14155550015"  # Sandbox phone number
            ),
            # webhook="https://your-app.com/webhook"  # Optional: webhook for updates
        )
        response = plaid_client.link_token_create(link_request)
        link_token = response["link_token"]
        print("link_token: ", link_token)

        # Should check availability first, then see if need to update
        # try:
        #    PlaidTokenTable.put_item(
        #        Item={
        #            "client_id": client_id,
        #            "sk": "link_token",
        #            "link_token": link_token,
        #            "access_token": "",
        #        },
        #        ConditionExpression="attribute_not_exists(client_id) AND attribute_not_exists(sk)"
        #    )
        #    print("Item successfully inserted.")
        # except Exception as e:
        #    if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
        #        # If the item already exists, skip writing
        #        print(
        #            f"client_id={client_id} or link_token{link_token} already exists, skipping insert")
        #    else:
        #        # Handle other exceptions
        #        print(f"Error: {str(e)}")

        # print("Finished DynamoDB insert.")
        # dbResp = PlaidTokenTable.get_item(
        #    Key={
        #        "client_id": client_id,
        #        "sk": link_token
        #    }
        # )
        # if "Item" in dbResp:
        #    print("Item found: ", json.dumps(dbResp["Item"], indent=4))
        # else:
        #    print("No item found with client_id: ", client_id)

        return JSONResponse({
            "link_token": link_token,
            "user_id": user_id
        })
    except plaid.ApiException as e:
        return {"status": "error", "message": str(e)}


@app.post("/exchange-public-token")
async def exchange_public_token(request: Request):
    body = await request.json()
    client_id = body.get("clientId")  # Extract the clientId
    print("client_id: ", client_id)

    global access_token
    public_token = body.get('publicToken')
    link_token = body.get('linkToken')

    request = ItemPublicTokenExchangeRequest(
        public_token=public_token
    )
    response = plaid_client.item_public_token_exchange(request)

    access_token = response['access_token']
    item_id = response['item_id']

    # try:
    #    dbResp = PlaidTokenTable.update_item(
    #        Key={
    #            "client_id": client_id,
    #            "sk": link_token
    #        },
    #        UpdateExpression="SET access_token = :value",
    #        # ConditionExpression="attribute_not_exists(access_token)",
    #        ExpressionAttributeValues={
    #            ":value": access_token
    #        },
    #        ReturnValues="UPDATED_NEW"
    #    )
    #    print("Update succeeded:", dbResp)
    # except Exception as e:
    #    if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
    #        print("Access token already exists, update skipped.")
    #    else:
    #        print("Unexpected error:", e)

    # dbResp = PlaidTokenTable.get_item(
    #    Key={
    #        "client_id": client_id,
    #        "sk": link_token
    #    }
    # )
    # if "Item" in dbResp:
    #    print("Item found after update access_token: ",
    #          json.dumps(dbResp["Item"], indent=4))
    # else:
    #    print("No item found with client_id: ", client_id)

    return {"status": "success", "access_token": access_token, "item_id": item_id}
    # return {
    #    "statusCode": 200,
    #    "headers": {
    #        "Content-Type": "application/json",
    #        "Access-Control-Allow-Origin": "*",
    #        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    #        "Access-Control-Allow-Headers": "Content-Type",
    #    },
    #    "body": json.dumps({"access_token": access_token, "item_id": item_id}),
    # }


@app.get("/get-account")
async def get_account(
    clientId: str = Query(...),  # Required query parameter
    linkToken: str = Query(...),  # Required query parameter
    publicToken: str = Query(None),  # Required query parameter
):
    # http_method = event.get("httpMethod")
    # print("HTTP Method:", http_method)

    # client_id = event.get("queryStringParameters", {}).get("clientId")
    # link_token = event.get("queryStringParameters", {}).get("linkToken")
    # print("client_id: ", client_id)
    # print("link_token: ", link_token)

    global access_token
    print("get-account access_token = ", access_token)
    # dbResp = PlaidTokenTable.get_item(
    #    Key={
    #        "client_id": clientId,
    #        "sk": linkToken
    #    }
    # )
    # if "Item" in dbResp:
    #    print("Item found after update access_token: ",
    #          json.dumps(dbResp["Item"], indent=4))

    #    access_token = dbResp["Item"]["access_token"]
    #    print("queried access_token: {access_token}")
    # else:
    #    print("No item found with client_id: ", clientId)

    request = AccountsGetRequest(
        access_token=access_token
    )
    accounts_response = plaid_client.accounts_get(request)
    accounts_response_dict = accounts_response.to_dict()
    print("account response: ", accounts_response_dict)
    return {"status": "success", "account": accounts_response_dict}
    # return {
    #    "statusCode": 200,
    #    "headers": {
    #        "Access-Control-Allow-Origin": "*",
    #        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    #        "Access-Control-Allow-Headers": "Content-Type",
    #    },
    #    "body": json.dumps({"account": accounts_response_dict}),
    # }


@app.get("/get-experian-token")
async def get_experian_token():
    return experian_handler.experian_token_handler()


@app.get("/get-credit-report")
async def get_credit_report():
    return experian_handler.credit_report_handler()


@app.get("/test-api")
async def test_api():
    # return plaid_handler.test_api_handler(event, context, plaid_client)
    return {"link_token": "Plaid provided your link token"}
    # return {
    #    "statusCode": 200,
    #    "headers": {
    #        "Access-Control-Allow-Origin": "*",
    #        "Access-Control-Allow-Methods": "GET,OPTIONS",
    #        "Access-Control-Allow-Headers": "Content-Type",
    #    },
    #    "body": json.dumps({"link_token": "Plaid provided your link token"})
    # }


@app.get("/test2-api")
async def test2_api():
    # return plaid_handler.test_api_handler(event, context, plaid_client)
    return {"link_token2": "Plaid provided your link token2"}
    # return {
    #    "statusCode": 200,
    #    "headers": {
    #        "Access-Control-Allow-Origin": "*",
    #        "Access-Control-Allow-Methods": "GET,OPTIONS",
    #        "Access-Control-Allow-Headers": "Content-Type",
    #    },
    #    "body": json.dumps({"link_token": "Plaid provided your link token"})
    # }


handler = Mangum(app, lifespan="off")
