const SocketIOAdapter = require("./SocketIOAdapter.js");

class SocketClientAuthAdapter extends SocketIOAdapter {
    constructor(emitter, topic, secret) {
        super(emitter, topic);
        this._is_auth = false;
        emitter.on("connect", () => {
            emitter.emit(topic, secret);
        });

        emitter.on("disconnect", () => {
            this._is_auth = false;
        });
    }

    _send_data(...args) {
        if (!this._is_auth) {
            throw new Error("not connected");
        }
        super._send_data(...args);
    }

    is_connected() {
        return this.emitter.connected && this._is_auth;
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