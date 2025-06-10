import {TodoService} from "../data/todoService.mjs";

const todoService = new TodoService()

export async function getTodos(userId) {
    return todoService.getTodos(userId);
}

export async function createTodo(todo) {
    return todoService.createTodo(todo);
}


export async function updateTodo(userId, todoId, updatedTodo) {
    return todoService.updateTodo(userId, todoId, updatedTodo)
}

export async function deleteTodo(userId, todoId) {
    return todoService.deleteTodo(userId, todoId)
}

export async function setAttachmentUrl(userId, todoId, image, attachmentUrl) {
    return todoService.setAttachmentUrl(userId, todoId, image, attachmentUrl)
}