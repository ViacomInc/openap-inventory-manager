import { RowData, TableCell } from "./types";

export default function SimpleEditCell<R extends RowData>({
  row,
  column,
  value,
  state: { editRowTransaction },
}: TableCell<R, string>) {
  const v =
    row.isEditing && editRowTransaction
      ? column.accessor(editRowTransaction)
      : value;
  return v === null ? null : String(v);
}
