import { NotConnectedError } from "../interface/Errors";
import { PacketData } from "./Adapter";
import { Socket } from "socket.io-client";
import { Emitter } from "./EventAdapter";
import { Socket as ServerSideSocket } from "socket.io";

import SocketAdapter from "./SocketAdapter";

export default class SocketIOAdapter extends SocketAdapter {
  _closed: boolean;
  emitter: Socket | ServerSideSocket;

  constructor(emitter: Socket | ServerSideSocket, topic: string) {
    super(emitter, topic);
    this._closed = false;
    (emitter as Emitter).on("disconnect", () => {
      this.__disconnect();
    });

    (emitter as Emitter).on("connect", () => {
      this.__connect();
    });
  }

  async connect(): Promise<boolean> {
    if (this._closed) return false;
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

  _send_data(dataset: PacketData) {
    if (!this.emitter.connected && dataset.is_request) {
      throw new NotConnectedError("socket not connected");
    }
    super._send_data(dataset);
  }

  is_connected() {
    return this.emitter.connected;
  }

  close() {
    super.close();
    this.emitter.disconnect();
  }
}
