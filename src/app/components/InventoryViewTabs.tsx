import React, { useMemo, useCallback, useEffect } from "react";
import classnames from "classnames";

import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import TabsStyles from "./ui/Tabs.module.css";

import { InventoryItem, Network } from "../graphql";

import { TableView, FilterType } from "../store/types";
import { selectTableState } from "../store/table";
import { setTableView, addTableFilter } from "../store/actions";
import { useDispatch, useSelector } from "../store";

import useInventoryUIStatus from "./useInventoryUIStatus";

import NoItems from "./NoItems";
import InventoryViewSummary from "./InventoryViewSummary";
import InventoryViewUnits from "./InventoryViewUnits";
import InventoryViewRates from "./InventoryViewRates";
import InventoryViewProjections from "./InventoryViewProjections";

import useInventoryStatus from "./useInventoryStatus";
import InventoryStatusPanel from "./InventoryStatusPanel";

import Styles from "./InventoryView.module.css";

export interface InventoryViewTabProps {
  items: InventoryItem[];
  networks: Network[];
}

interface InventoryViewTabsDescription {
  slug: TableView;
  name: string;
  component: React.FunctionComponent<InventoryViewTabProps>;
}

const inventoryViewTabs: InventoryViewTabsDescription[] = [
  {
    slug: TableView.Items,
    name: "Inventory Items",
    component: InventoryViewSummary,
  },
  {
    slug: TableView.Units,
    name: "Units Summary",
    component: InventoryViewUnits,
  },
  {
    slug: TableView.Rates,
    name: "Rate Summary",
    component: InventoryViewRates,
  },
  {
    slug: TableView.Projections,
    name: "Projections Summary",
    component: InventoryViewProjections,
  },
];

function getViewIndex(view?: TableView): number {
  if (view === undefined) {
    return 0;
  }

  const index = inventoryViewTabs.findIndex((t) => t.slug === view);
  return index === -1 ? 0 : index;
}

export default function InventoryViewTabs({
  networks,
  items,
}: InventoryViewTabProps): JSX.Element {
  const dispatch = useDispatch();
  const { view } = useSelector(selectTableState);
  const tabIndex = useMemo(() => getViewIndex(view), [view]);
  const { canAddNewItems } = useInventoryUIStatus();
  const setTabIndex = useCallback(
    (index: number, lastIndex: number) => {
      if (index === lastIndex || !canAddNewItems) {
        return;
      }

      dispatch(setTableView(inventoryViewTabs[index].slug));
    },
    [canAddNewItems]
  );

  useEffect(() => {
    if (view === undefined && tabIndex !== undefined) {
      dispatch(setTableView(inventoryViewTabs[tabIndex].slug));
    }
  }, [view, tabIndex]);

  const status = useInventoryStatus();

  return (
    <Tabs
      className={classnames(TabsStyles.Tabs, Styles.Tabs)}
      disabledTabClassName={TabsStyles.TabDisabled}
      selectedTabClassName={TabsStyles.TabSelected}
      selectedTabPanelClassName={TabsStyles.TabPanelSelected}
      selectedIndex={tabIndex}
      onSelect={setTabIndex}
    >
      <TabList className={TabsStyles.TabList}>
        {inventoryViewTabs.map((tab, i) => (
          <Tab className={TabsStyles.Tab} key={i}>
            {tab.name}
          </Tab>
        ))}
      </TabList>
      <div className={Styles.TabContainer}>
        <InventoryStatusPanel
          {...status}
          onClick={(status) =>
            dispatch(
              addTableFilter({
                type: FilterType.Status,
                value: status,
              })
            )
          }
        />
        {inventoryViewTabs.map((tab, i) => (
          <TabPanel key={i}>
            {items.length ? (
              <tab.component items={items} networks={networks} />
            ) : (
              <NoItems />
            )}
          </TabPanel>
        ))}
      </div>
    </Tabs>
  );
}
