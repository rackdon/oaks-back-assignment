import { Op, Sequelize } from 'sequelize'
import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql'
import { resolver } from 'graphql-sequelize'
import { PostgresqlClient } from '../client/postgresql/postgresqlClient'

export class ApiGraphController {
  readonly pgClient: Sequelize
  readonly dateScalarType = new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return value
    },
    serialize(value) {
      return value
    },
  })
  private readonly phaseType = new GraphQLObjectType({
    name: 'Phase',
    fields: () => ({
      id: { type: GraphQLString },
      name: { type: GraphQLString },
      done: { type: GraphQLBoolean },
      createdOn: {
        type: this.dateScalarType,
      },
      updatedOn: { type: this.dateScalarType },
      tasks: {
        type: new GraphQLList(this.taskType),
        resolve: resolver(this.pgClient.models.Phase['tasks']),
      },
    }),
  })

  private readonly taskType = new GraphQLObjectType({
    name: 'Task',
    fields: () => ({
      id: { type: GraphQLString },
      phaseId: { type: GraphQLString },
      name: { type: GraphQLString },
      done: { type: GraphQLBoolean },
      createdOn: {
        type: this.dateScalarType,
      },
      updatedOn: { type: this.dateScalarType },
      phase: {
        type: this.phaseType,
        resolve: resolver(this.pgClient.models.Task['phase']),
      },
    }),
  })

  constructor(pgClient: PostgresqlClient) {
    this.pgClient = pgClient.client
  }

  getApiSchema = (): GraphQLSchema => {
    return new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
          phases: {
            type: new GraphQLList(this.phaseType),
            args: {
              name: {
                type: GraphQLString,
              },
              done: {
                type: GraphQLBoolean,
              },
              createdBefore: { type: this.dateScalarType },
              createdAfter: { type: this.dateScalarType },
              limit: {
                type: GraphQLInt,
              },
              offset: {
                type: GraphQLInt,
              },
              order: {
                type: GraphQLString,
              },
            },
            resolve: resolver(this.pgClient.models.Phase, {
              before: (findOptions, args) => {
                findOptions.where = findOptions.where || {}
                if (args.createdBefore) {
                  findOptions.where.createdOn = { [Op.lt]: args.createdBefore }
                }
                if (args.createdAfter) {
                  findOptions.where.createdOn = { [Op.gt]: args.createdBefore }
                }
                return findOptions
              },
            }),
          },
          phase: {
            type: this.phaseType,
            args: {
              id: {
                description: 'id of the phase',
                type: new GraphQLNonNull(GraphQLString),
              },
            },
            resolve: resolver(this.pgClient.models.Phase),
          },

          tasks: {
            type: new GraphQLList(this.taskType),
            args: {
              name: {
                type: GraphQLString,
              },
              done: {
                type: GraphQLBoolean,
              },
              phaseId: {
                type: GraphQLString,
              },
              limit: {
                type: GraphQLInt,
              },
              offset: {
                type: GraphQLInt,
              },
              order: {
                type: GraphQLString,
              },
            },
            resolve: resolver(this.pgClient.models.Task),
          },
          task: {
            type: this.taskType,
            args: {
              id: {
                description: 'id of the task',
                type: new GraphQLNonNull(GraphQLString),
              },
            },
            resolve: resolver(this.pgClient.models.Task),
          },
        },
      }),
    })
  }
}
