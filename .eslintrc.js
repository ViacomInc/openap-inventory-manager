module.exports = {
  plugins: ["@typescript-eslint", "graphql", "react"],
  overrides: [
    {
      env: {
        browser: true,
        es6: true,
        node: true,
      },
      files: ["tests/**/*.ts"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./tsconfig.jest.json",
      },
    },
    {
      env: {
        browser: true,
        es6: true,
        node: true,
      },
      files: ["src/**/*.ts", "src/**/*.tsx"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./tsconfig.json",
      },
      extends: [
        "plugin:react/recommended",
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "prettier",
        "plugin:prettier/recommended",
      ],
      // todo: remove in the future, it will autodetect
      settings: {
        react: {
          version: "detect",
        },
      },
      rules: {
        "@typescript-eslint/camelcase": "off",
        "@typescript-eslint/consistent-type-assertions": "error",
        "@typescript-eslint/no-array-constructor": "error",
        "@typescript-eslint/no-empty-function": "error",
        "@typescript-eslint/no-empty-interface": "error",
        "@typescript-eslint/no-inferrable-types": "error",
        "@typescript-eslint/no-misused-new": "error",
        "@typescript-eslint/no-namespace": "error",
        "@typescript-eslint/no-this-alias": "error",
        "@typescript-eslint/no-unused-vars": [
          "error",
          {
            varsIgnorePattern: "^_",
            argsIgnorePattern: "^_",
            ignoreRestSiblings: true,
          },
        ],
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-var-requires": "error",
        "@typescript-eslint/prefer-namespace-keyword": "error",
        "@typescript-eslint/prefer-includes": "off",
        "@typescript-eslint/require-await": "off",
        "@typescript-eslint/triple-slash-reference": "error",
        "@typescript-eslint/type-annotation-spacing": "error",
        "@typescript-eslint/strict-boolean-expressions": "off",
        camelcase: "off",
        "no-console": ["error", { allow: ["warn", "error", "info"] }],
        "no-array-constructor": "off",
        "no-empty-function": "off",
        "no-unused-vars": "off",
        "no-use-before-define": "off",
        "no-var": "error",
        "prefer-const": "error",
        "prefer-rest-params": "error",
        "prefer-spread": "error",
        "react/prop-types": "off",
        "react/display-name": "off",
        eqeqeq: ["error", "smart"],
        "no-template-curly-in-string": "error",
        "no-else-return": "error",
        "consistent-return": "error",
      },
    },
    {
      env: {
        browser: true,
        es2020: true,
        node: true,
      },
      files: ["**/*.js"],
      extends: ["eslint:recommended", "plugin:prettier/recommended"],
      parserOptions: {
        sourceType: "module",
      },
      globals: {
        step: "readonly",
        gauge: "readonly",
        beforeSuite: "readonly",
        afterSuite: "readonly",
      },
    },
  ],
};
