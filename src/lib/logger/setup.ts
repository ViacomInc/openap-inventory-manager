import { Logger } from "pino";
import { v4 as uuid } from "uuid";
import { IncomingMessage } from "http";

import logger from "./";

export default (type: string, request?: IncomingMessage): Logger =>
  logger.child({
    traceId: String(request?.headers["x-request-id"]) ?? uuid(),
    url: request?.url,
    name: `${type} (${process.env.ENV ?? "local"})`,
  });
