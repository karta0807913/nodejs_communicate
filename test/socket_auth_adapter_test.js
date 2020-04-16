const { equal } = require("assert");
const { CommunicateManager, Socket, Adapter } = require("../index");
const server = require('http').createServer();
const io = require('socket.io')(server);
const port = 19274;
const topic = "" + Math.random();
const secret = "" + Math.random();

const client = require("socket.io-client")(`http://localhost:${port}`);
const client1 = require("socket.io-client")(`http://localhost:${port}`);
const client1_client_msg = Math.random();
client1.emit("HI", client1_client_msg);

const { unit_test } = require("./manager_test");

server.listen(port, async ()=> {


    const server_adapter = new Adapter.SocketServerAuthAdapter(io, topic, secret);
    const server_sender = Socket.CreateSender(server_adapter);
    server_sender.retry_connect_time = 100;
    const server_receiver = Socket.CreateReceiver(server_adapter);

    server_adapter.connection_callback((socket)=> {
        equal(socket.id, client1.id);
        socket.on("HI", (msg)=> {
            equal(msg, client1_client_msg);
            client1.close();
        });
    });

    const client_adapter = new Adapter.SocketClientAuthAdapter(client, topic, secret);
    const client_sender = Socket.CreateSender(client_adapter);
    client_sender.retry_connect_time = 100;
    const client_receiver = Socket.CreateReceiver(client_adapter);

    try {
        console.log("test auth client send to auth server");
        await unit_test(new CommunicateManager(client_sender, server_receiver));
        console.log("test auth server send to auth client");
        await unit_test(new CommunicateManager(server_sender, client_receiver));
        console.log("test finish");
    } catch(error) {
        console.log(error);
        process.exit(1);
    } finally {
        server_sender.close();
        server_receiver.close();
        client_sender.close();
        client_receiver.close();
        server.close();
    }
});