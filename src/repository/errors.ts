import { ApiError, Conflict, Internal } from '../model/error'
import winston from 'winston'

export function manageDbErrors(e, logger: winston.Logger): ApiError {
  switch (e.name) {
    case 'SequelizeUniqueConstraintError': {
      return new Conflict(e.errors.map((x) => x.message))
    }
    default: {
      logger.warn(`Don't know how to manage db error ${e.name || e.message}`, e)
      return new Internal()
    }
  }
}
