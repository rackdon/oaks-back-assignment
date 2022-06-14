import { Router } from 'express'
import { graphqlHTTP } from 'express-graphql'
import { ApiGraphController } from '../graphController/apiGraphController'

export class GraphRoutes {
  readonly router: Router = Router()

  constructor(apiGraphController: ApiGraphController) {
    this.router.use(
      '/api',
      graphqlHTTP({
        schema: apiGraphController.getApiSchema(),
        graphiql: true,
      })
    )
  }
}
