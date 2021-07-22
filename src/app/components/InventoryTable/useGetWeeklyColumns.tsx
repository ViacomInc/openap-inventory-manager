import React, { useMemo } from "react";

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

import TotalCell from "../Cells/TotalCell";
import createSelectCell from "../Cells/SelectCell";
import { toOption, InputType } from "../ui";
import createInputCell from "../Cells/InputCell";

import { InventoryItem, Network } from "../../graphql";

import {
  InventoryTableColumnOptions,
  InventoryTableCell,
  Alignment,
  CellRenderer,
} from "./types";

import Styles from "./InventoryTable.module.css";
import { DateTime } from "luxon";

type Column = "units" | "rate" | "projectedImpressions";

interface UseGetWeeklyData {
  items: InventoryItem[];
  networks: Network[];
  column: Column;
  Cell: (cell: InventoryTableCell) => React.ReactNode;
  format?: (v: string | number) => string;
}

export default function useGetWeeklyColumns({
  items,
  networks,
  column,
  Cell,
  format,
}: UseGetWeeklyData): InventoryTableColumnOptions[] {
  const columns = useMemo(() => {
    const columns: InventoryTableColumnOptions[] = [
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
        id: `${weekRange.start.toISODate()}-${weekRange.end.toISODate()}-${column}`,
        Header: formatWeekHeader(weekRange.start),
        accessor: getDateRangeAccessor(weekRange, column),
        Cell,
        aggregate: "sum",
        Aggregated: TotalCell,
        align: Alignment.Trailing,
        format,
      } as InventoryTableColumnOptions);
    });

    return columns;
  }, [items, networks]);

  return columns;
}

function getDateRangeAccessor(
  weekRange: Interval,
  column: Column
): (item: InventoryItem) => number | null {
  return (item: InventoryItem) => {
    if (isItemInDateRange(item, weekRange)) {
      return item[column];
    }

    return null;
  };
}

function DatesRange({
  cell: { isPlaceholder, row },
}: CellRenderer): React.ReactNode {
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
