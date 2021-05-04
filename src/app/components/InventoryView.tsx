import React, { useEffect } from "react";

import { Publisher } from "../graphql";

import {
  getAllInventoryItemsRequest,
  selectGetAllInventoryItemsRequest,
  clearSubmitInventoryItemsRequest,
} from "../api/inventoryItems";

import { useDispatch, useSelector, State } from "../store";
import { ignoreErrorCodes } from "../store/requests";
import {
  GetAllInventoryItemsRequestKey,
  SubmitInventoryItemsRequestKey,
  CreateInventoryItemRequestKey,
  CreateInventoryItemsRequestKey,
  ImportItemsRequestKey,
} from "../store/constants";
import { Error } from "../store/types";

import { BoxLoader } from "./ui";
import ErrorNotification from "./ErrorNotification";

import useInventoryItems from "./useInventoryItems";
import useRedirectToLogin from "./useRedirectToLogin";

import InventoryViewToolbar from "./InventoryViewToolbar";
import InventoryViewTabs from "./InventoryViewTabs";

const selectViewErrors = (state: State): Error[] => {
  const getAllItemsErrors =
    state.requests[GetAllInventoryItemsRequestKey]?.errors || [];
  const createItemErrors =
    state.requests[CreateInventoryItemRequestKey]?.errors || [];
  const createItemsErrors =
    state.requests[CreateInventoryItemsRequestKey]?.errors || [];
  const submitErrors =
    state.requests[SubmitInventoryItemsRequestKey]?.errors || [];
  const importItemsErrors = state.requests[ImportItemsRequestKey]?.errors || [];

  const csvErrors = state.csv.errors || [];

  return [
    ...ignoreErrorCodes(getAllItemsErrors, 404),
    ...createItemErrors,
    ...createItemsErrors,
    ...submitErrors,
    ...csvErrors,
    ...importItemsErrors,
  ];
};

interface InventoryViewProps {
  publisher: Publisher;
}

export default function InventoryView({
  publisher,
}: InventoryViewProps): JSX.Element | null {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearSubmitInventoryItemsRequest);
    dispatch(getAllInventoryItemsRequest(publisher.id));
  }, [publisher.id]);

  const { loading } = useSelector(selectGetAllInventoryItemsRequest);
  const items = useInventoryItems();

  const errors = useSelector(selectViewErrors);
  if (useRedirectToLogin(errors)) {
    return null;
  }

  return (
    <div>
      <InventoryViewToolbar publisher={publisher} />
      <ErrorNotification errors={errors} />
      {loading || !items ? (
        <BoxLoader />
      ) : (
        <InventoryViewTabs networks={publisher.networks} items={items} />
      )}
    </div>
  );
}
