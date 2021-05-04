import pino from "pino";

export default pino({
  base: null,
  serializers: { error: pino.stdSerializers.err },
  level: process.env.LOG_LEVEL ?? "info",
});
