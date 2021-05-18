import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb';
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import { RemovalPolicy } from '@aws-cdk/core';

export class CdkHelloCrudApisStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Todos Table declaration
    const todosTable = new Table(this, 'todos-table', {
      tableName: 'todos',
      partitionKey: {
        name: 'description',
        type: AttributeType.STRING
      },
      removalPolicy: RemovalPolicy.RETAIN,
      billingMode: BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1
    });

    const listTodoFunction = new Function(this, 'list-todos-handler', {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('functions'),
      handler: 'list.handler',
      environment: {
        TABLE_NAME: todosTable.tableName,
        PRIMARY_KEY: 'description'
      }
    });
    todosTable.grantReadData(listTodoFunction);

    const createTodoFunction = new Function(this, 'create-todos-handler', {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('functions'),
      handler: 'create.handler',
      environment: {
        TABLE_NAME: todosTable.tableName,
        PRIMARY_KEY: 'description'
      }
    });
    todosTable.grantWriteData(createTodoFunction);

    const getTodoFunction = new Function(this, 'get-todos-handler', {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('functions'),
      handler: 'get.handler',
      environment: {
        TABLE_NAME: todosTable.tableName,
        PRIMARY_KEY: 'description'
      }
    });
    todosTable.grantReadData(getTodoFunction);
  }
}
