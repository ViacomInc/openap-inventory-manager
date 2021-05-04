import { JobHelpers } from "graphile-worker";

import { InventoryItemStatus } from "../../graphql/__generated__/types";

import { getAllForDate, updateStatus } from "../InventoryItem";
import { getId, separateRemoved } from "../InventoryItem/helpers";
import { createOAPInventoryItem } from "../openap/helpers";
import { uploadInventory } from "../openap/api";

export interface SyncInventoryForDatePayload {
  userId: string;
  publisherId: number;
  date: string;
}

export default async function syncInventoryForDate(
  payload: unknown,
  { logger }: JobHelpers
): Promise<void> {
  if (!payload) {
    throw new Error(`Wrong payload ${String(payload)}`);
  }

  const { userId, publisherId, date } = payload as SyncInventoryForDatePayload;
  if (
    typeof userId !== "string" ||
    typeof publisherId !== "number" ||
    typeof date !== "string"
  ) {
    throw new Error(`Wrong payload type ${String(payload)}`);
  }

  const items = await getAllForDate({
    publisherId,
    date,
    statuses: [
      InventoryItemStatus.New,
      InventoryItemStatus.Updated,
      InventoryItemStatus.Committed,
      InventoryItemStatus.Removed,
    ],
  });

  // clean date
  const cleanInventory = await uploadInventory(
    {
      broadcastDate: date,
      items: [],
    },
    true
  );
  logger.info(
    `Cleaned up inventory for ${date} with: ${JSON.stringify(cleanInventory)}`
  );

  if (!items.length) {
    return;
  }

  const { left: updatedItems, right: removedItems } = separateRemoved(items);

  if (updatedItems.length) {
    const submitInventory = await uploadInventory(
      {
        broadcastDate: date,
        items: updatedItems.map(createOAPInventoryItem),
      },
      true
    );

    logger.info(
      `Submitted inventory for ${date} with: ${JSON.stringify(submitInventory)}`
    );

    await updateStatus(
      userId,
      updatedItems.map(getId),
      InventoryItemStatus.Committed,
      false
    );
    logger.info(`Committed ${updatedItems.length} inventory for ${date}`);
  } else {
    logger.info(`No inventory for ${date}`);
  }

  if (removedItems.length) {
    await updateStatus(
      userId,
      removedItems.map(getId),
      InventoryItemStatus.Deleted,
      false
    );
    logger.info(`Deleted ${removedItems.length} inventory for ${date}`);
  }
}
