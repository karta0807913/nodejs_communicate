import SocketAdapter from "../adapter/SocketAdapter";
import { TypeError } from "../interface/Errors";
import Serialization from "../interface/serialization";
import Receiver from "./Receiver";
import Sender from "./Sender";

export function CreateReceiver(adapter: SocketAdapter, serialized: Serialization = new Serialization()): Receiver {
  if (adapter instanceof SocketAdapter) {
    return new Receiver(adapter, serialized);
  }
  throw new TypeError("must instanceof SocketAdapter");
};

export function CreateSender(adapter: SocketAdapter, serialized: Serialization = new Serialization()): Sender {
  if (adapter instanceof SocketAdapter) {
    return new Sender(adapter, serialized);
  }
  throw new TypeError("must instanceof SocketAdapter");
};

export {
  Sender,
  Receiver,
}