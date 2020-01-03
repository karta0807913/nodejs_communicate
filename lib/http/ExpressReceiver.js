const assert = require("assert");
const NativeReceiver = require("./NativeReceiver");

class ExpressReceiver extends require("../interface/Receiver") {
    constructor(server, prefix, serialization=require("./serialization")) {
        super(serialization);
        server.post(prefix, this._listener.bind(this));
    }

    async _listener(req, res) {
        if(req.body !== undefined) {
            req.body.event = req.query.event;
            var result = await this._emit(req.body);
            res.end(this.serialized.encode_response(result));
        } else {
            NativeReceiver.prototype._listener.call(this, req, res);
        }
    }
}

module.exports = ExpressReceiver;
