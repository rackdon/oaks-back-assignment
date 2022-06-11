/* eslint-disable  @typescript-eslint/no-explicit-any */
export class EitherI<A, B> {
  private readonly a: A
  private readonly b: B
  private readonly left: boolean
  private readonly right: boolean

  private constructor(a: A, b: B) {
    this.a = a
    this.b = b
    if (a !== null) {
      this.left = true
      this.right = false
    } else {
      this.left = false
      this.right = true
    }
  }

  public static Left<A>(a: A): EitherI<A, any> {
    return new EitherI(a, null)
  }

  public static Right<B>(b: B): EitherI<any, B> {
    return new EitherI(null, b)
  }

  public static async catchA<A>(f: () => A): Promise<Either<unknown, A>> {
    try {
      const result = await f()
      return new EitherI(null, result)
    } catch (e: unknown) {
      return new EitherI(e, null)
    }
  }

  public static catch<A>(f: () => A): Either<unknown, A> {
    try {
      return new EitherI(null, f())
    } catch (e: unknown) {
      return new EitherI(e, null)
    }
  }

  isLeft(): boolean {
    return this.left
  }

  isRight(): boolean {
    return this.right
  }

  async mapA<C>(f: (x: B) => C): Promise<Either<A, C>> {
    return this.isRight() ? new EitherI(this.a, await f(this.b)) : this
  }

  map<C>(f: (x: B) => C): Either<A, C> {
    return this.isRight() ? new EitherI(this.a, f(this.b)) : this
  }

  async mapLeftA<C>(f: (x: A) => C): Promise<Either<C, B>> {
    return this.isLeft() ? new EitherI(await f(this.a), null) : this
  }

  mapLeft<C>(f: (x: A) => C): Either<C, B> {
    return this.isLeft() ? new EitherI(f(this.a), null) : this
  }

  async foldA<C, D>(
    f: (x: A) => C,
    g: (x: B) => D
  ): Promise<EitherI<C, B> | EitherI<A, D>> {
    return this.isLeft()
      ? new EitherI(await f(this.a), this.b)
      : new EitherI(this.a, await g(this.b))
  }

  fold<C, D>(f: (x: A) => C, g: (x: B) => D): EitherI<C, B> | EitherI<A, D> {
    return this.isLeft()
      ? new EitherI(f(this.a), this.b)
      : new EitherI(this.a, g(this.b))
  }

  flatMap<C>(f: (x: B) => Either<A, C>): Either<A, C> {
    return this.isRight()
      ? new EitherI(this.a, f((this.b as unknown as Either<A, B>).extract()))
      : this
  }

  async flatMapA<C>(f: (x: B) => Promise<Either<A, C>>): Promise<Either<A, C>> {
    return this.isRight()
      ? new EitherI(
          this.a,
          await f((this.b as unknown as Either<A, B>).extract())
        )
      : this
  }

  flatten(): Either<A, B> {
    return this.isRight()
      ? new EitherI(this.a, (this.b as unknown as Either<A, B>).extract())
      : this
  }

  bind(): Either<A, B> {
    if (this.isRight()) {
      return this.b instanceof EitherI
        ? (this.b as unknown as Either<A, B>)
        : this
    } else {
      return this
    }
  }

  swap(): EitherI<B, A> {
    return new EitherI(this.b, this.a)
  }

  extract(): B {
    return this.b
  }

  extractLeft(): A {
    return this.a
  }
}

export type Either<A, B> = EitherI<A, any> | EitherI<any, B>
