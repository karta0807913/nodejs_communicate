const SocketIOAdapter = require("./SocketIOAdapter.js");
const { NotConnectedError } = require("../interface/Errors.js");

class SocketClientAuthAdapter extends SocketIOAdapter {
    constructor(emitter, topic, secret) {
        super(emitter, topic);
        this._is_auth = false;
        this._topic = topic;
        this._secret = secret;
    }

    _send_data(...args) {
        if (!this._is_auth) {
            throw new NotConnectedError("not connected");
        }
        super._send_data(...args);
    }

    is_connected() {
        return this.emitter.connected && this._is_auth;
    }

    __connect() {
        this.emitter.emit(this._topic, this._secret);
        this.emit("connect");
    }

    __disconnect() {
        this._is_auth && this.emit("disconnect");
        this._is_auth = false;
    }

    connect() {
        return this._is_auth;
    }

    _listening(message) {
        if (this._is_auth) {
            super._listening(message);
        } else {
            if (message === "success") {
                this._is_auth = true;
            } else {
                console.warn(message);
            }
        }
    }
}

module.exports = SocketClientAuthAdapter;