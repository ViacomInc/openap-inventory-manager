export function intParse(str?: string): number | undefined {
  if (!str) {
    return undefined;
  }

  const n = parseInt(str, 10);
  if (isNaN(n)) {
    return undefined;
  }

  return n;
}

type Obj = {
  [key: string]: string | number;
};

export function withoutKey(src: Obj, prop: string): Obj {
  return Object.keys(src).reduce((object: Obj, key: string) => {
    if (key !== prop) {
      object[key] = src[key];
    }
    return object;
  }, {});
}

export function clamp(min: number, max: number, val: number): number {
  return Math.min(Math.max(min, val), max);
}

export function isEmpty<T>(obj?: T): obj is T {
  if (obj === undefined || obj === null) {
    return true;
  }

  if (!Object.keys(obj).length) {
    return true;
  }

  return false;
}

export function getDiff<
  T extends Record<string, string | number | undefined | null>
>(original: T, update: T): Partial<T> {
  const diff: Record<string, string | number | undefined | null> = {};
  for (const [key, value] of Object.entries(update)) {
    if (update[key] !== original[key]) {
      diff[key] = value;
    }
  }

  return diff as Partial<T>;
}
