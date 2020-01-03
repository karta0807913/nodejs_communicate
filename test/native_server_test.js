const assert = require("assert");
const { CreateHttpReceiver, CreateHttpSender, CommunicateManager } = require("../index");
const { create_promise, unit_test } = require("./manager_test");

const http = require("http");

const server = http.createServer();
const port = 23284;

const prefix = "/test/123";

const receiver = CreateHttpReceiver(server, prefix);
const sender = CreateHttpSender(`http://127.0.0.1:${port}${prefix}`);

server.listen(port, async () => {

    // test disconnect behavior
    try {
        // simulate server stop when uncatch exception happened
        await receiver.init();
        while(await sender.connect());
        server.close();

        var { reslove, promise } = create_promise(1000);

        // http sender disconnect will trigger after send_request
        sender.on_disconnect(reslove);
        var test_promise = sender.send_request("test", "HI");
        await promise;

        server.listen(port, async ()=> {
            try {
                var manager = new CommunicateManager(sender, receiver);

                manager.on_disconnect((error) => {
                    if(error) { console.log(error); }
                    process.exit(1);
                });

                await unit_test(manager);

                // manager will reconnect on 3 seconds or send a new request
                assert(await test_promise === "HI");

                var adapter = await manager.init(true);
                assert(await adapter.test("HI") === "HI");
            } catch(error) {
                console.log(error);
            } finally {
                manager.close();
                server.close();
            }
        });
    } catch(error) {
        console.log(error);
        sender.close();
        receiver.close();
    }
});