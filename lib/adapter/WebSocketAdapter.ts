import * as WebSocket from "ws";
import { PacketData } from "./Adapter";
import SocketAdapter from "./SocketAdapter";

export default class WebSocketAdapter extends SocketAdapter {
  emitter: WebSocket;

  constructor(emitter: WebSocket) {
    super(emitter, "message");
    this._close = false;

    emitter.on("open", () => {
      this.__connect();
    });

    emitter.on("close", () => {
      this.__disconnect();
    });

    emitter.on("error", () => {
    });
  }

  protected listen_topic() {
    this.emitter.on(this.topic, (data: any) => {
      this._listening(JSON.parse(data));
    });
  }

  _send_data(dataset: PacketData) {
    this.emitter.send(JSON.stringify(dataset));
  }

  on_connect(func: (...args: any[]) => void) {
    this.on("connect", func);
  }

  on_disconnect(func: () => void) {
    this.on("disconnect", func);
  }

  async connect(): Promise<boolean> {
    if (this._close) return false;
    return this.emitter.readyState === WebSocket.OPEN;
  }

  is_connected() {
    return this.emitter.readyState === WebSocket.OPEN;
  }

  close() {
    super.close();
    this._close = true;
    this.emitter.close();
  }
}