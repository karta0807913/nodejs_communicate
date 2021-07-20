import serialization from "../http/serialization";
import Sender from "../events/Sender";
import { ErrorResponse, Response } from "../interface/serialization";
import { SocketAdapter } from "../adapter";

export default class SocketSender extends Sender {
  protected override adapter: SocketAdapter;

  constructor(adapter: SocketAdapter, serialized: serialization) {
    super(adapter, serialized);
    if (!(adapter instanceof SocketAdapter)) {
      throw new TypeError("adapter type");
    }
    this.adapter = adapter;
    this.adapter.on_disconnect(this._set_disconnect.bind(this));
  }

  override _send_request(data: any): Promise<ErrorResponse | Response> {
    if (!this.adapter.is_connected()) {
      throw new TypeError("adapter disconnected");
    }
    return super._send_request(data);
  }

  override async _connect(...args: any[]): Promise<boolean> {
    await this.adapter.connect();
    if (this.adapter.is_connected()) {
      try {
        return super._connect(...args);
      } catch (error) {
        throw error;
      }
    } else {
      return false;
    }
  }
}