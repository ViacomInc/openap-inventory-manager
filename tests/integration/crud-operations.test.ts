import { request as graphqlFetch } from "graphql-request";

import {
  create as createItems,
  get,
  getAllForPublisher,
} from "../../src/lib/InventoryItem";
import { getDiff } from "../../src/lib/helpers";
import { insertInventoryItems, inventoryItemFactory } from "../factories";
import {
  CreateInventoryItems,
  UpdateInventoryItem,
  RemoveInventoryItem,
  RestoreInventoryItem,
} from "../../src/graphql/operations/inventoryItems.graphql";
import {
  CreateInventoryItemsMutationResult,
  UpdateInventoryItemMutationResult,
  RemoveInventoryItemMutationResult,
  RestoreInventoryItemMutationResult,
  InventoryItemStatus,
} from "../../src/graphql/__generated__/types";
import { TEST_USER_ID } from "../constants";

import {
  startGraphQLServer,
  stopGraphQLServer,
  Server,
  getGraphQLSettings,
} from "../serverHelpers";

import { stopDBPool, resetDB } from "../dbHelpers";

const { port, path, url: apiURL } = getGraphQLSettings();
const NOW = new Date().toISOString();

describe("Crud Operations with Inventory Items:", () => {
  let server: Server;

  beforeAll(async () => {
    jest.spyOn(console, "info").mockImplementation(() => {});
    server = await startGraphQLServer({ path, port });
  });

  beforeEach(async () => {
    await resetDB();
  });

  afterAll(async () => {
    await stopGraphQLServer(server);
    await stopDBPool();
  });

  it("creates an inventory item", async () => {
    const testItem = inventoryItemFactory.build({
      name: "test airing",
      projectionsDemographics: "P2+",
      projectedImpressions: 2000,
      networkId: 11,
      units: 2,
      rate: 45.67,
      publisherId: 101,
    });

    await graphqlFetch<CreateInventoryItemsMutationResult>(
      apiURL,
      CreateInventoryItems,
      {
        inventoryItems: [testItem],
      }
    );

    const [item] = await getAllForPublisher({
      publisherId: testItem.publisherId,
    });

    expect(item.name).toBe(testItem.name);
    expect(item.status).toBe("New");
    expect(item.createdBy).toBe(TEST_USER_ID);
    expect(item.updatedBy).toBe(TEST_USER_ID);
  });

  it("does not create a copy of the same item", async () => {
    const inventoryItem = inventoryItemFactory.build();

    await graphqlFetch<CreateInventoryItemsMutationResult>(
      apiURL,
      CreateInventoryItems,
      {
        inventoryItems: [inventoryItem],
      }
    );

    const data = await graphqlFetch<CreateInventoryItemsMutationResult>(
      apiURL,
      CreateInventoryItems,
      {
        inventoryItems: [inventoryItem],
      }
    );

    const dbItems = await getAllForPublisher({
      publisherId: inventoryItem.publisherId,
    });

    expect(dbItems.length).toBe(1);
  });

  it("new item updates shouldn't change status", async () => {
    const [item] = await insertInventoryItems(1);
    const updatedItem = { ...item, units: 5, name: "changed airing" };

    const inventoryItemUpdate = getDiff(item, updatedItem);

    await graphqlFetch<UpdateInventoryItemMutationResult>(
      apiURL,
      UpdateInventoryItem,
      {
        id: item.id,
        inventoryItem: inventoryItemUpdate,
      }
    );

    const updatedItemResult = await get({ id: item.id });

    expect(updatedItemResult?.name).toBe("changed airing");
    expect(updatedItemResult?.status).toBe("New");
    expect(updatedItemResult?.units).toBe(5);
  });

  it("removes an inventory item", async () => {
    const [item] = await createItems(TEST_USER_ID, [
      inventoryItemFactory.build(),
    ]);
    const data = await graphqlFetch<RemoveInventoryItemMutationResult>(
      apiURL,
      RemoveInventoryItem,
      {
        id: item.id,
      }
    );

    const removedItemResult = await get({ id: item.id });

    expect(removedItemResult.status).toBe(InventoryItemStatus.Removed);
  });

  it("restores removed inventory item", async () => {
    const [item] = await createItems(TEST_USER_ID, [
      inventoryItemFactory.build(),
    ]);

    await graphqlFetch<RemoveInventoryItemMutationResult>(
      apiURL,
      RemoveInventoryItem,
      {
        id: item.id,
      }
    );

    const data = await graphqlFetch<RestoreInventoryItemMutationResult>(
      apiURL,
      RestoreInventoryItem,
      {
        id: item.id,
      }
    );

    const restoredItemResult = await get({ id: item.id });

    expect(restoredItemResult.status).toBe(InventoryItemStatus.Updated);
  });

  it("update of removed inventory item should set status to updated", async () => {
    const [item] = await createItems(TEST_USER_ID, [
      inventoryItemFactory.build(),
    ]);

    await graphqlFetch<RemoveInventoryItemMutationResult>(
      apiURL,
      RemoveInventoryItem,
      {
        id: item.id,
      }
    );

    const data = await graphqlFetch<UpdateInventoryItemMutationResult>(
      apiURL,
      UpdateInventoryItem,
      {
        id: item.id,
        inventoryItem: { units: 10 },
      }
    );

    const updatedItem = await get({ id: item.id });

    expect(updatedItem.status).toBe(InventoryItemStatus.Updated);
    expect(updatedItem.units).toBe(10);
  });

  it("updates rates for all items", async () => {
    const publisherId = 14;

    const items = await insertInventoryItems(4, {
      networkId: 17,
      name: "Cult",
      rate: 11,
      publisherId: publisherId,
    });

    const updatedItem = { units: 666, rate: 13 };

    const inventoryItemUpdate = getDiff(items[0], updatedItem);

    const data = await graphqlFetch<UpdateInventoryItemMutationResult>(
      apiURL,
      UpdateInventoryItem,
      {
        id: items[0].id,
        inventoryItem: inventoryItemUpdate,
      }
    );

    const updatedItems = await getAllForPublisher({ publisherId: publisherId });

    expect(updatedItems.length).toBe(4);

    updatedItems.forEach((item) => {
      if (item.id === items[0].id) {
        expect(item.units).toBe(666);
      }
      expect(item.rate).toBe(13);
    });
  });
});
