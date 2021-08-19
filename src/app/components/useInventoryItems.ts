import { useMemo } from "react";
import {
  YearQuarter,
  isYearQuarter,
  formatBroadcastDateRange,
  getBroadcastQuarterRangeFromYearQuarter,
} from "@viacomcbs/broadcast-calendar";
import { useSelector } from "../store";
import { Filter, FilterValue, FilterType } from "../store/types";
import {
  selectInventoryItems,
  sortInventoryItems,
} from "../store/inventoryItems";
import { selectTableFilters } from "../store/table";

import { InventoryItemReturnFieldsFragment } from "../graphql";

import { ItemDateTimeRange } from "../../lib/types";
import { hasConflicts } from "../../lib/InventoryItem/helpers";
import { groupFilters } from "../store/table/helpers";

export default function useInventoryItems(): InventoryItemReturnFieldsFragment[] {
  const itemsState = useSelector(selectInventoryItems);
  const allItems = useMemo(
    () => Object.values(itemsState).sort(sortInventoryItems),
    [itemsState]
  );
  const filters = useSelector(selectTableFilters);
  const items = useMemo(
    () => filterItems(allItems, filters),
    [allItems, filters]
  );

  return items;
}

type FilterFunction = (
  values: FilterValue[]
) => (item: InventoryItemReturnFieldsFragment) => boolean;

type FilterDefinitions = Record<FilterType, FilterFunction>;

const FILTERS: FilterDefinitions = {
  [FilterType.Status]: (statuses: FilterValue[]) => (item) =>
    (statuses.includes("Conflict") && hasConflicts(item)) ||
    statuses.includes(item.status),
  [FilterType.Network]: (networkIds: FilterValue[]) => (item) =>
    networkIds.includes(item.networkId),
  [FilterType.Demographics]: (demographics: FilterValue[]) => (item) =>
    demographics.includes(item.projectionsDemographics),
  [FilterType.YearQuarter]: (yqs: FilterValue[]) => {
    const yearsQuarters = yqs
      .map((yq) => getYearQuarterFromPath(yq as string))
      .filter(isYearQuarter);

    if (!(yearsQuarters && yearsQuarters.length)) {
      return () => true;
    }
    return byYearsQuarters(yearsQuarters);
  },
  [FilterType.Name]: (names: FilterValue[]) => (item) =>
    names.includes(item.name),
};

function filterItems(
  items: InventoryItemReturnFieldsFragment[],
  filters: Filter[]
): InventoryItemReturnFieldsFragment[] {
  const groupedFilters = filters.reduce(groupFilters, {});

  return Object.entries(groupedFilters).reduce((items, [name, values]) => {
    const filter = FILTERS[name as FilterType];
    if (values && values.length) {
      return items.filter(filter(values));
    }

    return items;
  }, items);
}

function getYearQuarterFromPath(str?: string): undefined | YearQuarter {
  if (!str) {
    return undefined;
  }

  const parts = str.split("-");
  if (parts.length !== 2) {
    return undefined;
  }

  return {
    year: parseInt(parts[0], 10),
    quarter: parseInt(parts[1], 10),
  };
}

function byYearsQuarters(
  yearsQuarters: YearQuarter[]
): (item: ItemDateTimeRange) => boolean {
  const ranges = yearsQuarters.map((yearQuarter) =>
    formatBroadcastDateRange(
      getBroadcastQuarterRangeFromYearQuarter(yearQuarter)
    )
  );

  return ({ startDatetime, endDatetime }: ItemDateTimeRange): boolean => {
    const startDate = startDatetime.slice(0, 10);
    const endDate = endDatetime.slice(0, 10);

    return ranges.some(
      ([start, end]) =>
        (startDate >= start && startDate <= end) ||
        (endDate >= start && endDate <= end) ||
        (startDate < start && endDate > end)
    );
  };
}
