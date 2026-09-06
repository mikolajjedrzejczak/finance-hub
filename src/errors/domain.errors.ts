export class DomainError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends DomainError {
  constructor(message = 'Nie znaleziono zasobu') {
    super(message, 404);
  }
}

export class ConflictError extends DomainError {
  constructor(message = 'Zasób o podanych parametrach już istnieje') {
    super(message, 409);
  }
}

export class BadRequestError extends DomainError {
  constructor(message = 'Nieprawidłowe żądanie') {
    super(message, 400);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Nieautoryzowany dostęp') {
    super(message, 401);
  }
}

