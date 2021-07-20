import SocketIOAdapter from "./SocketIOAdapter";
import { NotConnectedError } from "../interface/Errors";
import { PacketData } from "./Adapter";
import { Socket } from "socket.io-client";

export default class SocketClientAuthAdapter extends SocketIOAdapter {
  private _is_auth: boolean = false;
  private _secret: string;
  protected override emitter: Socket;

  constructor(emitter: Socket, topic: string, secret: string) {
    super(emitter, topic);
    this.emitter = emitter;
    this._is_auth = false;
    this._secret = secret;
  }

  override _send_data(data: PacketData): Promise<void> {
    if (!this._is_auth) {
      throw new NotConnectedError("not connected");
    }
    return super._send_data(data);
  }

  override is_connected(): boolean {
    return this.emitter.connected && this._is_auth;
  }

  override __connect(): void {
    this.emitter.emit(this.topic, this._secret);
  }

  override __disconnect(): void {
    this._is_auth && super.__disconnect();
    this._is_auth = false;
  }

  override async connect(): Promise<boolean> {
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

  override async _listening(message: PacketData | string): Promise<void> {
    if (this._is_auth) {
      super._listening(message as PacketData);
    } else {
      if (message === "success") {
        this._is_auth = true;
        super.__connect();
      } else {
        this.emit("connect_error", new Error("Auth failed: " + message))
        this.__disconnect();
      }
    }
  }
}