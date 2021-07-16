import Sender from "../interface/Sender";
import { Response, ErrorResponse } from "../interface/serialization";
import Serialization from "./serialization";

export default class extends Sender {
  request: any;
  host: string;
  port: string;
  prefix_path: string;
  headers: Map<string, string[]>;
  timeout: number;
  serialized: Serialization;

  constructor(host: string, headers = {} as Map<string, string[]>, timeout = 3000, serialization: Serialization = new Serialization()) {
    super(serialization);
    let url = new URL(host);
    this.request = require(url.protocol.slice(0, url.protocol.length - 1));
    this.host = url.hostname;
    if (url.port === "") {
      this.port = (url.protocol === "http") ? "80" : "443";

    }
    this.port = this.port || url.port;
    this.prefix_path = url.pathname;
    this.headers = headers;
    this.timeout = timeout;
  }

  async _send_request(data: Buffer): Promise<Response | ErrorResponse> {
    return new Promise((resolve, reject) => {
      let req = this.request.request({
        port: this.port,
        hostname: this.host,
        method: "POST",
        path: this.prefix_path,
        headers: {
          "Content-Length": data.length,
          ...this.headers
        },
        timeout: this.timeout,
      }, (res) => {
        let data = [];
        res.on('data', (chunk) => {
          data.push(chunk);
        });
        res.on('end', () => {
          try {
            resolve(
              this.serialized.decode_response(
                Buffer.concat(data)
              )
            );
          } catch (error) {
            reject(error);
          }
        });
      });
      req.write(data);
      req.on("error", (error) => {
        reject(error);
      });
      req.end();
    });
  }
}