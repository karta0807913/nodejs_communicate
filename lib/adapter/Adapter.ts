import { EventEmitter } from "events";
import { ErrorResponse, Response } from "../interface/serialization";

export interface PacketData {
  serial: number;
  dataset: any;
  is_request: boolean;
}

export default abstract class Adapter extends EventEmitter {
  private _close: boolean;
  private _serial_map: Map<number, (dataset: ErrorResponse | Response) => void>;
  protected _on_request: (dataset: any) => Promise<any>;

  constructor() {
    super();
    this._close = false;
    this._serial_map = new Map();
    this._on_request = async () => { };
  }

  generate_serial(func: (dataset: ErrorResponse | Response) => void): number {
    let serial: number;
    do {
      serial = Math.random();
    } while (this._serial_map.has(serial));
    this._serial_map.set(serial, func);
    return serial;
  }

  remove_serial(serial: number): ((dataset: ErrorResponse | Response) => void) | undefined {
    var temp = this._serial_map.get(serial);
    this._serial_map.delete(serial);
    return temp;
  }

  async send_request(dataset: any): Promise<ErrorResponse | Response> {
    if (this._close) return Promise.reject(new Error("adapter closed"));
    return new Promise<ErrorResponse | Response>(async (s, r) => {
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
  async _listening(message: PacketData): Promise<void> {
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

  protected abstract _send_data(dataset: PacketData): Promise<void>;

  on_request(func: (dataset: Response | ErrorResponse) => Promise<void>): void {
    this._on_request = func;
  }

  is_close(): boolean {
    return this._close;
  }

  close(): void {
    this._close = true;
    this.removeAllListeners();
  }
}