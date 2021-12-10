import React, { useEffect, useState } from "react";
import { useSelector } from "../store";
import { ImportMode } from "../graphql";
import { selectImportConflicts } from "../store/import";

import { selectIsLoadingImportItemsRequest } from "../api/import";

import { SlowButton, Button, Icons, Modal } from "./ui";

import Styles from "./ImportButton.module.css";

interface ImportButtonProps {
  disabled: boolean;
  onDismiss: () => void;
  onClick: (mode?: ImportMode) => void;
}

export default function ImportButton({
  disabled,
  onDismiss,
  onClick,
}: ImportButtonProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const isLoading = useSelector(selectIsLoadingImportItemsRequest);
  const conflicts = useSelector(selectImportConflicts);
  useEffect(() => setIsOpen(Boolean(conflicts.total)), [conflicts.total]);

  function handleClose() {
    setIsOpen(false);
    setTimeout(onDismiss, 300);
  }

  return (
    <>
      <SlowButton
        title="Import Inventory"
        disabled={disabled}
        icon={Icons.Fetch}
        secondary
        isLoading={isLoading}
        onClick={() => onClick()}
      />
      <Modal
        title="Missing Rates in the external dataset"
        isOpen={isOpen}
        onClose={handleClose}
      >
        <div>
          <p>
            <strong>{conflicts.conflicts}</strong> out of{" "}
            <strong>{conflicts.total}</strong> items are missing rates.
            <br />
            The items can be fetched but rates for these items must be added
            manually.
          </p>
          <table className={Styles.Table}>
            <thead>
              <tr>
                <th>Selling Title</th>
                <th>Number of items</th>
              </tr>
            </thead>
            <tbody>
              {conflicts.titles.map(({ name, itemsCount }, index) => (
                <tr key={index}>
                  <td>{name}</td>
                  <td>{itemsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button disabled={isLoading} secondary onClick={handleClose}>
            Cancel
          </Button>
          <Button
            disabled={isLoading}
            onClick={() => onClick(ImportMode.Ignore)}
          >
            Only fetch {conflicts.total - conflicts.conflicts} items with rates
          </Button>
          <Button
            disabled={isLoading}
            onClick={() => onClick(ImportMode.ImportAll)}
          >
            Fetch all {conflicts.total} items
          </Button>
        </div>
      </Modal>
    </>
  );
}
