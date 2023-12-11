export function notFoundError(message) {
  return {
    name: 'NotFoundError',
    message: `${message} does not exist`
  }
}