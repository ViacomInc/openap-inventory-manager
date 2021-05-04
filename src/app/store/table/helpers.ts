import qs from "query-string";
import { State } from "../";
import { Filter, FilterType, FilterValue } from "../types";
import { TableSlice } from ".";

const isArray = Array.isArray;

export function parseFilters(str: string): Filter[] | undefined {
  const { network, status, demographics, yq, name } = qs.parse(str, {
    arrayFormat: "comma",
  });

  const filters: Filter[] = [];
  if (name) {
    const names = isArray(name) ? name : [name];

    names.forEach((value) =>
      filters.push({
        type: FilterType.Name,
        value,
      })
    );
  }

  if (network) {
    const networks = isArray(network)
      ? network.map((id) => parseInt(id, 10))
      : [parseInt(network, 10)];

    networks.forEach((value) =>
      filters.push({
        type: FilterType.Network,
        value,
      })
    );
  }

  if (status) {
    const statuses = isArray(status) ? status : [status];
    statuses.forEach((value) =>
      filters.push({
        type: FilterType.Status,
        value,
      })
    );
  }

  if (demographics) {
    const demographicsFilters = isArray(demographics)
      ? demographics
      : [demographics];
    demographicsFilters.forEach((value) =>
      filters.push({
        type: FilterType.Demographics,
        value,
      })
    );
  }

  if (yq) {
    const yqs = isArray(yq) ? yq : [yq];
    yqs.forEach((value) =>
      filters.push({
        type: FilterType.YearQuarter,
        value,
      })
    );
  }

  if (!filters.length) {
    return undefined;
  }

  return filters;
}

export function stringifyFilters(filters: Filter[]): string {
  if (!(filters && filters.length)) {
    return "";
  }

  return qs.stringify(filters.reduce(groupFilters, {}), {
    arrayFormat: "comma",
  });
}

export function groupFilters(
  filters: Partial<Record<FilterType, FilterValue[]>>,
  filter: Filter
): Partial<Record<FilterType, FilterValue[]>> {
  if (!filter.type) {
    return filters;
  }

  const type = filter.type as FilterType;
  if (filters[type] === undefined) {
    filters[type] = [];
  }

  filters[type]?.push(filter.value);
  return filters;
}

export function getTableStateForItem(
  { table, inventoryItems }: State,
  itemId: number
): TableSlice {
  const { pageSize } = table;

  if (!pageSize) {
    return table;
  }

  const id = String(itemId);
  const index = Object.keys(inventoryItems).findIndex((k) => k === id);

  return {
    ...table,
    filters: [],
    page: Math.floor(index / pageSize),
  };
}
