import SocketAdapter from "../adapter/SocketAdapter";
import { TypeError } from "../interface/Errors";
import Receiver from "../interface/Receiver";
import Serialization from "../interface/serialization";

export default class extends Receiver {
  adapter: SocketAdapter;

  constructor(adapter: SocketAdapter, serialized: Serialization = new Serialization()) {
    super(serialized);
    if (!(adapter instanceof SocketAdapter)) {
      throw new TypeError("adapter type error");
    }
    this.adapter = adapter;
    this.adapter.on_request(this._listener.bind(this));
  }

  async _listener(message: any): Promise<any> {
    return this.serialized.encode_response(
      await this._emit(message)
    );
  }

  close() {
    super.close();
    this.adapter.close();
  }
}