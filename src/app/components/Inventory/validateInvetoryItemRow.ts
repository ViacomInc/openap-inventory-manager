import { InventoryItem } from "../../graphql";
import {
  isFutureItem,
  isLessThan,
  isValidUntilBeforeStart,
} from "../../../lib/InventoryItem/helpers";
import { MAX_ITEM_DURATION_HOURS } from "../../../lib/constants";

import { EditRowValidationError } from "../Table";

export default function validateInvetoryItemRow(
  item: InventoryItem
): null | EditRowValidationError<InventoryItem>[] {
  const errors: EditRowValidationError<InventoryItem>[] = [];

  if (!isFutureItem(item)) {
    errors.push({
      column: "startDatetime",
      message:
        "Start Date has be today or later and later than Valid Until date",
    });
  }

  if (!isLessThan(item, MAX_ITEM_DURATION_HOURS)) {
    errors.push({
      column: "endDatetime",
      message: `Item duration has be less than ${MAX_ITEM_DURATION_HOURS} hours`,
    });
  }

  if (!isValidUntilBeforeStart(item)) {
    errors.push({
      column: "validUntil",
      message: "Valid until date has to be earlier or the same as start date",
    });
  }

  if (errors.length === 0) {
    return null;
  }

  return errors;
}
