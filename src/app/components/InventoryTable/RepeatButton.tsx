import React, { useState } from "react";

import { Pop, InputDateTime, Icons, Button } from "../ui";

import {
  formatDate,
  parseNYDate,
  getIsoDateFromInput,
} from "../../../lib/dateHelpers";

import Styles from "./InventoryTable.module.css";
import { DateTime } from "luxon";

interface RepeatButtonProps {
  disabled?: boolean;
  defaultValue?: DateTime | null;
  repeatNumber: number;
  onChange: (date: string) => void;
}

export default function RepeatButton({
  disabled,
  repeatNumber,
  defaultValue,
  onChange,
}: RepeatButtonProps): JSX.Element {
  const [active, setAcive] = useState<boolean>(false);

  return (
    <Pop
      active={[active, setAcive]}
      className={Styles.RepeatPop}
      target={
        <Button
          className={Styles.Repeat}
          title="Repeat Item Weekly"
          icon={Icons.RepeatItem}
          glyphed
        >
          {repeatNumber > 0 && (
            <strong className={Styles.RepeatCoin}>+{repeatNumber}</strong>
          )}
        </Button>
      }
    >
      <h5 className={Styles.RepeatHeader}>Repeat Weekly Until</h5>
      <InputDateTime
        value={defaultValue}
        disabled={disabled}
        format={formatDate}
        parse={parseNYDate}
        inputClassName={Styles.RepeatInput}
        autoHide={true}
        onChange={(date) => onChange(getIsoDateFromInput(date))}
      />
      {repeatNumber > 0 && (
        <em className={Styles.RepeatTip}>
          Item will repeat {repeatNumber} times
        </em>
      )}
    </Pop>
  );
}
