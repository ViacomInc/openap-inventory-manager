import { request as graphqlFetch } from "graphql-request";

import { insertInventoryItems, inventoryItemFactory } from "../factories";
import {
  InventoryItem,
  InventoryItemInput,
  InventoryItemStatus,
  CreateInventoryItemsMutationVariables,
  CreateInventoryItemsMutationResult,
  UpdateInventoryItemMutationVariables,
  UpdateInventoryItemMutationResult,
  RemoveInventoryItemMutationVariables,
  RemoveInventoryItemMutationResult,
  SubmitInventoryItemsMutationVariables,
  SubmitInventoryItemsMutationResult,
} from "../../src/graphql/__generated__/types";
import {
  CreateInventoryItems,
  UpdateInventoryItem,
  RemoveInventoryItem,
  SubmitInventoryItems,
} from "../../src/graphql/operations/inventoryItems.graphql";
import {
  mockOpenAPAuth,
  mockOpenAPInventoryItems,
  mockOpenAPRates,
  clearOpenAPMocks,
} from "../openapHelpers";
import { TEST_USER_ID } from "../constants";

import {
  collectBroadcastDates,
  collectRatesDates,
} from "../../src/lib/openap/helpers";

import {
  startGraphQLServer,
  stopGraphQLServer,
  Server,
  getGraphQLSettings,
} from "../serverHelpers";

import { stopDBPool, resetDB } from "../dbHelpers";

import InventoryItemsJSON from "../fixtures/inventoryItems.json";
const inventoryItems = InventoryItemsJSON as InventoryItem[];
const inventoryItemsInput: InventoryItemInput[] = inventoryItems.map(
  ({ id, status, ...item }) => ({
    ...item,
  })
);

const { port, path, url: apiURL } = getGraphQLSettings();

describe("Full workflow test: create > edit > submit > edit > resubmit:", () => {
  let server: Server;

  beforeAll(async () => {
    jest.spyOn(console, "info").mockImplementation(() => {});
    await resetDB();
    server = await startGraphQLServer({ path, port });
    mockOpenAPAuth();
  });

  afterAll(async () => {
    await stopDBPool();
    await stopGraphQLServer(server);
    clearOpenAPMocks();
  });

  let idToUpdate: number;
  let idToDelete: number;

  it("Creates new items and checks db", async () => {
    const response = await graphqlFetch<
      CreateInventoryItemsMutationResult,
      CreateInventoryItemsMutationVariables
    >(apiURL, CreateInventoryItems, {
      inventoryItems: inventoryItemsInput,
    });

    idToUpdate = response.createInventoryItems[0].id;
    idToDelete = response.createInventoryItems[1].id;

    response.createInventoryItems.forEach((item) => {
      expect(item.status).toBe(InventoryItemStatus.New);
      expect(item.createdBy).toBe(TEST_USER_ID);
      expect(item.updatedBy).toBe(TEST_USER_ID);
    });
  });

  it("Updates new item and checks that the status is still New", async () => {
    const response = await graphqlFetch<
      UpdateInventoryItemMutationResult,
      UpdateInventoryItemMutationVariables
    >(apiURL, UpdateInventoryItem, {
      id: idToUpdate,
      inventoryItem: { units: 1000 },
    });

    const item = response.updateInventoryItem[0];
    expect(item.status).toBe(InventoryItemStatus.New);
    expect(item.units).toBe(1000);
  });

  it("Submits items", async () => {
    const ratesDates = inventoryItemsInput.reduce(
      collectRatesDates,
      new Set<string>()
    );
    const rateMocks = Array.from(ratesDates).map((_date) => ({
      clear: mockOpenAPRates(0),
      create: mockOpenAPRates(1), // not a real number
    }));

    const broadcatsDates = inventoryItemsInput.reduce(
      collectBroadcastDates,
      new Set<string>()
    );
    const inventoryMocks = Array.from(broadcatsDates).map((_date) => ({
      clear: mockOpenAPInventoryItems(0),
      create: mockOpenAPInventoryItems(1), // not a real number
    }));

    const response = await graphqlFetch<
      SubmitInventoryItemsMutationResult,
      SubmitInventoryItemsMutationVariables
    >(apiURL, SubmitInventoryItems, {
      publisherId: 101,
    });

    response.submitInventoryItems.forEach((item) =>
      expect(item.status).toBe(InventoryItemStatus.Committed)
    );

    rateMocks.forEach(({ clear, create }) => {
      expect(clear.isDone()).toBe(true);
      expect(create.isDone()).toBe(true);
    });

    inventoryMocks.forEach(({ clear, create }) => {
      expect(clear.isDone()).toBe(true);
      expect(create.isDone()).toBe(true);
    });
  });

  it("Updates commited item and checks that the status is Updated", async () => {
    const response = await graphqlFetch<
      UpdateInventoryItemMutationResult,
      UpdateInventoryItemMutationVariables
    >(apiURL, UpdateInventoryItem, {
      id: idToUpdate,
      inventoryItem: { units: 200 },
    });

    const item = response.updateInventoryItem[0];
    expect(item.status).toBe(InventoryItemStatus.Updated);
    expect(item.units).toBe(200);
  });

  it("Removes commited item and checks that the status is Removed", async () => {
    const response = await graphqlFetch<
      RemoveInventoryItemMutationResult,
      RemoveInventoryItemMutationVariables
    >(apiURL, RemoveInventoryItem, {
      id: idToDelete,
    });

    const item = response.removeInventoryItem;
    expect(item.status).toBe(InventoryItemStatus.Removed);
  });

  it("Resubmits items", async () => {
    const clearRatesMockOne = mockOpenAPRates(0);
    const createRateMockOne = mockOpenAPRates(1);
    const clearMockOne = mockOpenAPInventoryItems(0);
    const createMockOne = mockOpenAPInventoryItems(1);
    const clearMockTwo = mockOpenAPInventoryItems(0);
    const createMockTwo = mockOpenAPInventoryItems(1);

    const response = await graphqlFetch<
      SubmitInventoryItemsMutationResult,
      SubmitInventoryItemsMutationVariables
    >(apiURL, SubmitInventoryItems, {
      publisherId: 101,
    });

    response.submitInventoryItems.forEach((item) => {
      if (item.id === idToUpdate) {
        expect(item.status).toBe(InventoryItemStatus.Committed);
      }

      if (item.id === idToDelete) {
        expect(item.status).toBe(InventoryItemStatus.Deleted);
      }
    });

    expect(clearRatesMockOne.isDone()).toBe(true);
    expect(createRateMockOne.isDone()).toBe(true);
    expect(clearMockOne.isDone()).toBe(true);
    expect(createMockOne.isDone()).toBe(true);
    expect(clearMockTwo.isDone()).toBe(true);
    expect(createMockTwo.isDone()).toBe(true);
  });
});
