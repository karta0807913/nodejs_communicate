import { CommunicateManager, Socket, Adapter } from "../index";
import { unit_test } from "./manager_test";

const server = require('http').createServer();
const io = require('socket.io')(server);
const port = 19274;
const client = require("socket.io-client")(`http://localhost:${port}`);

const topic = "" + Math.random();


server.listen(port, async () => {
  const server_adapter = new Adapter.SocketServerAdapter(io, topic);
  const server_sender = Socket.CreateSender(server_adapter);
  server_sender.retry_connect_time = 100;
  const server_receiver = Socket.CreateReceiver(server_adapter);

  const client_adapter = new Adapter.SocketIOAdapter(client, topic);
  const client_sender = Socket.CreateSender(client_adapter);
  client_sender.retry_connect_time = 100;
  const client_receiver = Socket.CreateReceiver(client_adapter);

  try {
    console.log("test client send to server");
    await unit_test(new CommunicateManager(client_sender, server_receiver));
    console.log("test server send to client");
    await unit_test(new CommunicateManager(server_sender, client_receiver));
    console.log("test finish");
  } catch (error) {
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
