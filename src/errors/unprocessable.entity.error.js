export function unprocessableEntityError(message) {
  return {
    name: 'UnprocessableEntityError',
    message: `${message}`
  }
}