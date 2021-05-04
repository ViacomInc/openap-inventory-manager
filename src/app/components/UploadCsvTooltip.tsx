import React, { useState } from "react";

import { Pop, Icon, Icons } from "./ui";
import Styles from "./InventoryView.module.css";

export default function UploadCsvTooltip(): JSX.Element {
  const active = useState<boolean>(false);
  return (
    <Pop
      active={active}
      target={<Icon className={Styles.InfoTip} icon={Icons.Info} />}
    >
      <div className={Styles.InfoTipContent}>
        <a href="/csv/openap-csv-template.xlsx">Download Excel template.</a>
        <br />
        Remember to convert the Excel to .csv file format before uploading.
      </div>
    </Pop>
  );
}
