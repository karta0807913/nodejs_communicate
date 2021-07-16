import Receiver from "../interface/Receiver";
import Adapter from "../adapter/Adapter";
import Serialization from "../interface/serialization";

export default class extends Receiver {
  adapter: Adapter;

  constructor(adapter: Adapter, serialized: Serialization = new Serialization()) {
    super(serialized);
    this.adapter = adapter;
    this.adapter.on_request(this._listen.bind(this));
  }

  async _listen(message: any) {
    let response_data = await this._emit(message);
    return this.serialized.encode_response(response_data);
  }

  close() {
    super.close();
    this.adapter.close();
  }
}