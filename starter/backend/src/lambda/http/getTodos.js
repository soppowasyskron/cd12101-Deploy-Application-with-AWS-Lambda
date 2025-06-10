import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import cors from '@middy/http-cors'
import {createLogger} from "../../utils/logger.mjs";
import {getUserId} from "../utils.mjs";
import {getTodos} from "../../business/todoController.mjs";

const logger = createLogger("GetTodos");

export const handler = middy()
    .use(httpErrorHandler())
    .use(cors({
            credentials: true
        })
    ).handler(async (event) => {
        logger.info("Returning all todos")

        console.log("Event:", JSON.stringify(event, null, 2));

        const userId = getUserId(event);
        const todos = await getTodos(userId);

        logger.info("Todos retrieved successfully", {userId, todos});

        return {
            statusCode: 200,
            body: JSON.stringify({
                items: todos
            }),
        };
    })
