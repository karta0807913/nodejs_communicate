const { equal } = require("assert");
const { SenderConfig, ReceiverConfig, CommunicateManager, Events, Adapter, Errors } = require("../index");

const EventEmitter = require("events");
const { unit_test } = require("./manager_test");

const emitter = new Adapter.EventAdapter(new EventEmitter());

async function run() {
    let receiver = Events.CreateReceiver(emitter);
    let sender = Events.CreateSender(emitter);

    receiver.add_listener("HI", ()=> {
        return "HI";
    });

    let result = await sender.connect();
    equal(result, false);

    let request = sender.serialized.encode_request({ event: "HI", dataset: [] });
    result = await sender._send_request(request);

    equal(result.is_error, true);
    equal(result.name, "Error");
    equal(result.message, "Not Connect");

    await receiver.init();
    result = await sender.connect();
    equal(result, true);

    result = await sender.send_request("HI");
    equal(result, "HI");
    sender.close();
    receiver.close();
}

run();
