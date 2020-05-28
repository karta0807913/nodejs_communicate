const { MethodNotImplementError } = require("../interface/Errors.js");
class SocketAdapter extends require("./EventAdapter") {
    constructor(emitter, topic) {
        super(emitter, topic);
        this._on_connect = () => { };
        this._on_disconnect = () => { };
    }

    connect() {
        new MethodNotImplementError("please implement this function");
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

    close() {
        this.emitter.close();
    }
}
module.exports = SocketAdapter;
