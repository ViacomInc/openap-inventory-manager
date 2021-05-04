import { stopDBPool, teardownDB, deleteSchema } from "../dbHelpers";
import getClient, { sql } from "../../src/db/client";
import { managerDBConfig } from "../../src/db/config";

import migrateManager from "../../bin/migrate-manager";

describe("DB migrations:", () => {
  beforeEach(async () => {
    await deleteSchema();
    jest.spyOn(console, "info").mockImplementation(() => {});
  });

  afterAll(async () => {
    await deleteSchema();
    await stopDBPool();
  });

  it("creates the default schema", async () => {
    await migrateManager();
    const dbClient = getClient();

    const schemas = await dbClient.query<{ schema_name: string }>(
      sql`SELECT schema_name FROM information_schema.schemata`
    );

    const schemaNames = schemas.rows.map<string>((s) => s.schema_name);

    expect(schemaNames).toContain(managerDBConfig.schema);
  });

  it("creates the inventory_items and rates table", async () => {
    await migrateManager();
    const dbClient = getClient();

    const tables = await dbClient.query<{
      table_schema: string;
      table_name: string;
    }>(sql`SELECT table_schema, table_name FROM information_schema.tables`);

    const openAPTables = tables.rows
      .filter((s) => s.table_schema === managerDBConfig.schema)
      .map((t) => t.table_name);

    expect(openAPTables).toContain("inventory_items");
    expect(openAPTables).toContain("rates");
  });
});
