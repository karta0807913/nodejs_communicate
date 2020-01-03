const { CreateProcessSRConfig, CommunicateManager } = require("../../index");
const { unit_test } = require("./util");

var request_args = {
    "test": "'HI'",
    "test1": "args[0] + (args[2] - args[1])",
    "test2": "args",
    "test3": "'name' + args[0]",
};

async function main() {
    var config = CreateProcessSRConfig(__dirname + "/subprocess.js", [JSON.stringify(request_args)]);
    var manager = new CommunicateManager(config);
    var done = false;
    manager.add_listener("done", function() {
        if(done) {
            manager.close();
            config.close();
        }
        done = true;
    });
    try {
        await unit_test(manager, request_args);
        if(done) {
            manager.close();
            config.close();
        }
        done = true;
        console.log("main process done");
    } catch(error) {
        console.log(error);
        manager.close();
        config.close();
    }
}

main();
