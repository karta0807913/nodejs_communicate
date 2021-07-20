import * as WebSocket from "ws";
import { PacketData } from "./Adapter";
import SocketAdapter from "./SocketAdapter";

export default class WebSocketAdapter extends SocketAdapter {
  protected override emitter: WebSocket;

  constructor(emitter: WebSocket) {
    super(emitter, "message");
    this.emitter = emitter;

    emitter.on("open", () => {
      this.__connect();
    });

    emitter.on("close", () => {
      this.__disconnect();
    });

    emitter.on("error", () => {
    });
  }

  protected override listen_topic(): void {
    this.emitter.on(this.topic, (data: any) => {
      this._listening(JSON.parse(data));
    });
  }

  protected override _send_data(dataset: PacketData): Promise<void> {
    this.emitter.send(JSON.stringify(dataset));
    return Promise.resolve();
  }

  async connect(): Promise<boolean> {
    if (this.is_close()) return false;
    return this.emitter.readyState === WebSocket.OPEN;
  }

  is_connected(): boolean {
    return this.emitter.readyState === WebSocket.OPEN;
  }

  override close(): void {
    super.close();
    this.emitter.close();
  }
}