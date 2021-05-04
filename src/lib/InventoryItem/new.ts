import {
  RateType,
  InventoryItemInput,
  Demographics,
} from "../../graphql/__generated__/types";

import { DateOrString } from "../types";
import {
  parseNYDate,
  parseNYDateTime,
  newYorkTimeZone,
  getSqlDateTimeFromIsoInput,
  getIsoDateFromSql,
} from "../dateHelpers";

import {
  DEFAULT_VALID_UNTIL_DAYS,
  DEFAULT_ITEM_DURATION_HOURS,
} from "../constants";
import { DateTime } from "luxon";

const getStartDateTime = (date: DateTime): DateTime =>
  date.plus({ days: DEFAULT_VALID_UNTIL_DAYS });
const getEndDateTime = (date: DateTime): DateTime =>
  date.plus({ hours: DEFAULT_ITEM_DURATION_HOURS });
export const getValidUntil = (date: DateTime): DateTime =>
  date.plus({ days: -DEFAULT_VALID_UNTIL_DAYS });

type CreateNewInventoryItem = Pick<InventoryItemInput, "publisherId"> &
  Partial<
    Pick<
      InventoryItemInput,
      "name" | "projectedImpressions" | "networkId" | "units" | "rate"
    >
  > &
  Partial<{
    projectionsDemographics: InventoryItemInput["projectionsDemographics"] | "";
    rateType: InventoryItemInput["rateType"] | "";
  }> & {
    startDatetime?: DateOrString;
    endDatetime?: DateOrString;
    validUntil?: DateOrString;
  };

export function createNewInventoryItem(
  item: CreateNewInventoryItem
): InventoryItemInput {
  const startDatetime = DateTime.isDateTime(item.startDatetime)
    ? item.startDatetime
    : parseNYDateTime(item.startDatetime) ||
      getStartDateTime(DateTime.local().setZone(newYorkTimeZone));

  const endDatetime = DateTime.isDateTime(item.endDatetime)
    ? item.endDatetime
    : parseNYDateTime(item.endDatetime) || getEndDateTime(startDatetime);

  const validUntil = DateTime.isDateTime(item.validUntil)
    ? item.validUntil
    : parseNYDate(item.validUntil) || getValidUntil(startDatetime);

  return {
    name: "Title",
    networkId: 17, // MTV
    units: 0.0,
    rate: 0.0,
    projectedImpressions: 0,
    ...item,
    rateType: item.rateType || RateType.Scatter,
    projectionsDemographics:
      item.projectionsDemographics || Demographics.P2PLUS,
    startDatetime: getSqlDateTimeFromIsoInput(startDatetime),
    endDatetime: getSqlDateTimeFromIsoInput(endDatetime),
    validUntil: getIsoDateFromSql(validUntil),
  };
}
