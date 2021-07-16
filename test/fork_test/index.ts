import { CreateProcessSRConfig, CommunicateManager } from "../../index";
import { unit_test } from "./util";

var request_args = {
  "test": "'HI'",
  "test1": "args[0] + (args[2] - args[1])",
  "test2": "args",
  "test3": "'name' + args[0]",
};

async function main() {
  let config = CreateProcessSRConfig(__dirname + "/subprocess.ts", [JSON.stringify(request_args)]);
  let manager = new CommunicateManager(config);
  let done = false;
  manager.add_listener("done", function() {
    if (done) {
      manager.close();
      config.close();
    }
    done = true;
  });
  try {
    await unit_test(manager, request_args);
    if (done) {
      manager.close();
      config.close();
    }
    done = true;
    console.log("main process done");
  } catch (error) {
    console.log(error);
    manager.close();
    config.close();
  }
}

main();
