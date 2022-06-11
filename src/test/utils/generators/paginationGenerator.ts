import { Pagination } from '../../../model/pagination'

export function generatePagination(
  page?: number,
  pageSize?: number,
  sort?: string[],
  sortDir?: 'ASC' | 'DESC'
): Pagination {
  return {
    page: page || 0,
    pageSize: pageSize || 10,
    sort: sort || [],
    sortDir: sortDir || null,
  }
}
