import React, { useMemo, useCallback } from "react";

import { InventoryItem, Network } from "../graphql";
import { isNotRemoved } from "../../lib/InventoryItem/helpers";

import useWeeklyColumns, {
  AggregateColumn,
} from "./Inventory/useWeeklyColumns";

import Table, { createInputCell, DRAFT_ID } from "./Table";
import { InputType } from "./ui";

import { useDispatch } from "../store";
import { deleteInventoryItem } from "../store/actions";

import {
  createInventoryItemRequest,
  updateInventoryItemRequest,
  removeInventoryItemRequest,
  // restoreInventoryItemRequest,
} from "../api/inventoryItems";

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

  const handleEditRowCanceled = useCallback(async ({ id }: InventoryItem) => {
    id === DRAFT_ID && dispatch(deleteInventoryItem(id));
  }, []);

  const handleEditRowConfirmed = useCallback(async (item: InventoryItem) => {
    if (item.id === DRAFT_ID) {
      dispatch(createInventoryItemRequest(item));
    } else {
      dispatch(updateInventoryItemRequest(item));
    }
  }, []);

  const handleEditRowDeleted = useCallback(async (item: InventoryItem) => {
    dispatch(removeInventoryItemRequest(item.id));
  }, []);

  const itemsWithNoRemoved = useMemo(() => items.filter(isNotRemoved), [items]);

  const columns = useWeeklyColumns({
    items: itemsWithNoRemoved,
    networks,
    aggregateByColumn,
    Cell: createInputCell({
      name: aggregateByColumn,
      type: InputType.Float,
    }),
  });

  return (
    <Table
      isEditRowEnabled={true}
      isEditRowLoading={false}
      onEditRowCanceled={handleEditRowCanceled}
      onEditRowConfirmed={handleEditRowConfirmed}
      onEditRowDeleted={handleEditRowDeleted}
      columns={columns}
      data={itemsWithNoRemoved}
      groupBy={["networkId", "name"]}
    />
  );
}
