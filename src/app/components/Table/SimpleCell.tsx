import { RowData, TableCell } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SimpleCell<R extends RowData, V = any>({
  value,
  column,
}: TableCell<R, V>) {
  if (column.format) {
    return column.format(value);
  }

  if (value === null) {
    return null;
  }

  return String(value);
}
