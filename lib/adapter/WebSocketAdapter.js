const WebSocket = require("ws");

const SocketAdapter = require("./SocketAdapter");

class WebSocketAdapter extends SocketAdapter {
    constructor(emitter) {
        super(emitter, "message");
        this._closed = false;

        emitter.on("open", () => {
            this.__connect();
        });

        emitter.on("close", () => {
            this.__disconnect();
        });

        emitter.on("error", ()=> {
        });
    }

    __connect() {
        this.emit("connect");
    }

    __disconnect() {
        this.emit("disconnect");
    }

    _send_data(dataset) {
        dataset = JSON.stringify(dataset);
        this.emitter.send(dataset);
    }

    _listening(message) {
        super._listening(JSON.parse(message));
    }

    connect() {
        if (this._closed) return false;
        return this.emitter.readyState === WebSocket.OPEN;
    }

    is_connected() {
        return this.emitter.readyState === WebSocket.OPEN;
    }

    close() {
        super.close();
        this._closed = true;
        this.emitter.close();
    }
}

module.exports = WebSocketAdapter;