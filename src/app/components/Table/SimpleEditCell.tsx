import { RowData, CellRendererProps } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SimpleEditCell<R extends RowData, V = any>({
  row,
  column,
  value,
  state: { editRowTransaction },
}: CellRendererProps<R, V>) {
  const v =
    row.isEditing && editRowTransaction
      ? column.accessor(editRowTransaction)
      : value;

  if (column.format) {
    return column.format(v);
  }

  if (v === null) {
    return null;
  }

  return String(v);
}
