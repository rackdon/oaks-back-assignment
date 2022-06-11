/* eslint-disable  @typescript-eslint/no-explicit-any */

import { validate, ValidationError } from 'class-validator'

export async function getValidationErrors<T>(
  instance: T,
  baseInstance: T
): Promise<string[]> {
  const extraKeys = Object.keys(instance).filter(
    (x) => !Object.keys(baseInstance).includes(x)
  )
  const validationErrors: ValidationError[] = await validate(
    instance as Record<string, any>,
    { skipMissingProperties: false }
  )
  const extraKeysErrors = extraKeys.map((x) => `${x} is an invalid key`)
  const validationParsedErrors = validationErrors
    .map((x: ValidationError) => {
      return x.constraints ? Object.values(x.constraints) : []
    })
    .flat()
  return extraKeysErrors.concat(validationParsedErrors)
}

export function validateBody<T>(
  f: (x: T) => [T, T]
): (x, y, z) => Promise<void> {
  return async function (req, res, next): Promise<void> {
    const [instance, baseInstance] = f(req.body)
    const validationErrors = await getValidationErrors(instance, baseInstance)
    if (validationErrors.length === 0) {
      next()
    } else {
      res.status(400).json({ errors: validationErrors })
    }
  }
}

export function validateQueryParams<T>(
  f: (x: T) => [T, T]
): (x, y, z) => Promise<void> {
  return async function (req, res, next): Promise<void> {
    const [instance, baseInstance] = f(req.query)
    const validationErrors = await getValidationErrors(instance, baseInstance)
    if (validationErrors.length === 0) {
      next()
    } else {
      res.status(400).json({ errors: validationErrors })
    }
  }
}
