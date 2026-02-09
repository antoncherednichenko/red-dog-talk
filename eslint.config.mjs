import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/** @type {import("eslint").Linter.FlatConfig[]} */

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    ignores: ["node_modules/**"],
    rules: {
      "prettier/prettier": "warn",
    },
    plugins: {
      prettier: require("eslint-plugin-prettier"),
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
