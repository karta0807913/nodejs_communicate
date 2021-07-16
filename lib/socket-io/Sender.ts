import { SocketAdapter } from "../adapter/index";
import serialization from "../http/serialization";
import Sender from "../interface/Sender";

export default class extends Sender {
  adapter: SocketAdapter;

  constructor(adapter: SocketAdapter, serialized: serialization) {
    super(serialized);
    if (!(adapter instanceof SocketAdapter)) {
      throw new TypeError("adapter type");
    }
    this.adapter = adapter;
    this.adapter.on_disconnect(this._set_disconnect.bind(this));
  }

  _send_request(data: any) {
    if (!this.adapter.is_connected()) {
      throw new TypeError("adapter disconnected");
    }
    return this.adapter.send_request(data);
  }

  async _connect(...args: any[]): Promise<boolean> {
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

  close(export_buffers: boolean = false) {
    this.adapter.close();
    return super.close(export_buffers);
  }
}