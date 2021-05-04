// import logger from "redux-logger";
import type { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { configureStore } from "@reduxjs/toolkit";
import { useDispatch as useDispatchHook } from "react-redux";

import inventoryItemsReducer from "./inventoryItems";
import transactionReducer from "./transaction";
import requestsReducer from "./requests";
import publishersReducer from "./publishers";
import csvReducer from "./csv";
import importReducer from "./import";
import userReducer from "./user";
import notificationsReducer from "./notifications";
import tableReducer from "./table";

export { useSelector } from "react-redux";

export const openAPReducer = {
  inventoryItems: inventoryItemsReducer,
  transaction: transactionReducer,
  requests: requestsReducer,
  publishers: publishersReducer,
  csv: csvReducer,
  import: importReducer,
  user: userReducer,
  notifications: notificationsReducer,
  table: tableReducer,
};

const store = configureStore({
  reducer: openAPReducer,
});

export default store;
export type State = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;
export const useDispatch = (): Dispatch => useDispatchHook<Dispatch>();

export type {
  ActionCreatorWithPayload,
  ActionCreatorWithoutPayload,
} from "@reduxjs/toolkit";

export type AsyncActionCreatorWithPayload<T> = (
  arg: T
) => (
  dispatch: Dispatch,
  getState: () => State,
  extraArgument: undefined
) => void;

export type AsyncActionCreatorWithoutPayload = () => (
  dispatch: Dispatch,
  getState: () => State,
  extraArgument: undefined
) => void;

export function isAsyncActionCreator<T>(
  actionCreator: ActionCreatorWithPayload<T> | AsyncActionCreatorWithPayload<T>
): actionCreator is AsyncActionCreatorWithPayload<T> {
  // it doesn't matter, both will go to dispatch
  return typeof actionCreator === "function";
}

export function selectState(state: State): State {
  return state;
}
