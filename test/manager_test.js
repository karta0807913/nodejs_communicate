const assert = require("assert");

function create_promise(timeout) {
    var reslove, reject;
    var promise = new Promise((s,r)=>{
        reslove = s; reject = r;
    });
    if(timeout) {
        var error = new Error("timeout");
        timeout = setTimeout(()=>reject(error), timeout);
    }
    return { reslove, reject, promise };
}

class TestError extends Error {
    constructor(...args) {
        super(...args);
        this.name = "TestError";
    }
}

async function unit_test(manager) {
    var { reslove, promise } = create_promise(1000);
    manager.add_listener("test", (data) => {
        reslove(data);
        return data;
    });
    var res = manager.send_request("test", "HI");
    var res1 = await promise;
    assert.equal(res1, "HI");
    res = await res;
    assert.equal(res, "HI");

    var { reslove, promise } = create_promise(1000);
    manager.add_listener("test1", (data,data1,data2) => {
        assert.equal(data, 1);
        assert.equal(data1, 2);
        assert.equal(data2, 3);
        reslove(data1 + data2 + data);
        return data1 + data + data2;
    });
    res = await manager.send_request("test1", 1,2,3);
    assert.equal(res, 6);
    res = await promise;
    assert.equal(res, 6);
    var { reslove, promise } = create_promise(1000);
    manager.add_listener("test2", () => {
        reslove();
        throw new TestError();
    });
    try {
        res = await manager.send_request("test122", 1,2,3);
        assert(false, "must throw error");
    } catch(error) {
        if(error.message !== "request event not defined") {
            throw error;
        }
    }

    try {
        res = await manager.send_request("test2");
    } catch(error) {
        if(error.name !== "TestError") {
            throw error;
        }
    }
}

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

module.exports = {
    TestError, create_promise, unit_test
};
