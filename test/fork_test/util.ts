import { CommunicateManager } from "../../index";
import * as assert from "assert";

export async function unit_test(manager: CommunicateManager, func_map: { [key: string]: string }) {
  for (let func_name in func_map) {
    manager.add_listener(func_name, (...args: any[]) => {
      console.log(args);
      return eval(func_map[func_name] as string);
    });
  }

  for (let func_name in func_map) {
    let args = [Math.random(), Math.random(), Math.random()];
    let result = await manager.send_request(func_name, ...args);
    let answer = eval(func_map[func_name] as string);
    if (answer instanceof Array) {
      for (var index in answer) {
        assert.deepStrictEqual(result[index], answer[index]);
      }
    } else {
      assert.deepStrictEqual(result, eval(func_map[func_name] as string));
    }
  }

  var promise_list = [];
  var answer_list = [];
  for (let func_name in func_map) {
    var args = [Math.random(), Math.random(), Math.random()];
    promise_list.push(manager.send_request(func_name, ...args));
    answer_list.push(eval(func_map[func_name] as string));
  }
  var result_list = await Promise.all(promise_list);
  for (let i = 0; i < answer_list.length; ++i) {
    let result = result_list[i];
    let answer: Array<any> | any = answer_list[i];
    if (answer instanceof Array) {
      for (let index in answer) {
        assert.deepStrictEqual(result[index], answer[index]);
      }
    } else {
      assert.deepStrictEqual(result, answer);
    }
  }
}