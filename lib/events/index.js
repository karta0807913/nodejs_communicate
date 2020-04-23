const EventAdapter = require("../adapter/EventAdapter");
const Receiver = require("./Receiver");
const Sender = require("./Sender");
const { TypeError } = require("../interface/Errors.js");

exports.CreateReceiver = function(process, serialized) {
    if(process instanceof EventAdapter) {
        return new Receiver(process, serialized);
    }
    throw new TypeError("must instanceof EventApadter");
};

exports.CreateSender = function(process, serialized) {
    if(process instanceof EventAdapter) {
        return new Sender(process, serialized);
    }
    throw new TypeError("must instanceof EventApadter");
};

exports.Sender = Sender;
exports.Receiver = Receiver;