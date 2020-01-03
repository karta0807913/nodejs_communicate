const crypto = require("crypto");
const EventEmitter = require("events");
const ErrorTypes = require("../middleware/error_types.js");
const { BasicError } = require("error-helper");

const process_event = new Set(["exit"]);

class SubProcessHelper extends EventEmitter {
    constructor(process) {
        super();
        this.process = process;
        this.id_map = new Map();
        this.process.on("message", this.message.bind(this));
        this.message.bind(this);
    }

    message(msg_obj) {
        const self = this;
        if (!Array.isArray(msg_obj) && msg_obj.length !== 3) {
            return;
        }
        if (msg_obj[0] === "response") {
            return this.response(msg_obj);
        } else if (msg_obj[0] === "error") {
            return this.error(msg_obj);
        }
        var responsed = false;
        super.emit(msg_obj[0], msg_obj[2], function (response) {
            if(responsed) return;
            responsed = true;
            if (response instanceof BasicError) {
                return self.process.send(["error", msg_obj[1], response.message]);
            } else if (response instanceof Error) {
                return self.process.send(["error", msg_obj[1], response.message]);
            }
            self.process.send(["response", msg_obj[1], response]);
        });
    }

    response(msg_obj) {
        var func = this.id_map.get(msg_obj[1]);
        func && func(msg_obj[2]);
    }

    error(msg_obj) {
        var func = this.id_map.get(msg_obj[1]);
        return func && func(msg_obj[2], true);
    }

    emit(method, msg_obj) {
        return new Promise((reslove, reject) => {
            var id = crypto.randomBytes(20).toString('hex');
            while (this.id_map.has(id)) {
                id = crypto.randomBytes(20).toString('hex');
            }
            this.process.send([method, id, msg_obj]);
            const timeout = setTimeout(() => {
                this.id_map.delete(id);
                reject(new ErrorTypes.IpcCommunicateError(method, "IPC_REQUEST_TIMEOUT", msg_obj));
            }, 5000);
            this.id_map.set(id, (data, is_error) => {
                clearTimeout(timeout);
                this.id_map.delete(id);
                if (is_error === true) {
                    return reject(new ErrorTypes.IpcCommunicateError(method, data, msg_obj));
                }
                reslove(data);
            });
        });
    }

    on(event, func) {
        if (process_event.has(event)) {
            return this.process.on.apply(this.process, arguments);
        }
        super.on(event, this.process_job_wrapper(func));
    }

    process_job_wrapper(func) {
        return async function(object, callback) {
            try {
                var res = await func.call(func, object, callback);
                callback(res);
            } catch(error) {
                callback(error);
            }
        };
    };

    kill(signal="SIGHUP") {
        this.process.kill(signal);
    }
}

module.exports = SubProcessHelper;