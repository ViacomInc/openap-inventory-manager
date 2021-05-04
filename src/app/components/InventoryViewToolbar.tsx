import React, { useMemo } from "react";

import {
  submitInventoryItemsRequest,
  flushInventoryItemsRequest,
} from "../api/inventoryItems";
import { importItemsRequest } from "../api/import";

import { useDispatch, useSelector } from "../store";
import { selectUser } from "../store/user";
import {
  createInventoryItem,
  setTableFilters,
  clearTableFilters,
  resetImportConflicts,
} from "../store/actions";
import { FilterType } from "../store/types";

import {
  Icons,
  Button,
  Select,
  GroupedOption,
  Option,
  isMultiOptions,
} from "./ui";
import FlushInventoryButton from "./FlushInventoryButton";
import DownloadCsvButton from "./DownloadCsvButton";
import UploadCsvButton from "./UploadCsvButton";
import UploadCsvTooltip from "./UploadCsvTooltip";
import ImportButton from "./ImportButton";
import InvetoryViewSubmitButton from "./InvetoryViewSubmitButton";
import useInventoryUIStatus from "./useInventoryUIStatus";
import useFilters from "./useFilters";

import { Publisher } from "../graphql";

import Styles from "./InventoryView.module.css";

interface InventoryViewToolbarProps {
  publisher: Publisher;
}

export default function InventoryViewToolbar({
  publisher,
}: InventoryViewToolbarProps): JSX.Element {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const {
    canAddNewItems,
    canSubmitItems,
    canUseFilters,
  } = useInventoryUIStatus();

  const { allOptions, selectedOptions } = useFilters(publisher);
  const groupedOptions = useMemo(() => getGroupedOptions(allOptions), [
    allOptions,
  ]);

  return (
    <div className={Styles.Toolbar}>
      <Select
        name="filters"
        isDisabled={!canUseFilters}
        isMulti={true}
        className={Styles.Filter}
        options={groupedOptions}
        value={selectedOptions}
        placeholder="Type to add filter by year, demographics, network, etc..."
        onChange={(values) => {
          if (!values) {
            dispatch(clearTableFilters());
          }

          if (!isMultiOptions(values)) {
            // react-select has primitive types so here we go
            throw new Error("Impossible!");
          }

          dispatch(setTableFilters([...values]));
        }}
      />
      <div className={Styles.ToolbarButtons}>
        <Button
          secondary
          icon={Icons.Add}
          disabled={!canAddNewItems}
          onClick={() =>
            dispatch(createInventoryItem({ publisherId: publisher.id }))
          }
        >
          Add Item
        </Button>
        {user && user.isAdmin && (
          <ImportButton
            disabled={!canAddNewItems}
            onDismiss={() => dispatch(resetImportConflicts())}
            onClick={(mode) =>
              dispatch(
                importItemsRequest({
                  publisherId: publisher.id,
                  mode,
                })
              )
            }
          />
        )}
        <UploadCsvButton disabled={!canAddNewItems} publisher={publisher} />
        <UploadCsvTooltip />
        <DownloadCsvButton disabled={!canUseFilters} publisher={publisher} />
        {user && user.isAdmin && (
          <FlushInventoryButton
            disabled={!canUseFilters}
            onClick={(range) => dispatch(flushInventoryItemsRequest(range))}
          />
        )}
        <InvetoryViewSubmitButton
          disabled={!canSubmitItems}
          onClick={() => dispatch(submitInventoryItemsRequest(publisher.id))}
        />
      </div>
    </div>
  );
}

function getGroupedOptions(values: Option[]): GroupedOption[] {
  const groupped = values.reduce<Partial<Record<FilterType, Option[]>>>(
    (filters, value) => {
      if (!value.type) {
        return filters;
      }

      const type = value.type as FilterType;
      if (filters[type] === undefined) {
        filters[type] = [];
      }

      filters[type]?.push(value);
      return filters;
    },
    {}
  );

  return [
    {
      label: "Networks",
      options: groupped[FilterType.Network] || [],
    },
    {
      label: "Year Quarter",
      options: groupped[FilterType.YearQuarter] || [],
    },
    {
      label: "Status",
      options: groupped[FilterType.Status] || [],
    },
    {
      label: "Demographics",
      options: groupped[FilterType.Demographics] || [],
    },
    {
      label: "Selling Title",
      options: groupped[FilterType.Name] || [],
    },
  ];
}
