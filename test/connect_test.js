const { CommunicateManager, Events, Adapter } = require("../index");
const { unit_test } = require("./manager_test");
const assert = require("assert");

const EventEmitter = require("events");
const emitter = new EventEmitter();

class EventReceiver extends Events.Receiver {
    constructor(adapter, secret, serialized) {
        super(adapter, serialized);
        this.secret = secret;
    }

    __connect(secret) {
        if(this.secret !== secret) {
            throw new Error("Please Check Secret");
        }
        return this._init;
    }
}

class EventSender extends Events.Sender {
    constructor(adapter, secret, serialized) {
        super(adapter, serialized);
        this.secret = secret;
    }

    async _connect() {
        return await super._connect(this.secret);
    }
}

const adapter = new Adapter.EventAdapter(emitter);
const secret = Math.random();
const receiver = new EventReceiver(adapter, secret);
const wrong_sender = new EventSender(adapter, Math.random());
const sender = new EventSender(adapter, secret);

const manager = new CommunicateManager(sender, receiver);

async function main() {
    receiver.init();

    var success = false;
    var error = undefined;
    try {
        await wrong_sender.connect();
    } catch(err) {
        error = err;
        assert(error.message === "Please Check Secret");
        success = true;
    }

    try {
        assert(success, error);
    } catch(error) {
        console.log(error);
        process.exit(1);
    }

    try {
        await unit_test(manager);
        await manager.close();
    } catch(error) {
        console.log(error);
        process.exit(1);
    }
}
main();