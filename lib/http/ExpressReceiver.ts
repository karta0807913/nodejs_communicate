import Receiver from "../interface/Receiver";
import * as express from "express";
import Serialization, { Request } from "../interface/serialization";

interface RequestQuery {
  event: string;
}

export default class extends Receiver {
  constructor(server: express.Express, prefix: string, serialization: Serialization = new Serialization()) {
    super(serialization);
    server.post(prefix, this._listener.bind(this));
  }

  async _listener(req: express.Request<{}, {}, Request, RequestQuery>, res: express.Response): Promise<void> {
    if (req.body !== undefined) {
      req.body.event = req.query.event;
      let result = await this._emit(req.body);
      res.end(this.serialized.encode_response(result));
    } else {
      let data = "";
      req.on("data", (chunk) => {
        data += chunk;
      });
      req.on("end", async () => {
        let result = await this._emit(data);
        res.end(this.serialized.encode_response(result));
      });
    }
  }
}