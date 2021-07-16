import * as assert from "assert";
export async function unit_test(manager, func_map) {
  for (let func_name in func_map) {
    manager.add_listener(func_name, (...args) => {
      return eval(func_map[func_name]);
    });
  }

  for (let func_name in func_map) {
    var args = [Math.random(), Math.random(), Math.random()];
    var result = await manager.send_request(func_name, ...args);
    var answer = eval(func_map[func_name]);
    if (answer instanceof Array) {
      for (var index in answer) {
        assert.deepStrictEqual(result[index], answer[index]);
      }
    } else {
      assert.deepStrictEqual(result, eval(func_map[func_name]));
    }
  }

  var promise_list = [];
  var answer_list = [];
  for (let func_name in func_map) {
    var args = [Math.random(), Math.random(), Math.random()];
    promise_list.push(manager.send_request(func_name, ...args));
    answer_list.push(eval(func_map[func_name]));
  }
  var result_list = await Promise.all(promise_list);
  for (var i = 0; i < answer_list.length; ++i) {
    var result = result_list[i];
    var answer = answer_list[i];
    if (answer instanceof Array) {
      for (var index in answer) {
        assert.deepStrictEqual(result[index], answer[index]);
      }
    } else {
      assert.deepStrictEqual(result, answer);
    }
  }
}