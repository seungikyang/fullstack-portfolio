// Note Hub 모노레포 ESLint 10 flat config. TypeScript는 typescript-eslint, React Hooks는 별도 플러그인.
// 패키지별로 환경(node/browser)을 분리한다.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/coverage/**", "packages/web/src/test/**"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["packages/api/**/*.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node }
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      "no-console": "off"
    }
  },
  {
    files: ["packages/shared/**/*.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module"
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }]
    }
  },
  {
    files: ["packages/web/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser }
    },
    rules: {
      ...(reactHooks.configs.recommended?.rules ?? {}),
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }]
    }
  },
  {
    // 테스트 파일은 vi/import로 vitest 함수를 가져오므로 추가 globals 불필요.
    files: ["**/*.test.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser }
    }
  }
];
