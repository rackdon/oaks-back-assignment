import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql'
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
import { dateScalarType, getPhaseType, getTaskType } from '../model/graphTypes'

export class ApiGraphController {
  readonly phasesService: PhasesService
  readonly tasksService: TasksService
  readonly logger: winston.Logger

  private readonly phaseType
  private readonly taskType

  constructor(
    phasesService: PhasesService,
    tasksService: TasksService,
    loggerConfig: LoggerConfig
  ) {
    this.phasesService = phasesService
    this.tasksService = tasksService
    this.logger = loggerConfig.create(ApiGraphController.name)
    this.taskType = getTaskType('Task', {
      phase: {
        type: getPhaseType('BasePhase'),
        resolve: this.tasksService.getGraphTaskPhaseResolver(),
      },
    })
    this.phaseType = getPhaseType('Phase', {
      tasks: {
        type: new GraphQLList(getTaskType('BaseTask')),
        resolve: this.phasesService.getGraphPhasesTasksResolver(),
      },
    })
  }

  getApiSchema = (): GraphQLSchema => {
    return new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'RootQuery',
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
              createdBefore: { type: dateScalarType },
              createdAfter: { type: dateScalarType },
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
            resolve: this.phasesService.getGraphPhasesResolver(),
          },
          phase: {
            type: this.phaseType,
            args: {
              id: {
                description: 'id of the phase',
                type: new GraphQLNonNull(GraphQLUUID),
              },
            },
            resolve: this.phasesService.getGraphPhasesResolver(),
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
            resolve: this.tasksService.getGraphTasksResolver(),
          },
          task: {
            type: this.taskType,
            args: {
              id: {
                description: 'id of the task',
                type: new GraphQLNonNull(GraphQLUUID),
              },
            },
            resolve: this.tasksService.getGraphTasksResolver(),
          },
        },
      }),
      mutation: new GraphQLObjectType({
        name: 'RootMutation',
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
