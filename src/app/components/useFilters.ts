import { useMemo, useEffect } from "react";
import {
  getBroadcastYearsQuarters,
  parseIntervalFromSQL,
  YearQuarters,
} from "@viacomcbs/broadcast-calendar";
import { useSelector, useDispatch } from "../store";

import { selectGetAllInventoryItemsRequest } from "../api/inventoryItems";
import { InventoryItemsSliceState } from "../store/inventoryItems";
import { setTableFilters } from "../store/actions";
import { selectTableFilters } from "../store/table";

import { getDateRange, hasConflicts } from "../../lib/InventoryItem/helpers";

import { Network, Publisher } from "../graphql";
import { FilterType, Filter, Option } from "../store/types";

import { DemographicsOptions, InventoryItemStatusOptions } from "../options";

export default function useFilters(publisher: Publisher): {
  allOptions: Option[];
  selectedOptions: Option[];
} {
  const dispatch = useDispatch();
  const { data: items, loading } = useSelector(
    selectGetAllInventoryItemsRequest
  );
  const currentFilters = useSelector(selectTableFilters);
  const allOptions = useMemo(
    () =>
      createFilters({
        items,
        networks: publisher.networks,
      }),
    [items, publisher.id]
  );

  const selectedOptions = useMemo(
    () => getSelectedOptions(allOptions, currentFilters),
    [allOptions, currentFilters]
  );

  const shouldUpdateFilters =
    !loading && selectedOptions.length !== currentFilters.length;

  useEffect(() => {
    if (shouldUpdateFilters) {
      dispatch(setTableFilters(selectedOptions));
    }
  }, [shouldUpdateFilters, selectedOptions]);

  return { allOptions, selectedOptions };
}

interface CreateFilters {
  items: InventoryItemsSliceState;
  networks: Network[];
}

function createFilters({ items, networks }: CreateFilters): Option[] {
  const allItems = Object.values(items);
  if (!allItems.length) {
    return [];
  }
  const range = parseIntervalFromSQL(getDateRange(allItems));
  const yearsQuarters: YearQuarters[] = range.isValid
    ? getBroadcastYearsQuarters(range)
    : [];

  const {
    availableNetworks,
    availableDemographics,
    availableStatuses,
    availableNames,
  } = allItems.reduce(
    (res, item) => {
      res.availableNetworks.add(item.networkId);
      res.availableDemographics.add(item.projectionsDemographics);
      res.availableStatuses.add(item.status);
      res.availableNames.add(item.name);

      if (hasConflicts(item)) {
        res.availableStatuses.add("Conflict");
      }

      return res;
    },
    {
      availableNetworks: new Set<number>(),
      availableDemographics: new Set<string>(),
      availableStatuses: new Set<string>(),
      availableNames: new Set<string>(),
    }
  );

  const networkFilters: Option[] = networks
    .filter((n) => availableNetworks.has(n.id))
    .map((network) => ({
      value: network.id,
      label: network.name,
      type: FilterType.Network,
    }));

  const yearsQuartersFilters: Option[] = yearsQuarters.flatMap(
    ({ year, quarters }) =>
      quarters.map((quarter) => ({
        value: `${year}-${quarter}`,
        label: `${year} Q${quarter}`,
        type: FilterType.YearQuarter,
      }))
  );

  const statusFilters: Option[] = getStatusOptions(availableStatuses).map(
    (o) => ({
      ...o,
      type: FilterType.Status,
    })
  );

  const demographicsFilters: Option[] = DemographicsOptions.filter((d) =>
    availableDemographics.has(String(d.value))
  ).map((o) => ({
    ...o,
    type: FilterType.Demographics,
  }));

  const nameFilters: Option[] = Array.from(availableNames).map((name) => ({
    value: name,
    label: name,
    type: FilterType.Name,
  }));

  return networkFilters.concat(
    yearsQuartersFilters,
    statusFilters,
    demographicsFilters,
    nameFilters
  );
}

function getStatusOptions(availableStatuses: Set<string>): Option[] {
  const options: Option[] = InventoryItemStatusOptions.filter((s) =>
    availableStatuses.has(String(s.value))
  );

  if (availableStatuses.has("Conflict")) {
    options.push({
      value: "Conflict",
      label: "Conflicts",
      type: FilterType.Status,
    });
  }

  return options;
}

function getSelectedOptions(
  allFilters: Option[],
  selected: Filter[]
): Option[] {
  if (!allFilters.length) {
    return [];
  }

  return selected
    .map(({ type, value }) =>
      allFilters.find(
        (filter) => filter.type === type && filter.value === value
      )
    )
    .filter(isOption);
}

function isOption(option?: Option): option is Option {
  return (
    Boolean(option) && typeof option === "object" && option.value !== undefined
  );
}
