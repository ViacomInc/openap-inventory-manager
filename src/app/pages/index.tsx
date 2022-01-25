import React, { useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";

import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import TabsStyles from "../components/ui/Tabs.module.css";

import {
  getPublishersRequest,
  selectGetPublishersRequest,
} from "../api/publishers";

import { Publisher } from "../graphql";

import { TableSlice } from "../store/table";
import { useDispatch, useSelector } from "../store";
import { PublishersSlice } from "../store/publishers";
import {
  setTablePublisher,
  setTableView,
  setTablePage,
  setTablePageSize,
  setTableFilters,
} from "../store/actions";
import { selectTableState } from "../store/table";

import Page from "../components/Page";
import InventoryView from "../components/InventoryView";
import ErrorNotification from "../components/ErrorNotification";
import useRedirectToLogin from "../components/useRedirectToLogin";
import useSyncUrlState, {
  UseSyncUrlState,
} from "../components/useSyncUrlState";

import { intParse } from "../../lib/helpers";
import { parseFilters, stringifyFilters } from "../store/table/helpers";

export default function Index(): JSX.Element | null {
  const dispatch = useDispatch();

  // get all publishers
  useEffect(() => dispatch(getPublishersRequest()), []);
  const publishers = useSelector(selectGetPublishersRequest());

  if (useRedirectToLogin(publishers.errors)) {
    return null;
  }

  const pageProps = publishers.loading
    ? { loading: true }
    : (publishers.errors?.length ?? 0) > 0
    ? {}
    : (publishers.data?.length ?? 0) > 1
    ? { withTabs: true }
    : { withToolbar: true };

  return (
    <Page {...pageProps}>
      <ErrorNotification errors={publishers.errors} />
      {Boolean(publishers.data && publishers.data.length) && (
        <Publishers publishers={publishers.data} />
      )}
    </Page>
  );
}

interface PublishersProps {
  publishers: PublishersSlice;
}

function Publishers({ publishers }: PublishersProps): JSX.Element {
  const router = useRouter();
  const dispatch = useDispatch();
  // url <> state sync
  const urlStateSync = useMemo(() => {
    const route = router.route.split("/");
    const index = route.findIndex((path) => path === "[[...match]]");
    const basePath = route.slice(0, index).join("/");
    return getUrlSyncState(basePath, publishers);
  }, [publishers]);
  useSyncUrlState(urlStateSync);

  useEffect(() => {
    if (publishers.length === 1) {
      dispatch(setTablePublisher(publishers[0].id));
    }
  }, [publishers]);

  if (publishers.length === 1) {
    return <InventoryView publisher={publishers[0]} />;
  }

  return (
    <PublishersTabs
      publishers={publishers}
      setPublisher={(id) => dispatch(setTablePublisher(id))}
    />
  );
}

interface PublishersTabsProps {
  publishers: PublishersSlice;
  setPublisher: (id: number) => void;
}

function PublishersTabs({
  publishers,
  setPublisher,
}: PublishersTabsProps): JSX.Element {
  //publisher tabs
  const { publisher } = useSelector(selectTableState);
  const tabIndex = useMemo(
    () => getPublisherIndex(publishers, publisher),
    [publishers, publisher]
  );
  const setTabIndex = useCallback(
    (index: number, lastIndex: number) => {
      if (index === lastIndex) {
        return;
      }

      setPublisher(publishers[index].id);
    },
    [publishers]
  );
  // to set default publisher id
  useEffect(() => {
    if (publisher === undefined && tabIndex !== undefined) {
      setPublisher(publishers[tabIndex].id);
    }
  }, [publishers, publisher, tabIndex]);

  return (
    <Tabs
      className={TabsStyles.Tabs}
      disabledTabClassName={TabsStyles.TabDisabled}
      selectedTabClassName={TabsStyles.TabSelected}
      selectedTabPanelClassName={TabsStyles.TabPanelSelected}
      selectedIndex={tabIndex}
      onSelect={setTabIndex}
    >
      <TabList className={TabsStyles.TabList}>
        {publishers.map((publisher) => (
          <Tab className={TabsStyles.Tab} key={publisher.id}>
            {publisher.name} Inventory
          </Tab>
        ))}
      </TabList>
      {publishers.map((publisher) => (
        <TabPanel key={publisher.id}>
          <InventoryView publisher={publisher} />
        </TabPanel>
      ))}
    </Tabs>
  );
}

function getPublisherIndex(
  publishers: PublishersSlice,
  publisherId: number | undefined
): number {
  if (publisherId === undefined) {
    return 0;
  }

  const index = publishers.findIndex((p) => p.id === publisherId);
  return index === -1 ? 0 : index;
}

function getUrlSyncState(
  root: string,
  publishers: PublishersSlice
): UseSyncUrlState<TableSlice> {
  const publisherIndices = publishers.reduce(
    (indices, publisher: Publisher) => {
      const slug = publisher.name.replace(/\W/g, "-").toLowerCase();
      indices.id[publisher.id] = slug;
      indices.slug[slug] = publisher.id;
      return indices;
    },
    { id: {}, slug: {} } as {
      id: Record<number, string>;
      slug: Record<string, number>;
    }
  );

  return {
    url: `${root}/:publisher?/:view?/:pageSize?/:page?`,
    selector: selectTableState,
    queryString: "filters",
    parameters: {
      publisher: {
        toUrl: (id: number) => publisherIndices.id[id],
        toValue: (slug: string) => publisherIndices.slug[slug],
        action: setTablePublisher,
      },
      view: {
        action: setTableView,
      },
      page: {
        toValue: (str: string) => {
          const n = intParse(str);
          if (!n) {
            return undefined;
          }
          return n - 1;
        },
        toUrl: (value: number) => String(value + 1),
        action: setTablePage,
      },
      pageSize: {
        toValue: intParse,
        action: setTablePageSize,
      },
      filters: {
        toValue: parseFilters,
        toUrl: stringifyFilters,
        action: setTableFilters,
      },
    },
  };
}
