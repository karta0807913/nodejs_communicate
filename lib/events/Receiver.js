class Receiver extends require("../interface/Receiver"){
    constructor(adapter, serialized) {
        super(serialized);
        this.adapter = adapter;
        this.adapter.on_request(this._listen.bind(this));
    }

    _listen(message) {
        return this._emit(message);
    }

    close() {
        this.adapter.close();
    }
}

module.exports = Receiver;