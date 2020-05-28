const { NotConnectedError } = require("../interface/Errors.js");
class SocketIOAdapter extends require("./SocketAdapter") {
    constructor(emitter, topic) {
        super(emitter, topic);
        this._closed = false;
        emitter.on("disconnect", () => {
            this.__disconnect();
        });

        emitter.on("connect", () => {
            this.__connect();
        });
    }

    __connect() {
        this.emit("connect");
    }

    __disconnect() {
        this.emit("disconnect");
    }

    connect() {
        if (this._closed) return false;
        if (!this.emitter.connected) {
            this.emitter.connect();
        }
        return this.emitter.connected;
    }

    _send_data(dataset) {
        if (!this.emitter.connected && dataset.is_request) {
            throw new NotConnectedError("socket not connected");
        }
        super._send_data(dataset);
    }

    is_connected() {
        return this.emitter.connected;
    }

    close() {
        this.removeAllListeners();
        this._closed = true;
        this.emitter.disconnect();
    }
}

module.exports = SocketIOAdapter;
