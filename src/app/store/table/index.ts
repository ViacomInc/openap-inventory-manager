import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TableView, Filter } from "../types";
import { State } from "../";

import { clamp } from "../../../lib/helpers";
import { DEFAULT_PAGE_SIZE, MIN_PAGE_SIZE, MAX_PAGE_SIZE } from "../../config";

export type TableSlice = {
  view?: TableView;
  publisher?: number;
  page?: number;
  pageSize?: number;
  filters?: Filter[];
};

const initialState: TableSlice = {};

export const tableSlice = createSlice({
  name: "table",
  initialState,
  reducers: {
    set: (_state, { payload }: PayloadAction<TableSlice>) => payload,
    setPublisher: (state, { payload }: PayloadAction<number>) => {
      state.publisher = payload;
    },
    setView: (state, { payload }: PayloadAction<TableView>) => {
      state.view = payload;
      if (payload !== TableView.Items) {
        state.page = undefined;
        state.pageSize = undefined;
      }
    },

    setPage: (state, { payload }: PayloadAction<number>) => {
      state.page = payload >= 0 ? payload : 0;
    },

    setPageSize: (state, { payload }: PayloadAction<number>) => {
      state.pageSize =
        payload >= 0
          ? clamp(MIN_PAGE_SIZE, MAX_PAGE_SIZE, payload)
          : DEFAULT_PAGE_SIZE;
    },

    setFilters: (state, { payload }: PayloadAction<Filter[]>) => {
      state.filters =
        payload === undefined
          ? undefined
          : payload.map(({ value, type }) => ({ value, type }));
    },

    clearFilters: (state) => {
      state.filters = [];
    },

    addFilter: (state, { payload: { value, type } }: PayloadAction<Filter>) => {
      if (state.view === TableView.Items) {
        state.page = 0;
      }

      if (!state.filters) {
        state.filters = [];
      }

      if (state.filters.some((f) => f.value === value && f.type === type)) {
        return;
      }

      state.filters = [...state.filters, { value, type }];
    },

    removeFilter: (
      state,
      { payload: { value, type } }: PayloadAction<Partial<Filter>>
    ) => {
      if (state.view === TableView.Items) {
        state.page = 0;
      }

      if (!state.filters || !state.filters.length || !type) {
        return;
      }

      if (value === undefined) {
        state.filters = state.filters.filter((f) => f.type === type);
        return;
      }

      state.filters = state.filters.filter(
        (f) => f.value === value && f.type === type
      );
    },
  },
});

export const actions = tableSlice.actions;
export default tableSlice.reducer;

export function selectTableState(state: State): TableSlice {
  return state.table;
}

export function selectTableFilters(state: State): Filter[] {
  return state.table.filters || [];
}
