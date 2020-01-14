const SocketIOAdapter = require("./SocketIOAdapter");

class SocketServerAdapter extends require("./SocketAdapter") {
    constructor(io, topic) {
        super(io, "connection");
        this.topic = topic;
        this._client_map = new Map();
    }

    _listening(socket) {
        var socket_id = socket.id;
        socket = new SocketIOAdapter(socket, this.topic);
        this._client_map.set(socket_id, socket);
        socket.id = socket_id;
        socket._listening = super._listening.bind(this);
        socket.on("disconnect", ()=> {
            this._client_map.delete(socket_id);
            if(this._client_map.size() === 0) {
                this._on_disconnect();
            }
        });
        return socket;
    }

    _send_data(dataset) {
        if(this._client_map.size() === 0) {
            throw new Error("socket not connected");
        }
        return this._client_map.values().next().value._send_data(dataset);
    }

    connect() {
        return this.is_connected();
    }

    is_connected() {
        return this.socket !== undefined;
    }

    disconnect(socket_id) {
        var socket = this._client_map.get(socket_id);
        socket && socket.emitter.disconnect();
    }
}

module.exports = SocketServerAdapter;