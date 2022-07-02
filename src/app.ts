import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import { createTerminus } from '@godaddy/terminus'
import * as http from 'http'
import compression from 'compression'
import {
  sentryConfig,
  serverConfig,
} from './dependencyInjection/configInjections'
import { serverHealth } from './dependencyInjection/serverHealthInjections'
import { graphRoutes, routes } from './dependencyInjection/routesInjections'
import * as fs from 'fs'
import { parse } from 'yaml'
import { setup, serve } from 'swagger-ui-express'

const swaggerData = fs.readFileSync('./swagger.yml', 'utf8')
const swaggerDocument = parse(swaggerData)

const app: express.Application = express()
const server = http.createServer(app)
sentryConfig.init(app)

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With'
  )

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  } else {
    next()
  }
})
app.use(morgan('common'))
app.use(helmet({ contentSecurityPolicy: false }))
app.use(compression())

createTerminus(server, {
  signal: 'SIGINT',
  healthChecks: { '/health': serverHealth.onHealthCheck },
  onShutdown: serverHealth.onShutdown,
})

app.use('/api-docs', serve, setup(swaggerDocument))
app.use('/api', express.json(), routes.router)
app.use('/graph', graphRoutes.router)

server.listen(serverConfig.port, () => {
  /* eslint-disable no-console */
  console.log(`Server started at port ${serverConfig.port}`)
})
