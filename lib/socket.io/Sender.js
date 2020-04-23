const SocketAdapter = require("../adapter/SocketAdapter");
const { TypeError } = require("../interface/Errors.js");

class Sender extends require("../interface/Sender") {
    constructor(adapter, serialized) {
        super(serialized);
        if(!adapter instanceof SocketAdapter) {
            throw new TypeError("adapter type");
        }
        this.adapter = adapter;
        this.adapter.on_disconnect(this._set_disconnect.bind(this));
    }

    _send_request(data) {
        if(!this.adapter.is_connected()) {
            throw new TypeError("adapter disconnected");
        }
        return this.adapter.send_request(data);
    }

    _connect(...args) {
        this.adapter.connect();
        if(this.adapter.is_connected()) {
            try {
                return super._connect(...args);
            } catch(error) {
                this.adapter.disconnect();
                throw error;
            }
        } else {
            return false;
        }
    }

    on_disconnect(...args) {
        super.on_disconnect(...args);
    }

    close() {
        super.close();
        this.adapter.close();
    }
}

module.exports = Sender;
