export interface DataWithPages<T> {
  data: Array<T>
  pages: number
}

const defaultPageSize = 10
export type SortDir = 'ASC' | 'DESC'

export interface PaginationFilters {
  page?: number
  pageSize?: number
  sort?: string[] | string
  sortDir?: SortDir
}

export interface Pagination {
  page: number
  pageSize: number
  sort: string[]
  sortDir: SortDir | null
}

export function toPagination(pagination: PaginationFilters): Pagination {
  return {
    page: pagination.page || 0,
    pageSize: pagination.pageSize || defaultPageSize,
    sort: pagination.sort
      ? typeof pagination.sort === 'string'
        ? [pagination.sort as string]
        : (pagination.sort as Array<string>)
      : [],
    sortDir: pagination.sortDir || null,
  }
}
