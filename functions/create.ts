import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { Errors } from "./errors"
import { captureAWS } from "aws-xray-sdk-core"
import { DocumentClient } from "aws-sdk/clients/dynamodb"

const TABLE_NAME = process.env.TABLE_NAME || ''
const PRIMARY_KEY = process.env.PRIMARY_KEY || ''

const aws = captureAWS(require('aws-sdk'))
const db = new aws.DynamoDB.DocumentClient() as DocumentClient

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {

    if (!event.body) return {
        statusCode: 400,
        body: Errors.EMPTY_BODY_MESSAGE
    }

    const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body)
    if (!item[PRIMARY_KEY]) return {
        statusCode: 400,
        body: Errors.EMPTY_REQUIRED_FIELD
    }

    const params = {
        TableName: TABLE_NAME,
        Item: item
    }
    try {
      await db.put(params).promise()
      return { 
            statusCode: 201, 
            body: JSON.stringify(item)
        }
    } catch (error) {
        console.error(error)
        return { 
            statusCode: 500, 
            body: Errors.INTERNAL_SERVER_ERROR
        }
    }

}