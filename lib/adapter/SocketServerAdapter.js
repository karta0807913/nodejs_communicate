const SocketIOAdapter = require("./SocketIOAdapter");
const { NotConnectedError } = require("../interface/Errors.js");

class SocketServerAdapter extends require("./SocketAdapter") {
    constructor(io, topic) {
        super(io, "connection");
        this.topic = topic;
        this.socket = null;
    }

    _listening(socket) {
        if (this.socket) {
            return socket.disconnect();
        }
        this.socket = new SocketIOAdapter(socket, this.topic);

        socket.on("disconnect", () => {
            this._set_disconnect();
        });
        this.socket._listening = super._listening.bind(this);
        this.emit("connect");
    }

    on_request(func) {
        this._on_request = func;
        this.socket && this.socket.on_request(this._on_request.bind(this));
    }

    _send_data(dataset) {
        if (!this.socket) {
            throw new NotConnectedError("socket not connected");
        }
        return this.socket._send_data(dataset);
    }

    _set_disconnect(...args) {
        this.socket = null;
        this.emit("disconnect");
    }

    connect() {
        return this.is_connected();
    }

    is_connected() {
        return this.socket !== null;
    }

    disconnect() {
        this.socket && this.socket.emitter.disconnect();
    }
}

module.exports = SocketServerAdapter;