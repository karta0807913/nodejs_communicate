import Serialization, { Response, ErrorResponse } from "./serialization";
import { EventEmitter } from "events";

import { SenderAlreadyClosedError, ConnectTimeOutError, UserInteruptError } from "./Errors";

type ResolveFunction = (response: ErrorResponse | Response) => void;
type RejectFunction = (reason?: any) => void;

export interface UnfinishJobs {
  request: any;
  resolve: ResolveFunction;
  reject: RejectFunction;
}

export default abstract class Sender extends EventEmitter {
  serialized: Serialization
  retry_connect_time = 2000;
  connecting = false;
  connected = false;
  buffer_list: UnfinishJobs[] = [];
  _connect_args: any[] = [];
  _reconnect_timeout: NodeJS.Timeout | undefined = undefined;
  _is_close = false;

  constructor(serialized: Serialization) {
    super();
    this.serialized = serialized;
  }

  protected abstract _send_request(data: any): Promise<Response | ErrorResponse>;

  set_connect_args(...args: any[]): void {
    this._connect_args = args;
  }

  async send_request(event: string, ...args: any[]): Promise<any> {
    if (this._is_close) throw new SenderAlreadyClosedError("call a closed sender");
    var request = this.serialized.encode_request({ event, dataset: args });

    if (!this.connected) {
      // store request
      return new Promise(async (resolve, reject) => {
        this.buffer_list.push({
          request, resolve, reject
        });

        if (!this.connecting) {
          try {
            await this.connect();
          } catch (error) {
            this.emit("connect_error", error);
          }
        }
      })
    } else {
      return new Promise(async (reslove, reject) => {
        let result: ErrorResponse | Response
        try {
          result = await this._send_request(request);
        } catch (error) {
          this._handle_send_request_error(error, request, reslove, reject);
          return;
        }
        try {
          reslove(
            this.serialized.from_response(
              result
            )
          );
        } catch (error) {
          reject(error);
        }
      });
    }
  }

  _process_unfinish_job(job: UnfinishJobs): void {
    this._send_request(job.request).then((data) => {
      try {
        job.resolve(
          this.serialized.from_response(
            data
          )
        );
      } catch (error) {
        job.reject(error);
      }
    }).catch((error) => {
      this._handle_send_request_error(error, job.request, job.resolve, job.reject);
    });
  }

  async connect(): Promise<boolean> {
    if (this._is_close) throw new SenderAlreadyClosedError("sender closed");
    if (this._reconnect_timeout) {
      clearTimeout(this._reconnect_timeout);
      this._reconnect_timeout = undefined;
    }
    if (!this.connecting && !this.connected) {
      this.connecting = true;
      try {
        if (await this._connect(...this._connect_args)) {
          if (this._is_close) return false;
          var job = this.buffer_list.shift();
          while (job) {
            this._process_unfinish_job(job);
            job = this.buffer_list.shift();
          }
        } else {
          if (this._is_close) return false;
          this._reconnect_timeout = setTimeout(async () => {
            try {
              await this.connect();
            } catch (error) {
              this.emit("connect_error", error);
            }
          }, this.retry_connect_time);
        }
        this.connecting = false;
      } finally {
        this.connecting = false;
      }
    }
    return this.connected;
  }

  _handle_send_request_error(error: Error, request: any, resolve: ResolveFunction, reject: RejectFunction): void {
    this._set_disconnect(error);
    this.buffer_list.push({ request, resolve, reject });
  }

  async _connect(...args: any[]): Promise<boolean> {
    let resolve: (response: Response | ErrorResponse) => void, reject: (reason?: any) => void;
    let promise = new Promise<Response | ErrorResponse>((s, r) => {
      resolve = s;
      reject = r;
    });
    let error = new ConnectTimeOutError("connect time out");
    let timeout = setTimeout(() => reject(error), 3000);
    try {
      let request = this.serialized.encode_request({ event: "__connect", dataset: args });
      this._send_request(request).then((data) => { resolve(data); })
        .catch((error) => { reject(error); });
      let result = await promise;
      let connected = !!this.serialized.from_response(result);
      if (this.connected !== connected && connected) {
        this.emit("connect");
      }
      this.connected = connected;
      return this.connected;
    } finally {
      clearTimeout(timeout);
    }
  }

  on_disconnect(funcs: (...args: any[]) => void): void {
    this.on("disconnect", funcs);
  }

  on_connect(func: (...args: any[]) => void): void {
    this.on("connect", func);
  }

  on_connect_error(func: (...args: any[]) => void): void {
    this.on("connect_error", func);
  }

  is_connect(): boolean {
    return this.connected;
  }

  _set_disconnect(error?: Error): void {
    this.emit("connect_error", error);
    if (!this.connected) return;
    this.connected = false;
    if (this._reconnect_timeout) {
      clearTimeout(this._reconnect_timeout);
    }
    if (!this._is_close) {
      this._reconnect_timeout = setTimeout(this.connect.bind(this), this.retry_connect_time);
    }
    this.emit("disconnect");
  }

  import_jobs(jobs: UnfinishJobs[]): void {
    if (this._is_close) throw new SenderAlreadyClosedError("call a closed sender");
    for (let job of jobs) {
      job.request = this.serialized.encode_request(job.request);
      if (this.connected) {
        this._process_unfinish_job(job);
      } else {
        this.buffer_list.push(job);
      }
    }
  }

  close(export_buffers: boolean = false): UnfinishJobs[] | void {
    if (this._is_close) return;
    this._is_close = true;
    this._set_disconnect();
    if (this._reconnect_timeout) {
      clearTimeout(this._reconnect_timeout);
    }
    this._reconnect_timeout = undefined;
    if (export_buffers) {
      let buffers: UnfinishJobs[] = [];
      for (let job of this.buffer_list) {
        buffers.push({
          request: this.serialized.decode_request(job.request),
          resolve: job.resolve,
          reject: job.reject
        });
      }
      this.buffer_list = [];
      return buffers;
    }
    let job = this.buffer_list.shift();
    while (job) {
      job.reject(new UserInteruptError("Interrupt by user"));
      job = this.buffer_list.shift();
    };
    this.removeAllListeners();
  }
}