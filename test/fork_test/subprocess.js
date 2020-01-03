const { CreateProcessSRConfig, CommunicateManager } = require("../../index");
const { unit_test } = require("./util");

const request_args = JSON.parse(process.argv[2]);

async function main() {
    var config = CreateProcessSRConfig(process);
    var manager = new CommunicateManager(config);
    try {
        await unit_test(manager, request_args);
        console.log("subprocess done");
        await manager.send_request("done");
    } catch(error) {
        console.log(error);
        manager.close();
        config.close();
    }
}

main();