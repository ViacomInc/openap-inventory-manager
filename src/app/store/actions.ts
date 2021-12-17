import { actions as inventoryItemsActions } from "./inventoryItems";
export const setInventoryItem = inventoryItemsActions.set;
export const setInventoryItems = inventoryItemsActions.setAll;
export const updateInventoryItem = inventoryItemsActions.update;
export const deleteInventoryItem = inventoryItemsActions.delete;

export {
  createInventoryItem,
  setNewInventoryItem,
  setInventoryItemsWithNotification,
} from "./inventoryItems/actions";

export { graphqlRequest, clearRequest } from "./requests/actions";

import { actions as csvActions } from "./csv";
export const setCsv = csvActions.set;

import { actions as importActions } from "./import";
export const setImportConflicts = importActions.set;
export const resetImportConflicts = importActions.reset;

import { actions as publishersActions } from "./publishers";
export const setPublishers = publishersActions.set;

import { actions as userActions } from "./user";
export const setUser = userActions.set;

import { actions as notificationsActions } from "./notifications";
export const addNotification = notificationsActions.add;
export const removeNotification = notificationsActions.remove;
export const clearNotifications = notificationsActions.clear;

import { actions as tableActions } from "./table";
export const setTable = tableActions.set;
export const setTablePublisher = tableActions.setPublisher;
export const setTableView = tableActions.setView;
export const setTablePage = tableActions.setPage;
export const setTablePageSize = tableActions.setPageSize;
export const setTableFilters = tableActions.setFilters;
export const clearTableFilters = tableActions.clearFilters;
export const addTableFilter = tableActions.addFilter;
export const removeTableFilter = tableActions.removeFilter;
