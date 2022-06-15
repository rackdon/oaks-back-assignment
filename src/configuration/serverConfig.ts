import { cleanEnv, port } from 'envalid'

export class ServerConfig {
  readonly port: number

  constructor() {
    const config = cleanEnv(process.env, {
      SERVER_PORT: port({ default: 8082 }),
    })
    this.port = config.SERVER_PORT
  }
}
