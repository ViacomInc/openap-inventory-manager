import { RowData, CellRendererProps } from "./types";

export default function IdCell<R extends RowData>({
  row,
  column,
  value,
}: CellRendererProps<R, number | string | null>): string {
  if (row.isEditDraft) {
    return "";
  }

  if (column.format) {
    return column.format(value);
  }

  if (value === null) {
    return "";
  }

  return String(value);
}
