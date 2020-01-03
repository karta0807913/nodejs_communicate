const { CommunicateManager, Socket, Adapter } = require("../index");
const server = require('http').createServer();
const io = require('socket.io')(server);
const port = 19274;
const client = require("socket.io-client")(`http://localhost:${port}`);
const { unit_test } = require("./manager_test");

const topic = "" + Math.random();


server.listen(port, async ()=> {
    const server_adapter = new Adapter.SocketServerAdapter(io, topic);
    const server_sender = Socket.CreateSender(server_adapter);
    server_sender.retry_connect_time = 100;
    const server_receiver = Socket.CreateReceiver(server_adapter);

    try {
        await unit_test(new CommunicateManager(server_sender, server_receiver));
    } catch(error) {
        console.log(error);
        process.exit(1);
    } finally {
        server.close();
    }

    // const client_adapter = Adapter.SocketIOAdapter(client);
    // const client_sender = Events.CreateSender(client_adapter);
    // const client_receiver = Events.CreateReceiver(client_adapter);
});