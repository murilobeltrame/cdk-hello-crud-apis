import { DynamoDB } from "aws-sdk";

const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';

export async function handler() {
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
            body: 'Internal server error.'
        }
    }
}