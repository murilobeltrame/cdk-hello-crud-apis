import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { Errors } from "./errors";

const db = new DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

export async function handler(event: APIGatewayProxyEvent) : Promise<APIGatewayProxyResult> {

    
    if (!event.pathParameters || !event.pathParameters[PRIMARY_KEY]) return { 
        statusCode: 400, 
        body: Errors.EMPTY_PARAMETER 
    };

    const editedItemPk = event.pathParameters[PRIMARY_KEY];
    if (!event.body) return { 
        statusCode: 400, 
        body: Errors.EMPTY_BODY_MESSAGE 
    };
    const editedItem = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
    const editedItemProperties = Object.keys(editedItem);

    if (!editedItem || editedItemProperties.length < 1) return { 
        statusCode: 400, 
        body: Errors.NO_ARGUMENTS_PROVIDED 
    }
    if (!editedItem[PRIMARY_KEY]) return { 
        statusCode: 400, 
        body: Errors.EMPTY_REQUIRED_FIELD 
    };

    const firstProperty = editedItemProperties.splice(0,1);
    const params: any = {
        TableName: TABLE_NAME,
        Key: {
            [PRIMARY_KEY]: editedItemPk
        },
        UpdateExpression: `set ${firstProperty} = :${firstProperty}`,
        ExpressionAttributeValues: {},
        ReturnValues: 'UPDATED_NEW'
    }
    params.ExpressionAttributeValues[`:${firstProperty}`] = editedItem[`${firstProperty}`]; 
    editedItemProperties.forEach(property => {
        params.UpdateExpression += `, ${property} = :${property}`;
        params.ExpressionAttributeValues[`:${property}`] = editedItem[property];
    });
    try {
        const response = await db.get(params).promise();
        if (response.Item) {
            await db.update(params).promise();
            return { 
                statusCode: 204, 
                body: ''
            };
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