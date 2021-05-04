import {
  sql,
  SqlSqlTokenType,
  ListSqlTokenType,
  IdentifierSqlTokenType,
} from "slonik";
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

export function sqlSet(setMap: SQLSetMap): ListSqlTokenType {
  const set = Object.entries(setMap).reduce(
    (update: SqlSqlTokenType[], [key, value]) => {
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

export function table(name: string): IdentifierSqlTokenType {
  return sql.identifier([managerDBConfig.schema, name]);
}
