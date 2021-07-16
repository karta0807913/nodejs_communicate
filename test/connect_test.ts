import { CommunicateManager, Events, Adapter, Serialization } from "../index";
import { unit_test } from "./manager_test";
import * as assert from "assert";
import { EventEmitter } from "events";

const emitter = new EventEmitter();

class EventReceiver extends Events.Receiver {
  secret: string;
  constructor(adapter: Adapter.Adapter, secret: string, serialized?: Serialization) {
    super(adapter, serialized);
    this.secret = secret;
  }

  __connect(secret: string) {
    if (this.secret !== secret) {
      throw new Error("Please Check Secret");
    }
    return super.__connect();
  }
}

class EventSender extends Events.Sender {
  secret: string;
  constructor(adapter: Adapter.Adapter, secret: string, serialized?: Serialization) {
    super(adapter, serialized);
    this.secret = secret;
  }
}

const adapter = new Adapter.EventAdapter(emitter, "test-topic");
const secret = Math.random() + "";
const receiver = new EventReceiver(adapter, secret);
const wrong_sender = new EventSender(adapter, Math.random() + "");
const sender = new EventSender(adapter, secret);
sender.set_connect_args(secret);

const manager = new CommunicateManager(sender, receiver);

async function main() {
  receiver.init();

  var success = false;
  var error = undefined;
  try {
    await wrong_sender.connect();
  } catch (err) {
    error = err;
    assert(error.message === "Please Check Secret");
    success = true;
  }

  try {
    assert(success, error);
  } catch (error) {
    console.log("Auth check failed");
    process.exit(1);
  }

  try {
    await unit_test(manager);
    await manager.close();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}
main();
