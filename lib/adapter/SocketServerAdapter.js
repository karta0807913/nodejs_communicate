const SocketIOAdapter = require("./SocketIOAdapter");

class SocketServerAdapter extends require("./SocketAdapter") {
    constructor(io, topic) {
        super(io, "connection");
        this.socket = undefined;
        this.topic = topic;
    }

    _listening(socket) {
        if(this.socket) return;
        this.socket = new SocketIOAdapter(socket, this.topic);
        this.socket._listening = super._listening.bind(this);
        socket.on("disconnect", ()=> this.socket = undefined);
    }

    send_request(dataset) {
        if(!this.socket) {
            throw new Error("socket not connected");
        }
        return this.socket.send_request(dataset);
    }

    connect() {
        return this.is_connected();
    }

    is_connected() {
        return this.socket !== undefined;
    }
}

module.exports = SocketServerAdapter;