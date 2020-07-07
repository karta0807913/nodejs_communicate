const SocketAdapter = require("../adapter/SocketAdapter");
const { TypeError } = require("../interface/Errors.js");

class Receiver extends require("../interface/Receiver") {
    constructor(adapter, serialized) {
        super(serialized);
        if (!adapter instanceof SocketAdapter) {
            throw new TypeError("adapter type error");
        }
        this.adapter = adapter;
        this.adapter.on_request(this._listen.bind(this));
    }

    async _listen(message) {
        return this._emit(message);
    }

    close() {
        super.close();
        this.adapter.close();
    }
}

module.exports = Receiver;