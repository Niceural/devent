export class WalletNotConnectedError extends Error {
  public constructor(message: string | any) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class StateNotCreatedError extends Error {
  public constructor(message: string | any) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class EventCreationError extends Error {
  public constructor(message: string | any) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class EventNotCreatedError extends Error {
  public constructor(message: string | any) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class RegistrationCreationError extends Error {
  public constructor(message: string | any) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class RegistrationNotCreatedError extends Error {
  public constructor(message: string | any) {
    super(message);
    this.name = this.constructor.name;
  }
}
