import SocketAdapter from "../adapter/SocketAdapter";
import { TypeError } from "../interface/Errors";
import Receiver from "../events/Receiver";
import Serialization from "../interface/serialization";

export default class SocketReceiver extends Receiver {

  constructor(adapter: SocketAdapter, serialized: Serialization = new Serialization()) {
    super(adapter, serialized);
    if (!(adapter instanceof SocketAdapter)) {
      throw new TypeError("adapter type error");
    }
  }

  protected override async _listener(message: any): Promise<any> {
    return this.serialized.encode_response(
      await this._emit(message)
    );
  }
}