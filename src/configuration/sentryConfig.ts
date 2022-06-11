import * as express from 'express'
import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'
import { cleanEnv, str } from 'envalid'

export class SentryConfig {
  readonly dsn: string
  private readonly environment: string
  private readonly release: string

  constructor() {
    const config = cleanEnv(process.env, {
      SENTRY_DSN: str({ default: '' }),
      SENTRY_ENVIRONMENT: str({ default: '' }),
      SENTRY_RELEASE: str({ default: '' }),
    })
    this.dsn = config.SENTRY_DSN
    this.environment = config.SENTRY_ENVIRONMENT
    this.release = config.SENTRY_RELEASE
  }

  init(app: express.Application): void {
    if (this.dsn) {
      Sentry.init({
        dsn: this.dsn,
        environment: this.environment,
        release: this.release,

        integrations: [
          // enable HTTP calls tracing
          new Sentry.Integrations.Http({ tracing: true }),
          // enable Express.js middleware tracing
          new Tracing.Integrations.Express({ app }),
        ],
        tracesSampleRate: 1.0,
      })
      app.use(Sentry.Handlers.requestHandler())
      app.use(Sentry.Handlers.errorHandler())
    }
  }
}
