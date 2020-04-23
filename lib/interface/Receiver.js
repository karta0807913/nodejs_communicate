const assert = require("assert");
const { MethodNotExistError } = require("./Errors.js");

class Receiver {
    constructor(serialized=require("./serialization")) {
        this.serialized = serialized;
        this._listening = new Map();
        this._init = false;
        this.add_listener("__connect", this.__connect.bind(this));

        this.add_listener("__funcs", ()=> {
            return [ ...this._listening.keys() ];
        });
    }

    init() {
        this._init = true;
    }

    __connect() {
        return this._init;
    }

    add_listener(event_name, func) {
        if(event_name instanceof Function) {
            assert(event_name.name !== "", "need named function");
            func = event_name;
            event_name = event_name.name;
        }
        assert(this._listening.has(event_name) === false, "One event can't have multiple listener");
        assert(func instanceof Function);
        this._listening.set(event_name, func);
    }

    // when event fired
    async _emit(obj) {
        var result;
        try {
            var request = this.serialized.decode_request(obj);
            var func = this._listening.get(request.event);
            if(!func) {
                throw new MethodNotExistError("request event not defined");
            }
            result = await func(...request.dataset);
        } catch(error) {
            result = error;
        }
        return this.serialized.encode_response(result);
    }

    close() {
        this._init = false;
    }
}

module.exports = Receiver;