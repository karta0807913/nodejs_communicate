import Serialization, { ErrorResponse, Response, Request } from "../interface/serialization";

export default class extends Serialization {
  encode_request(obj: Request): Buffer {
    return Buffer.from(JSON.stringify(obj), "utf-8");
  }

  decode_request(obj: Buffer): Request {
    return JSON.parse(obj.toString("utf-8"));
  };

  encode_response(obj: ErrorResponse | Response): Buffer {
    return Buffer.from(JSON.stringify(obj));
  };

  decode_response(obj: Buffer): ErrorResponse | Response {
    return JSON.parse(obj.toString("utf-8"))
  };
}
