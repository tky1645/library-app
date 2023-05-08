import json
import boto3
import uuid
from datetime import datetime
from botocore.exceptions import ClientError

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("Books")

def lambda_handler(event, context):
    body = json.loads(event['body'])
    operation = body.get("operation")

    if not operation:
        return error_response(400, "Missing operation")

    if operation == "create":
        return create_book(body)
    elif operation == "update":
        return update_book(body)
    elif operation == "delete":
        return delete_book(body)
    else:
        return error_response(400, "Invalid operation")

def error_response(status_code, message):
    return {
        "statusCode": status_code,
        "body": json.dumps({"error": message})
    }
        
def create_book(data):
    try:
        title = data.get("title")
        borrower = data.get("borrower")
        borrowed_date = data.get("borrowed_date")

        if not title or not borrower or not borrowed_date:
            return error_response(400, "Missing required field")

        item = {
            "book_id": str(uuid.uuid4()),
            "title": title,
            "borrower": borrower,
            "borrowed_date": borrowed_date,
            "returned_date": data.get("returned_date", "")
        }
        table.put_item(Item=item)
        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Book created", "book_id": item["book_id"]})
        }
    except Exception as e:
        return error_response(500, str(e))

def update_book(data):
    try:
        book_id = data.get("book_id")
        title = data.get("title")
        borrower = data.get("borrower")
        borrowed_date = data.get("borrowed_date")

        if not book_id or (not title and not borrower and not borrowed_date):
            return error_response(400, "Missing required field")

        update_expression = "SET "
        expression_attribute_values = {}

        for field_name in ["title", "borrower", "borrowed_date", "returned_date"]:
            if field_name in data:
                update_expression += f"{field_name} = :{field_name}, "
                expression_attribute_values[f":{field_name}"] = data[field_name]

        update_expression = update_expression.rstrip(', ')

        table.update_item(
            Key={"book_id": book_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values
        )

        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Book updated"})
        }
    except ClientError as e:
        return error_response(500, str(e))

def delete_book(data):
    try:
        book_id = data.get("book_id")

        if not book_id:
            return error_response(400, "Missing required field")
               
        book_id = data["book_id"]
        table.delete_item(Key={"book_id":book_id})
        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Book deleted"})
        }
    except ClientError as e:
        return error_response(500, str(e))
