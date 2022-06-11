/* eslint-disable  @typescript-eslint/no-unused-vars */

import { EitherI } from '../../model/either'

describe('Either with right value', () => {
  const eitherRight = EitherI.Right(1)

  it('is left returns false', () => {
    expect(eitherRight.isLeft()).toEqual(false)
  })

  it('is right returns true', () => {
    expect(eitherRight.isRight()).toEqual(true)
  })

  it('map apply the function over right value', () => {
    const f = (x) => x + 1
    expect(eitherRight.map(f)).toEqual(EitherI.Right(2))
  })

  it('map async apply the function over right value', async () => {
    const f = async (x) => x + 1
    expect(await eitherRight.mapA(f)).toEqual(EitherI.Right(2))
  })

  it('mapLeft returns the same either as there is no left value', () => {
    const f = (x) => x + 1
    expect(eitherRight.mapLeft(f)).toEqual(EitherI.Right(1))
  })

  it('mapLeft async returns the same either as there is no left value', async () => {
    const f = async (x) => x + 1
    expect(await eitherRight.mapLeftA(f)).toEqual(EitherI.Right(1))
  })

  it('fold apply function over right side when there is right value', () => {
    const fRight = (x) => x + 1
    const fLeft = (x) => 'error'
    expect(eitherRight.fold(fLeft, fRight)).toEqual(EitherI.Right(2))
  })

  it('fold async apply function over right side when there is right value', async () => {
    const fRight = async (x) => x + 1
    const fLeft = async (x) => 'error'
    expect(await eitherRight.foldA(fLeft, fRight)).toEqual(EitherI.Right(2))
  })

  it('flatMap apply the function over right either value', () => {
    const doubleEither = EitherI.Right(EitherI.Right(1))
    const f = (x) => x + 1
    expect(doubleEither.flatMap(f)).toEqual(EitherI.Right(2))
  })

  it('flatMap async apply the function over right either value', async () => {
    const doubleEither = EitherI.Right(EitherI.Right(1))
    const f = async (x) => x + 1
    expect(await doubleEither.flatMapA(f)).toEqual(EitherI.Right(2))
  })

  it('flatten plain the either', () => {
    const doubleEither = EitherI.Right(EitherI.Right(1))
    expect(doubleEither.flatten()).toEqual(EitherI.Right(1))
  })

  it('bind returns the left of the right side', () => {
    const doubleEither = EitherI.Right(EitherI.Left(1))
    expect(doubleEither.bind()).toEqual(EitherI.Left(1))
  })
  it('bind returns the right side if exists', () => {
    const doubleEither = EitherI.Right(2)
    expect(doubleEither.bind()).toEqual(EitherI.Right(2))
  })

  it('swap convert either right to either left', async () => {
    expect(eitherRight.swap()).toEqual(EitherI.Left(1))
  })

  it('extract returns right value', async () => {
    expect(eitherRight.extract()).toEqual(1)
  })

  it('extractLeft returns left value', async () => {
    expect(eitherRight.extractLeft()).toEqual(null)
  })
})

describe('Either catch', () => {
  it('returns either right when no error', () => {
    const f = () => 1
    expect(EitherI.catch(f)).toEqual(EitherI.Right(1))
  })

  it('returns either left when error', () => {
    const error = new Error('error')
    const f = () => {
      throw error
    }
    expect(EitherI.catch(f)).toEqual(EitherI.Left(error))
  })
})

describe('Either catch async', () => {
  it('returns either right when no error', async () => {
    const f = async () => 1
    expect(await EitherI.catchA(f)).toEqual(EitherI.Right(1))
  })

  it('returns either left when error', async () => {
    const error = new Error('error')
    const f = async () => {
      throw error
    }
    expect(await EitherI.catchA(f)).toEqual(EitherI.Left(error))
  })
})
