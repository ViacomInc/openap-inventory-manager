import React, { useRef, useState } from "react";
import { useDispatch } from "../store";
import { Publisher } from "../graphql";
import { setCsv } from "../store/actions";
import { selectCSVIsLoading } from "../store/csv";

import { createInventoryItemsRequest } from "../api/inventoryItems";

import filereader from "../filereader";
import parseCsv from "../csv/parser";
import decodeCsv, { DecodedResult } from "../csv/decoder";

import { Icons, SlowButton, Button, Modal } from "./ui";

import FormStyles from "./ui/Form.module.css";

async function decodeFile(
  event: React.ChangeEvent<HTMLInputElement>,
  publisher: Publisher
): Promise<DecodedResult | null> {
  const files = event.target.files;
  if (!(files && files.length)) {
    return null;
  }

  return filereader(files[0])
    .then(parseCsv)
    .then((data) => decodeCsv(data, publisher));
}

enum ImperssionUnits {
  Singular,
  Thousands,
}

interface UploadCsvButtonProps {
  publisher: Publisher;
  disabled: boolean;
}

export default function UploadCsvButton({
  publisher,
  disabled,
}: UploadCsvButtonProps): JSX.Element {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [imperssionUnits, setImperssionUnits] =
    useState<ImperssionUnits | null>(null);
  const refInput = useRef<HTMLInputElement>(null);

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const units = imperssionUnits;
    setIsOpen(false);
    setImperssionUnits(null);
    dispatch(
      setCsv({
        processing: true,
        errors: null,
      })
    );

    decodeFile(event, publisher)
      .then((result) => {
        if (!result) {
          return;
        }

        if (result.errors.length > 0) {
          dispatch(setCsv({ errors: result.errors }));
          return;
        }

        const items =
          units === ImperssionUnits.Thousands
            ? result.items.map((i) => ({
                ...i,
                projectedImpressions: i.projectedImpressions * 1000,
              }))
            : result.items;

        dispatch(createInventoryItemsRequest(items));
      })
      .catch((error: Error) =>
        dispatch(setCsv({ errors: [{ message: error.message }] }))
      )
      .finally(() => dispatch(setCsv({ processing: false })));

    event.target.value = "";
  }

  return (
    <>
      <SlowButton
        title="Upload CSV"
        disabled={disabled}
        icon={Icons.Upload}
        secondary
        isLoadingSelector={selectCSVIsLoading}
        onClick={() => setIsOpen(true)}
      />
      <Modal
        title="Upload CSV file"
        isOpen={isOpen}
        onClose={() => {
          setImperssionUnits(null);
          setIsOpen(false);
        }}
      >
        <div>
          <fieldset
            className={FormStyles.Fieldset}
            id="units"
            onChange={({ target }) => {
              if (!(target && target instanceof HTMLInputElement)) {
                return;
              }

              setImperssionUnits(parseInt(target.value, 10) as ImperssionUnits);
            }}
          >
            <label className={FormStyles.FieldsetLabel}>
              1. Select impressions units
            </label>
            <label className={FormStyles.InlineRadioInput}>
              <input
                type="radio"
                name="units"
                value={ImperssionUnits.Singular}
              />
              <span>
                <em>Singular units</em>
                5,000 means 5,000 impressions
              </span>
            </label>
            <label className={FormStyles.InlineRadioInput}>
              <input
                type="radio"
                name="units"
                value={ImperssionUnits.Thousands}
              />
              <span>
                <em>Thousands (000)</em>
                5,000 means 5,000,000 impressions
              </span>
            </label>
          </fieldset>
          <label className={FormStyles.FieldsetLabel}>
            2. Select CSV file and upload
          </label>
          <Button
            disabled={imperssionUnits === null}
            onClick={() => refInput.current && refInput.current.click()}
          >
            Select file and upload
          </Button>
          <input
            ref={refInput}
            id="upload-csv"
            type="file"
            accept=".csv"
            disabled={disabled}
            onChange={handleFileUpload}
            className={FormStyles.HiddenFileInput}
          />
        </div>
      </Modal>
    </>
  );
}
