import { unparse } from "papaparse";

import { InventoryItem, Network } from "../graphql";
import { formatDateTime, formatDate } from "../../lib/dateHelpers";

export default function makeCSV(
  items: InventoryItem[],
  networks: Network[]
): string {
  return unparse(
    items.map((item) => ({
      id: item.id,
      name: item.name,
      "start date time": formatDateTime(item.startDatetime),
      "end date time": formatDateTime(item.endDatetime),
      network: networks.find((network) => network.id === item.networkId)?.name,
      "rate type": item.rateType,
      rate: item.rate,
      units: item.units,
      "valid until": formatDate(item.validUntil),
      "projections demographics": item.projectionsDemographics,
      "projected impressions": item.projectedImpressions,
    }))
  );
}
