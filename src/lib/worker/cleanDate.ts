import { JobHelpers } from "graphile-worker";
import { uploadRates, uploadInventory } from "../openap/api";
import { updateStatusForDate } from "../InventoryItem";
import { InventoryItemStatus } from "../../graphql/__generated__/types";

export interface CleanDatePayload {
  userId: string;
  date: string;
}

export default async function cleanDate(
  payload: unknown,
  { logger }: JobHelpers
): Promise<void> {
  if (!payload) {
    throw new Error(`Wrong payload ${String(payload)}`);
  }

  const { date, userId } = payload as CleanDatePayload;

  if (typeof date !== "string" || typeof userId !== "string") {
    throw new Error(`Wrong payload type ${String(payload)}`);
  }

  const cleanRates = await uploadRates(
    {
      validFrom: date,
      items: [],
    },
    true
  );
  logger.info(`Deleted rates for ${date} with: ${JSON.stringify(cleanRates)}`);

  const cleanInventory = await uploadInventory(
    {
      broadcastDate: date,
      items: [],
    },
    true
  );
  logger.info(
    `Deleted inventroy for ${date} with: ${JSON.stringify(cleanInventory)}`
  );

  await updateStatusForDate(userId, date, InventoryItemStatus.New);

  logger.info(`Delete rates for ${date} in Open AP`);
}
