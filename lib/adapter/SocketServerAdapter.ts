import SocketIOAdapter from "./SocketIOAdapter";
import { NotConnectedError } from "../interface/Errors";
import { Server, Socket } from "socket.io";
import { PacketData } from "./Adapter";
import SocketAdapter from "./SocketAdapter";

export default class SocketServerAdapter extends SocketAdapter {
  protected override emitter: Server;
  protected socket: SocketIOAdapter | null;

  constructor(io: Server, topic: string) {
    super(io, "connection");
    this.topic = topic;
    this.emitter = io;
    this.socket = null;
  }

  protected override listen_topic(): void {
    this.emitter.on(this.topic, (socket: Socket) => this._on_socket_connection(socket));
  }

  override close(): void {
    super.close();
    this.emitter.close();
    if (this.socket) {
      this.socket.close();
    }
  }

  protected _on_socket_connection(socket: Socket): void {
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

  override on_request(func: (dataset: any) => Promise<any>) {
    this._on_request = func;
    this.socket && this.socket.on_request(this._on_request.bind(this));
  }

  protected override _send_data(dataset: PacketData): Promise<void> {
    if (!this.socket) {
      throw new NotConnectedError("socket not connected");
    }
    return this.socket._send_data(dataset);
  }

  protected _set_disconnect(): void {
    this.socket = null;
    this.__disconnect();
  }

  async connect(): Promise<boolean> {
    return this.is_connected();
  }

  is_connected(): boolean {
    return this.socket !== null;
  }
}