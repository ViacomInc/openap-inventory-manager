import React from "react";
import { PluginHook } from "react-table";
import classnames from "classnames";

import { Button, Icons } from "../ui";
import LoaderIcon, { LoaderSize } from "../Icons/Loader";

import { useDispatch, useSelector } from "../../store";
import {
  clearTransaction,
  deleteInventoryItem,
  setRepeatUntil,
} from "../../store/actions";

import { selectRepeatUntilNumber } from "../../store/transaction";

import {
  createInventoryItemRequest,
  removeInventoryItemRequest,
  restoreInventoryItemRequest,
  updateInventoryItemRequest,
  selectInventoryItemTransaction,
} from "../../api/inventoryItems";

import { InventoryItem, InventoryItemStatus } from "../../graphql";
import { hasActions } from "./";
import { InventoryTableCell } from "./types";

import CommonActions from "./CommonActions";
import RepeatButton from "./RepeatButton";

import Styles from "./InventoryTable.module.css";
import { DateTime } from "luxon";

export const ActionsCellElementSelector = `.${Styles.Actions}`;

const Wrapper: React.FC<{ center?: boolean }> = ({ center, children }) => {
  return (
    <div
      className={classnames(Styles.Actions, {
        [Styles.ActionsCenter]: center,
      })}
    >
      {children}
    </div>
  );
};

function ActionsCell({ row, selectedFlatRows }: InventoryTableCell) {
  if (
    (selectedFlatRows.length && !row.isSelected) ||
    !hasActions(row.original)
  ) {
    return <Wrapper />;
  }

  const repeatNumber = useSelector(selectRepeatUntilNumber);
  const { id, status } = row.original;
  const { isUpdating, errors } = useSelector(
    selectInventoryItemTransaction(id)
  );
  const isDraft = status === InventoryItemStatus.Draft;
  const dispatch = useDispatch();

  if (isUpdating) {
    return (
      <Wrapper center>
        <LoaderIcon size={LoaderSize.S} />
      </Wrapper>
    );
  }

  if (!row.isSelected) {
    return (
      <Wrapper>
        <CommonActions
          item={row.original}
          onDelete={() => {
            dispatch(removeInventoryItemRequest(id));
          }}
          onUndo={() => {
            dispatch(restoreInventoryItemRequest(id));
          }}
        />
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {isDraft && (
        <RepeatButton
          defaultValue={DateTime.fromSQL(row.original.startDatetime)}
          disabled={Boolean(errors)}
          repeatNumber={repeatNumber}
          onChange={(date) => dispatch(setRepeatUntil(date))}
        />
      )}
      <Button
        disabled={Boolean(errors)}
        className={Styles.Confirm}
        icon={Icons.Done}
        title={isDraft ? "Create Item" : "Update Item"}
        onClick={
          () => isDraft
          /*  ? dispatch(createInventoryItemRequest())
            : dispatch(updateInventoryItemRequest())*/
        }
      />
      <Button
        className={Styles.Cancel}
        icon={Icons.Cancel}
        title="Cancel"
        onClick={() => {
          isDraft && dispatch(deleteInventoryItem(id));
          dispatch(clearTransaction());
        }}
      />
    </Wrapper>
  );
}

export const useActions: PluginHook<InventoryItem> = (hooks) => {
  hooks.allColumns.push((columns) => [
    ...columns,
    {
      id: "actions",
      width: 10,
      Cell: ActionsCell,
    },
  ]);
};

export default useActions;
