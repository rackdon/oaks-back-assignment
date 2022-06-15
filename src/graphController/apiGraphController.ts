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
import { PhaseCreation } from '../model/phases'
import { PhasesService } from '../service/phases/phasesService'
import { TasksService } from '../service/tasks/tasksService'
import {
  BadRequest,
  Conflict,
  Forbidden,
  Internal,
  NotFound,
} from '../model/error'
import winston from 'winston'
import { LoggerConfig } from '../configuration/loggerConfig'
import { GraphQLUUID } from 'graphql-scalars'
import { TaskCreation } from '../model/tasks'

export class ApiGraphController {
  readonly pgClient: Sequelize
  readonly phasesService: PhasesService
  readonly tasksService: TasksService
  readonly logger: winston.Logger
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
      id: { type: GraphQLUUID },
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
      id: { type: GraphQLUUID },
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

  constructor(
    pgClient: PostgresqlClient,
    phasesService: PhasesService,
    tasksService: TasksService,
    loggerConfig: LoggerConfig
  ) {
    this.pgClient = pgClient.client
    this.phasesService = phasesService
    this.tasksService = tasksService
    this.logger = loggerConfig.create(ApiGraphController.name)
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
              // order: {
              //   type: GraphQLString,
              // },
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
                type: new GraphQLNonNull(GraphQLUUID),
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
              // order: {
              //   type: GraphQLString,
              // },
            },
            resolve: resolver(this.pgClient.models.Task),
          },
          task: {
            type: this.taskType,
            args: {
              id: {
                description: 'id of the task',
                type: new GraphQLNonNull(GraphQLUUID),
              },
            },
            resolve: resolver(this.pgClient.models.Task),
          },
        },
      }),
      mutation: new GraphQLObjectType({
        name: 'RootMutationType',
        fields: {
          createPhase: {
            type: this.phaseType,
            args: {
              name: {
                description: 'name of the phase',
                type: new GraphQLNonNull(GraphQLString),
              },
            },
            resolve: async (source, args: PhaseCreation) => {
              const result = await this.phasesService.createPhase(args)
              return result.foldExtract(
                (err) => this.manageErrors(err),
                (phase) => phase
              )
            },
          },
          updatePhase: {
            type: this.phaseType,
            args: {
              id: {
                description: 'id of the phase',
                type: new GraphQLNonNull(GraphQLUUID),
              },
              name: {
                description: 'new name of the phase',
                type: GraphQLString,
              },
              done: {
                description: 'new status of the phase',
                type: GraphQLBoolean,
              },
            },
            resolve: async (root, args) => {
              const { id, done } = args
              if ('done' in args && done === false) {
                throw new Error('Only true is allowed in done param')
              }
              delete args.id
              const result = await this.phasesService.editPhase(id, args)
              return result.foldExtract(
                (err) => this.manageErrors(err),
                (phase) => phase
              )
            },
          },
          deletePhase: {
            type: this.phaseType,
            args: {
              id: {
                description: 'id of the phase',
                type: new GraphQLNonNull(GraphQLUUID),
              },
            },
            resolve: async (source, args: { id: string }) => {
              const result = await this.phasesService.deletePhaseById(args.id)
              return result.foldExtract(
                (err) => this.manageErrors(err),
                (phase) => phase
              )
            },
          },
          createTask: {
            type: this.taskType,
            args: {
              name: {
                description: 'name of the task',
                type: new GraphQLNonNull(GraphQLString),
              },
              phaseId: {
                description: 'id of the relatedPhase',
                type: new GraphQLNonNull(GraphQLUUID),
              },
            },
            resolve: async (source, args: TaskCreation) => {
              const result = await this.tasksService.createTask(args)
              return result.foldExtract(
                (err) => this.manageErrors(err),
                (phase) => phase
              )
            },
          },
          updateTask: {
            type: this.taskType,
            args: {
              id: {
                description: 'id of the task',
                type: new GraphQLNonNull(GraphQLUUID),
              },
              name: {
                description: 'new name of the task',
                type: GraphQLString,
              },
              done: {
                description: 'new status of the task',
                type: GraphQLBoolean,
              },
            },
            resolve: async (root, args) => {
              const { id, done } = args
              delete args.id
              if ('done' in args && done === false) {
                throw new Error('Only true is allowed in done param')
              }
              const result = await this.tasksService.editTask(id, args)
              return result.foldExtract(
                (err) => this.manageErrors(err),
                (phase) => phase
              )
            },
          },
          deleteTask: {
            type: this.taskType,
            args: {
              id: {
                description: 'id of the task',
                type: new GraphQLNonNull(GraphQLUUID),
              },
            },
            resolve: async (source, args: { id: string }) => {
              const result = await this.tasksService.deleteTaskById(args.id)
              return result.foldExtract(
                (err) => this.manageErrors(err),
                (phase) => phase
              )
            },
          },
        },
      }),
    })
  }

  private manageErrors = (error) => {
    switch (error.constructor) {
      case BadRequest: {
        throw new Error(error.errors.join())
      }
      case Forbidden: {
        throw new Error('Forbidden')
      }
      case NotFound: {
        throw new Error('Not found')
      }
      case Conflict: {
        throw new Error(error.errors.join())
      }
      case Internal: {
        throw new Error('Internal error')
      }
      default: {
        this.logger.warn(`Unexpected error: ${error}`)
        throw new Error('Internal error')
      }
    }
  }
}
