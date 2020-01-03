const SocketAdapter = require("../adapter/SocketAdapter");

class Sender extends require("../interface/Sender") {
    constructor(adapter, serialized) {
        super(serialized);
        if(!adapter instanceof SocketAdapter) {
            throw new Error("adapter type");
        }
        this.adapter = adapter;
    }

    _send_request(data) {
        return this.adapter.send_request(data);
    }

    _connect() {
        this.adapter.connect();
        if(this.adapter.is_connected()) {
            return super._connect();
        } else {
            return false;
        }
    }

    close() {
        this.adapter.close();
    }
}

module.exports = Sender;