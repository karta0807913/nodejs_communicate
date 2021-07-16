import { CommunicateManager, Socket, Adapter } from "../index";
import { unit_test } from "./manager_test";
import { Server, Socket as ServerSocket } from "socket.io";
import { io as SocketClient } from "socket.io-client";
import * as http from "http";

const server = http.createServer();
const io = new Server(server);

const port = 19274;
const client = SocketClient(`http://localhost:${port}`);

const topic = "" + Math.random();

let flag = false;
io.on("connection", async function(socket: ServerSocket) {
  if (flag) return;
  flag = true;
  let server_adapter = new Adapter.SocketIOAdapter(socket, topic);
  let server_sender = Socket.CreateSender(server_adapter);
  server_sender.retry_connect_time = 100;
  let server_receiver = Socket.CreateReceiver(server_adapter);

  let client_adapter = new Adapter.SocketIOAdapter(client, topic);
  let client_sender = Socket.CreateSender(client_adapter);
  client_sender.retry_connect_time = 100;
  let client_receiver = Socket.CreateReceiver(client_adapter);

  // socket.use(function(event, next) {
  //   console.log(event);
  //   next();
  // });

  // wait socket.io process other methods.
  await new Promise((r) => {
    setTimeout(r, 100);
  });

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

server.listen(port);