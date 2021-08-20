import { sql } from "slonik";

import getPool from "../../db/client";
import { table } from "../../db/helpers";
import { Rate, NewRate } from "../../db/types";

import { rateQuery } from "./queries";

function createQuery(userId: string, rates: NewRate[]) {
  return sql`
    INSERT INTO ${table("rates")} (
      rate,
      rate_key,
      rate_type,
      valid_from,
      valid_until,
      publisher_id,
      created_by,
      updated_by
    )
    VALUES ${sql.join(makeValues(userId, rates), sql`, `)}
    RETURNING ${rateQuery}
  `;
}

export function create(userId: string, data: NewRate): Promise<Rate> {
  const pool = getPool();
  return pool.one<Rate>(createQuery(userId, [data]));
}

export async function bulkCreate(
  userId: string,
  data: NewRate[]
): Promise<Rate[]> {
  const pool = getPool();
  const res = await pool.many<Rate>(createQuery(userId, data));
  return [...res];
}

function makeValues(userId: string, data: NewRate[]) {
  return data.map(
    (rate) => sql`(
    ${rate.rate},
    ${rate.rateKey},
    ${rate.rateType},
    ${rate.validFrom},
    ${rate.validUntil},
    ${rate.publisherId},
    ${userId},
    ${userId}
  )`
  );
}
