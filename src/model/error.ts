export class BadRequest {
  errors: string[]

  constructor(errors: string[]) {
    this.errors = errors
  }
}

export class Conflict {
  errors: string[]

  constructor(errors?: string[]) {
    this.errors = errors || []
  }
}

export class Forbidden {}

export class NotFound {}

export class Internal {}

export class ServiceUnavailable {}

export type ApiError =
  | BadRequest
  | NotFound
  | Forbidden
  | Conflict
  | Internal
  | ServiceUnavailable
