class ProcessAdapter extends require("./EventAdapter") {
    constructor(process, exit_callback) {
        super(process, "message");
        this.closed = false;
        this.process = process;
        process.on("exit", ()=> {
            this.closed = true;
            exit_callback && exit_callback();
        });
    }

    _send_data(data) {
        this.process.send(data);
    }

    close(signal="SIGHUP") {
        if(!this.closed) {
            this.process.kill(signal);
            this.closed = true;
        }
    }
}

module.exports = ProcessAdapter;