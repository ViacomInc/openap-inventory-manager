# Contributing

> Before contributing, please read our [code of conduct](CODE_OF_CONDUCT.md).

When contributing to this repository, please first discuss the change you wish
to make via the issues, with the owners of this repository before making a
change.

Please note we have a code of conduct, please follow it in all your interactions
with the project.

## Setup

Make sure you have the correct version of Node installed. See the `.nvmrc` file
for the current version for the project.

```bash
git clone git@github.com:ViacomInc/openap-inventory-manager.git
cd openap-inventory-manager
npm install
```

Once you are setup, you may run any of the npm scripts available in the
`package.json`.

## Running Tests

You'll need to be running Postgres locally to be able to run the tests. The
current default settings are in the `DATABASE_URL` variable in the `.env.test`.
You can override your local settings by adding a `.env.test.local` file and
setting the variable there. `dotenv-flow` will do the rest for you.

To run the tests you may run any of the following commands:

```bash
# runs all tests
npm run test

# runs all tests with watch mode
npm run test:watch

# runs all tests with test coverage
npm run test:coverage
```

## Code Standards

**Linting**

We are mainly using `typescript-eslint` settings with a few overrides. See the
`.estlintrc.js` file for details.

**Formatting**

We are using [Prettier](https://prettier.io) for javascript style formatting.
Settings can be found in the `.prettierrc` file.

**Programming style**

Aside from trying to follow common Typescript best practices we have made an
effort to follow a functional programming approach in our codebase, please help
us continue with this pattern.

If you are new to Functional programming there is a lot of good documentation
out there, but a good introduction is Eric Elliott's Functional Programming
Series. You can start with
[What is Functional Programming](https://medium.com/javascript-scene/master-the-javascript-interview-what-is-functional-programming-7f218c68b3a0)
and the more in depth
[Composing Software](https://medium.com/javascript-scene/the-rise-and-fall-and-rise-of-functional-programming-composable-software-c2d91b424c8c#.2dfd6n6qe)
posts are really good.

If you'd like to take it to the next level, check out
[Professor Frisby's Mostly Adequate Guide to Functional Programming](https://mostly-adequate.gitbook.io/mostly-adequate-guide/).

## Pull Request Process

1. Fork it
2. Create your feature branch `git checkout -b feature/my-new-feature`
3. Commit your changes
4. Push to the branch `git push origin feature/my-new-feature`
5. Create a new
   [Pull Request](https://github.com/ViacomInc/openap-inventory-manager/compare)
6. Profit.

### Updating Documentation

Please update the respective README files with details of changes to
functionality, the interface, or code.
