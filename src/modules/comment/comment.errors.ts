export class CommentNotFoundError extends Error {
  constructor(message: string = 'Comment not found') {
    super(message);
    this.name = 'CommentNotFoundError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}
