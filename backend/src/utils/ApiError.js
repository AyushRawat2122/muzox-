class ApiError extends Error {
  constructor(statusCode = 500, message = "Something went wrong", errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

export default ApiError;
