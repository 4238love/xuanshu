import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "**/*.backup",
    "app/**/*-old.tsx",
    "tests/test-*.js",
    "eslint-report.json",
  ]),
  {
    files: [
      "lib/bazi/**/*.ts",
      "lib/liuyao/**/*.ts",
      "lib/meihua/**/*.ts",
      "lib/daliuren/**/*.ts",
      "lib/qimen/**/*.ts",
      "lib/ziwei/**/*.ts",
      "lib/utils/common.ts",
      "lunar.d.ts",
    ],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "prefer-const": "off",
    },
  },
]);

export default eslintConfig;
