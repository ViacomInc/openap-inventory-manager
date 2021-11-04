import { InventoryTableCell } from "../InventoryTable/types";

export default function TotalCell({
  value,
  column,
}: InventoryTableCell): string {
  if (column.format) {
    return column.format(value as number);
  }
  return String(value);
}
