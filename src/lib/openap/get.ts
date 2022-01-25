import { getPublishers as getPublishersRequest } from "./api";
import type { OAPPublisher } from "./types";

let publisherIds: number[];
function getPublisherIds(): number[] {
  if (!publisherIds) {
    const ids = process.env.OPENAP_PUBLISHERS_IDS;
    if (!ids) {
      throw new Error(
        "Set OPENAP_PUBLISHERS_IDS enviroment variable to your supported publishers ids. Set as comma separated list for multiple publishers."
      );
    }

    publisherIds = JSON.parse(`[${ids}]`) as number[];
  }
  return publisherIds;
}

export async function getPublishers(): Promise<OAPPublisher[]> {
  const publishersIds = getPublisherIds();
  const publishers = await getPublishersRequest();
  return publishers.filter((publisher) => publishersIds.includes(publisher.id));
}

export { getInventory } from "./api";
