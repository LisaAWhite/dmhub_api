import HttpStatus from "http-status-codes";

class BaseError extends Error {
  statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  errorCode;

  constructor(message = "Something went wrong!", errorCode = "ERROR") {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }

  get errorResponse() {
    return {
      error: {
        code: this.errorCode,
        message: this.message,
      },
    };
  }
}

export default BaseError;