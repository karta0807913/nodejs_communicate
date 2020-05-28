const { MethodNotImplementError } = require("../interface/Errors.js");
class SocketAdapter extends require("./EventAdapter") {
    constructor(emitter, topic) {
        super(emitter, topic);
    }

    connect() {
        new MethodNotImplementError("please implement this function");
    }

    on_connect(func) {
        this.on("connect", func);
    }

    on_disconnect(func) {
        this.on("disconnect", func);
    }

    is_connected() {
        return false;
    }

    close() {
        super.close();
        this.emitter.close();
    }
}
module.exports = SocketAdapter;
