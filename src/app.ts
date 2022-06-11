import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import * as Sentry from '@sentry/node'
import * as http from 'http'
import compression from 'compression'

const app: express.Application = express()
const server = http.createServer(app)

app.use(Sentry.Handlers.requestHandler())
app.use(morgan('common'))
app.use(helmet({ contentSecurityPolicy: false }))
app.use(compression())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use(Sentry.Handlers.errorHandler())

server.listen(8080)
