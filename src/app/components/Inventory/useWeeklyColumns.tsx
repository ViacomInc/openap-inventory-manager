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

import { toOption } from "../ui";

import {
  TableColumnOptions,
  CellRendererProps,
  Alignment,
  SimpleCell,
  createSelectCell,
  createTotalRowCell,
} from "../Table";

import Styles from "./Cell.module.css";

export type AggregateColumn = "units" | "rate" | "projectedImpressions";

interface UseGetWeeklyColumns {
  items: InventoryItem[];
  networks: Network[];
  aggregateByColumn: AggregateColumn;
  Cell: (cell: CellRendererProps<InventoryItem>) => React.ReactNode;
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
          canEdit: false,
          options: networks,
          toOption,
        }),
      },
      {
        Header: "Name",
        accessor: "name",
        Cell: SimpleCell,
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
        Cell: Cell,
        aggregate: "sum",
        Aggregated: SimpleCell,
        format,
        align: Alignment.Trailing,
      } as TableColumnOptions<InventoryItem>);
    });

    columns.push({
      id: `total-${aggregateByColumn}`,
      Header: "Total",
      Cell: createTotalRowCell({
        skipColumns: ["networkId", "name"],
      }),
      align: Alignment.Trailing,
      format,
    } as TableColumnOptions<InventoryItem>);

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
}: CellRendererProps<InventoryItem>): React.ReactNode {
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
