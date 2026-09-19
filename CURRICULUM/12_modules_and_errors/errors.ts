// Companion module for Exercise 12.
// Imported by exercises.ts as "./errors.js".

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
  ) {
    super(message);
    this.name = "ValidationError";   // without this, err.name would be "Error"
  }
}

export class NotFoundError extends Error {
  constructor(public readonly id: number) {
    super(`no record with id ${id}`);
    this.name = "NotFoundError";
  }
}

export const isValidationError = (e: unknown): e is ValidationError =>
  e instanceof ValidationError;
