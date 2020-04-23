class Sender extends require("../interface/Sender") {
    constructor(adapter, serialized) {
        super(serialized);
        this.adapter = adapter;
    }

    _send_request(data) {
        return this.adapter.send_request(data);
    }

    close() {
        super.close();
        this.adapter.close();
    }
}

module.exports = Sender;