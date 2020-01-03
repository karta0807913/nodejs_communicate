class Sender extends require("../interface/Sender") {
    constructor(host, headers={}, timeout=3000, serialization=require("./serialization")) {
        super(serialization);
        var url = new URL(host);
        this.request = require(url.protocol.slice(0, url.protocol.length - 1));
        this.host = url.hostname;
        if(url.port === "") {
            url.port = (url.protocol === "http") ? 80 : 443;
        }
        this.port = url.port;
        this.prefix_path = url.pathname;
        this.headers = headers;
        this.timeout = timeout;
    }

    _send_request(data) {
        return new Promise((reslove, reject)=> {
            var req = this.request.request({
                port: this.port,
                hostname: this.host,
                method: "POST",
                path: this.prefix_path,
                headers: {
                    "Content-Length": data.length,
                    ...this.headers
                },
                timeout: this.timeout,
            }, (res) => {
                var data = [];
                res.on('data', (chunk) => {
                    data.push(chunk);
                });
                res.on('end', () => {
                    try {
                        reslove(Buffer.concat(data));
                    } catch(error) {
                        reject(error);
                    }
                });
            });
            req.write(data);
            req.on("error", (error) => {
                reject(error);
            });
            req.end();
        });
    }
}

module.exports = Sender;