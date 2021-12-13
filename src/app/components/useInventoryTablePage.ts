import { useCallback, useEffect } from "react";

import { useDispatch, useSelector } from "../store";
import { setTablePage, setTablePageSize } from "../store/actions";
import { selectTableState } from "../store/table";

import { DEFAULT_PAGE_SIZE } from "../config";

export type Pagination = {
  pageIndex: number;
  pageSize: number;
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
};

export default function useInventoryTablePage(): Pagination {
  const dispatch = useDispatch();
  const { page, pageSize } = useSelector(selectTableState);

  const setPageIndex = useCallback((index: number): void => {
    dispatch(setTablePage(index));
  }, []);

  const setPageSize = useCallback((size: number): void => {
    dispatch(setTablePageSize(size));
  }, []);

  useEffect(() => {
    if (page === undefined) {
      dispatch(setTablePage(0));
    }
  }, [page]);

  useEffect(() => {
    if (pageSize === undefined) {
      dispatch(setTablePageSize(DEFAULT_PAGE_SIZE));
    }
  }, [pageSize]);

  return {
    pageIndex: page || 0,
    pageSize: pageSize || DEFAULT_PAGE_SIZE,
    setPageIndex,
    setPageSize,
  };
}
