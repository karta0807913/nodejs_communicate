import * as assert from "assert";
import { Http, UnfinishJobs } from "../index";
import * as http from "http";

const server = http.createServer();
const port = 23284;

const prefix = "/test/123";

const receiver = Http.CreateReceiver(server, prefix);
let sender = Http.CreateSender(`http://127.0.0.1:${port}${prefix}`);

let promise_list: Promise<any>[] = [];

promise_list.push(sender.send_request("aaa", "123"));
promise_list.push(sender.send_request("bbb", "123"));
promise_list.push(sender.send_request("ccc", "123"));

let temp = sender.close(true);

assert(temp !== undefined);

let jobs = temp as UnfinishJobs[]

assert(jobs[0] !== undefined)
assert(jobs[0].request.event === "aaa");
assert(jobs[1] !== undefined)
assert(jobs[1].request.event === "bbb");
assert(jobs[2] !== undefined)
assert(jobs[2].request.event === "ccc");

server.listen(port, async function() {
  receiver.add_listener("aaa", () => { });
  receiver.add_listener("bbb", () => { });
  receiver.add_listener("ccc", () => { });
  receiver.init();
  let sender = Http.CreateSender(`http://127.0.0.1:${port}${prefix}`);
  sender.import_jobs(jobs);
  try {
    await sender.connect();
    await Promise.all(promise_list);
  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    sender.close();
    receiver.close();
  }
});