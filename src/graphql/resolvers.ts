import {
  Resolvers,
  QueryResolvers,
  MutationResolvers,
  ImportItemsResult,
  Maybe,
} from "./__generated__/types";
import {
  getAllForPublisher,
  get,
  update,
  remove,
  restore,
  createNewOnly,
} from "../lib/InventoryItem";
import { submit, getPublishers, cleanup } from "../lib/openap";
import { createImportResolver, ImportItemsFunction } from "../lib/import";
import {
  isInventoryItems,
  isImportItemsConflicts,
} from "../lib/import/helpers";

import { adminOnly } from "./context";

const queryResolvers: QueryResolvers = {
  publishers: (_parent, _args, _context) => getPublishers(),
  inventoryItems: (_parent, args, _context) =>
    getAllForPublisher({ noPastItems: true, ...args }),
  inventoryItem: (_parent, args, _context) => get(args),
};

export interface CreateResolvers {
  importItems?: ImportItemsFunction;
}

export default function createResolvers(opts: CreateResolvers = {}): Resolvers {
  const importItems = createImportResolver(opts.importItems);

  const mutationResolvers: MutationResolvers = {
    createInventoryItems: (_parent, { inventoryItems }, { auth }) =>
      createNewOnly(auth.id, inventoryItems),
    updateInventoryItem: (_parent, { id, inventoryItem }, { auth }) =>
      update(auth.id, { id, update: inventoryItem }),
    removeInventoryItem: (_parent, { id }, { auth }) => remove(auth.id, { id }),
    restoreInventoryItem: (_parent, { id }, { auth }) =>
      restore(auth.id, { id }),
    submitInventoryItems: (_parent, { publisherId }, { auth }) =>
      submit(auth.id, { publisherId }),
    flushInventoryItems: (_parent, { from, to }, { auth }) =>
      adminOnly(auth, () => cleanup(auth.id, [from, to])),
    importItems: (_parent, { input: { publisherId, mode } }, { auth }) =>
      adminOnly(auth, () => importItems(auth.id, publisherId, mode)),
  };

  return {
    Query: queryResolvers,
    Mutation: mutationResolvers,
    ImportItemsResult: {
      __resolveType(
        result: ImportItemsResult
      ): Maybe<"InventoryItems" | "ImportItemsConflicts"> {
        if (isInventoryItems(result)) {
          return "InventoryItems";
        }

        if (isImportItemsConflicts(result)) {
          return "ImportItemsConflicts";
        }

        return null;
      },
    },
  };
}
