class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: Record<string, any>[];
  stack!: string;

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    errors?: Record<string, any>[],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
