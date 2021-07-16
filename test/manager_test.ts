import * as assert from "assert";
import { CommunicateManager } from "../index";

export function create_promise(timeout: number) {
  let reslove, reject;
  let promise = new Promise((s, r) => {
    reslove = s; reject = r;
  });
  if (timeout) {
    let error = new Error("timeout");
    setTimeout(() => reject(error), timeout);
  }
  return { reslove, reject, promise };
}

export class TestError extends Error {
  constructor(...args) {
    super(...args);
    this.name = "TestError";
  }
}

export async function unit_test(manager: CommunicateManager) {
  var { reslove, promise } = create_promise(1000);
  manager.add_listener("test", (data) => {
    reslove(data);
    return data;
  });
  var res = manager.send_request("test", "HI");
  var [res1, res2] = await Promise.all([res, promise]);

  assert.deepEqual(res1, "HI");
  assert.deepEqual(res2, "HI");

  var { reslove, promise } = create_promise(1000);
  manager.add_listener("test1", (data, data1, data2) => {
    assert.deepEqual(data, 1);
    assert.deepEqual(data1, 2);
    assert.deepEqual(data2, 3);
    reslove(data1 + data2 + data);
    return data1 + data + data2;
  });
  res1 = await manager.send_request("test1", 1, 2, 3);
  assert.deepEqual(res1, 6);
  res1 = await promise;
  assert.deepEqual(res1, 6);
  var { reslove, promise } = create_promise(1000);
  manager.add_listener("test2", () => {
    reslove();
    throw new TestError();
  });
  try {
    res1 = await manager.send_request("test122", 1, 2, 3);
    assert(false, "must throw error");
  } catch (error) {
    if (error.message !== "request event \"test122\" not defined") {
      throw error;
    }
  }

  try {
    res1 = await manager.send_request("test2");
  } catch (error) {
    if (error.name !== "TestError") {
      throw error;
    }
  }
}

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});