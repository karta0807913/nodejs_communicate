import { PacketData } from "./Adapter";
import EventAdapter from "./EventAdapter";
import { ChildProcess } from "child_process";

export default class ProcessAdapter extends EventAdapter {
  process: NodeJS.Process | ChildProcess;

  constructor(process: NodeJS.Process | ChildProcess, exit_callback?: () => void) {
    super(process, "message");
    this.process = process;
    process.on("exit", () => {
      super.close();
      exit_callback && exit_callback();
    });
  }

  _send_data(data: PacketData) {
    this.process.send(data);
  }

  close(signal: NodeJS.Signals = "SIGHUP") {
    if (!this._close) {
      super.close();
      if (this.process === global.process) {
      } else {
        (this.process as ChildProcess).kill(signal);
      }
    }
  }
}