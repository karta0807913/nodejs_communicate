import * as assert from "assert";
import * as http from "http";
import { CommunicateManager, Http } from "../index";
import { create_promise, unit_test } from "./manager_test";

const { CreateReceiver, CreateSender } = Http;

const server = http.createServer();
const port = 23284;

const prefix = "/test/123";

const receiver = CreateReceiver(server, prefix);
const sender = CreateSender(`http://127.0.0.1:${port}${prefix}`);

server.listen(port, async () => {

  // test disconnect behavior
  try {
    // simulate server stop when uncatch exception happened
    await receiver.init();
    while (!await sender.connect());
    server.close();

    let { resolve, promise } = create_promise(1000);

    // http sender disconnect will trigger after send_request
    sender.on_disconnect(resolve as (...args: any[]) => void);
    let test_promise = sender.send_request("test", "HI");
    await promise;

    server.listen(port, async () => {
      let manager = new CommunicateManager(sender, receiver);
      try {
        manager.on_disconnect((error) => {
          if (error) { console.log(error); }
          process.exit(1);
        });

        await unit_test(manager);

        // manager will reconnect on 3 seconds or send a new request
        assert(await test_promise === "HI");

        let adapter = await manager.init(true);
        assert(adapter instanceof Object);
        assert(adapter['test'] !== undefined);
        assert(await adapter['test']("HI") === "HI");
      } catch (error) {
        console.log(error);
      } finally {
        manager.close();
        server.close();
      }
    });
  } catch (error) {
    console.log(error);
    sender.close();
    receiver.close();
  }
});