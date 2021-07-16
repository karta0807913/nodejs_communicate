export class BaseError extends Error { }

export class UserInteruptError extends BaseError { }

export class SenderAlreadyClosedError extends BaseError { }

export class ConnectTimeOutError extends BaseError { }

export class MethodNotImplementError extends BaseError { }

export class MethodNotExistError extends BaseError { }

export class TypeError extends BaseError { }

export class NotConnectedError extends BaseError { }