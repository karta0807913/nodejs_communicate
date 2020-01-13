const SocketAdapter = require("../adapter/SocketAdapter");

class Sender extends require("../interface/Sender") {
    constructor(adapter, serialized) {
        super(serialized);
        if(!adapter instanceof SocketAdapter) {
            throw new Error("adapter type");
        }
        this.adapter = adapter;
        this.adapter.on_disconnect(this.on_disconnect.bind(this));
    }

    _send_request(data) {
        if(!this.adapter.is_connected()) {
            throw new Error("adapter disconnected");
        }
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

    on_disconnect(...args) {
        super.on_disconnect(...args);
    }

    _on_disconnect() {
        this._set_disconnect();
    }

    close() {
        this.adapter.close();
    }
}

module.exports = Sender;
