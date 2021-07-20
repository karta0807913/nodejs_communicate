import { deepStrictEqual } from "assert";
import { EventEmitter } from "events";
import { Events, Adapter } from "../index";
import { ErrorResponse, Response } from "../lib/interface/serialization";

const emitter = new Adapter.EventAdapter(new EventEmitter(), "test-topic");

class PublicSender extends Events.Sender {
  public override _send_request(request: any): Promise<ErrorResponse | Response> {
    return super._send_request(request);
  }
}

async function run() {
  let receiver = Events.CreateReceiver(emitter);
  let sender = new PublicSender(emitter);

  receiver.add_listener("HI", () => {
    return "HI";
  });

  let connect_result = await sender.connect();
  deepStrictEqual(connect_result, false);

  let request = sender.serialized.encode_request({ event: "HI", dataset: [] });
  let result: ErrorResponse = await sender._send_request(request) as ErrorResponse;

  deepStrictEqual(result.is_error, true);
  deepStrictEqual(result.name, "Error");
  deepStrictEqual(result.message, "Not Connect");

  await receiver.init();
  connect_result = await sender.connect();
  deepStrictEqual(connect_result, true);

  let response = await sender.send_request("HI");
  deepStrictEqual(response, "HI");
  sender.close();
  receiver.close();
}

run();
