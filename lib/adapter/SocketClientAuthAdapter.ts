import SocketIOAdapter from "./SocketIOAdapter";
import { NotConnectedError } from "../interface/Errors";
import { PacketData } from "./Adapter";
import { Socket } from "socket.io-client";

export default class SocketClientAuthAdapter extends SocketIOAdapter {
  _is_auth: boolean = false;
  _secret: string;
  emitter: Socket;

  constructor(emitter: Socket, topic: string, secret: string) {
    super(emitter, topic);
    this._is_auth = false;
    this._secret = secret;
  }

  _send_data(data: PacketData) {
    if (!this._is_auth) {
      throw new NotConnectedError("not connected");
    }
    super._send_data(data);
  }

  is_connected() {
    return this.emitter.connected && this._is_auth;
  }

  __connect() {
    this.emitter.emit(this.topic, this._secret);
  }

  __disconnect() {
    this._is_auth && this.emit("disconnect");
    this._is_auth = false;
  }

  async connect(): Promise<boolean> {
    if (this._is_auth) {
      return true;
    }
    this.emitter.connect();
    return new Promise<boolean>((resolve, reject) => {
      this.once("connect", () => {
        resolve(true);
      });
      this.once("connect_error", (error: Error) => {
        reject(error);
      });
    });
  }

  async _listening(message: PacketData | string): Promise<void> {
    if (this._is_auth) {
      super._listening(message as PacketData);
    } else {
      if (message === "success") {
        this._is_auth = true;
        this.emit("connect");
      } else {
        this.emit("connect_error", new Error("Auth failed: " + message))
        this.__disconnect();
      }
    }
  }
}