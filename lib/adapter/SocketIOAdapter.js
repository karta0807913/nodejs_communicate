class SocketIOAdapter extends require("./SocketAdapter") {
    constructor(emitter, topic) {
        super(emitter, topic);
        emitter.on("disconnect", ()=> {
            this.__disconnect();
        });

        emitter.on("connect", ()=> {
            this.__connect();
        });
    }

    __connect() {
        this._on_connect();
    }

    __disconnect() {
        this._on_disconnect();
    }

    connect() {
        this.emitter.connect();
    }

    _send_data(dataset) {
        if(!this.emitter.connected && dataset.is_request) {
            throw new Error("socket not connected");
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
