import { EventEmitter } from "events";
import { MethodNotImplementError } from "../interface/Errors";

export interface PacketData {
  serial: number;
  dataset: any;
  is_request: boolean;
}

export default class Adapter extends EventEmitter {
  _close: boolean;
  _serial_map: Map<number, Function>;
  _on_request: Function;

  constructor() {
    super();
    this._close = false;
    this._serial_map = new Map();
    this._on_request = () => { };
  }

  generate_serial(func: Function): number {
    let serial: number;
    do {
      serial = Math.random();
    } while (this._serial_map.has(serial));
    this._serial_map.set(serial, func);
    return serial;
  }

  remove_serial(serial: number): Function {
    var temp = this._serial_map.get(serial);
    this._serial_map.delete(serial);
    return temp;
  }

  async send_request(dataset: any): Promise<any> {
    if (this._close) return;
    return new Promise(async (s, r) => {
      let serial = this.generate_serial(s);
      try {
        await this._send_data({ serial, dataset, is_request: true });
      } catch (error) {
        r(error);
        this.remove_serial(serial);
      }
    });
  }

  // for input message
  async _listening(message: PacketData) {
    if (this._close) return;
    let { serial, dataset, is_request } = message;
    if (is_request === true) {
      let result = await this._on_request(dataset);
      if (this._close) return;
      let packet: PacketData = {
        dataset: result,
        is_request: false,
        serial: serial
      };
      await this._send_data(packet);
    } else if (is_request === false) {
      let func = this.remove_serial(serial);
      if (func) {
        func(dataset);
      }
    }
  }

  _send_data(dataset: PacketData): any {
    throw new MethodNotImplementError("please implement this function");
  }

  on_request(func: Function) {
    this._on_request = func;
  }

  close() {
    this._close = true;
    this.removeAllListeners();
  }
}