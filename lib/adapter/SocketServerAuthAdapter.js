const SocketServerAdapter = require("./SocketServerAdapter.js");

class SocketServerAuthAdapter extends SocketServerAdapter {
    constructor(io, topic, secret) {
        super(io, topic);
        this.secret = secret;
        this._next_array = [];
        this._connection_callback = ()=>{};
        this.on_connect(()=>{});
    }

    _listening(socket) {
        if(this.socket) return;
        socket.use((pkg, next)=> { // hang all data untill auth
            if(this.is_connected() || pkg[0] === this.topic) {
                next();
            } else {
                this._next_array.push(next);
            }
        });
        this._next_array.push(()=> {
            if(socket === this.socket.emitter) return;
            if(!this.is_connected()) return;
            this._connection_callback(socket);
        });
        socket.on(this.topic, this._auth.bind(this, socket));
    }

    connection_callback(callback) {
        this._connection_callback = callback;
    }

    async _auth(socket, message) {
        if(this.socket) {
            socket.emit(this.topic, "someone connected");
            return socket.disconnect();
        }
        if(message !== this.secret) {
            socket.emit(this.topic, "wrong secret");
            return socket.disconnect();
        }
        socket.removeAllListeners(this.topic);
        socket.emit(this.topic, "success");
        super._listening(socket);
    }

    on_connect(func) {
        super.on_connect(func);
        this._on_connect = ()=> {
            func();
            this._next_all();
        };
    }

    _set_disconnect(...args) {
        super._set_disconnect(...args);
    }

    _next_all() {
        for(let next of this._next_array) {
            next();
        }
        this._next_array = [];
    }
}

module.exports = SocketServerAuthAdapter;