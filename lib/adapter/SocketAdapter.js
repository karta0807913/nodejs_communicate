class SocketAdapter extends require("./EventAdapter") {
    constructor(emitter, topic) {
        super(emitter, topic);
        this._on_connect = ()=>{};
        this._on_disconnect = ()=>{};
    }

    connect() {
        new Error("please implement this function");
    }

    on_connect(func) {
        this._on_connect = func;
    }

    on_disconnect(func) {
        this._on_disconnect = func;
    }

    is_connected() {
        return false;
    }

    disconnect() {
        this.emitter.disconnect();
    }
}
module.exports = SocketAdapter;
