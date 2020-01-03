exports.encode_request = function(obj) {
    return Buffer.from(JSON.stringify(obj), "utf-8");
};

exports.decode_request = function(obj) {
    return JSON.parse(obj.toString("utf-8"));
};

exports.encode_response = function(obj) {
    var data;
    if(obj instanceof Error) {
        data = JSON.stringify({
            is_error: true,
            name: obj.name,
            message: obj.message,
            stack: obj.stack
        });
    } else {
        data = JSON.stringify({
            is_error: false,
            result: obj
        });
    }
    return Buffer.from(data);
};

exports.decode_response = function(obj) {
    obj = JSON.parse(obj.toString());
    if(obj.is_error) {
        function cus_error() { Error.captureStackTrace(this, cus_error); }
        cus_error.prototype.__proto__ = Error.prototype;
        cus_error.prototype.name = obj.name;
        cus_error.prototype.message = obj.message;

        var error = new cus_error();
        error.stack = obj.stack || error.stack;
        throw error;
    } else {
        return obj.result;
    }
};
