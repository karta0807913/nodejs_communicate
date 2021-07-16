import { CommunicateManager, Socket, Adapter } from "../index";
import * as assert from "assert";
const server = require('http').createServer();
const io = require('socket.io')(server);

const port = 19274;
const client = require("socket.io-client")(`http://localhost:${port}`);

const topic = "" + Math.random();

const secret = "~$1n?HZ$l),uP5s6F1`yB&!._Z5e8d";

class Receiver extends Socket.Receiver {
  __connect(_secret: string) {
    if (_secret !== secret) {
      throw new Error("secret error");
    }
    return super.__connect();
  }
}

io.on("connection", async function(socket) {
  let server_adapter = new Adapter.SocketIOAdapter(socket, topic);
  let server_sender = Socket.CreateSender(server_adapter);
  server_sender.retry_connect_time = 100;
  let server_receiver = new Receiver(server_adapter);

  let client_adapter = new Adapter.SocketIOAdapter(client, topic);
  let client_sender = Socket.CreateSender(client_adapter);
  client_sender.retry_connect_time = 100;
  let client_receiver = Socket.CreateReceiver(client_adapter);

  // socket.use(function(...args) {
  //     console.log(args);
  //     console.log(args[0][1]);
  //     args[args.length - 1]();
  // });

  try {
    let server_manager = new CommunicateManager(server_sender, server_receiver);

    await server_manager.init();
    let client_manager = new CommunicateManager(client_sender, client_receiver);

    try {
      await client_manager.init();
    } catch (error) {
      assert(error.message, "secret error");
    }
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