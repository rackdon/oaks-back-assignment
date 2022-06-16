import { BadRequest, Conflict, Internal } from '../../model/error'
import { LoggerConfig } from '../../configuration/loggerConfig'
import { manageDbErrors } from '../../repository/errors'
import { Logger } from '../../service/server/logger'

describe('Manage db errors', () => {
  const logger = new Logger('DB', new LoggerConfig().create())

  it('returns conflict when SequelizeUniqueConstraintError', async () => {
    const error = {
      name: 'SequelizeUniqueConstraintError',
      errors: [{ message: 'a' }, { message: 'b' }],
    }
    const response = new Conflict(['a', 'b'])
    const result = manageDbErrors(error, logger)
    expect(result).toEqual(response)
  })

  it('returns bad request when SequelizeForeignKeyConstraintError', async () => {
    const error = {
      name: 'SequelizeForeignKeyConstraintError',
      message: 'message',
    }
    const response = new BadRequest(['message'])
    const result = manageDbErrors(error, logger)
    expect(result).toEqual(response)
  })

  it('returns internal when do not know how to manage db error name', async () => {
    const error = {
      name: 'not managged',
      errors: [{ message: 'a' }, { name: 'b' }],
    }
    const response = new Internal()
    const result = manageDbErrors(error, logger)
    expect(result).toEqual(response)
  })
})
