import nock, { Scope } from "nock";

const OPENAP_API_URL = process.env.OPENAP_API_URL || "http://lvh.me";

export const mockOpenAPAuth = (): Scope => {
  return nock(OPENAP_API_URL).persist().post("/authenticate").reply(200, {
    access_token: "jskdk8-d923-4a8c-8234-dkdjdjdkfls",
    refresh_token: "ksjdlkdjlf-ef43-486a-b81a-dksoei89cjj",
    scope: "orgtype OpenAPScopes uid mail openid usertype orgid",
    id_token: "test_id_token",
    token_type: "Bearer",
    expires_in: 1799,
  });
};

export const mockOpenAPPublishers = (): Scope => {
  return nock(OPENAP_API_URL)
    .persist()
    .get("/publishers/networks")
    .reply(200, {
      publishers: [
        {
          id: 1,
          name: "Test Publisher",
          networks: [
            {
              id: 0,
              name: "Test Network 0",
            },
            {
              id: 1,
              name: "Test Network 1",
            },
            {
              id: 2,
              name: "Test Network 2",
            },
          ],
        },
      ],
    });
};

export const mockOpenAPInventoryItems = (itemCount: number): Scope => {
  return nock(OPENAP_API_URL)
    .post("/inventory_bank/inventories?delete_inventory=true")
    .reply(200, {
      warnings: [],
      itemCount: itemCount,
    });
};

export const mockOpenAPRates = (itemCount: number): Scope => {
  return nock(OPENAP_API_URL)
    .post("/inventory_bank/rates?delete_rate=true")
    .reply(200, {
      warnings: [],
      itemCount: itemCount,
    });
};

export const clearOpenAPMocks = (): void => nock.cleanAll();
