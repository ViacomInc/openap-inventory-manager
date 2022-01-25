import { sql, SqlSqlToken, ListSqlToken, IdentifierSqlToken } from "slonik";
import { managerDBConfig } from "./config";

interface SQLSetMap {
  [index: string]:
    | boolean
    | number
    | number[]
    | string
    | string[]
    | null
    | undefined;
}

export function sqlSet(setMap: SQLSetMap): ListSqlToken {
  const set = Object.entries(setMap).reduce(
    (update: SqlSqlToken[], [key, value]) => {
      if (value !== undefined) {
        const v = Array.isArray(value)
          ? sql`ARRAY[${sql.join(value, sql`,`)}]`
          : value;
        update.push(sql`${sql.identifier([key])} = ${v}`);
      }
      return update;
    },
    []
  );

  return sql.join(set, sql`,`);
}

export function table(name: string): IdentifierSqlToken {
  return sql.identifier([managerDBConfig.schema, name]);
}
