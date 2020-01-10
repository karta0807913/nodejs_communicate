const assert = require("assert");
const { CreateReceiver, CreateSender } = require("../index").Http;

const http = require("http");

const server = http.createServer();
const port = 23284;

const prefix = "/test/123";

const receiver = CreateReceiver(server, prefix);
var sender = CreateSender(`http://127.0.0.1:${port}${prefix}`);

var promise_list = [];

promise_list.push(sender.send_request("aaa", "123"));
promise_list.push(sender.send_request("bbb", "123"));
promise_list.push(sender.send_request("ccc", "123"));

var jobs = sender.close(true);

assert(jobs[0].request.event === "aaa");
assert(jobs[1].request.event === "bbb");
assert(jobs[2].request.event === "ccc");

server.listen(port, async function() {
    receiver.add_listener("aaa", ()=>{});
    receiver.add_listener("bbb", ()=>{});
    receiver.add_listener("ccc", ()=>{});
    receiver.init();
    var sender = CreateSender(`http://127.0.0.1:${port}${prefix}`);
    sender.import_jobs(jobs);
    sender.connect();
    try {
        await Promise.all(promise_list);
    } catch(error) {
        console.log(error);
        process.exit(1);
    } finally {
        sender.close();
        receiver.close();
    }
});