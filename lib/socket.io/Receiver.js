const SocketAdapter = require("../adapter/SocketAdapter");

class Receiver extends require("../interface/Receiver"){
    constructor(adapter, serialized) {
        super(serialized);
        if(!adapter instanceof SocketAdapter) {
            throw new Error("adapter type");
        }
        this.adapter = adapter;
        this.adapter.on_request(this._listen.bind(this));
    }

    async _listen(message) {
        return this._emit(message);
    }

    close() {
        this.adapter.close();
    }
}

module.exports = Receiver;