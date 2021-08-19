# GraphQL resolvers and DB client for OpenAP Inventory Manager

This is the server package for the
[OpenAP Inventory Manager](https://github.com/ViacomInc/openap-inventory-manager).

If you'd like to skip the details, just use the [Quickstart](#quickstart).
Otherwise, read on...

This package is responsible for managing:

- [GraphQL Goodies](#graphql): a GraphQL API and resolvers you can use for the
  `openap-inventory-manager-react` components to talk to.
- [Database Client](#database-client): a database client that speaks to your
  app's local database maintaining tables needed to keep things in sync with
  OpenAP and the UI.
- [Background Worker](#background-worker): a background worker that handles
  syncing between your data and OpenAP.
- [OpenAP Manager Migrate script](#openap-migrate-manager): a migration script
  (`openap-migrate`) that is used for migrating this lib's tables and schema.
- [Migrate Script](#migrate-script): a migrate script (`migrate`) that exposes
  [node-pg-migrate](https://salsita.github.io/node-pg-migrate) with
  [dotenv-flow](https://github.com/kerimdzhanov/dotenv-flow). You can use this
  to run migrations against your own custom tables in another schema if you need
  additional functionality or customization for your app

## Quickstart

The easiest way to start is to use our Next.js template. It will create
everything you need to get up and running. The repo and instructions can be
found here:
[OpenAP Next JS Template](https://github.com/ViacomInc/with-openap-inventory-manager)

## GraphQL

### Creating your GraphQL Handler (optional)

You'll need to create a GraphQL handler and expose it via a Next JS
`/api/graphql` route that can handle API requests. Meaning you'll need to create
something similar to the following file under `/pages/api/graphql` that uses
this library's GraphQL `schema`,`createResolvers`, and `withAuth`:

```typescript
import { ApolloServer } from "apollo-server-micro";
import {
  schema,
  createResolvers,
  withAuth,
} from "openap-inventory-manager-server";

import myAuthMiddleware from "../../lib/authentication";
import { myItemImportingFunction } from "../../lib/my-resolvers";

const apolloServer = new ApolloServer({
  typeDefs: [schema],
  resolvers: createResolvers(),
  context: withAuth,
});

const handler = apolloServer.createHandler({ path: "/api/graphql" });

export default myAuthMiddleware(handler);
export const config = { api: { bodyParser: false } };
```

### Importing Items From an External Source (optional)

The `createResolvers` function accepts an optional object with property
`importItems`. If you'd like to support importing items from some external data
source, this is how you do it.

Your import function needs to take in an `OAPublisher` and return a
`Promise<InventoryItemInput[]>`. It might look something like this (we've
inlined the library types for convenience):

```typescript
type OAPNetwork = {
  id: number;
  name: string;
};

type OAPPublisher = {
  id: number;
  name: string;
  networks: OAPNetwork[];
};

enum RateType {
  Scatter = "SCATTER",
  Upfront = "UPFRONT",
}

type InventoryItemInput = {
  name: string;
  projectionsDemographics: string;
  projectedImpressions: number;
  startDatetime: string;
  endDatetime: string;
  validUntil: string;
  networkId: number;
  units: number;
  rate: number;
  rateType: RateType;
  publisherId: number;
};

export async function myItemImportFunction(
  publisher: OAPPublisher
): Promise<InventoryItemInput[]> {
  const myItems = await fetchItemsFromSomewhere();

  const newItems = myItems.map(createNewInventoryItem({ publisher }));

  return newItems;
}
```

Then when you create your GraphQL handler, you can add it to the
`createResolvers` function:

```typescript
import { myItemImportingFunction } from "../../lib/my-import";

const apolloServer = new ApolloServer({
  resolvers: createResolvers({
    importItems: myItemImportingFunction,
  }),
});
```

### The `withAuth` Function and Authorization

The app assumes you will be using some sort of authentication. The `withAuth`
function can be used in the `context` property of the GraphQL server. It expects
that you will have modified the `req` object, adding an `auth` property that
follows the necessary type interface. Using the example above, it would look
something like this (we've inlined the library types for convenience):

```typescript
interface User {
  id?: string | null;
  firstName?: string;
  lastName?: string;
  groups?: string[];
  isAdmin?: boolean;
}

interface Auth extends User {
  id: string;
}

interface WithAuth {
  auth?: Auth;
}

interface NextContext {
  req: NextApiRequest & WithAuth;
  res: NextApiResponse;
}

export default function myAuthMiddleware(handler: Handler): Handler {
  return async (
    req: NextApiRequestWithAuth,
    res: NextApiResponse
  ): Promise<void> => {
    // My authentication logic here: check cookies, tokens, headers, etc.

    req.auth = {
      id: someIDLikeAnEmail,
      isAdmin: booleanIndicatingIfThisUserAdmin,
    };

    return handler(req, res);
  };
}
```

## OpenAP Inventory Manager Migrations

This library maintains its own schema in the database for adding, updating, and
syncing with OpenAP. It also keeps track of what users make what changes given
their `id` passed into the `withAuth` context.

Once you've installed the library, you can run the DB migrations needed by:

```bash
./node_modules/.bin/openap-migrate-manager
```

If you'd like you can add it as a script to your `package.json`:

```json
...
  "scripts": {
    "openap-migrate": "openap-migrate-manager"
  },
...
```

And you can also pass a optional direction `-d` to the script to migrate up or
down (defaults to `up`). E.g.:

```bash
$ npm run openap-migrate -- -d down
```

## Migration Script

We also expose the underlying migrate script from
[Node PG Migrate](https://salsita.github.io/node-pg-migrate). You're not
required to use this by any means, but it's there if you'd like to so you don't
need to add any other dependencies!

Once you've installed the library, you can use it by:

```bash
./node_modules/.bin/openap-migrate
```

If you'd like you can add it as a script to your `package.json`:

```json
...
  "scripts": {
    "migrate": "openap-migrate"
  },
...
```

This will accept any of the
[args](https://salsita.github.io/node-pg-migrate/#/cli?id=configuration) that
`node-pg-migrate` accepts. E.g.:

```bash
$ npm run migrate -- --schema "my_non_public_schema" --create-schema true
```

## Database Client

This library has a built-in database client that handles all data persistence
and fetching from your `DATABASE_URL`. It's built on top of
[Slonik](https://github.com/gajus/slonik) to give us some type safety around our
data. (This is more of an FYI. There's not really anything you can do with it as
a library user).

## Background Worker

This library uses [Graphile Worker](https://github.com/graphile/worker) in the
background to handle syncing between the database and the OpenAP API. These can
take some time on occasion and this helps make sure that there's no lost data or
things don't fall out of sync in the middle of a request.

This will also create its own schema `graphile_worker` to manage its jobs, runs,
etc.
