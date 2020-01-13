class SocketIOAdapter extends require("./SocketAdapter") {
    constructor(emitter, topic) {
        super(emitter, topic);
        emitter.on("disconnect", ()=> {
            this._on_disconnect();
        });

        emitter.on("connect", ()=> {
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
