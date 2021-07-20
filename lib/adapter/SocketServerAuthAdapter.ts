import SocketServerAdapter from "./SocketServerAdapter";
import { Server, Socket } from "socket.io";
import { PacketData } from "./Adapter";
import { NotConnectedError } from "../interface/Errors";

export default class SocketServerAuthAdapter extends SocketServerAdapter {
  private secret: string;
  private _next_array: Array<(error?: Error) => void>;
  private _connection_callback: (socket: Socket) => void;
  private _raw_socket: Socket | null;
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

  protected override _send_data(dataset: PacketData): Promise<void> {
    if (!this._raw_socket) {
      throw new NotConnectedError("socket not connected");
    }
    this._raw_socket.emit(this.topic, dataset);
    return Promise.resolve();
  }

  protected override _on_socket_connection(socket: Socket): void {
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
      if (!this.socket || socket.id === this.socket.id()) return;
      if (!this.is_connected()) return;
      socket.removeAllListeners(this.topic);
      this._connection_callback(socket);
    });
    socket.on(this.topic, this._auth.bind(this, socket));
  }

  connection_callback(callback: (socket: Socket) => void): void {
    this._connection_callback = callback;
  }

  protected async _auth(socket: Socket, message: string): Promise<void> {
    if (this.socket) {
      socket.emit(this.topic, "someone connected");
      socket.disconnect();
      return;
    }
    if (message !== this.secret) {
      socket.emit(this.topic, "wrong secret");
      socket.disconnect();
      return;
    }
    socket.removeAllListeners(this.topic);
    socket.emit(this.topic, "success");
    this._raw_socket = socket;
    super._on_socket_connection(socket);
  }

  override on_connect(func: (...args: any[]) => void): void {
    super.on_connect(func);
  }

  protected _next_all(): void {
    for (let next of this._next_array) {
      next();
    }
    this._next_array = [];
  }
}