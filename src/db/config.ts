import { createTypeParserPreset } from "slonik";
import { createQueryLoggingInterceptor } from "slonik-interceptor-query-logging";

export default {
  captureStackTrace: true,
  connectionTimeout: 30000,
  idleTimeout: 30000,
  logValues: false,
  interceptors: [createQueryLoggingInterceptor()],
  typeParsers: [
    ...createTypeParserPreset(),
    {
      name: "json",
      parse: (value: string): string => value,
    },
    {
      name: "timestamp",
      parse: (value: string): string => value,
    },
    {
      name: "timestamptz",
      parse: (value: string): string => value,
    },
  ],
};

type ManagerDBConfig = {
  schema: string;
};

export const managerDBConfig: ManagerDBConfig = {
  schema: process.env.OPENAP_SCHEMA || "manager",
};
