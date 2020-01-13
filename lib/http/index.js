const ExpressReceiver = require("./ExpressReceiver");
const NativeReceiver  = require("./NativeReceiver");
const Sender = require("./Sender");
const assert = require("assert");
const EventEmitter = require("events");

function CreateReceiver (host, prefix) {
    if(host.post !== undefined) {
        return new ExpressReceiver(host, prefix);
    }
    assert(host instanceof EventEmitter);
    return new NativeReceiver(host, prefix);
}

function CreateSender(url, headers={}, timeout=3000) {
    return new Sender(url, headers, timeout);
}

module.exports = {
    CreateReceiver,
    CreateSender,
    ExpressReceiver,
    NativeReceiver,
    Sender
};