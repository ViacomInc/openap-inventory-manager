import { InventoryTableCell } from "../InventoryTable/types";

export default function IdCell({ value }: InventoryTableCell): string {
  if (value === -1) {
    return "";
  }

  return String(value);
}
