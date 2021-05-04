import {
  createTZDateFromUTC,
  createTZDateTimeFromUTC,
} from "../../src/lib/dateHelpers";

const exampleUTCDateSpecs: Array<[string, number | null]> = [
  ["2016-12-31", 1483142400000],
  ["2017-12-31", 1514678400000],
  ["2018-04-30", 1525046400000],
  ["2018-05-28", 1527465600000],
  ["2018-08-27", 1535328000000],
  ["2018-12-30", 1546128000000],
  ["2018-12-31", 1546214400000],
  ["2019-08-27", 1566864000000],
  ["2019-12-31", 1577750400000],
  ["2020-04-20", 1587340800000],
  ["2020-12-27", 1609027200000],
  ["2021-06-28", 1624838400000],
  ["2021-12-26", 1640476800000],
  ["2021-12-27", 1640563200000],
  ["2022-06-26", 1656201600000],
  ["2022-06-27", 1656288000000],
  ["2022-12-25", 1671926400000],
  ["2022-12-26", 1672012800000],
  ["2023-12-30", 1703894400000],
  ["2028-12-29", 1861660800000],
  ["2020/12/15", null],
  ["20-12-28", null],
  ["2020-13-28", null],
  ["2020-12-32", null],
  ["asdfasd", null],
];

const exampleUTCDateTimeSpecs: Array<[string, number | null]> = [
  ["2016-12-31 2:20:45", 1483150845000],
  ["2016-12-31 12:10:32", 1483186232000],
  ["2016-12-31 14:59:59", 1483196399000],
  ["2019-08-27 1:01:01", 1566867661000],
  ["2019-08-27 9:20:34", 1566897634000],
  ["2019-08-27 19:00:00", 1566932400000],
  ["2016-12-31T2:20:45", 1483150845000],
  ["16-12-31 2:20:45", null],
  ["2016-13-31 2:20:45", null],
  ["2016-12-32 2:20:45", null],
  ["2016-12-31", null],
  ["asdfasd", null],
];

describe("date helpers", () => {
  describe.each(exampleUTCDateSpecs)("createTZDateFromUTC", (key, expected) => {
    test(`createTZDateFromUTC with ${key} should be ${expected ?? ""}`, () => {
      const val = createTZDateFromUTC(key);
      if (expected === null) {
        expect(val).toEqual(null);
        return;
      }

      expect(val).not.toBe(null);
      val && expect(val.toMillis()).toEqual(expected);
    });
  });

  describe.each(exampleUTCDateTimeSpecs)(
    "createTZDateTimeFromUTC",
    (key, expected) => {
      test(`createTZDateTimeFromUTC with ${key} should be ${
        expected ?? ""
      }`, () => {
        const val = createTZDateTimeFromUTC(key);
        if (expected === null) {
          expect(val).toEqual(null);
          return;
        }

        expect(val).not.toBe(null);
        val && expect(val.valueOf()).toEqual(expected);
      });
    }
  );
});
