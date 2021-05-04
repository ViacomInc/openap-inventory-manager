import type { NextApiRequest, NextApiResponse } from "next";
import { Logger } from "pino";
import setupLogger from "./setup";

export interface WithLoggerApiRequest extends NextApiRequest {
  logger: Logger;
}

export interface LoggerHttpError {
  error: Error;
  duration: number;
}

export type WithLoggerRequestHandler = (
  req: WithLoggerApiRequest,
  res: NextApiResponse
) => void;

const getDuration = (time: [number, number]) => {
  const [seconds, nanoseconds] = process.hrtime(time);

  return Math.round(seconds * 1e3 + nanoseconds / 1e6);
};

export const withLogger = (type: string) => (
  handler: (req: WithLoggerApiRequest, res: NextApiResponse) => Promise<void>
): WithLoggerRequestHandler => async (req, res) => {
  req.logger = setupLogger(type, req);

  const time = process.hrtime();

  try {
    await handler(req, res);
    req.logger.debug(
      { duration: getDuration(time) },
      `Request to ${String(req.url)} finished`
    );
  } catch (error) {
    const logError: LoggerHttpError = {
      error: error as Error,
      duration: getDuration(time),
    };

    req.logger.error(logError, `Request ${String(req.url)} errored`);
  }
};
