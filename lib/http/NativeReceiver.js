class Receiver extends require("../interface/Receiver") {
    constructor(server, prefix, serialization=require("./serialization")) {
        super(serialization);
        this.server = server;
        server.on("request", this._listener.bind(this));
        this.prefix = prefix;
    }

    async _listener(req, res) {
        var data = "";
        if(req.url !== this.prefix) {
            return;
        }
        req.on("data", (chunk)=> {
            data += chunk;
        });
        req.on("end", async ()=> {
            var result = await this._emit(data);
            res.end(result);
        });
    }

    close() {
        super.close();
        this.server.close();
    }
}

module.exports = Receiver;