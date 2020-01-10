<h1 id="title">Communicate</h1>

Communicate implement <span style="color:#0000ff">http</span>, <span style="color:#0000ff">socket.io</span>, <span style="color:#0000ff">subprocess</span> for communicate between process

## Menu

* [Installation](#Installation)
* [Usage](#Usage)
  * [subprocess example](#subprocess_example)
  * [http example](#http_example)
* [Document](#Document)
  * manager
    * [CommunicateManager](#CommunicateManager)
  * config
    * [SRConfig](#SRConfig)
    * [SenderConfig](#SenderConfig)
    * [ReceiverConfig](#ReceiverConfig)
  * process communicate
    * [function CreateProcessSRConfig(filename, args, options)](#CreateProcessSRConfig1)
    * [function CreateProcessSRConfig(process)](#CreateProcessSRConfig2)
 * library
   * [Socket](#Socket)
   * [Http](#Http)


## Installation
```bash
npm i --save "https://gitlab+deploy-token-128922:Rphf6qiyyExysinbznqD@gitlab.com/publiclib/communicate"
```
<h2 id="Usage"> Usage </h2>
<h3 style="text-align: center" id="subprocess_example">
subprocess example
</h3>
```javascript
// parent.js
const assert = require("assert");
const { CreateProcessSRConfig, CommunicateManager } = require("communite_helper");
const config = CreateProcessSRConfig(__dirname + "/subprocess.js", null);

var manager = new CommunicateManager(config);
manager.add_listener("test", function() {
    return "test";
});
manager.init(); // start listening reequest !IMPORTANT
manager.send_request("subprocess", "a", "b").then((data) => { assert(data === "HI"); })
```
```javascript
// subprocess.js

const { CreateProcessSRConfig, CommunicateManager } = require("communite_helper");
var config = CreateProcessSRConfig(process);
var manager = new CommunicateManager(config);
manager.add_listener("subprocess", function(a, b) {
    console.log(a, b);
    return "HI";
});
manager.init(); // start listening reequest !IMPORTANT
```

<hr>
<h3 style="text-align: center" id="http_example">
http example
</h3>
```javascript
const assert = require("assert");
const { CommunicateManager } = require("communite_helper");
const { CreateReceiver, CreateSender } = require("communite_helper").Http;
const http = require("http");

const server = http.createServer();
const port = 23284;

const prefix = "/test/123";

// receiver listen on http://127.0.0.1:23284/test/123
const receiver = CreateReceiver(server, prefix);

// sender send to http://127.0.0.1:23284/test/123 (self)
const sender = CreateSender(`http://127.0.0.1:${port}${prefix}`);

const manager = new CommunicateManager(sender, receiver);

manager.add_listener("server_test", function(a, b) {
    console.log(a, b);
    return "server alive";
});
manager.init(); // start listening reequest !IMPORTANT
manager.send_request("server_test", "c", "d").then((data) => { assert(data === "server alive"); })
```
## Document

<h4 style="margin: 0; margin-left: 10px" id="document_process_config">
process config
</h4>

* [function CreateProcessSRConfig(filename, args, options)](#CreateProcessSRConfig1)
* [function CreateProcessSRConfig(process)](#CreateProcessSRConfig2)

<h4 style="margin: 0; margin-left: 10px" id="document_manager_config">
manager
</h4>

* [CommunicateManager](#CommunicateManager)

<h4  style="margin: 0; margin-left: 10px" id="document_config">
config
</h4>

* [SRConfig](#SRConfig)
* [SenderConfig](#SenderConfig)
* [ReceiverConfig](#ReceiverConfig)

<h4 style="margin: 0; margin-left: 10px" id="document_semder_receiver">
create sender/receiver library
</h4>

* [Socket](#Socket)
* [Http](#Http)

<h3 id="CreateProcessSRConfig1">
function CreateProcessSRConfig(filename, args, options)
</h3>
<table>
<tr><td>name</td><td>type</td><td>note</td></tr>
<tr><td></td><td></td><td></td></tr>
<tr><td>filename</td><td>string</td><td>fork filename</td></tr>
<tr><td>args</td><td>array</td><td>fork args</td></tr>
<tr><td>options</td><td>Object</td><td><div>fork options</div><div>options.env.NODE_PATH default <span class="str">"communite_helper_path/../.."</span></div></td></tr>
</table>
* return SRConfig class

<h3 id="CreateProcessSRConfig2">
function CreateProcessSRConfig(process)
</h3>
<table>
<tr><td>name</td><td>type</td><td>note</td></tr>
<tr><td></td><td></td><td></td></tr>
<tr><td>process</td><td>EventEmitter</td><td>process instance</td></tr>
</table>
* return SRConfig class



<h3 id="CommunicateManager">
class CommunicateManager
</h3>
- create process receiver/sender

<h5 style="margin: 0; margin-left: 10px" id="CommunicateManager_funcs">
functions</h5>
* [constructor(sender, receiver)](#CommunicateManager_construct1)
* [constructor(srconfig)](#CommunicateManager_construct2)
  * [init(instance)](#CommunicateManager_init)
  * [add_listener(event, ...args)](#CommunicateManager_add_listener)
  * [send_request(event, ...args)](#CommunicateManager_send_request)
  * [on_disconnect(event, ...args)](#CommunicateManager_on_disconnect)
  * [close()](#CommunicateManager_close)

<h3 id="CommunicateManager_construct1">
new CommunicateManager(sender, receiver)
</h3>
<table>
<tr><td>name</td><td>type</td><td>note</td></tr>
<tr><td></td><td></td><td></td></tr>
<tr><td>sender</td><td>[Sender](#Sender) / SenderConfig</td><td></td></tr>
<tr><td>receiver</td><td>[Receiver](#Receiver) / ReceiverConfig</td><td></td></tr>
</table>
<p></p>

<h3 id="CommunicateManager_construct2">
new CommunicateManager(srconfig)
</h3>
<table>
<tr><td>name</td><td>type</td><td>note</td></tr>
<tr><td></td><td></td><td></td></tr>
<tr><td>srconfig</td><td>[SRConfig](#SRConfig)</td><td></td></tr>
</table>
<p></p>

<h4 id="CommunicateManager_init">
CommunicateManager.prototype.init(instance)
</h4>
<table>
<tr><td>name</td><td>type</td><td>note</td></tr>
<tr><td></td><td></td><td></td></tr>
<tr><td>instance</td><td>boolean</td><td>return functions call</td></tr>
</table>
* init, try connect and start receiving request
* if instance is true, return a Object: { "function_name": function } when connected

<h4 id="CommunicateManager_add_listener">
CommunicateManager.prototype.add_listener(event, ...args)
</h4>
* a wrapper for sender.add_listener

<h4 id="CommunicateManager_send_request">
CommunicateManager.prototype.send_request(event, ...args)
</h4>
* a wrapper for receiver.send_request

<h4 id="CommunicateManager_on_disconnect">
CommunicateManager.prototype.on_disconnect(callback)
</h4>
* a wrapper for sender.on_disconnect

<h4 id="CommunicateManager_close">
CommunicateManager.prototype.close()
</h4>
* close sender and receiver

<h3 id="SRConfig">
class SRConfig
</h3>
- config for create sender/receiver

<h5 style="margin: 0; margin-left: 10px" id="SRConfig_funcs">
functions</h5>
* [constructor()](#SRConfig_construct)
  * [createReceiver()](#SRConfig_createReceiver)
  * [createSender()](#SRConfig_createSender)
  * [toReceiverConfig()](#SRConfig_toReceiverConfig)
  * [toSenderConfig()](#SRConfig_toSenderConfig)
  * [close()](#SRConfig_close)

<h4 id="SRConfig_createReceiver">
SRConfig.prototype.createReceiver()
</h4>
* create [Receiver](#Receiver)

<h4 id="SRConfig_createSender">
SRConfig.prototype.createSender()
</h4>
* create [Sender](#Sender)

<h4 id="SRConfig_toReceiverConfig">
SRConfig.prototype.toReceiverConfig()
</h4>
* return [ReceiverConfig](#ReceiverConfig)

<h4 id="SRConfig_toSenderConfig">
SRConfig.prototype.toSenderConfig()
</h4>
* return [SenderConfig](#SenderConfig)


<h4 id="SRConfig_close">
SRConfig.prototype.close()
</h4>
* close Sender/Receiver

<h3 id="SenderConfig">
class SenderConfig
</h3>
- config for create sender

<h5 style="margin: 0; margin-left: 10px" id="SenderConfig_funcs">
functions</h5>
* [constructor()](#SenderConfig_construct)
  * [create()](#SenderConfig_create)
  * [close()](#SenderConfig_close)

<h4 id="SenderConfig_create">
SenderConfig.prototype.create()
</h4>
* create [Sender](#Sender)

<h4 id="SenderConfig_close">
SenderConfig.prototype.close()
</h4>
* close [Sender](#Sender)

<h3 id="ReceiverConfig">
class ReceiverConfig
</h3>
- config for create receiver

<h5 style="margin: 0; margin-left: 10px" id="ReceiverConfig_funcs">
functions</h5>
* [constructor()](#ReceiverConfig_construct)
  * [create()](#ReceiverConfig_create)
  * [close()](#ReceiverConfig_close)

<h4 id="ReceiverConfig_create">
ReceiverConfig.prototype.create()
</h4>
* create [Receiver](#Receiver)

<h4 id="ReceiverConfig_close">
ReceiverConfig.prototype.close()
</h4>
* close [Receiver](#Receiver)

<h3 id="Sender">
class Sender
</h3>
- send message to remote server

<h5 style="margin: 0; margin-left: 10px" id="Sender_funcs">
functions</h5>
* [constructor(serialized)](#Sender_construct)
  * [connect()](#Sender_connect)
  * [send_request(event, ...args)](#Sender_send_request)
  * [on_disconnect()](#Sender_on_disconnect)
  * [close()](#Sender_close)


<h3 id="Sender_construct">
new Sender(serialized)
</h3>
<table>
<tr><td>name</td><td>type</td><td>note</td></tr>
<tr><td></td><td></td><td></td></tr>
<tr><td>serialized</td><td>serialized</td><td>can be null</td></tr>
</table>
<p></p>

<h4 id="Sender_connect">
Sender.prototype.connect()
</h4>
* try connect to remote

<h4 id="Sender_send_request">
Sender.prototype.send_request(event, ...args)
</h4>
* if connect is false, will buffered request and call [connect](#Sender_connect)
* send_request event to remote with args

<h4 id="Sender_on_disconnect">
Sender.prototype.on_disconnect(error)
</h4>
* callback when request raise error or close called

<h4 id="Sender_close">
Sender.prototype.close()
</h4>
* close sender

<h3 id="Receiver">
class Receiver
</h3>
- receive message from remote

<h5 style="margin: 0; margin-left: 10px" id="Receiver_funcs">
functions</h5>
* [constructor(serialized)](#Receiver_construct)
  * [init()](#Receiver_init)
  * [add_listener(event, ...args)](#Receiver_add_listener)
  * [close()](#Receiver_close)


<h3 id="Receiver_construct">
new Receiver(serialized)
</h3>
<table>
<tr><td>name</td><td>type</td><td>note</td></tr>
<tr><td></td><td></td><td></td></tr>
<tr><td>serialized</td><td>serialized</td><td>can be null</td></tr>
</table>
<p></p>

<h4 id="Receiver_init">
Receiver.prototype.init()
</h4>
* start receive request from remote

<h4 id="Receiver_add_listener">
Receiver.prototype.add_listener()
</h4>
* add event listener

<h4 id="Receiver_close">
Receiver.prototype.close()
</h4>
* close Receiver

<h3 id="Socket">
library Socket
</h3>
- receive/send message from Socket

<h5 style="margin: 0; margin-left: 10px" id="Receiver_funcs">
functions</h5>
* [CreateReceiver(socket, serialized)](#Socket_CreateReceiver)
* [CreateSender(socket, serialized)](#Socket_CreateSender)


<h4 id="Socket_CreateSender">
Socket.CreateSender(socket, serialized)
</h4>
<table>
<tr><td>name</td><td>type</td><td>note</td></tr>
<tr><td></td><td></td><td></td></tr>
<tr><td>serisocketalized</td><td>socket.io</td><td>socket.io instance</td></tr>
<tr><td>serialized</td><td>serialized</td><td>can be null</td></tr>
</table>
* send from socket.io

<h4 id="Socket_CreateReceiver">
Socket.CreateReceiver(process, serialized)
</h4>
<table>
<tr><td>name</td><td>type</td><td>note</td></tr>
<tr><td></td><td></td><td></td></tr>
<tr><td>serisocketalized</td><td>socket.io</td><td>socket.io instance</td></tr>
<tr><td>serialized</td><td>serialized</td><td>can be null</td></tr>
</table>
* receive from socket.io


<h3 id="Http">
library Http
</h3>
- receive/send message from Http

<h5 style="margin: 0; margin-left: 10px" id="Receiver_funcs">
functions</h5>
* [CreateReceiver(server, prefix)](#Http_CreateReceiver)
* [CreateSender(url, headers={}, timeout=3000)](#Http_CreateSender)


<h4 id="Http_CreateSender">
Http.CreateSender(server, prefix)
</h4>
<table>
<tr><td>name</td><td>type</td><td>note</td></tr>
<tr><td></td><td></td><td></td></tr>
<tr><td>server</td><td>EventEmitter</td><td>native http server / express server instance</td></tr>
<tr><td>prefix</td><td>string</td><td>send url prefix, ex: "/my/url/prefix"</td></tr>
</table>
* send from socket.io

<h4 id="Http_CreateReceiver">
Http.CreateReceiver(url, headers={}, timeout=3000)
</h4>
<table>
<tr><td>name</td><td>type</td><td>note</td></tr>
<tr><td></td><td></td><td></td></tr>
<tr><td>url</td><td>url</td><td>full http url, ex: "http://127.0.0.1/my/url/prefix"</td></tr>
<tr><td>headers</td><td>Object</td><td>can be null</td></tr>
<tr><td>timeout</td><td>number</td><td>mark disconnect when timeout(ms)</td></tr>
</table>
* receive from socket.io