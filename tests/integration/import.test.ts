import { request as graphqlFetch } from "graphql-request";

import {
  startGraphQLServer,
  stopGraphQLServer,
  Server,
  getGraphQLSettings,
} from "../serverHelpers";

import { stopDBPool, resetDB } from "../dbHelpers";
import {
  mockOpenAPAuth,
  mockOpenAPPublishers,
  clearOpenAPMocks,
} from "../openapHelpers";
import { OAPPublisher } from "../../src/lib/openap/types";

import { ImportItems } from "../../src/graphql/operations/import.graphql";
import {
  isInventoryItems,
  isImportItemsConflicts,
  setImportFilters,
} from "../../src/lib/import";
import {
  InventoryItemInput,
  ImportItemsMutationVariables,
  ImportItemsMutationResult,
  ImportFilterType,
  RateType,
} from "../../src/graphql/__generated__/types";

import { inventoryItemFactory } from "../factories";
import { TEST_USER_ID } from "../constants";

function callImport(url: string) {
  return graphqlFetch<ImportItemsMutationResult, ImportItemsMutationVariables>(
    url,
    ImportItems,
    {
      input: { publisherId: 1 },
    }
  );
}

describe("External data import", () => {
  beforeAll(async () => {
    jest.spyOn(console, "info").mockImplementation(() => {});
    await resetDB();
    mockOpenAPAuth();
    mockOpenAPPublishers();
  });

  afterAll(async () => {
    await stopDBPool();
    clearOpenAPMocks();
  });

  it("gets NOT IMPLMENTED error when no importItems function is provided", async () => {
    const { port, path, url: apiURL } = getGraphQLSettings(1);
    const server = await startGraphQLServer({ path, port });
    try {
      await callImport(apiURL);
      fail("Failed to fail");
    } catch (e) {
      expect(e.response.errors[0].extensions.code).toBe("NOT_IMPLEMENTED");
    }

    await stopGraphQLServer(server);
  });

  it("Checks if import function is called", async () => {
    const { port, path, url: apiURL } = getGraphQLSettings(2);
    const importItems = jest.fn<Promise<InventoryItemInput[]>, OAPPublisher[]>(
      async () => inventoryItemFactory.buildList(10)
    );
    const server = await startGraphQLServer({
      path,
      port,
      importItems,
    });

    const response = await callImport(apiURL);

    await stopGraphQLServer(server);

    if (!isInventoryItems(response.importItems)) {
      fail("Response should not have conflicts");
    }

    expect(response.importItems.items.length).toBe(10);
    expect(importItems).toHaveBeenCalled();
    expect(importItems.mock.calls.length).toBe(1);
    expect(importItems.mock.calls[0].length).toBe(1);

    const publisher = importItems.mock.calls[0][0];
    expect(publisher.id).toBe(1);
    expect(publisher.name).toBe("Test Publisher");
  });

  it("Checks clamp filter", async () => {
    const { port, path, url: apiURL } = getGraphQLSettings(3);
    await setImportFilters(TEST_USER_ID, [
      { type: ImportFilterType.Clamp, field: "units", values: [String(5)] },
    ]);

    const importItems = jest.fn<Promise<InventoryItemInput[]>, [OAPPublisher]>(
      async () => inventoryItemFactory.buildList(10)
    );
    const server = await startGraphQLServer({
      path,
      port,
      importItems,
    });

    const response = await callImport(apiURL);

    await stopGraphQLServer(server);

    if (!isInventoryItems(response.importItems)) {
      fail("Response should not have conflicts");
    }

    response.importItems.items.forEach((item) => {
      expect(item.units).toBeLessThanOrEqual(5);
    });
  });

  it("Checks include filter", async () => {
    const { port, path, url: apiURL } = getGraphQLSettings(4);
    await setImportFilters(TEST_USER_ID, [
      {
        type: ImportFilterType.Include,
        field: "rateType",
        values: [RateType.Scatter],
      },
    ]);

    const importItems = jest.fn<Promise<InventoryItemInput[]>, [OAPPublisher]>(
      async () => inventoryItemFactory.buildList(10)
    );
    const server = await startGraphQLServer({
      path,
      port,
      importItems,
    });

    const response = await callImport(apiURL);

    await stopGraphQLServer(server);

    if (!isInventoryItems(response.importItems)) {
      fail("Response should not have conflicts");
    }

    response.importItems.items.forEach((item) => {
      expect(item.rateType).toBe(RateType.Scatter);
    });
  });

  it("Checks exclude filter", async () => {
    const { port, path, url: apiURL } = getGraphQLSettings(5);
    await setImportFilters(TEST_USER_ID, [
      {
        type: ImportFilterType.Exclude,
        field: "rateType",
        values: [RateType.Scatter],
      },
    ]);

    const importItems = jest.fn<Promise<InventoryItemInput[]>, [OAPPublisher]>(
      async () => inventoryItemFactory.buildList(10)
    );
    const server = await startGraphQLServer({
      path,
      port,
      importItems,
    });

    const response = await callImport(apiURL);

    await stopGraphQLServer(server);

    if (!isInventoryItems(response.importItems)) {
      fail("Response should not have conflicts");
    }

    expect(response.importItems.items.length).toBe(0);
  });
});
