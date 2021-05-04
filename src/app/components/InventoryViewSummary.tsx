import React from "react";

import { InventoryViewTabProps } from "./InventoryViewTabs";
import InventoryTable from "./InventoryTable";

import useValidateTransaction from "./useValidateTransaction";
import useColumns from "./useColumns";
import useInventoryTablePage from "./useInventoryTablePage";

export default function InventoryViewSummary({
  items,
  networks,
}: InventoryViewTabProps): JSX.Element {
  useValidateTransaction();
  const columns = useColumns(networks);
  const pagination = useInventoryTablePage();

  return (
    <InventoryTable columns={columns} data={items} pagination={pagination} />
  );
}
