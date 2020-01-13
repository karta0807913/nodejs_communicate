const { SenderConfig, ReceiverConfig, CommunicateManager, Events, Adapter } = require("../index");

const EventEmitter = require("events");
const { unit_test } = require("./manager_test");

const emitter = new Adapter.EventAdapter(new EventEmitter());

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

var manager = new CommunicateManager(new ProcessSenderConfig(), new ProcessReceiverConfig());
unit_test(manager).then(()=> {
    manager.close();
});