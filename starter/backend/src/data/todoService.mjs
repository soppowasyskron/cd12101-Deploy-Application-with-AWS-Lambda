import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb";
import {DynamoDB} from "@aws-sdk/client-dynamodb";
import {createLogger} from "../utils/logger.mjs";

const logger = createLogger('TodoService');

export class TodoService {
    constructor(
        documentClient = new DynamoDB({
            apiVersion: '2012-08-10'
        }),
        dynamoDbClient = DynamoDBDocument.from(documentClient),
        todosTable = process.env.TODOS_TABLE_NAME,
        todoIndex = process.env.TODOS_INDEX_NAME,
    ) {
        this.dynamoDbClient = dynamoDbClient
        this.todosTable = todosTable
        this.todosIndex = todoIndex
    }

    async getTodos(userId) {
        try {
            const result = await this.dynamoDbClient.query({
                TableName: this.todosTable,
                IndexName: this.todosIndex,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                }
            })
            return result.Items
        } catch (error) {
            return "Could not get TODOs: " + error
        }

    }

    async createTodo(todo) {
        logger.info('Creating TODO', { todo })
        try {
            await this.dynamoDbClient.put({
                TableName: this.todosTable,
                Item: todo
            })
        } catch (error) {
            return "Could not create TODO: " + error.message
        }
    }

    async updateTodo(userId, todoId, updatedTodo) {
        logger.info('Update TODO', { todoId })
        try {
            await this.dynamoDbClient.update({
                TableName: this.todosTable,
                Key: { userId, todoId },
                UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
                ExpressionAttributeNames: {
                    '#name': 'name',
                    'dueDate': 'dueDate',
                    'done': 'done'
                },
                ExpressionAttributeValues: {
                    ':name': updatedTodo.name,
                    ':dueDate': updatedTodo.dueDate,
                    ':done': updatedTodo.done
                },
                ReturnValues: "UPDATED_NEW",
            })
        } catch (error) {
            return "Could not update TODO: " + error.message
        }

    }

    async deleteTodo(userId, todoId) {
        logger.info('Deleting TODO item:', { todoId })
        try {
            await this.dynamoDbClient.delete({
                TableName: this.todosTable,
                Key: { userId, todoId }
            })
        } catch (error) {
            return "Could not delete TODO: " + error.message
        }
    }

    async setAttachmentUrl(userId, todoId, image, attachmentUrl) {
        logger.info('Set attachment URL', { todoId })
        try {
            await this.dynamoDbClient.update({
                TableName: this.todosTable,
                Key: { userId, todoId },
                UpdateExpression: 'set image = :image, attachmentUrl = :attachmentUrl',
                ExpressionAttributeValues: {
                    ':attachmentUrl': attachmentUrl,
                    ':image': image
                },
                ReturnValues: "UPDATED_NEW",
            })
        } catch (error) {
            return "Could not set attachment URL: " + error.message
        }
    }


}