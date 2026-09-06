// Note Hub 모노레포 ESLint 10 flat config. TypeScript는 typescript-eslint, React Hooks는 별도 플러그인.
// 패키지별로 환경(node/browser)을 분리한다.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  {
    // 설치 패키지·빌드·테스트 결과는 직접 작성한 소스가 아니므로 검사하지 않는다.
    ignores: ["**/dist/**", "**/node_modules/**", "**/coverage/**", "packages/web/src/test/**"]
  },
  // JavaScript와 TypeScript의 기본 권장 규칙을 먼저 적용한다.
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // API는 Node 전역(process, Buffer 등)과 콘솔 로그를 사용할 수 있다.
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
    // shared는 브라우저·Node 어느 한쪽의 전역에 기대지 않는 순수 타입/함수 패키지다.
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
    // Web에는 브라우저 전역과 React Hooks 사용 규칙을 추가한다.
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
