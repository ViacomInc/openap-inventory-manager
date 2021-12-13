import { InventoryItem } from "../../graphql";
import { TableCell } from "../Table";

export default function IdCell({
  value,
}: TableCell<InventoryItem, number>): string {
  if (value === -1) {
    return "";
  }

  return String(value);
}
