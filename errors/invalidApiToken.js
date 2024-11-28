import HttpStatus from "http-status-codes";

import BaseError from "./base.js";

class InvalidApiToken extends BaseError {
  statusCode = HttpStatus.UNAUTHORIZED;

  constructor(message = "Invalid API token.", errorCode = "INVALID_API_TOKEN") {
    super(message, errorCode);
  }
}

export default InvalidApiToken;