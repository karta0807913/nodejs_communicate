import { PacketData } from "./Adapter";
import EventAdapter from "./EventAdapter";
import { ChildProcess } from "child_process";

export default class ProcessAdapter extends EventAdapter {
  override emitter: ChildProcess | NodeJS.Process;

  constructor(process: ChildProcess, exit_callback?: () => void) {
    super(process, "message");
    this.emitter = process;
    process.on("exit", () => {
      super.close();
      exit_callback && exit_callback();
    });
  }

  override _send_data(data: PacketData): Promise<void> {
    if (this.emitter.send) {
      this.emitter.send(data);
    } else {
      return Promise.reject(new Error("no parent process found"));
    }
    return Promise.resolve();
  }

  override close(signal: NodeJS.Signals = "SIGHUP"): void {
    if (!this.is_close()) {
      super.close();
      if (this.emitter === global.process) {
      } else {
        (this.emitter as ChildProcess).kill(signal);
      }
    }
  }
}