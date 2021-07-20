export interface ErrorResponse {
  is_error: boolean;
  name: string;
  message: string;
  stack: string | undefined;
}

export interface Response {
  is_error: boolean;
  result: any;
}

export interface Request {
  event: string;
  dataset: any;
}

export default class Serialization {
  encode_request(obj: Request): any {
    return obj;
  }

  decode_request(obj: any): Request {
    return obj;
  }

  to_response(obj: any): ErrorResponse | Response {
    if (obj instanceof Error) {
      return {
        is_error: true,
        name: obj.name,
        message: obj.message,
        stack: obj.stack
      };
    } else {
      return {
        is_error: false,
        result: obj
      };
    }
  }

  from_response(obj: ErrorResponse | Response): any {
    if (obj.is_error) {
      obj = obj as ErrorResponse
      let error = new Error();
      // function cus_error() { Error.captureStackTrace(this, cus_error); }
      // cus_error.prototype.__proto__ = Error.prototype;
      // cus_error.prototype.name = obj.name;
      // cus_error.prototype.message = obj.message;

      // let error = new cus_error();
      error.name = obj.name;
      error.message = obj.message;
      error.stack = obj.stack || error.stack;
      throw error;
    } else {
      return (obj as Response).result;
    }
  }

  encode_response(obj: ErrorResponse | Response): any {
    return obj;
  }

  decode_response(obj: any): ErrorResponse | Response {
    return obj;
  }
}
