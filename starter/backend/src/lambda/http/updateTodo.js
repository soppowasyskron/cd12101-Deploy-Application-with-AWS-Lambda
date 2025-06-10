import httpErrorHandler from "@middy/http-error-handler";
import middy from "@middy/core";
import cors from "@middy/http-cors";
import {getUserId} from "../utils.mjs";
import {updateTodo} from "../../business/todoController.mjs";
import {createLogger} from "../../utils/logger.mjs";
import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb";
import {DynamoDB} from "@aws-sdk/client-dynamodb";

const dynamoDbClient = DynamoDBDocument.from(new DynamoDB())
const todosTable = process.env.TODOS_TABLE
const logger = createLogger('UpdateTodo')

export  const handler = middy()
    .use(httpErrorHandler())
    .use(
        cors({
          credentials: true
        })
    ).handler(async (event) => {
      logger.info('Update TODO')

      const userId = getUserId(event)
      const todoId = event.pathParameters.todoId
      const updatedTodo = JSON.parse(event.body)

      await updateTodo(
          userId,
          todoId,
          updatedTodo
      )
      return {
        statusCode: 200,
      }
    })
