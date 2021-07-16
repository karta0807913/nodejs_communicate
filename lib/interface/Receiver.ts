import * as assert from "assert";
import Serialization, { Response, ErrorResponse } from "./serialization";
import { NotConnectedError, MethodNotExistError, MethodNotImplementError } from "./Errors";

export default class Receiver {
  serialized: Serialization;
  _listening: Map<string, Function>;
  _init: boolean;
  _is_connect: boolean;

  constructor(serialized: Serialization = new Serialization()) {
    this.serialized = serialized;
    this._listening = new Map();
    this._init = false;
    this._is_connect = false;
    this.add_listener("__connect", this.__connect.bind(this));

    this.add_listener("__funcs", () => {
      return [...this._listening.keys()];
    });
  }

  async init(): Promise<boolean> {
    this._init = true;
    return true;
  }

  __connect(...args: any[]) {
    this._is_connect = this._init;
    return this._init;
  }

  add_listener(event_name: Function | string, func?: Function) {
    if (event_name instanceof Function) {
      assert(event_name.name !== "", "need named function");
      func = event_name;
      event_name = event_name.name;
    }
    assert(this._listening.has(event_name) === false, "One event can't have multiple listener");
    assert(func instanceof Function);
    this._listening.set(event_name, func);
  }

  remove_listener(event_name: string) {
    this._listening.delete(event_name);
  }

  disconnected() {
    this._is_connect = false;
  }

  // when event fired
  async _emit(obj: any): Promise<ErrorResponse | Response> {
    let result: any;
    try {
      var request = this.serialized.decode_request(obj);
      var func = this._listening.get(request.event);
      if (!this._is_connect && request.event !== "__connect") {
        throw new NotConnectedError("Not Connect");
      }
      if (!func) {
        throw new MethodNotExistError(`request event "${request.event}" not defined`);
      }
      result = await func(...request.dataset);
    } catch (error) {
      result = error;
    }
    let response = this.serialized.to_response(result);
    return response
  }

  /**
   * implement and call _emit method when event is fired
   * for example:
   * let response = await this._emit(args);
   * socket.send(this.serialized.encode_response(result));
   **/
  async _listener(...args: any[]): Promise<void> {
    throw new MethodNotImplementError("method not implement");
  }

  close() {
    this._listening.clear();
    this._init = false;
  }
}
