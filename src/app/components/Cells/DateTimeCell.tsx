import React from "react";
import { InputDateTime, CalendarWeeks } from "../ui";
import { useDispatch } from "../../store";
import { actions } from "../../store/transaction";
import {
  InventoryTableCell,
  EditableCellOptions,
} from "../InventoryTable/types";
import useCellData from "../InventoryTable/useCellData";

import Styles from "./Cell.module.css";
import {
  formatDate,
  formatDateTime,
  parseNYDate,
  parseNYDateTime,
  getIsoDateFromSql,
  getSqlDateTimeFromSql,
} from "../../../lib/dateHelpers";
import { DateTime } from "luxon";

type Name = "startDatetime" | "endDatetime" | "validUntil";

interface Options extends EditableCellOptions {
  name: Name;
  selectTime?: boolean;
}

type CellComponent = (cell: InventoryTableCell) => string | JSX.Element;

export default function createDateTimeCell({
  name,
  selectTime = false,
  disabled = false,
  isEditable,
}: Options): CellComponent {
  const format = selectTime ? formatDateTime : formatDate;
  const parse = selectTime ? parseNYDateTime : parseNYDate;
  const getValue = selectTime ? getSqlDateTimeFromSql : getIsoDateFromSql;
  const makeDateFromValue = (value: string) => {
    return selectTime ? DateTime.fromSQL(value) : parseNYDate(value);
  };

  return function DateTimeCell(cell: InventoryTableCell): string | JSX.Element {
    const dispatch = useDispatch();
    const { value, isSelected, isUpdating, error } = useCellData<string>(
      cell,
      name
    );

    const dt = makeDateFromValue(value);
    if (!isSelected || (isEditable && !isEditable(cell.row.original))) {
      return dt ? format(dt) : "";
    }

    return (
      <InputDateTime
        error={Boolean(error)}
        value={dt}
        onChange={(date) => {
          dispatch(actions.update({ [name]: getValue(date) }));
        }}
        format={format}
        parse={parse}
        containerClassName={Styles.Container}
        inputClassName={Styles.Input}
        disabled={disabled || isUpdating}
        showWeeks={CalendarWeeks.Broadcast}
      />
    );
  };
}
