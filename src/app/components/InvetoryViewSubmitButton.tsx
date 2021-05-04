import React, { useState } from "react";

import { selectIsLoadingSubmitInventoryItemsRequest } from "../api/inventoryItems";
import useInventoryStatus from "./useInventoryStatus";
import { SlowButton, Button, Icons, Modal } from "./ui";

interface Props {
  disabled: boolean;
  onClick: () => void;
}

export default function InvetoryViewSubmitButton({
  disabled,
  onClick,
}: Props): JSX.Element {
  const { conflicted } = useInventoryStatus();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <SlowButton
        title="Submit Updates"
        icon={Icons.Sync}
        disabled={disabled}
        isLoadingSelector={selectIsLoadingSubmitInventoryItemsRequest}
        onClick={() => setIsOpen(true)}
      />
      {conflicted > 1 ? (
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <p>
            You have <strong>{conflicted}</strong> conflicting items. Make sure
            that <em>rate</em>, <em>units</em>, and <em>impressions</em> are not
            zero.
          </p>
          <div>
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </div>
        </Modal>
      ) : (
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <p>Are you sure you want to submit changes to Open AP?</p>
          <div>
            <Button secondary onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsOpen(false);
                onClick();
              }}
            >
              Submit
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
