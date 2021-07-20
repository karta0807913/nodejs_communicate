import { NotConnectedError } from "../interface/Errors";
import { PacketData } from "./Adapter";
import { Socket } from "socket.io-client";
import { Emitter } from "./EventAdapter";
import { Socket as ServerSideSocket } from "socket.io";

import SocketAdapter from "./SocketAdapter";

export default class SocketIOAdapter extends SocketAdapter {

  protected override emitter: Socket | ServerSideSocket;

  constructor(emitter: Socket | ServerSideSocket, topic: string) {
    super(emitter, topic);
    this.emitter = emitter;
    (emitter as Emitter).on("disconnect", () => {
      this.__disconnect();
    });

    (emitter as Emitter).on("connect", () => {
      this.__connect();
    });
  }

  id(): string | null {
    if (this.emitter) {
      return this.emitter.id;
    }
    return null
  }

  async connect(): Promise<boolean> {
    if (this.is_close()) return false;
    if (this.emitter.connected) {
      return true;
    }
    (this.emitter as Socket).connect();
    return new Promise<boolean>((resolve) => {
      (this.emitter as Emitter).on("connect", () => {
        resolve(true);
      });
    });
  }

  override _send_data(dataset: PacketData): Promise<void> {
    if (!this.emitter.connected && dataset.is_request) {
      throw new NotConnectedError("socket not connected");
    }
    return super._send_data(dataset);
  }

  is_connected(): boolean {
    return this.emitter.connected;
  }

  override close(): void {
    super.close();
    this.emitter.disconnect();
  }
}
