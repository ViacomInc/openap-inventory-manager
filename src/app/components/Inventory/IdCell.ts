import { InventoryItem } from "../../graphql";
import { CellRendererProps } from "../Table";

export default function IdCell({
  value,
}: CellRendererProps<InventoryItem, number>): string {
  if (value === -1) {
    return "";
  }

  return String(value);
}
