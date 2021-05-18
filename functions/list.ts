import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyResult } from "aws-lambda";
import { Errors } from "./errors";

const TABLE_NAME = process.env.TABLE_NAME || '';

const db = new DynamoDB.DocumentClient();

export async function handler(): Promise<APIGatewayProxyResult> {
    try {
        const response = await db.scan({
            TableName: TABLE_NAME
        }).promise();
        return {
            statusCode: 200,
            body: JSON.stringify(response.Items || [])
        }
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: Errors.INTERNAL_SERVER_ERROR
        }
    }
}