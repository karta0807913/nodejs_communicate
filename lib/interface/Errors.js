class BaseError extends Error {}

class UserInteruptError extends BaseError {}

class SenderAlreadyClosedError extends BaseError {}

class ConnectTimeOutError extends BaseError {}

class MethodNotImplementError extends BaseError {}

class MethodNotExistError extends BaseError {}

class TypeError extends BaseError {}

class NotConnectedError extends BaseError {}

module.exports = {
    BaseError,
    UserInteruptError,
    SenderAlreadyClosedError,
    ConnectTimeOutError,
    MethodNotExistError,
    MethodNotImplementError,
    TypeError,
    NotConnectedError
};