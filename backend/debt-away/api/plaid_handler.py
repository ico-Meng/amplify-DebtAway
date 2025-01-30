import json
from plaid.model.user_account_session_get_request import UserAccountSessionGetRequest


def test_api_handler(event, context, plaid_client):
    public_token = event.get("queryStringParameters", {}).get("publicToken")
    print("public_token = ", public_token)
    layer_request = UserAccountSessionGetRequest(
        public_token="profile-sandbox-b0e2c4ee-a763-4df5-bfe9-46a46bce992d")
    layer_response = plaid_client.user_account_session_get(layer_request)
    print(f"layer_response", json.dumps(layer_response))

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body": json.dumps({"layer_response": layer_response})
    }
