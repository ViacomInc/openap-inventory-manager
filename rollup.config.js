import externals from "rollup-plugin-node-externals";
import inject from "@rollup/plugin-inject";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import graphql from "@rollup/plugin-graphql";
import typescript from "rollup-plugin-typescript2";
import copy from "rollup-plugin-copy";
import postcss from "rollup-plugin-postcss";
import json from "@rollup/plugin-json";
import analyze from "rollup-plugin-analyzer";
import generatePackageJson from "rollup-plugin-generate-package-json";

import autoprefixer from "autoprefixer";

const ANALYZE = false;
const analyzeFilter = ({ id }) => !id.startsWith("/node_modules");

const pkg = require("./package.json");

const reactPkg = `${pkg.name}-react`;
const serverPkg = `${pkg.name}-server`;

const bundleESModules = "react-linkify-it";

export default [
  {
    input: "src/index.graphql.ts",
    output: [
      {
        file: `${serverPkg}/index.js`,
        format: "cjs",
        sourcemap: true,
      },
    ],
    plugins: [
      externals({ exclude: bundleESModules }),
      typescript(),
      json(),
      graphql(),
      resolve(),
      commonjs(),
      generatePackageJson({
        baseContents: {
          name: serverPkg,
          description:
            "GraphQL resolvers and DB client for OpenAP Inventory Manager",
          bin: pkg.bin,
          license: pkg.license,
          version: pkg.version,
          author: pkg.author,
          repository: pkg.repository,
          private: pkg.private,
          main: "index.js",
          types: "index.graphql.d.ts",
          peerDependencies: pkg.peerDependenciesServer,
          directories: {
            migrations: "migrations",
            public: "public",
          },
        },
        additionalDependencies: {
          "node-pg-migrate": pkg.dependencies["node-pg-migrate"],
        },
      }),
      copy({
        targets: [
          { src: ["bin", "migrations", "public", "LICENSE"], dest: serverPkg },
          { src: "README-SERVER.md", dest: serverPkg, rename: "README.md" },
        ],
      }),
      ANALYZE &&
        analyze({
          filter: analyzeFilter,
        }),
    ],
  },
  {
    input: "src/index.app.ts",
    output: [
      {
        file: `${reactPkg}/index.js`,
        format: "cjs",
        sourcemap: true,
      },
    ],
    plugins: [
      externals({ exclude: bundleESModules }),
      typescript({
        outDir: "app",
      }),
      json(),
      graphql(),
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs(),
      inject({
        window: "global/window",
      }),
      postcss({
        extract: false,
        modules: true,
        namedExports: true,
        sourceMap: true,
        plugins: [autoprefixer()],
      }),
      generatePackageJson({
        baseContents: {
          name: reactPkg,
          description: "React UI for OpenAP Inventory Manager",
          peerDependencies: pkg.peerDependenciesClient,
          repository: pkg.repository,
          private: pkg.private,
          license: pkg.license,
          version: pkg.version,
          author: pkg.author,
          main: "index.js",
          types: "index.app.d.ts",
        },
      }),
      copy({
        targets: [
          { src: ["src/app/**/*.css", "LICENSE"], dest: reactPkg },
          { src: "README-REACT.md", dest: reactPkg, rename: "README.md" },
        ],
        flatten: false,
      }),
      ANALYZE &&
        analyze({
          showExports: true,
          filter: analyzeFilter,
        }),
    ],
  },
];
