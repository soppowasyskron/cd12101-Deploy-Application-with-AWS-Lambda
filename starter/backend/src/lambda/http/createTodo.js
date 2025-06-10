import httpErrorHandler from "@middy/http-error-handler";
import middy from "@middy/core";
import cors from "@middy/http-cors";
import { v4 as uuidv4 } from 'uuid'
import {getUserId} from "../utils.mjs";
import {createTodo} from "../../business/todoController.mjs";

export const handler = middy()
    .use(httpErrorHandler())
    .use(
        cors({
          credentials: true
        })
    ).handler(async (event) => {

      console.log('Processing event: ', event)

      const newTodo = JSON.parse(event.body)
      const todoId = uuidv4()
      const userId = getUserId(event)

      const newItem = {
        todoId,
        ...newTodo,
        userId,
        createdAt: new Date().toISOString(),
        done: false
      }
      await createTodo(newItem)
      return {
        statusCode: 201,
        body: JSON.stringify({
          item: newItem
        })
      }

    })

