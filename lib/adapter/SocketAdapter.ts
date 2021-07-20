import EventAdapter, { Emitter } from "./EventAdapter";

export default abstract class SocketAdapter extends EventAdapter {

  constructor(emitter: Emitter, topic: string) {
    super(emitter, topic);
  }

  abstract connect(): Promise<boolean>;

  on_connect(func: (...args: any[]) => void): void {
    this.on("connect", func);
  }

  on_disconnect(func: () => void): void {
    this.on("disconnect", func);
  }

  protected __connect(): void {
    this.emit("connect");
  }

  protected __disconnect(): void {
    this.emit("disconnect");
  }

  abstract is_connected(): boolean;
}