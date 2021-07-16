import { PacketData } from "./Adapter";
import Adapter from "./Adapter";

export interface Emitter<Event = string> {
  on(event: Event, listener: Function): Emitter;
  once(event: Event, listener: Function): Emitter;
  off(event?: Event, listener?: Function): Emitter;
  emit(event: Event, ...args: any[]): Emitter | boolean;
  listeners(event: Event): Function[];
}

export default class EventAdapter extends Adapter {
  emitter: Emitter;
  topic: string;

  constructor(emitter: Emitter, topic: string) {
    super();
    this.emitter = emitter;
    this.topic = topic;
    this.listen_topic();
  }

  protected listen_topic() {
    this.emitter.on(this.topic, (data: any) => this._listening(data));
  }

  _send_data(dataset: PacketData) {
    this.emitter.emit(this.topic, dataset);
  }
}