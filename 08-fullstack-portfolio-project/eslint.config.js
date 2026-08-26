// Career Hub의 ESLint 10 flat config. 프론트엔드(React)와 백엔드(Node) 환경을 분리해 적용한다.
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**", "data/**"]
  },
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.browser
      }
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...(reactHooks.configs.recommended?.rules ?? {}),
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }]
    }
  },
  {
    files: ["server/**/*.js", "scripts/**/*.js", "vite.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node
      }
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off"
    }
  },
  {
    // 테스트 파일은 vitest 함수를 명시적으로 import하므로 별도 globals가 필요 없다.
    files: ["server/**/*.test.js", "tests/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node
      }
    }
  }
];
