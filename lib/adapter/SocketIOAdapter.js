class SocketIOAdapter extends require("./SocketAdapter") {
    constructor(emitter, topic) {
        super(emitter, topic);
        this.connected = emitter.connected;
        emitter.on("disconnect", ()=> {
            this.connected = false;
            this._on_disconnect();
        });

        emitter.on("connect", ()=> {
            this.connected = true;
            this._on_connect();
        });
    }

    connect() {
        this.emitter.connect();
    }

    _send_data(dataset) {
        if(!this.emitter.connected && dataset.is_request) {
            throw new Error("socketno connected");
        }
        super._send_data(dataset);
    }

    is_connected() {
        return this.emitter.connected;
    }

    close() {
        this.emitter.disconnect();
    }
}

module.exports = SocketIOAdapter;