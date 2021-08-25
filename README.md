# OpenAP Inventory Manager

This is a set of two libraries to be used with [Next JS](https://nextjs.org) to
allow you to manage your company's inventory in
[OpenAP](https://www.openap.tv/). We generate two packages that are published
for use:

- A front-end library (`openap-inventory-manager-react`) which is a set of React
  UI components and styles.
- A server library (`openap-inventory-manager-server`) which is a set of GraphQL
  resolvers and schemas, a database client for persisting relevant data, and a
  background worker to handle syncing with OpenAP and your database.

## Requirements

- Nodejs >= 14
- PostgresQL >= 10
- Next JS >= 10
- Typescript >= 4
- Redux >= 4 (we recommend Redux Toolkit >= 1.4)

## Installation

To install the front-end lib:

```
$ npm install @viacomcbs/openap-inventory-manager-react
```

To install the server lib:

```
$ npm install @viacomcbs/openap-inventory-manager-server
```

For more details on how to use each package, importing components, etc., see the
respective READMEs:

- [README-REACT.md](README-REACT.md)
- [README-SERVER.md](README-SERVER.md)

## Quickstart

The easiest way to start is to use our Next.js template. It will create
everything you need to get up and running. The repo and instructions can be
found here:
[OpenAP Next JS Template](https://github.com/ViacomInc/with-openap-inventory-manager)

## Configuration

### Environment variables

There are certain ENV variables you need to set for these packages to work. You
can use tools like [dotenv-flow](https://github.com/kerimdzhanov/dotenv-flow) or
[direnv](https://direnv.net/) to handle this.

_All environments_

- `APP_URL` - The base url for this app when running.
- `LOG_LEVEL` - error, info, debug, silent.
- `DATABASE_URL` - The url of your database, e.g.,
  `postgres://user:pwd@host:port/my_database`
- `OPENAP_API_URL` - the base Open AP url for the env, e.g.,
  `https://api-uat.openap-acn.com/v1`
- `OPENAP_API_CLIENT_ID` - your Open AP client ID
- `OPENAP_API_USER_ID` - your env Open AP user id
- `OPENAP_API_PASSWORD` - your env Open AP password
- `OPENAP_API_CODE` - your env Open AP api code
- `OPENAP_API_GRANT_TYPE` - open ap api grant type. Usually: `password`
- `OPENAP_API_GRANT_SCOPE` - open ap api grant scope, e.g.,
  `openid OpenAPScopes mail uid orgid orgtype usertype`

### Setting up the Database

> **IMPORTANT**: We _highly_ recommend you run this migration command as part of
> your deploy pipeline so your `manager` schema is kept up to date after any
> library upgrades.

This library maintains it's own database tables it needs to function under it's
own DB Schema. It defaults to `manager`, but if you'd like to customize it, you
can set an env var: `OPENAP_SCHEMA`.

Once you've installed the library, you can run the DB migrations needed by:

```bash
./node_modules/.bin/openap-migrate-manager
```

If you'd like you can add it as a script to your `package.json`:

```json
...
  "scripts": {
    "migrate:manager": "openap-migrate-manager"
  },
...
```

And you can also pass a optional direction `-d` to the script to migrate up or
down (defaults to `up`). E.g.:

```bash
$ npm run migrate:manager -- -d down
```

## Development

We love pull requests! If you'd like to contribute to this project, please see
our [CONTRIBUTING.md](./CONTRIBUTING.md) guide.
