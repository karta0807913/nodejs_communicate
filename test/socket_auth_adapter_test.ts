import { deepStrictEqual } from "assert";
import { CommunicateManager, Socket, Adapter } from "../index";
import { unit_test } from "./manager_test";

function communicate_test() {
  const server = require('http').createServer();
  const io = require('socket.io')(server);
  const port = 19274;
  const topic = "" + Math.random();
  const secret = "" + Math.random();

  const client = require("socket.io-client")(`http://localhost:${port}`);
  const client1 = require("socket.io-client")(`http://localhost:${port}`);
  const client1_client_msg = Math.random();
  client1.emit("HI", client1_client_msg);


  return new Promise<void>((finish) => {
    let flag = false;
    server.listen(port, async () => {

      const server_adapter = new Adapter.SocketServerAuthAdapter(io, topic, secret);
      const server_sender = Socket.CreateSender(server_adapter);
      server_sender.retry_connect_time = 100;
      const server_receiver = Socket.CreateReceiver(server_adapter);

      let resolve, reject;
      const promise = new Promise((s, r) => {
        resolve = s;
        reject = r;
        setTimeout(() => r("next_all timeout, please check SocketServerAuthAdapter"), 1000);
      });
      client1.on(topic, (...data) => {
        console.log(data);
        reject("server message leak, other people can listen the data");
      });

      // normal user entry
      server_adapter.connection_callback((socket) => {
        try {
          deepStrictEqual(socket.id, client1.id);
        } catch (error) {
          reject(error);
        }
        socket.on("HI", (msg) => {
          try {
            deepStrictEqual(msg, client1_client_msg);
            if (flag) {
              resolve();
            } else {
              flag = true;
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      const client_adapter = new Adapter.SocketClientAuthAdapter(client, topic, secret);
      const client_sender = Socket.CreateSender(client_adapter);
      client_sender.retry_connect_time = 100;
      const client_receiver = Socket.CreateReceiver(client_adapter);
      const client_server_manager = new CommunicateManager(client_sender, server_receiver);
      const server_client_manager = new CommunicateManager(server_sender, client_receiver);
      await Promise.all([client_server_manager.init(), server_client_manager.init()])

      try {
        console.log("test auth client send to auth server");
        await unit_test(client_server_manager);
        console.log("test auth server send to auth client");
        await unit_test(server_client_manager);
        if (flag) {
          resolve();
        } else {
          flag = true;
        }
        await promise;
        console.log("test finish");
      } catch (error) {
        console.log(error);
        process.exit(1);
      } finally {
        client_server_manager.close();
        server_client_manager.close();
        server_sender.close();
        server_receiver.close();
        client_sender.close();
        client_receiver.close();
        server.close();
        client1.close();
        finish();
      }
    });
  });
}

function connect_error_test() {
  const server = require('http').createServer();
  const io = require('socket.io')(server);
  const port = 19274;
  const topic = "" + Math.random();

  const client = require("socket.io-client")(`http://localhost:${port}`);
  return new Promise<void>((finish, failed) => {
    server.listen(port, async () => {
      const client_adapter = new Adapter.SocketClientAuthAdapter(client, topic, 'wrong secret');
      const client_sender = Socket.CreateSender(client_adapter);
      client_sender.retry_connect_time = 100;
      const client_receiver = Socket.CreateReceiver(client_adapter);
      const server_adapter = new Adapter.SocketServerAuthAdapter(io, topic, 'true secret');
      const server_sender = Socket.CreateSender(server_adapter);
      server_sender.retry_connect_time = 100;
      const server_receiver = Socket.CreateReceiver(server_adapter);

      const client_server_manager = new CommunicateManager(client_sender, server_receiver);
      const server_client_manager = new CommunicateManager(server_sender, client_receiver);
      try {
        await Promise.all([client_server_manager.init(), server_client_manager.init()])
        console.log(new Error("must throw error"));
        process.exit(1);
      } catch (error) {
        if (error.message !== "Auth failed: wrong secret") {
          failed(error);
        }
      } finally {
        server_client_manager.close();
        client_server_manager.close();
        server.close();
      }
      finish();
    })
  });
}

async function main() {
  await communicate_test();
  await connect_error_test();
}

main();
