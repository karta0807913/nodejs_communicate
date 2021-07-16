import SocketServerAdapter from "./SocketServerAdapter";
import { Server, Socket } from "socket.io";
import { PacketData } from "./Adapter";

export default class SocketServerAuthAdapter extends SocketServerAdapter {
  secret: string;
  _next_array = [];
  _connection_callback: Function;
  _raw_socket: Socket | null;
  constructor(io: Server, topic: string, secret: string) {
    super(io, topic);
    this.secret = secret;
    this._next_array = [];
    this._connection_callback = () => { };
    super.on_connect(() => {
      this._next_all();
    });
    this._raw_socket = null;
  }

  _send_data(dataset: PacketData) {
    this._raw_socket.emit(this.topic, dataset);
  }

  _on_socket_connection(socket: Socket): void {
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

  connection_callback(callback: Function) {
    this._connection_callback = callback;
  }

  async _auth(socket: Socket, message: string) {
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
    super._on_socket_connection(socket);
  }

  on_connect(func: (...args: any[]) => void) {
    super.on_connect(func);
  }

  _next_all() {
    for (let next of this._next_array) {
      next();
    }
    this._next_array = [];
  }
}