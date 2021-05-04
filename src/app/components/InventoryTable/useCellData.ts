import { selectInventoryItemTransation } from "../../api/inventoryItems";
import { useSelector } from "../../store";

import { InventoryItem } from "../../graphql";
import { Error, ErrorCode } from "../../store/types";
import { InventoryTableCell } from "./types";

const ErrorCodesMap: { [index: string]: ErrorCode[] } = {
  ["startDatetime"]: [
    ErrorCode.PastStartDate,
    ErrorCode.StartEndDifferenceIsTooBig,
    ErrorCode.ValidUntilAfterStart,
  ],
  ["endDatetime"]: [ErrorCode.StartEndDifferenceIsTooBig],
  ["validUntil"]: [ErrorCode.ValidUntilAfterStart],
};

type UseCellData<V> = {
  value: V;
  isSelected: boolean;
  isUpdating: boolean;
  error?: Error;
};

export default function useCellData<V>(
  { value, row }: InventoryTableCell,
  name: keyof InventoryItem
): UseCellData<V> {
  // return as it is if row is not selected or groupped or aggregated
  if (!row.original || value === null) {
    return {
      value: value as V,
      isSelected: row.isSelected,
      isUpdating: false,
    };
  }

  const { isUpdating, item, errors } = useSelector(
    selectInventoryItemTransation(row.original.id)
  );

  return {
    value: (item && item[name] !== undefined ? item[name] : value) as V,
    isSelected: row?.isSelected,
    isUpdating,
    error:
      errors &&
      ErrorCodesMap[name] &&
      errors.find(
        (error) => error.code && ErrorCodesMap[name].includes(error.code)
      ),
  };
}
