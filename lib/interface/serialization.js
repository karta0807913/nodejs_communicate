exports.encode_request = function(obj) {
    return obj;
};

exports.decode_request = function(obj) {
    return obj;
};

exports.encode_response = function(obj) {
    if(obj instanceof Error) {
        return {
            is_error: true,
            name: obj.name,
            message: obj.message,
            stack: obj.stack
        };
    } else {
        return {
            is_error: false,
            result: obj
        };
    }
};

exports.decode_response = function(obj) {
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
