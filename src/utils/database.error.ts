export class DatabaseError extends Error {
  constructor(message: string = 'Database error') {
    super(message);
    this.name = 'DatabaseError';
  }
}
