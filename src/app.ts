import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import { createTerminus } from '@godaddy/terminus'
import * as Sentry from '@sentry/node'
import * as http from 'http'
import compression from 'compression'
import { sentryConfig, serverConfig } from './dependencyInjection/configInjections'
import { serverHealth } from './dependencyInjection/serverHealthInjections'

const app: express.Application = express()
const server = http.createServer(app)
sentryConfig.init(app)

app.use(Sentry.Handlers.requestHandler())
app.use(morgan('common'))
app.use(helmet({ contentSecurityPolicy: false }))
app.use(compression())


createTerminus(server, {
  signal: 'SIGINT',
  healthChecks: { '/health': serverHealth.onHealthCheck },
  onShutdown: serverHealth.onShutdown,
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use(Sentry.Handlers.errorHandler())

server.listen(serverConfig.port)
