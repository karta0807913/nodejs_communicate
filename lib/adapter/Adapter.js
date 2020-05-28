const { MethodNotImplementError } = require("../interface/Errors.js");
class Adapter {
    constructor() {
        this._serial_map = new Map();
        this._on_request = () => { };
    }

    generate_serial(func) {
        var serial;
        do {
            serial = Math.random();
        } while (this._serial_map.has(serial));
        this._serial_map.set(serial, func);
        return serial;
    }

    remove_serial(serial) {
        var temp = this._serial_map.get(serial);
        this._serial_map.delete(serial);
        return temp;
    }

    async send_request(dataset) {
        var s, r;
        var promise = new Promise((_s, _r) => {
            s = _s;
            r = _r;
        });
        var serial = this.generate_serial(s);
        try {
            await this._send_data({ serial, dataset, is_request: true });
        } catch (error) {
            r(error);
            this.remove_serial(serial);
        }
        return promise;
    }

    // for input message
    async _listening(message) {
        var { serial, dataset, is_request } = message;
        if (is_request === true) {
            var result = await this._on_request(dataset);
            result = {
                dataset: result,
                is_request: false,
                serial: serial
            };
            this._send_data(result);
        } else if (is_request === false) {
            var func = this.remove_serial(serial);
            if (func) {
                func(dataset);
            }
        }
    }

    _send_data(dataset) {
        throw new MethodNotImplementError("please implement this function");
    }

    on_request(func) {
        this._on_request = func;
    }

    close() {
    }
}

module.exports = Adapter;