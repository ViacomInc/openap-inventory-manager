import runMigration from "node-pg-migrate";
import getClient, { stopClient, sql } from "../src/db/client";
import { managerDBConfig } from "../src/db/config";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "Environment variable 'DATABASE_URL' is not set. Check your .env files"
  );
}

const MigrationConfigDefaults = {
  databaseUrl: process.env.DATABASE_URL,
  migrationsTable: "migrations",
  dir: "./migrations",
  count: Infinity,
  schema: managerDBConfig.schema,
  createSchema: true,
  verbose: false,
};

export async function resetDB(): Promise<void> {
  await runMigration({
    ...MigrationConfigDefaults,
    direction: "down",
  });

  await runMigration({
    ...MigrationConfigDefaults,
    direction: "up",
  });
}

export async function teardownDB(): Promise<void> {
  await runMigration({
    ...MigrationConfigDefaults,
    direction: "down",
  });
}

const TRUNCATE_TABLE_NAMES = ["inventory_items", "migrations"];
export const truncateDB = async (): Promise<void> => {
  const dbClient = getClient();
  await Promise.all(
    TRUNCATE_TABLE_NAMES.map((tableName) =>
      dbClient.query(sql`TRUNCATE TABLE ${tableName} CASCADE`)
    )
  );
};

export async function stopDBPool(): Promise<void> {
  await stopClient();
}

export const deleteSchema = async (): Promise<void> => {
  const dbClient = getClient();
  await dbClient.query(
    sql`DROP SCHEMA IF EXISTS ${sql.identifier([
      managerDBConfig.schema,
    ])} CASCADE`
  );
};
