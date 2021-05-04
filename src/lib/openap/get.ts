import { getPublishers as getPublishersRequest } from "./api";
import type { OAPPublisher } from "./types";
import { PUBLISHERS_IDS } from "../constants";

export async function getPublishers(): Promise<OAPPublisher[]> {
  const publishers = await getPublishersRequest();
  return publishers.filter((publisher) =>
    PUBLISHERS_IDS.includes(publisher.id)
  );
}

export { getInventory } from "./api";
