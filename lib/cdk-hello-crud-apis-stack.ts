import { Cors, LambdaIntegration, MethodLoggingLevel, RestApi } from '@aws-cdk/aws-apigateway';
import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb';
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import { Construct, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core';

export class CdkHelloCrudApisStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Todos Table declaration
    const primaryKeyName = 'description'
    const todosTable = new Table(this, 'todos-table', {
      tableName: 'todos',
      partitionKey: {
        name: primaryKeyName,
        type: AttributeType.STRING
      },
      removalPolicy: RemovalPolicy.RETAIN,
      billingMode: BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1
    })

    const listTodoFunction = new Function(this, 'list-todos-handler', {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('functions'),
      handler: 'list.handler',
      environment: {
        TABLE_NAME: todosTable.tableName,
        PRIMARY_KEY: primaryKeyName
      }
    })
    todosTable.grantReadData(listTodoFunction)

    const createTodoFunction = new Function(this, 'create-todos-handler', {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('functions'),
      handler: 'create.handler',
      environment: {
        TABLE_NAME: todosTable.tableName,
        PRIMARY_KEY: primaryKeyName
      }
    })
    todosTable.grantWriteData(createTodoFunction)

    const getTodoFunction = new Function(this, 'get-todos-handler', {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('functions'),
      handler: 'get.handler',
      environment: {
        TABLE_NAME: todosTable.tableName,
        PRIMARY_KEY: primaryKeyName
      }
    })
    todosTable.grantReadData(getTodoFunction)

    const updateTodoFunction = new Function(this, 'update-todos-handler', {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('functions'),
      handler: 'update.handler',
      environment: {
        TABLE_NAME: todosTable.tableName,
        PRIMARY_KEY: primaryKeyName
      }
    })
    todosTable.grantReadWriteData(updateTodoFunction)

    const deleteTodoFunction = new Function(this, 'delete-todos-handler', {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('functions'),
      handler: 'delete.handler',
      environment: {
        TABLE_NAME: todosTable.tableName,
        PRIMARY_KEY: primaryKeyName
      }
    })
    todosTable.grantReadWriteData(deleteTodoFunction)

    const api = new RestApi(this, 'todos-api', {
      deployOptions: {
        metricsEnabled: true,
        loggingLevel: MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        tracingEnabled: true
      }
    })

    const todosResource = api.root.addResource('todos', {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowHeaders: [
            'Content-Type',
            'X-Amz-Date',
            'Authorization',
            'X-Api-Key',
            'X-Amz-Security-Token'
        ],
        allowMethods: ['POST']
      }
    })
    todosResource.addMethod('GET', new LambdaIntegration(listTodoFunction))
    todosResource.addMethod('POST', new LambdaIntegration(createTodoFunction))

    const todoItemResource = todosResource.addResource(`{${primaryKeyName}}`, {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowHeaders: [
            'Content-Type',
            'X-Amz-Date',
            'Authorization',
            'X-Api-Key',
            'X-Amz-Security-Token'
        ],
        allowMethods: ['PUT', 'DELETE']
      }
    })
    todoItemResource.addMethod('GET', new LambdaIntegration(getTodoFunction))
    todoItemResource.addMethod('PUT', new LambdaIntegration(updateTodoFunction))
    todoItemResource.addMethod('DELETE', new LambdaIntegration(deleteTodoFunction))
  }
}
