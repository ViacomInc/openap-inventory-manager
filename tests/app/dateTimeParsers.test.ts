import { DateTime } from "luxon";
import { parseDateTimeString } from "../../src/app/components/Table/dateTimeParsers";

describe("DateTime Parser", () => {
  test("ISO short date time", () => {
    const dateTimeNoMilliseconds = parseDateTimeString("2021-12-20T01:59:00");

    if (dateTimeNoMilliseconds === null) {
      fail("Failed to parse the date");
    }

    expect(
      dateTimeNoMilliseconds.toISO().startsWith("2021-12-20T01:59:00")
    ).toEqual(true);
  });

  test("ISO long date time", () => {
    const dateTimeNoMilliseconds = parseDateTimeString(
      "2021-12-20T01:59:00.001"
    );

    if (dateTimeNoMilliseconds === null) {
      fail("Failed to parse the date");
    }

    expect(
      dateTimeNoMilliseconds.toISO().startsWith("2021-12-20T01:59:00.001")
    ).toEqual(true);
  });

  test("ISO long date time with time zone", () => {
    const dateTimeNoMilliseconds = parseDateTimeString(
      "2021-12-20T01:59:00.001+03:30"
    );

    if (dateTimeNoMilliseconds === null) {
      fail("Failed to parse the date");
    }

    expect(dateTimeNoMilliseconds.toISO()).toEqual(
      "2021-12-20T01:59:00.001+03:30"
    );
  });

  test("SQL short date time", () => {
    const dateTimeNoMilliseconds = parseDateTimeString("2021-12-20 01:59:00");

    if (dateTimeNoMilliseconds === null) {
      fail("Failed to parse the date");
    }

    expect(
      dateTimeNoMilliseconds.toISO().startsWith("2021-12-20T01:59:00")
    ).toEqual(true);
  });

  test("SQL long date time", () => {
    const dateTimeNoMilliseconds = parseDateTimeString(
      "2021-12-20 01:59:00.001"
    );

    if (dateTimeNoMilliseconds === null) {
      fail("Failed to parse the date");
    }

    expect(
      dateTimeNoMilliseconds.toISO().startsWith("2021-12-20T01:59:00.001")
    ).toEqual(true);
  });

  test("SQL long date time with time zone", () => {
    const dateTimeNoMilliseconds = parseDateTimeString(
      "2021-12-20 01:59:00.001+03"
    );

    if (dateTimeNoMilliseconds === null) {
      fail("Failed to parse the date");
    }

    expect(dateTimeNoMilliseconds.toISO()).toEqual(
      "2021-12-20T01:59:00.001+03:00"
    );
  });
});
