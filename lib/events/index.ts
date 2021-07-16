import EventAdapter from "../adapter/EventAdapter";
import { TypeError } from "../interface/Errors";
import Serialization from "../interface/serialization";
import Receiver from "./Receiver";
import Sender from "./Sender";

export function CreateReceiver(process: EventAdapter, serialized: Serialization = new Serialization()): Receiver {
  if (process instanceof EventAdapter) {
    return new Receiver(process, serialized);
  }
  throw new TypeError("must instanceof EventApadter");
};

export function CreateSender(process: EventAdapter, serialized: Serialization = new Serialization()): Sender {
  if (process instanceof EventAdapter) {
    return new Sender(process, serialized);
  }
  throw new TypeError("must instanceof EventApadter");
};

export {
  Sender,
  Receiver
}