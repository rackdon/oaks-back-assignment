import { QueryTypes, Sequelize } from 'sequelize'

export class DatabaseCleanerPsql {
  readonly client: Sequelize
  readonly versionControlTableNames = ['pgmigrations']

  constructor(client: Sequelize) {
    this.client = client
  }

  async getTableNames(): Promise<string[]> {
    const excludedTables = this.versionControlTableNames
      .map((x) => `'${x}'`)
      .join(',')
    const result = await this.client.query(
      `SELECT * FROM information_schema.tables WHERE table_schema='public' AND table_name NOT IN (${excludedTables})`,
      { type: QueryTypes.SELECT }
    )
    return result.map((r) => r['table_name'])
  }

  async truncate(tables?: string[], excludedTables?: string[]): Promise<void> {
    const finalTables = (tables || (await this.getTableNames())).filter(
      (t) => !excludedTables?.includes(t)
    )
    await this.client.query(`truncate ${finalTables.join(',')} cascade`)
  }
}
