import { createPool } from "slonik";
import type { DatabasePoolType } from "slonik";
import config from "./config";

export { sql } from "slonik";

export enum DB {
  Local,
}

const URLS = {
  [DB.Local]: process.env.DATABASE_URL ?? "",
};

const clients: Record<string, DatabasePoolType> = {};

function createPgDbPool(db: DB = DB.Local): DatabasePoolType {
  return createPool(URLS[db], config);
}

export default function getClient(db: DB = DB.Local): DatabasePoolType {
  if (!clients[db]) {
    clients[db] = createPgDbPool(db);
  }

  return clients[db];
}
export async function stopClient(db: DB = DB.Local): Promise<void> {
  if (!clients[db]) {
    return;
  }

  await clients[db].end();
}
