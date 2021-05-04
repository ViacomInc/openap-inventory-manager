import { useMemo } from "react";
import { Column } from "react-table";

import IdCell from "./Cells/IdCell";
import createSelectCell from "./Cells/SelectCell";
import createDateTimeCell from "./Cells/DateTimeCell";
import createInputCell from "./Cells/InputCell";
import StatusCell from "./Cells/StatusCell";

import { InventoryItem } from "../graphql";
import type { OAPNetwork } from "../../lib/openap/types";
import { RateTypeOptions, DemographicsOptions } from "../options";
import { onlyNewEditable } from "./InventoryTable";
import { Alignment } from "./InventoryTable/types";
import { biggerThanZero } from "./InventoryTable/";

import { toOption, InputType } from "./ui";

export default function useColumns(
  networks: Array<OAPNetwork>
): Array<Column<InventoryItem>> {
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
          selectTime: true,
          isEditable: onlyNewEditable,
        }),
      },
      {
        Header: "End Date & Time",
        accessor: "endDatetime",
        Cell: createDateTimeCell({
          name: "endDatetime",
          selectTime: true,
          isEditable: onlyNewEditable,
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
