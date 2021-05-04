import { parse } from "papaparse";

export default function parseCSV(csv: string): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    parse(csv, {
      header: true,
      transformHeader: normalizeCSVHeader,
      transform: normalizeCSVValues,
      skipEmptyLines: "greedy",
      complete: (result) => resolve(result.data),
      error: reject,
    });
  });
}

function normalizeCSVHeader(name: string): string {
  return name.toLowerCase();
}

function normalizeCSVValues(value: string, name: string | number): string {
  switch (name) {
    case "rate type":
      return value.toUpperCase();
      break;

    case "projections demographics":
      return value.toUpperCase();
      break;
  }

  return value;
}
