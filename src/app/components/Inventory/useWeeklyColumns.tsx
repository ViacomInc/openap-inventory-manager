import React, { useMemo } from "react";
import { DateTime } from "luxon";

import {
  Interval,
  getBroadcastWeeksInRange,
  parseIntervalFromISO,
} from "@viacomcbs/broadcast-calendar";

import {
  formatWeekHeader,
  formatDay,
  formatTime,
} from "../../../lib/dateHelpers";
import {
  getDateRange,
  isItemInDateRange,
} from "../../../lib/InventoryItem/helpers";

import { InventoryItem, Network } from "../../graphql";

import { toOption, InputType } from "../ui";

import {
  createSelectCell,
  createInputCell,
  TableColumnOptions,
  TableCell,
  CellRenderer,
  Alignment,
  SimpleCell,
} from "../Table";

import Styles from "./Cell.module.css";

export type AggregateColumn = "units" | "rate" | "projectedImpressions";

interface UseGetWeeklyColumns {
  items: InventoryItem[];
  networks: Network[];
  aggregateByColumn: AggregateColumn;
  Cell: (cell: TableCell<InventoryItem>) => React.ReactNode;
  format?: (v: string | number) => string;
}

export default function useGetWeeklyColumns({
  items,
  networks,
  aggregateByColumn,
  Cell,
  format,
}: UseGetWeeklyColumns): Array<TableColumnOptions<InventoryItem>> {
  const columns = useMemo(() => {
    const columns: Array<TableColumnOptions<InventoryItem>> = [
      {
        Header: "Network",
        accessor: "networkId",
        Cell: createSelectCell({
          name: "networkId",
          options: networks.map(toOption),
        }),
      },
      {
        Header: "Name",
        accessor: "name",
        Cell: createInputCell({ name: "name", type: InputType.String }),
        Placeholder: DatesRange,
      },
    ];

    if (!(items && items.length)) {
      return columns;
    }

    const range = parseIntervalFromISO(getDateRange(items));

    getBroadcastWeeksInRange(range).forEach((weekRange) => {
      columns.push({
        id: `${weekRange.start.toISODate()}-${weekRange.end.toISODate()}-${aggregateByColumn}`,
        Header: formatWeekHeader(weekRange.start),
        accessor: getDateRangeAccessor(weekRange, aggregateByColumn),
        Cell,
        aggregate: "sum",
        Aggregated: SimpleCell,
        format,
        align: Alignment.Trailing,
      } as TableColumnOptions<InventoryItem>);
    });

    return columns;
  }, [items, networks]);

  return columns;
}

function getDateRangeAccessor(
  weekRange: Interval,
  aggregateByColumn: AggregateColumn
): (item: InventoryItem) => number | null {
  return (item: InventoryItem) => {
    if (isItemInDateRange(item, weekRange)) {
      return item[aggregateByColumn];
    }

    return null;
  };
}

function DatesRange({
  cell: { isPlaceholder, row },
}: CellRenderer<InventoryItem>): React.ReactNode {
  if (isPlaceholder && row.isGrouped) {
    return null;
  }

  const start = DateTime.fromSQL(row.original.startDatetime);
  const end = DateTime.fromSQL(row.original.endDatetime);

  if (start.hasSame(end, "day")) {
    return (
      <>
        <span className={Styles.Day}>{formatDay(start)}</span>
        <span className={Styles.Time}>{formatTime(start)}</span>
        {" - "}
        <span className={Styles.Time}>{formatTime(end)}</span>
      </>
    );
  }

  return (
    <>
      <span className={Styles.StartDay}>{formatDay(start)}</span>
      <span className={Styles.StartTime}>{formatTime(start)}</span>
      {"-"}
      <span className={Styles.EndDay}>{formatDay(end)}</span>
      <span className={Styles.EndTime}>{formatTime(end)}</span>
    </>
  );
}
