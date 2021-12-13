import { useMemo } from "react";
import { BroadcastTimeZone } from "@viacomcbs/broadcast-calendar";

import { InventoryItem } from "../../graphql";
import type { OAPNetwork } from "../../../lib/openap/types";
import { RateTypeOptions, DemographicsOptions } from "../../options";
import { toOption, InputType, CalendarWeeks } from "../ui";

import {
  createSelectCell,
  createDateTimeCell,
  SelectDateTimeValue,
  createInputCell,
  TableColumnOptions,
  Alignment,
} from "../Table";

import IdCell from "./IdCell";
import StatusCell from "./StatusCell";

import { onlyNewEditable, biggerThanZero } from "./helpers";

export default function useInventorySummaryColumns(
  networks: Array<OAPNetwork>
): Array<TableColumnOptions<InventoryItem>> {
  return useMemo(
    () => [
      {
        accessor: "status",
        Cell: StatusCell,
      },
      {
        Header: "Id",
        accessor: "id",
        Cell: IdCell,
      },
      {
        Header: "Network",
        accessor: "networkId",
        Cell: createSelectCell({
          name: "networkId",
          options: networks.map(toOption),
          isEditable: onlyNewEditable,
        }),
      },
      {
        Header: "Name",
        accessor: "name",
        Cell: createInputCell({
          name: "name",
          type: InputType.String,
          isEditable: onlyNewEditable,
        }),
      },
      {
        Header: "Start Date & Time",
        accessor: "startDatetime",
        Cell: createDateTimeCell({
          name: "startDatetime",
          select: SelectDateTimeValue.DateTime,
          showWeeks: CalendarWeeks.Broadcast,
          isEditable: onlyNewEditable,
          timezone: BroadcastTimeZone,
        }),
      },
      {
        Header: "End Date & Time",
        accessor: "endDatetime",
        Cell: createDateTimeCell({
          name: "endDatetime",
          select: SelectDateTimeValue.DateTime,
          showWeeks: CalendarWeeks.Broadcast,
          isEditable: onlyNewEditable,
          timezone: BroadcastTimeZone,
        }),
      },
      {
        Header: "Rate Type",
        accessor: "rateType",
        Cell: createSelectCell({
          name: "rateType",
          options: RateTypeOptions,
          disabled: true,
        }),
      },
      {
        Header: "Rate",
        accessor: "rate",
        Cell: createInputCell({
          name: "rate",
          type: InputType.Float,
        }),
        align: Alignment.Trailing,
        validate: biggerThanZero,
      },
      {
        Header: "Units",
        accessor: "units",
        Cell: createInputCell({ name: "units", type: InputType.Float }),
        align: Alignment.Trailing,
        validate: biggerThanZero,
      },
      {
        Header: "Valid Until",
        accessor: "validUntil",
        Cell: createDateTimeCell({
          name: "validUntil",
          select: SelectDateTimeValue.Date,
          showWeeks: CalendarWeeks.Broadcast,
        }),
      },
      {
        Header: "Demographics",
        accessor: "projectionsDemographics",
        Cell: createSelectCell({
          name: "projectionsDemographics",
          options: DemographicsOptions,
          isEditable: onlyNewEditable,
        }),
      },
      {
        Header: "Projections",
        accessor: "projectedImpressions",
        Cell: createInputCell({
          name: "projectedImpressions",
          type: InputType.Float,
        }),
        align: Alignment.Trailing,
        validate: biggerThanZero,
      },
    ],
    [networks]
  );
}
