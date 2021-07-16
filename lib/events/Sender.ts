import Sender, { UnfinishJobs } from "../interface/Sender";
import Adapter from "../adapter/Adapter";
import Serialization, { ErrorResponse, Response } from "../interface/serialization";
export default class extends Sender {
  adapter: Adapter;

  constructor(adapter: Adapter, serialized: Serialization = new Serialization()) {
    super(serialized);
    this.adapter = adapter;
  }

  _send_request(data: any): Promise<ErrorResponse | Response> {
    return this.adapter.send_request(data);
  }

  close(export_buffers: boolean = false): UnfinishJobs[] | void {
    this.adapter.close();
    return super.close(export_buffers);
  }
}