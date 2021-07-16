import * as http from "http";
import Serialization from "./serialization";
import Receiver from "../interface/Receiver";

export default class extends Receiver {
  prefix: string;
  server: http.Server;
  serialized: Serialization

  constructor(server: http.Server, prefix: string, serialization: Serialization = new Serialization()) {
    super(serialization);
    this.server = server;
    server.on("request", this._listener.bind(this));
    this.prefix = prefix;
  }

  async _listener(req: http.IncomingMessage, res: http.ServerResponse) {
    var data = "";
    if (req.url !== this.prefix) {
      return;
    }
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", async () => {
      let result = await this._emit(data);
      res.end(this.serialized.encode_response(result));
    });
  }

  close() {
    super.close();
    this.server.close();
  }
}
