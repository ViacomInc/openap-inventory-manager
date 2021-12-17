import React, { useState, useMemo, useCallback } from "react";

import { InventoryItem, Network } from "../graphql";
import { isNotRemoved } from "../../lib/InventoryItem/helpers";

import useWeeklyColumns, {
  AggregateColumn,
} from "./Inventory/useWeeklyColumns";

import Table, { createInputCell, DRAFT_ID } from "./Table";
import { InputType } from "./ui";

import { useDispatch, useSelector } from "../store";
import { deleteInventoryItem } from "../store/actions";

import {
  createInventoryItemRequest,
  updateInventoryItemRequest,
  selectInventoryItemRequestsStatus,
} from "../api/inventoryItems";

import { noEditsForNull } from "./Inventory/helpers";

export interface InventoryViewAggregateProps {
  items: InventoryItem[];
  networks: Network[];
  aggregateByColumn: AggregateColumn;
}

export default function InventoryViewAggregate({
  items,
  networks,
  aggregateByColumn,
}: InventoryViewAggregateProps): JSX.Element {
  const dispatch = useDispatch();
  const [transactionId, setTransactionId] = useState<number>();
  const isTransactionLoading = useSelector(
    selectInventoryItemRequestsStatus(transactionId)
  );

  const handleEditRowCanceled = useCallback(async ({ id }: InventoryItem) => {
    id === DRAFT_ID && dispatch(deleteInventoryItem(id));
  }, []);

  const handleEditRowConfirmed = useCallback(async (item: InventoryItem) => {
    setTransactionId(item.id);
    if (item.id === DRAFT_ID) {
      dispatch(createInventoryItemRequest(item));
    } else {
      dispatch(updateInventoryItemRequest(item));
    }
  }, []);

  const itemsWithNoRemoved = useMemo(() => items.filter(isNotRemoved), [items]);
  const columns = useWeeklyColumns({
    items: itemsWithNoRemoved,
    networks,
    aggregateByColumn,
    Cell: createInputCell({
      name: aggregateByColumn,
      type: InputType.Float,
      canEdit: noEditsForNull,
    }),
  });

  return (
    <Table
      isEditRowEnabled={true}
      isEditRowLoading={isTransactionLoading}
      onEditRowCanceled={handleEditRowCanceled}
      onEditRowConfirmed={handleEditRowConfirmed}
      canDeleteRow={false}
      columns={columns}
      data={itemsWithNoRemoved}
      groupBy={["networkId", "name"]}
    />
  );
}
