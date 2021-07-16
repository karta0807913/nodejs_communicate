import { CommunicateManager, Socket, Adapter } from "../index";
import { unit_test } from "./manager_test";
import * as WebSocket from "ws";

const port = 19274;

const server = new WebSocket.Server({ port });

const client = new WebSocket(`http://localhost:${port}`);

server.on("connection", async function(socket) {
  let server_adapter = new Adapter.WebSocketAdapter(socket);
  let server_sender = Socket.CreateSender(server_adapter);
  server_sender.retry_connect_time = 100;
  let server_receiver = Socket.CreateReceiver(server_adapter);

  let client_adapter = new Adapter.WebSocketAdapter(client);
  let client_sender = Socket.CreateSender(client_adapter);
  client_sender.retry_connect_time = 100;
  let client_receiver = Socket.CreateReceiver(client_adapter);

  // socket.on("message", (msg) => {
  //   console.log(msg);
  // });
  // client.on("message", (msg) => {
  //   console.log(msg);
  // });

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