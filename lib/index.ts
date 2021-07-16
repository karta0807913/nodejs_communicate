import Sender, { UnfinishJobs } from "./interface/Sender";
import Receiver from "./interface/Receiver";
import Serialization from "./interface/serialization";
import * as Adapter from "./adapter";
import * as Socket from "./socket-io";
import * as Errors from "./interface/Errors";
import * as Http from "./http";
import * as Events from "./events";

import { EventEmitter } from "events";

import { CreateSender as CreateEventsSender, CreateReceiver as CreateEventsReceiver } from "./events/index";

import * as cp from "child_process";
import * as assert from "assert";

abstract class SenderConfigInterface {
  abstract create(): Sender;
  abstract close(): void;
}

abstract class SenderConfig extends SenderConfigInterface {
  _sender: Sender;
  create() {
    if (!this._sender) {
      this._sender = this._create();
    }
    return this._sender;
  }

  abstract _create(): Sender;

  close(): void {
    this._sender && this._sender.close();
  }
}

abstract class ReceiverConfigInterface {
  abstract create(): Receiver;
  abstract close(): void;
}

abstract class ReceiverConfig extends ReceiverConfigInterface {
  _receiver: Receiver;
  create() {
    if (!this._receiver) {
      this._receiver = this._create();
    }
    return this._receiver;
  }

  abstract _create(): Receiver;

  close() {
    this._receiver && this._receiver.close();
  }
}

abstract class SRConfig {
  _receiver: Receiver;
  _sender: Sender;

  createReceiver() {
    if (!this._receiver) {
      this._receiver = this._createReceiver();
    }
    return this._receiver;
  };
  createSender() {
    if (!this._sender) {
      this._sender = this._createSender();
    }
    return this._sender;
  }

  abstract _createSender(): Sender;
  abstract _createReceiver(): Receiver;

  toSenderConfig(): SenderConfigWrapper {
    return new SenderConfigWrapper(this);
  }

  toReceiverConfig(): ReceiverConfigWrapper {
    return new ReceiverConfigWrapper(this);
  }

  close() {
    this._sender && this._sender.close();
    this._receiver && this._receiver.close();
  }
}

class ProcessSRConfig extends SRConfig {
  process: Adapter.ProcessAdapter;

  constructor(process: NodeJS.Process | cp.ChildProcess) {
    super();
    assert(process instanceof EventEmitter);
    this.process = new Adapter.ProcessAdapter(process);
  }

  _createSender(): Sender {
    return CreateEventsSender(this.process);
  }

  _createReceiver() {
    return CreateEventsReceiver(this.process);
  }
}

class SenderConfigWrapper extends SenderConfigInterface {
  config: SRConfig;

  constructor(config: SRConfig) {
    super();
    assert(config instanceof SRConfig);
    this.config = config;
  }

  create() {
    return this.config.createSender();
  }

  close() {
    this.config.close();
  }
}

class ReceiverConfigWrapper extends ReceiverConfigInterface {
  config: SRConfig;

  constructor(config: SRConfig) {
    super();
    assert(config instanceof SRConfig);
    this.config = config;
  }

  create() {
    return this.config.createReceiver();
  }

  close() {
    this.config.close();
  }
}

class CommunicateManager extends EventEmitter {
  _closed: boolean;
  _raw_sender: Sender | SenderConfigInterface | SRConfig;
  _raw_receiver?: Receiver | ReceiverConfigInterface;
  sender: Sender;
  receiver: Receiver;

  constructor(sender: SRConfig);
  constructor(sender: Sender | SenderConfigInterface, receiver: Receiver | ReceiverConfigInterface);
  constructor(sender: Sender | SenderConfigInterface | SRConfig, receiver?: Receiver | ReceiverConfigInterface) {
    super();
    this._closed = false;
    this._raw_sender = sender;
    this._raw_receiver = receiver;
    if (sender instanceof SenderConfigInterface) {
      sender = sender.create();
    }
    if (receiver instanceof ReceiverConfigInterface) {
      receiver = receiver.create();
    }
    if (sender instanceof SRConfig) {
      receiver = sender.createReceiver();
      sender = sender.createSender();
    }
    assert(sender instanceof Sender);
    assert(receiver instanceof Receiver);
    this.sender = sender;
    this.receiver = receiver;
    this.sender.on_disconnect(() => {
      this.receiver.disconnected();
      this.emit("disconnect");
    });

    this.sender.on_connect(() => {
      this.emit("connect");
    });

    this.sender.on_connect_error((error: Error) => {
      this.emit("connect_error", error);
    });
  }

  add_listener(event_name: string | Function, listener?: Function) {
    return this.receiver.add_listener(event_name, listener);
  }

  remove_listener(event_name: string) {
    return this.receiver.remove_listener(event_name);
  }

  async init(instance: boolean | Object = false): Promise<any | boolean> {
    if (this.is_close()) return;
    await this.receiver.init();
    if (!await this.sender.connect()) {
      return false;
    }
    if (instance) {
      if (!(instance instanceof Object)) {
        instance = {};
      }
      var funcs = await this.send_request("__funcs");
      for (var func_name of funcs) {
        instance[func_name] = this.send_request.bind(this, func_name);
      }
      return instance;
    }
    return true;
  }

  async send_request(event: string, ...args: any[]) {
    await this.receiver.init();
    return this.sender.send_request(event, ...args);
  }

  on_disconnect(func: (...args: any[]) => void) {
    this.on("disconnect", func);
  }

  on_connect(func: (...args: any[]) => void) {
    this.on("connect", func);
  }

  is_connect() {
    return this.sender.is_connect();
  }

  is_close() {
    return this._closed;
  }

  close() {
    this._closed = true;
    this.removeAllListeners();
    this.sender.close();
    this.receiver.close();
    this._raw_receiver && this._raw_receiver.close();
    this._raw_sender && this._raw_sender.close();
  }
}

function ForkProcess(filename: string, args: readonly string[], options: { env?: {} } = {}) {
  if (!options.env) {
    options.env = {};
  }
  if (!options.env["NODE_PATH"]) {
    options.env["NODE_PATH"] = __dirname + "/../../";
  }
  return cp.fork(filename, args, options);
}

function CreateProcessSRConfig(filename: NodeJS.Process | cp.ChildProcess | string, args?: readonly string[], options?: { env?: {} }) {
  if (filename instanceof EventEmitter) {
    return new ProcessSRConfig(filename);
  }
  return new ProcessSRConfig(ForkProcess(filename as string, args, options));
}

export {
  CreateProcessSRConfig,
  CommunicateManager,
  SenderConfigInterface, ReceiverConfigInterface,
  SenderConfig, ReceiverConfig, SRConfig,
  SenderConfigWrapper, ReceiverConfigWrapper,
  Sender, Receiver,
  Events, Adapter, Socket, Http, Serialization,
  Errors, UnfinishJobs
};
