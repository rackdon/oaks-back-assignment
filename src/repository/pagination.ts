import { Pagination, SortDir } from '../model/pagination'

type Order = [string, SortDir]
export interface PaginationQuery {
  limit: number
  offset: number
  order: Order[]
}
export function getPaginationQuery({
  page,
  pageSize,
  sort,
  sortDir,
}: Pagination): PaginationQuery {
  return {
    limit: pageSize,
    offset: pageSize * page,
    order: sort.map((x) => [x, sortDir || 'DESC']),
  }
}

export function getPages(rows: number, pageSize: number): number {
  return Math.ceil(rows / pageSize)
}
