import { EitherI } from '../../model/either'

export function expectLeft<A, B, C>(
  x: EitherI<A, B>,
  f?: (a: A) => C
): jest.JestMatchers<A | C> {
  return expect(f ? f(x.extractLeft()) : x.extractLeft())
}

export function expectRight<A, B, C>(
  x: EitherI<A, B>,
  f?: (a: B) => C
): jest.JestMatchers<B | C> {
  return expect(f ? f(x.extract()) : x.extract())
}
