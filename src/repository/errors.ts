import {
  ApiError,
  BadRequest,
  Conflict,
  Forbidden,
  Internal,
} from '../model/error'
import { Logger } from '../service/server/logger'

export function manageDbErrors(e, logger: Logger): ApiError {
  switch (e.name) {
    case 'SequelizeUniqueConstraintError': {
      return new Conflict(e.errors.map((x) => x.message))
    }
    case 'SequelizeForeignKeyConstraintError': {
      return e.message.startsWith('update or delete')
        ? new Forbidden()
        : new BadRequest([e.message])
    }
    default: {
      logger.warn(`Don't know how to manage db error ${e.name || e.message}`, e)
      return new Internal()
    }
  }
}
