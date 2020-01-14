const SocketIOAdapter = require("./SocketIOAdapter");

class SocketServerAdapter extends require("./SocketAdapter") {
    constructor(io, topic) {
        super(io, "connection");
        this.topic = topic;
        this.socket = null;
    }

    _listening(socket) {
        if(this.socket) return;
        this.socket = new SocketIOAdapter(socket, this.topic);
        this._on_request && this.socket.on_request(this._on_request.bind(this));

        socket.on("disconnect", ()=> {
            this._on_disconnect();
            this.socket = null;
        });
        this.socket._listening = super._listening.bind(this);
        this.socket._send_data = super._send_data.bind(this);
    }

    on_request(func) {
        this._on_request = func;
        this.socket && this.socket.on_request(this._on_request.bind(this));
    }

    async _send_data(dataset) {
        if(!this.socket) {
            throw new Error("socket not connected");
        }
        return await this.socket._send_data(dataset);
    }

    connect() {
        return this.is_connected();
    }

    is_connected() {
        return this.socket !== undefined;
    }

    disconnect() {
        this.socket && this.socket.emitter.disconnect();
    }
}

module.exports = SocketServerAdapter;