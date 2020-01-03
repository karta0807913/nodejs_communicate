const EventAdapter = require("../adapter/EventAdapter");
const Receiver = require("./Receiver");
const Sender = require("./Sender");

exports.CreateReceiver = function(process, serialized) {
    if(process instanceof EventAdapter) {
        return new Receiver(process, serialized);
    }
    throw new Error("must instanceof EventApadter");
};

exports.CreateSender = function(process, serialized) {
    if(process instanceof EventAdapter) {
        return new Sender(process, serialized);
    }
    throw new Error("must instanceof EventApadter");
};