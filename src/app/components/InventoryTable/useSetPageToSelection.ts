import { useEffect } from "react";
import { InventoryTableRow } from "./types";

interface UseSetPageToSelection {
  rows: InventoryTableRow[];
  selectedRows: InventoryTableRow[];
  pageIndex: number;
  pageSize: number;
  setPage: (n: number) => void;
}

export default function useSetPageToSelection({
  rows,
  selectedRows,
  pageIndex,
  pageSize,
  setPage,
}: UseSetPageToSelection): void {
  useEffect(() => {
    if (!selectedRows.length) {
      return;
    }

    const selectedItem = selectedRows[selectedRows.length - 1];
    const index = rows.findIndex((item) => item.id === selectedItem.id);
    const page = Math.floor(index / pageSize);

    if (pageIndex !== page) {
      setPage(page);
    }
  }, [rows, selectedRows]);
}
