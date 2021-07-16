import ExpressReceiver from "./ExpressReceiver";
import NativeReceiver from "./NativeReceiver";
import Sender from "./Sender";
import * as assert from "assert";
import { EventEmitter } from "events";
import * as http from "http";
import * as express from "express";

function CreateReceiver(host: http.Server | express.Express, prefix: string) {
  if ((host as express.Express).post !== undefined) {
    return new ExpressReceiver(host as express.Express, prefix);
  }
  assert(host instanceof EventEmitter);
  return new NativeReceiver(host as http.Server, prefix);
}

function CreateSender(url: string, headers: Map<string, string[]> = {} as Map<string, string[]>, timeout = 3000) {
  return new Sender(url, headers, timeout);
}

export {
  CreateReceiver,
  CreateSender,
  ExpressReceiver,
  NativeReceiver,
  Sender
};