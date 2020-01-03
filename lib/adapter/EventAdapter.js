class EventAdapter extends require("./Adapter") {
    constructor(emitter, topic) {
        super();
        this.emitter = emitter;
        this.topic = topic;
        emitter.on(topic, (...args)=>this._listening(...args));
    }

    _send_data(dataset) {
        this.emitter.emit(this.topic, dataset);
    }
}

module.exports = EventAdapter;