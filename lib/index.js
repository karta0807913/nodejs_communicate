const Sender = require("./interface/Sender");
const Adapter = require("./adapter");
const Socket = require("./socket.io");
const Receiver = require("./interface/Receiver");
const EventEmitter = require("events");

const { CreateSender: CreateEventsSender, CreateReceiver: CreateEventsReceiver } = require("./events");
const Http = require("./http");


const cp = require("child_process");
const assert = require("assert");

class SenderConfigInterface {
    create() {}
    close() {}
}

class SenderConfig extends SenderConfigInterface {
    create(){
        if(!this._sender) {
            this._sender = this._create();
        }
        return this._sender;
    }
    _create() {}
    close() {
        this._sender && this._sender.close();
    }
}

class ReceiverConfigInterface {
    create() {}
    close() {}
}

class ReceiverConfig extends ReceiverConfigInterface {
    create(){
        if(!this._receiver) {
            this._receiver = this._create();
        }
        return this._receiver;
    }
    _create() {}
    close() {
        this._receiver && this._receiver.close();
    }
}

class SRConfig {
    createReceiver() {
        if(!this._receiver) {
            this._receiver = this._createReceiver();
        }
        return this._receiver;
    };
    createSender() {
        if(!this._sender) {
            this._sender = this._createSender();
        }
        return this._sender;
    }
    _createSender() {};
    _createReceiver() {};
    toSenderConfig() {
        return new SenderConfigWrapper(this);
    }
    toReceiverConfig() {
        return new ReceiverConfigWrapper(this);
    }

    close() {
        this._sender && this._sender.close();
        this._receiver && this._receiver.close();
    }
}

class ProcessSRConfig extends SRConfig {
    constructor(process) {
        super();
        assert(process instanceof EventEmitter);
        this.process = new Adapter.ProcessAdapter(process);
    }

    _createSender() {
        return CreateEventsSender(this.process);
    }

    _createReceiver() {
        return CreateEventsReceiver(this.process);
    }
}

class SenderConfigWrapper extends SenderConfigInterface {
    constructor(config) {
        assert(config instanceof SRConfig);
        this.config = config;
    }

    create() {
        return this.config.createSender();
    }

    close() {
        this.config.close();
    }
}

class ReceiverConfigWrapper extends ReceiverConfigInterface {
    constructor(config) {
        assert(config instanceof SRConfig);
        this.config = config;
    }

    create() {
        return this.config.createReceiver();
    }

    close() {
        this.config.close();
    }
}

class CommunicateManager {
    constructor(sender, receiver) {
        this._raw_sender = sender;
        this._raw_receiver = receiver;
        if(sender instanceof SenderConfigInterface) {
            sender = sender.create();
        }
        if(receiver instanceof ReceiverConfigInterface) {
            receiver = receiver.create();
        }
        if(sender instanceof SRConfig) {
            receiver = sender.createReceiver();
            sender = sender.createSender();
        }
        assert(sender instanceof Sender);
        assert(receiver instanceof Receiver);
        this.sender = sender;
        this.receiver = receiver;
    }

    add_listener(...args) {
        return this.receiver.add_listener(...args);
    }

    async init(instance=false) {
        await this.receiver.init();
        if(!await this.sender.connect()) {
            return false;
        }
        if(instance) {
            var funcs = await this.send_request("__funcs");
            instance = {};
            for(var func_name of funcs) {
                instance[func_name] = this.send_request.bind(this, func_name);
            }
            return instance;
        }
        return true;
    }

    async send_request(...args) {
        await this.receiver.init(false);
        return await this.sender.send_request(...args);
    }

    on_disconnect(...args) {
        this.sender.on_disconnect(...args);
    }

    close() {
        this.sender.close();
        this.receiver.close();
        this._raw_receiver && this._raw_receiver.close();
        this._raw_sender && this._raw_sender.close();
    }
}

function ForkProcess(filename, args, options={}) {
    if(!options.env) {
        options.env = {};
    }
    if(!options.env.NODE_PATH) {
        options.env.NODE_PATH = __dirname+"/../../";
    }
    return cp.fork(filename, args, options);
}

function CreateProcessSRConfig(filename, args, options) {
    if(filename instanceof EventEmitter) {
        return new ProcessSRConfig(filename);
    }
    return new ProcessSRConfig(ForkProcess(filename, args, options));
}

const Events = require("./events");

module.exports = {
    CreateProcessSRConfig,
    CommunicateManager,
    SenderConfigInterface, ReceiverConfigInterface,
    SenderConfig, ReceiverConfig, SRConfig,
    SenderConfigWrapper, ReceiverConfigWrapper,
    Sender, Receiver,
    Events, Adapter, Socket, Http
};