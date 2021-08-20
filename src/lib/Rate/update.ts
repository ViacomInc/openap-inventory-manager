import { sql } from "slonik";

import getPool from "../../db/client";
import { sqlSet, table } from "../../db/helpers";
import { Rate } from "../../db/types";

import { rateQuery } from "./queries";

interface ArchiveForDateQuery {
  userId: string;
  publisherId: number;
  date: string;
}

function archiveForDateQuery({
  userId,
  publisherId,
  date,
}: ArchiveForDateQuery) {
  return sql`
    UPDATE ${table("rates")}
    SET ${sqlSet({
      is_archived: true,
      updated_by: userId,
    })}
    WHERE is_archived = false AND
      publisher_id = ${publisherId} AND
      valid_from = ${date}
    RETURNING ${rateQuery}
  `;
}

export async function archiveForDate(
  options: ArchiveForDateQuery
): Promise<Rate[]> {
  const pool = getPool();
  const res = await pool.any<Rate>(archiveForDateQuery(options));
  return [...res];
}
