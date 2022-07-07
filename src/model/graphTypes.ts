import {
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLString,
} from 'graphql'
import { GraphQLDate, GraphQLUUID } from 'graphql-scalars'

export const dateScalarType = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  parseValue(value) {
    return value
  },
  serialize(value) {
    return value
  },
})

export function getPhaseType(
  name: string,
  extraFields?: Record<string, unknown>
): GraphQLObjectType {
  return new GraphQLObjectType({
    name: name,
    fields: {
      id: { type: GraphQLUUID },
      name: { type: GraphQLString },
      done: { type: GraphQLBoolean },
      createdOn: {
        type: dateScalarType,
      },
      updatedOn: { type: dateScalarType },
      ...extraFields,
    },
  })
}

export function getTaskType(
  name: string,
  extraFields?: Record<string, unknown>
): GraphQLObjectType {
  return new GraphQLObjectType({
    name: name,
    fields: {
      id: { type: GraphQLUUID },
      phaseId: { type: GraphQLUUID },
      name: { type: GraphQLString },
      done: { type: GraphQLBoolean },
      createdOn: {
        type: dateScalarType,
      },
      updatedOn: { type: dateScalarType },
      ...extraFields,
    },
  })
}
