const SocketAdapter = require("../adapter/SocketAdapter");
const Receiver = require("./Receiver");
const Sender = require("./Sender");

exports.CreateReceiver = function(process, serialized) {
    if(process instanceof SocketAdapter) {
        return new Receiver(process, serialized);
    }
    throw new Error("must instanceof SocketAdapter");
};

exports.CreateSender = function(process, serialized) {
    if(process instanceof SocketAdapter) {
        return new Sender(process, serialized);
    }
    throw new Error("must instanceof SocketAdapter");
};