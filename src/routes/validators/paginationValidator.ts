import { IsIn, IsNotEmpty, IsNumberString, IsOptional } from 'class-validator'

export class PaginationValidator {
  @IsOptional()
  @IsNumberString({ no_symbols: true })
  page!: number

  @IsOptional()
  @IsNumberString({ no_symbols: true })
  pageSize!: number

  @IsOptional()
  @IsNotEmpty({ each: true })
  sort!: string

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortDir!: string
}
