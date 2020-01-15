const assert = require("assert");

function _create_promise() {
    var reslove, reject;
    var promise = new Promise((s, r)=> {
        reslove = s;
        reject = r;
    });
    return { promise, reslove, reject };
}

class Sender {
    constructor(serialized=require("./serialization")) {
        this.retry_connect_time = 2000;
        this.connecting = false;
        this.connected = false;
        this.buffer_list = [];
        this.serialized = serialized;
        this._reconnect_timeout = undefined;
        this._on_disconnect = undefined;
        this._is_close = false;
        this._connection_error = (error)=>{ throw error; };
    }

    on_connection_error(func) {
        this._connection_error = func;
    }

    async send_request(event, ...args) {
        if(this._is_close) throw new Error("call a closed sender");
        var request = this.serialized.encode_request({event, dataset:args});

        // store request first
        if(!this.connected) {
            var { promise, reslove, reject } =_create_promise();
            this.buffer_list.push({
                request, reslove, reject
            });

            if(!this.connecting) {
                this.connect().catch(this._connection_error);
            }

            return promise;
        } else {
            return new Promise(async (reslove, reject) => {
                try {
                    var result = await this._send_request(request);
                } catch(error) {
                    this._handle_send_request_error(error, request, reslove, reject);
                    return;
                }
                try {
                    reslove(this.serialized.decode_response(result));
                } catch(error) {
                    reject(error);
                }
            });
        }
    }

    _process_unfinish_job(job) {
        this._send_request(job.request).then((data)=>{
            try {
                job.reslove(this.serialized.decode_response(data));
            } catch(error) {
                job.reject(error);
            }
        }).catch((error)=> {
            this._handle_send_request_error(error, job.request, job.reslove, job.reject);
        });
    }

    async connect(...args) {
        if(this._is_close) throw new Error("sender closed");
        if(this._reconnect_timeout) {
            clearTimeout(this._reconnect_timeout);
            this._reconnect_timeout = undefined;
        }
        if(!this.connecting && !this.connected) {
            this.connecting = true;
            try {
                if(await this._connect(...args)) {
                    if(this._is_close) return false;
                    var job = this.buffer_list.shift();
                    while(job) {
                        this._process_unfinish_job(job);
                        job = this.buffer_list.shift();
                    }
                } else {
                    if(this._is_close) return false;
                    this._reconnect_timeout = setTimeout(()=>{
                        this.connect().catch(()=>{});
                    }, this.retry_connect_time);
                }
                this.connecting = false;
            } finally {
                this.connecting = false;
            }
        }
        return this.connected;
    }

    _handle_send_request_error(error, request, reslove, reject) {
        this._set_disconnect(error);
        this.buffer_list.push({ request, reslove, reject });
    }

    async _connect(...args) {
        var reslove, reject;
        var promise = new Promise((s,r)=>{
            reslove = s;
            reject = r;
        });
        var error = new Error("connect time out");
        var timeout = setTimeout(()=>reject(error), 3000);
        try {
            var request = this.serialized.encode_request({ event: "__connect", dataset: args });
            this._send_request(request).then((...args)=> { reslove(...args); })
                .catch((error)=> { reject(error); });
            var result = await promise;
            this.connected = !!this.serialized.decode_response(result);
            return this.connected;
        } finally {
            clearTimeout(timeout);
        }
    }

    _connect_args() {
        return [];
    }

    on_disconnect(funcs) {
        this._on_disconnect = funcs;
    }

    _set_disconnect(...args) {
        if(!this.connected) return;
        this.connected = false;
        if(this._reconnect_timeout) {
            clearTimeout(this._reconnect_timeout);
        }
        this._reconnect_timeout = setTimeout(this.connect.bind(this), this.retry_connect_time);
        this._on_disconnect && this._on_disconnect(...args);
    }

    async _send_request(data) {
        throw new Error("method not implement");
    }

    import_jobs(jobs) {
        if(this._is_close) throw new Error("call a closed sender");
        for(var job of jobs) {
            job.request = this.serialized.encode_request(job.request);
            if(this.connected) {
                this._process_unfinish_job(job);
            } else {
                this.buffer_list.push(job);
            }
        }
    }

    close(export_buffers=false){
        if(this._is_close) return;
        this._is_close = true;
        this.connected = false;
        clearTimeout(this._reconnect_timeout);
        this._reconnect_timeout = undefined;
        if(export_buffers) {
            var buffers = [];
            for(let job of this.buffer_list) {
                buffers.push({
                    request: this.serialized.decode_request(job.request),
                    reslove: job.reslove,
                    reject: job.reject
                });
            }
            this.buffer_list = [];
            return buffers;
        }
        var job = this.buffer_list.shift();
        while(job) {
            job.reject(new Error("Interrupt by user"));
            job = this.buffer_list.shift();
        };
    }
}

module.exports = Sender;