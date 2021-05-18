import { APIGatewayProxyResult } from "aws-lambda"
import { Errors } from "./errors"
import { captureAWS } from "aws-xray-sdk-core"
import { DocumentClient } from "aws-sdk/clients/dynamodb"

const TABLE_NAME = process.env.TABLE_NAME || ''

const aws = captureAWS(require('aws-sdk'))
const db = new aws.DynamoDB.DocumentClient() as DocumentClient

export async function handler(): Promise<APIGatewayProxyResult> {
    try {
        const response = await db.scan({
            TableName: TABLE_NAME
        }).promise()
        return {
            statusCode: 200,
            body: JSON.stringify(response.Items || [])
        }
    } catch (error) {
        console.error(error)
        return {
            statusCode: 500,
            body: Errors.INTERNAL_SERVER_ERROR
        }
    }
}