import NativeReceiver from "./NativeReceiver";
import Receiver from "../interface/Receiver";
import * as express from "express";
import Serialization from "../interface/serialization";

export default class extends Receiver {
  constructor(server: express.Express, prefix: string, serialization: Serialization = new Serialization()) {
    super(serialization);
    server.post(prefix, this._listener.bind(this));
  }

  async _listener(req: express.Request, res: express.Response) {
    if (req.body !== undefined) {
      req.body.event = req.query.event;
      let result = await this._emit(req.body);
      res.end(this.serialized.encode_response(result));
    } else {
      NativeReceiver.prototype._listener.call(this, req, res);
    }
  }
}