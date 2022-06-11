/* eslint-disable  @typescript-eslint/no-explicit-any */

export function mockRequest(
  params: Record<string, any> | null,
  body: Record<string, any> | null,
  query: Record<string, any> | null,
  args: Record<string, string> = {}
): Record<string, any> {
  return {
    ...{
      params: params,
      body: body,
      query: query,
      get: (param) => (params ? params[param] : null),
    },
    ...args,
  }
}

export class MockResponse {
  statusCode = -1
  body: Record<string, any> = {}

  status(status: number): MockResponse {
    this.statusCode = status
    return this
  }

  json(body: Record<string, any>): MockResponse {
    this.body = body
    return this
  }

  send(): MockResponse {
    return this
  }
}
