import EventAdapter, { Emitter } from "./EventAdapter";

export default abstract class SocketAdapter extends EventAdapter {
  constructor(emitter: Emitter, topic: string) {
    super(emitter, topic);
  }

  abstract connect(): Promise<boolean>;

  on_connect(func: (...args: any[]) => void) {
    this.on("connect", func);
  }

  on_disconnect(func: () => void) {
    this.on("disconnect", func);
  }

  protected __connect() {
    this.emit("connect");
  }

  protected __disconnect() {
    this.emit("disconnect");
  }

  abstract is_connected(): boolean;
}