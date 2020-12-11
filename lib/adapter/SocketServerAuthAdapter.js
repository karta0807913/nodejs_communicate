const SocketServerAdapter = require("./SocketServerAdapter.js");

class SocketServerAuthAdapter extends SocketServerAdapter {
    constructor(io, topic, secret) {
        super(io, topic);
        this.secret = secret;
        this._next_array = [];
        this._connection_callback = () => { };
        super.on_connect(() => {
            this._next_all();
        });
        this._raw_socket = null;
    }

    _send_data(dataset) {
        this._raw_socket.emit(this.topic, dataset);
    }

    _listening(socket) {
        socket.use((pkg, next) => { // hang all data until auth
            if (this.is_connected() || pkg[0] === this.topic) {
                next();
            } else {
                this._next_array.push(next);
            }
        });
        if (this.socket) {
            this._connection_callback(socket);
            return;
        }
        this._next_array.push(() => {
            if (socket.id === this.socket.emitter.id) return;
            if (!this.is_connected()) return;
            socket.removeAllListeners(this.topic);
            this._connection_callback(socket);
        });
        socket.on(this.topic, this._auth.bind(this, socket));
    }

    connection_callback(callback) {
        this._connection_callback = callback;
    }

    async _auth(socket, message) {
        if (this.socket) {
            socket.emit(this.topic, "someone connected");
            return socket.disconnect();
        }
        if (message !== this.secret) {
            socket.emit(this.topic, "wrong secret");
            return socket.disconnect();
        }
        socket.removeAllListeners(this.topic);
        socket.emit(this.topic, "success");
        this._raw_socket = socket;
        super._listening(socket);
    }

    on_connect(func) {
        super.on_connect(func);
    }

    _next_all() {
        for (let next of this._next_array) {
            next();
        }
        this._next_array = [];
    }
}

module.exports = SocketServerAuthAdapter;