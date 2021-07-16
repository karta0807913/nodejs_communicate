import { EventEmitter } from "events";
import { SenderConfig, ReceiverConfig, CommunicateManager, Events, Adapter } from "../index";

import { unit_test } from "./manager_test";

const emitter = new Adapter.EventAdapter(new EventEmitter(), "test-topic");

class ProcessSenderConfig extends SenderConfig {
  _create() {
    return Events.CreateSender(emitter);
  }
}

class ProcessReceiverConfig extends ReceiverConfig {
  _create() {
    return Events.CreateReceiver(emitter);
  }
}

let manager = new CommunicateManager(new ProcessSenderConfig(), new ProcessReceiverConfig());
manager.on("connect_error", (error: Error) => {
  console.log(error);
  process.exit(1);
})
unit_test(manager).then(() => {
  manager.close();
}).catch((error) => {
  console.log(error);
  process.exit(1);
});