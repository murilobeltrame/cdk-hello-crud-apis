import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { Errors } from "./errors";

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const db = new DynamoDB.DocumentClient();

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {

    if (!event.pathParameters || !event.pathParameters[PRIMARY_KEY]) return { 
        statusCode: 400, 
        body: Errors.EMPTY_PARAMETER };

    const requestedItemPk = event.pathParameters[PRIMARY_KEY];
    const params = {
        TableName: TABLE_NAME,
        Key: {
            [PRIMARY_KEY]: requestedItemPk
        }
    };
    try {
        const response = await db.get(params).promise();
        if (response.Item) {
            await db.delete(params).promise();
            return {
                statusCode: 204, 
                body: ''
            }
        }
        return {
            statusCode:404, 
            body: Errors.NOT_FOUND
        };
    } catch (error) {
        console.error(error);
        return { 
            statusCode: 500, 
            body: Errors.INTERNAL_SERVER_ERROR 
        };
    }
}