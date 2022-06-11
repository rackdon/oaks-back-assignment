import { Conflict, Internal } from '../../model/error'
import { LoggerConfig } from '../../configuration/loggerConfig'
import { manageDbErrors } from '../../repository/errors'

describe('Manage db errors', () => {
  const logger = new LoggerConfig().create('DB')

  it('returns conflict when SequelizeUniqueConstraintError', async () => {
    const error = {
      name: 'SequelizeUniqueConstraintError',
      errors: [{ message: 'a' }, { message: 'b' }],
    }
    const response = new Conflict(['a', 'b'])
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
