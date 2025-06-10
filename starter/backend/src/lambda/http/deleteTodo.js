import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb";
import {DynamoDB} from "@aws-sdk/client-dynamodb";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import cors from "@middy/http-cors";
import {getUserId} from "../utils.mjs";
import {deleteTodo} from "../../business/todoController.mjs";

const dynamoDbClient = DynamoDBDocument.from(new DynamoDB())
const todosTable = process.env.TODOS_TABLE

export const handler = middy()
    .use(httpErrorHandler())
    .use(
        cors({
          credentials: true
        })
    ).handler(async (event) => {
      const userId = getUserId(event)
      const todoId = event.pathParameters.todoId

      await deleteTodo(userId, todoId)
      return {
        statusCode: 204,
      }
    })

