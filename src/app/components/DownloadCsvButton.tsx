import React from "react";

import type { Publisher } from "../graphql";

import { useSelector } from "../store";
import { selectInventoryItems } from "../store/inventoryItems";

import { fileTimestamp } from "../../lib/dateHelpers";
import makeCSV from "../csv/encoder";
import download from "../download";

import { Icons, Button } from "./ui";

interface DownoladCsvButtonProps {
  publisher: Publisher;
  disabled: boolean;
}

export default function DownloadCsvButton({
  publisher,
  disabled,
}: DownoladCsvButtonProps): JSX.Element {
  const items = useSelector(selectInventoryItems);
  const onClick = () => {
    const csv = makeCSV(Object.values(items), publisher.networks);
    const blob = new Blob([csv], { type: "text/csv" });
    download(blob, `openap_inventory_${fileTimestamp()}.csv`);
  };

  return (
    <Button
      disabled={disabled}
      secondary
      icon={Icons.Download}
      onClick={onClick}
    >
      Download CSV
    </Button>
  );
}
