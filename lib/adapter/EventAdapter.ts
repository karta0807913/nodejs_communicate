import { PacketData } from "./Adapter";
import Adapter from "./Adapter";

export interface Emitter<Event = string | symbol> {
  on(event: Event, listener: Function): Emitter;
  once(event: Event, listener: Function): Emitter;
  off(event?: Event, listener?: Function): Emitter;
  emit(event: Event, ...args: any[]): Emitter | boolean;
  listeners(event: Event): Function[];
}

export default class EventAdapter extends Adapter {
  protected emitter: Emitter;
  protected topic: string;

  constructor(emitter: Emitter, topic: string) {
    super();
    this.emitter = emitter;
    this.topic = topic;
    this.listen_topic();
  }

  protected listen_topic(): void {
    this.emitter.on(this.topic, (data: any) => this._listening(data));
  }

  protected _send_data(dataset: PacketData): Promise<void> {
    this.emitter.emit(this.topic, dataset);
    return Promise.resolve();
  }
}