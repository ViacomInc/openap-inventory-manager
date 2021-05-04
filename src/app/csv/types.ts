import {
  Type,
  type,
  Any,
  success,
  failure,
  union,
  identity,
  number,
  string,
  literal,
  undefined as undefinedCodec,
  UnionC,
  UndefinedC,
  LiteralC,
} from "io-ts";

import { withValidate } from "io-ts-types/lib/withValidate";
import { NumberFromString } from "io-ts-types/lib/NumberFromString";
export { NumberFromString } from "io-ts-types/lib/NumberFromString";

import { isRight, mapLeft, either } from "fp-ts/lib/Either";
import { DateTime } from "luxon";

import {
  Network,
  RateType as RateTypeEnum,
  Demographics as DemographicsEnum,
  InventoryItemInput,
} from "../../graphql/__generated__/types";

import { createTZDateFromUTC, parseNYDateTime } from "../../lib/dateHelpers";

import { CSVError } from "./error";

export interface InventoryItemInputWihtIndex extends InventoryItemInput {
  index: number;
}

export function optional<C extends Any>(
  codec: C
): UnionC<[C, LiteralC<"">, UndefinedC]> {
  return union([codec, literal(""), undefinedCodec]);
}

export const OptionalNumberFromString = optional(NumberFromString);

export function fromEnum<EnumType>(
  enumName: string,
  theEnum: Record<string, EnumType>,
  defaultValue?: EnumType
): Type<EnumType, EnumType, unknown> {
  const isEnumValue = (u: unknown): u is EnumType =>
    Object.values<unknown>(theEnum).includes(u);

  return new Type<EnumType, EnumType, unknown>(
    enumName,
    isEnumValue,
    (input, context) => {
      if (isEnumValue(input)) {
        return success(input);
      }

      if (defaultValue !== undefined) {
        return success(defaultValue);
      }

      return failure(input, context);
    },
    identity
  );
}

export const Demographic = fromEnum("Demographics", DemographicsEnum);
export const OptionalDemographics = optional(Demographic);

export const RateType = fromEnum("RateTypes", RateTypeEnum);
export const OptionalRateType = optional(RateType);

const OAPNetworkCodec = type({
  id: number,
  name: string,
});

export const NetworkFromString = (
  networks: Network[]
): Type<Network, string, unknown> => {
  const NetworkFromString = new Type<Network, string, unknown>(
    "NetworkFromString",
    (u): u is Network => isRight(OAPNetworkCodec.decode(u)),
    (u, c) =>
      either.chain(string.validate(u, c), (s) => {
        const network = networks.find(({ name }) => s === name);
        return network ? success(network) : failure(u, c);
      }),
    (a) => a.name
  );

  return NetworkFromString;
};

export const DateFromISOString = new Type<DateTime, string, unknown>(
  "DateFromISOString",
  (u): u is DateTime => u instanceof DateTime,
  (u, c) =>
    either.chain(string.validate(u, c), (s) => {
      const date = createTZDateFromUTC(s);
      if (!date) {
        return failure(u, c);
      }

      return success(date);
    }),
  (a) => a.toISODate()
);
export const OptionalDateFromISOString = optional(DateFromISOString);

export const DateTimeFromISOString = new Type<DateTime, string, unknown>(
  "DateTimeFromISOString",
  (u): u is DateTime => u instanceof DateTime,
  (u, c) =>
    either.chain(string.validate(u, c), (s) => {
      const dateTime = parseNYDateTime(s);
      if (!dateTime) {
        return failure(u, c);
      }
      return isNaN(dateTime.valueOf()) ? failure(u, c) : success(dateTime);
    }),
  (a) => a.toISO()
);
export const OptionalDateTimeFromISOString = optional(DateTimeFromISOString);

export function withError<C extends Any>(codec: C, error: CSVError): C {
  return withValidate(codec, (i: unknown, c) =>
    mapLeft(() => [
      {
        value: error,
        context: c,
        actual: i,
      },
    ])(codec.validate(i, c))
  );
}
