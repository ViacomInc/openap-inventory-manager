import { sql } from "slonik";

import getPool from "../../db/client";
import { table } from "../../db/helpers";
import { Rate } from "../../db/types";

import { rateQuery } from "./queries";

function getQuery(id: number) {
  return sql`
      SELECT ${rateQuery}
      FROM
        ${table("rates")}
      WHERE id = ${id}
    `;
}

interface Get {
  id: number;
}

export function get({ id }: Get): Promise<Rate> {
  const pool = getPool();
  return pool.one<Rate>(getQuery(id));
}

interface GetALLQuery {
  publisherId: number;
  isArchived: boolean;
}

function getAllQuery({ publisherId, isArchived }: GetALLQuery) {
  return sql`
    SELECT ${rateQuery}
    FROM
      ${table("rates")}
    WHERE publisher_id = ${publisherId}
    AND is_archived = ${isArchived}
  `;
}

interface GetAllForPublisher {
  publisherId: number;
  isArchived: boolean;
}

export async function getAllForPublisher({
  publisherId,
  isArchived = false,
}: GetAllForPublisher): Promise<Rate[]> {
  const pool = getPool();
  const res = await pool.any<Rate>(getAllQuery({ publisherId, isArchived }));
  return [...res];
}
