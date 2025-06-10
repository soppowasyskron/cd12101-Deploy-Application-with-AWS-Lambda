import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import { getUserId } from '../utils.mjs'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {setAttachmentUrl} from "../../business/todoController.mjs";

const s3Client = new S3Client()
const bucketName = process.env.S3_BUCKET_NAME
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION_TIME)

export async function getS3UploadUrl(todoId) {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: todoId
    })
    return await getSignedUrl(s3Client, command, {
      expiresIn: urlExpiration
    })
  } catch (error) {
    return "Could not generate upload URL: " + error.message
  }
}

export function getFormattedUrl(todoId) {
  return `https://${bucketName}.s3.amazonaws.com/${todoId}`;
}

export const handler = middy()
    .use(httpErrorHandler())
    .use(
        cors({
          credentials: true
        })
    ).handler(async (event) => {
      const todoId = event.pathParameters.todoId
      const userId = getUserId(event)
      const image = JSON.parse(event.body)

      const uploadUrl = await getS3UploadUrl(todoId)
      const attachmentUrl = getFormattedUrl(todoId)

      await setAttachmentUrl(userId, todoId, image, attachmentUrl)

      return {
        statusCode: 200,
        body: JSON.stringify({
          uploadUrl
        })
      }
    })



