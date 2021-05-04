import React, { useState, useEffect, useCallback } from "react";
import { DateTime, Interval } from "luxon";

import { selectIsLoadingFlushInventoryItemsRequest } from "../api/inventoryItems";

import { SlowButton, Button, Icons, Modal, InputDateTime } from "./ui";

import {
  getNow,
  formatDate,
  parseNYDate,
  getIsoDateFromInput,
} from "../../lib/dateHelpers";

import Styles from "./FlushInventoryButton.module.css";

enum Step {
  Select,
  Confirm,
}

interface FlushInventoryButtonProps {
  disabled: boolean;
  onClick: (range: Interval) => void;
}

export default function FlushInventoryButton({
  disabled,
  onClick,
}: FlushInventoryButtonProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [range, setRange] = useState<Interval>();
  const [step, setStep] = useState<Step>(Step.Select);

  const close = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setStep(Step.Select), 300);
  }, [setIsOpen, setStep]);

  const canSubmit = !error && range;

  return (
    <>
      <SlowButton
        title="Clear Inventory"
        destructive
        secondary
        disabled={disabled}
        icon={Icons.Flush}
        isLoadingSelector={selectIsLoadingFlushInventoryItemsRequest}
        onClick={() => setIsOpen(true)}
      />
      <Modal
        title="Delete submitted inventory items"
        isOpen={isOpen}
        onClose={close}
      >
        <DateRangeSelect
          step={step}
          error={error}
          onChange={setRange}
          onError={setError}
        />
        <div>
          <Button onClick={close}>Cancel</Button>
          <Button
            destructive
            disabled={!canSubmit}
            onClick={() => {
              if (step === Step.Select) {
                setStep(Step.Confirm);
                return;
              }

              if (step === Step.Confirm && range !== undefined) {
                onClick(range);
                close();
              }
            }}
          >
            Delete Items
          </Button>
        </div>
      </Modal>
    </>
  );
}

interface DateRangeSelectProps {
  step: Step;
  error: boolean;
  onError: (error: boolean) => void;
  onChange: (range: Interval) => void;
}

function DateRangeSelect({
  onChange,
  onError,
  error,
  step,
}: DateRangeSelectProps): JSX.Element | null {
  const now = getNow();
  const [start, setStart] = useState<DateTime>(now.startOf("day"));
  const [end, setEnd] = useState<DateTime>(now.endOf("day"));

  useEffect(() => {
    const today = getNow().startOf("day");
    if (start > end || start < today || end < today) {
      onError(true);
      return;
    }

    onError(false);
    onChange(Interval.fromDateTimes(start, end));
  }, [start, end]);

  if (step === Step.Confirm) {
    return (
      <div className={Styles.DateSelect}>
        Are you sure you want to delete submitted items for
        <br />
        <strong>
          {getIsoDateFromInput(start)} – {getIsoDateFromInput(end)}
        </strong>
      </div>
    );
  }

  if (step === Step.Select) {
    return (
      <>
        Select Dates
        <div className={Styles.DateSelect}>
          <InputDateTime
            key={"start"}
            containerClassName={Styles.DateStart}
            error={error}
            value={start}
            format={formatDate}
            parse={parseNYDate}
            onChange={setStart}
            autoHide={true}
          />
          {" → "}
          <InputDateTime
            key={"end"}
            containerClassName={Styles.DateEnd}
            error={error}
            value={end}
            format={formatDate}
            parse={parseNYDate}
            onChange={setEnd}
            autoHide={true}
          />
        </div>
      </>
    );
  }

  return null;
}
