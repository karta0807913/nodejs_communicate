import SocketIOAdapter from "./SocketIOAdapter";
import { NotConnectedError } from "../interface/Errors";
import { Server, Socket } from "socket.io";
import { PacketData } from "./Adapter";
import SocketAdapter from "./SocketAdapter";

export default class SocketServerAdapter extends SocketAdapter {
  socket: SocketIOAdapter;
  emitter: Server;

  constructor(io: Server, topic: string) {
    super(io, "connection");
    this.topic = topic;
    this.socket = null;
  }

  listen_topic() {
    this.emitter.on(this.topic, (socket: Socket) => this._on_socket_connection(socket));
  }

  close() {
    super.close();
    this.emitter.close();
  }

  _on_socket_connection(socket: Socket): void {
    if (this.socket) {
      socket.disconnect();
      return;
    }
    this.socket = new SocketIOAdapter(socket, this.topic);

    socket.on("disconnect", () => {
      this._set_disconnect();
    });
    this.socket._listening = super._listening.bind(this);
    this.__connect();
  }

  on_request(func: Function) {
    this._on_request = func;
    this.socket && this.socket.on_request(this._on_request.bind(this));
  }

  _send_data(dataset: PacketData) {
    if (!this.socket) {
      throw new NotConnectedError("socket not connected");
    }
    return this.socket._send_data(dataset);
  }

  _set_disconnect() {
    this.socket = null;
    this.__disconnect();
  }

  async connect(): Promise<boolean> {
    return this.is_connected();
  }

  is_connected() {
    return this.socket !== null;
  }

  disconnect() {
    this.socket && this.socket.emitter.disconnect();
  }
}