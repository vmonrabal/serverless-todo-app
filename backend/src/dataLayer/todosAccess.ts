import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'

const logger = createLogger('todoAccess')

export class TodosAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosUserIdIndex = process.env.TODOS_TABLE_USERID_INDEX
    ) {
    }

    async getUserTodos(userId: string): Promise<TodoItem[]> {
        logger.info(`Retrieving all Todos for user: ${userId}`)

        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todosUserIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        const todoItems = result.Items as TodoItem[]
        return todoItems
    }

    async getUserTodo(todoId: string, userId: string): Promise<TodoItem> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todosUserIdIndex,
            KeyConditionExpression: 'todoId = :todoId AND userId = :userId',
            ExpressionAttributeValues: {
                ':todoId': todoId,
                ':userId': userId
            }
        }).promise()
        const todoItems = result.Items as TodoItem[]
        return todoItems[0]
    }

    async getTodo(todoId: string): Promise<TodoItem> {
        logger.info('Getting Todo item with id: ', todoId)

        const result = await this.docClient.get({
            TableName: this.todosTable,
            Key: {
                todoId: todoId
            }
        }).promise()

        return result.Item as TodoItem
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info(`Creating Todo with id ${todo.todoId} for user: ${todo.userId}`)

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()

        return todo
    }

    async updateTodo(todoId:string, todoUpdate: TodoUpdate) {
        logger.info(`Updating Todo with id ${todoId}`)

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId: todoId
            },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeNames: {
                '#name': 'name'
            },
            ExpressionAttributeValues: {
                ":name": todoUpdate.name,
                ":dueDate": todoUpdate.dueDate,
                ":done": todoUpdate.done
            }
        }).promise()
    }

    async updateTodoAttachmentUrl(todoId: string, attachmentUrl: string) {
        logger.info(`Updating Todo with id ${todoId}`)

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId: todoId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ":attachmentUrl": attachmentUrl
            }
        }).promise()
    }

    async deleteTodo(todoId: string) {
        logger.info(`Deleting Todo with id ${todoId}`)

        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId: todoId
            }
        }).promise()
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        console.log('Creating a local DynamoDB instance')
        return new AWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }
    return new AWS.DynamoDB.DocumentClient()
}
