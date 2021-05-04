import { useEffect } from "react";
import { useSelector, useDispatch } from "../store";
import { ErrorCode, Error } from "../store/types";
import { selectTransaction, actions } from "../store/transaction";

import {
  isFutureItem,
  isLessThan,
  isValidUntilBeforeStart,
} from "../../lib/InventoryItem/helpers";
import { MAX_ITEM_DURATION_HOURS } from "../../lib/constants";

export default function useValidateTransaction(): void {
  const dispatch = useDispatch();
  const { data } = useSelector(selectTransaction);

  useEffect(() => {
    if (!data) {
      return;
    }

    const errors: Error[] = [];

    if (!isFutureItem(data)) {
      errors.push({
        code: ErrorCode.PastStartDate,
        message:
          "Start Date has be today or later and later than Valid Until date",
      });
    }

    if (!isLessThan(data, MAX_ITEM_DURATION_HOURS)) {
      errors.push({
        code: ErrorCode.StartEndDifferenceIsTooBig,
        message: `Item duration has be less than ${MAX_ITEM_DURATION_HOURS} hours`,
      });
    }

    if (!isValidUntilBeforeStart(data)) {
      errors.push({
        code: ErrorCode.ValidUntilAfterStart,
        message: "Valid until date has to be earlier or the same as start date",
      });
    }

    dispatch(actions.errors(errors));
  }, [data]);
}
