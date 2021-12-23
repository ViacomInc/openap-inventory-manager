import got, { NormalizedOptions, RequestError } from "got";
import formUrlEncoded from "form-urlencoded";
import flattern from "flat";

import logger from "../logger";
import { OAPInventory, OAPRates, OAPPublisher, OAPError } from "./types";

type Tokens = {
  access_token: string;
  refresh_token: string;
  scope: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  expires_by: number;
};

let tokens: Tokens;

function getAuthorizationHeader() {
  const buff = Buffer.from(
    `${process.env.OPENAP_API_CLIENT_ID || ""}:${
      process.env.OPENAP_API_CODE || ""
    }`
  );
  const header = buff.toString("base64");
  logger.debug(`Authorization: Basic ${header}`);
  return `Basic ${header}`;
}

async function authenticate(): Promise<void> {
  const response = await openApClient.post<Tokens>("authenticate", {
    body: formUrlEncoded({
      username: process.env.OPENAP_API_USER_ID,
      password: process.env.OPENAP_API_PASSWORD,
      grant_type: process.env.OPENAP_API_GRANT_TYPE,
      scope: process.env.OPENAP_API_GRANT_SCOPE,
    }),
    headers: {
      Authorization: getAuthorizationHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  tokens = response.body;
  logger.debug(tokens, `Access Token ${tokens.access_token}`);
  // save the expiration date - 10 seconds
  tokens.expires_by = Date.now() + tokens.expires_in * 1000 - 10000;
}

async function getAccessToken(): Promise<string> {
  if (!tokens || tokens.expires_by < Date.now()) {
    await authenticate();
  }

  return tokens.access_token;
}

async function setAuthorizationHeaderWhenNeeded(options: NormalizedOptions) {
  if (options.url.pathname.endsWith("authenticate")) {
    return;
  }

  const accessToken = await getAccessToken();
  if (accessToken) {
    options.headers.Authorization = accessToken;
  }
}

async function logRequest({
  url,
  method,
  headers,
  body,
  json,
  form,
}: NormalizedOptions) {
  logger.debug(
    { headers, method, body, json, form },
    `OpenAP request ${url.toString()}`
  );
}

interface ErrorMessage {
  code?: string;
  statusCode?: number;
  body?: unknown;
}

function normalizeResponseErrors(error: RequestError) {
  const { code, response } = error;
  const message: ErrorMessage = {
    code,
  };

  if (response) {
    const errorBody = response.body as OAPError;
    message.statusCode = response.statusCode;
    message.body = flattern(errorBody.error);
  }

  // error message goes to job.last_error column
  error.message = JSON.stringify(message);
  return error;
}

export const openApClient = got.extend({
  prefixUrl: process.env.OPENAP_API_URL,
  responseType: "json",
  hooks: {
    beforeRequest: [setAuthorizationHeaderWhenNeeded, logRequest],
    beforeError: [normalizeResponseErrors],
  },
});

type OAPUploadResponse = {
  itemCount: number;
  warnings: string[];
};

export async function uploadInventory(
  inventory: OAPInventory,
  deleteInventory?: boolean
): Promise<OAPUploadResponse> {
  const response = await openApClient.post<OAPUploadResponse>(
    `inventory_bank/inventories${
      deleteInventory === undefined
        ? ""
        : `?delete_inventory=${String(deleteInventory)}`
    }`,
    {
      json: inventory,
    }
  );

  return response.body;
}

export async function uploadRates(
  rates: OAPRates,
  deleteRate?: boolean
): Promise<OAPUploadResponse> {
  const response = await openApClient.post<OAPUploadResponse>(
    `inventory_bank/rates${
      deleteRate === undefined ? "" : `?delete_rate=${String(deleteRate)}`
    }`,
    {
      json: rates,
    }
  );

  return response.body;
}

export async function getInventory(): Promise<OAPInventory> {
  const response = await openApClient.get<OAPInventory>(
    `inventory_bank/inventories`
  );

  return response.body;
}

export async function getPublishers(): Promise<OAPPublisher[]> {
  const response = await openApClient.get<{ publishers: OAPPublisher[] }>(
    `publishers/networks`
  );

  return response.body.publishers;
}
