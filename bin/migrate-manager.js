#!/usr/bin/env node
require("dotenv-flow").config({ silent: true });
const path = require("path");
const yargs = require("yargs");
const runMigration = require("node-pg-migrate").default;

const dbSchema = process.env.OPENAP_SCHEMA || "openap";

const args = yargs(process.argv.slice(2)).option("direction", {
  describe: "Which direction to run the migrations: 'up' or 'down'",
  alias: "d",
  type: "string",
  default: "up",
  choices: ["up", "down"],
  demandOption: true,
}).argv;

const migrationConfigDefaults = {
  databaseUrl: process.env.DATABASE_URL || "",
  migrationsTable: "migrations",
  dir: path.resolve(__dirname, "../migrations"),
  count: Infinity,
  verbose: false,
  schema: dbSchema,
  createSchema: true,
};

async function main() {
  await runMigration({
    ...migrationConfigDefaults,
    direction: args.direction,
  });
}

module.exports = main;

if (!module.parent) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
