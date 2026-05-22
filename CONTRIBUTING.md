# Contributing

이 저장소는 SI/SW 취업 준비용 풀스택 학습 워크북이자 포트폴리오입니다. 본인이 학습하면서 직접 수정하는 것이 기본이지만, 협업하거나 PR을 받는 상황을 가정한 흐름을 정리해 둡니다(면접에서 "협업 매너"를 묻는 질문에 답하기 위한 기록 역할도 합니다).

## 개발 환경

세 가지 중 편한 방법 한 가지를 고르세요.

1. **Dev Container / GitHub Codespaces (권장).** 루트 `.devcontainer/devcontainer.json` 기반. VS Code에서 "Reopen in Container"만 누르면 Node·JDK·Gradle·Docker가 동일 버전으로 준비됩니다. 코드 리뷰어/면접관 모두 같은 환경에서 재현 가능합니다.
2. **mise.** 로컬에서 도구 버전만 통일하고 싶을 때. `mise install`로 `mise.toml`의 모든 도구가 설치됩니다.
3. **직접 설치.** Node 22.12(또는 20.19), JDK 21. 루트 `.nvmrc`로 Node 버전이 고정됩니다 — `nvm use`로 맞출 수 있습니다.

OS 무관. 들여쓰기/줄바꿈은 `.editorconfig`로 통일됩니다.

## 작업 흐름

1. 이슈 또는 작업 단위를 정합니다.
2. `main`에서 새 브랜치를 만듭니다. 이름은 `feat/...`, `fix/...`, `docs/...` 형태로 짧게.
3. 작은 단위로 자주 커밋합니다. 메시지는 한 줄에 의도를 적습니다.
4. PR을 올리기 전에 변경한 영역에 해당하는 검증을 통과시킵니다.

   ```bash
   # 루트 (워크북 구조)
   npm run verify

   # 8번 포트폴리오 (lint + build + test + 제출 감사)
   cd 08-fullstack-portfolio-project
   npm run verify

   # monorepo-mini-app (lint + typecheck + test + build)
   cd monorepo-mini-app
   npm install && npm run build -w @note-hub/shared
   npm run lint && npm run typecheck && npm test && npm run build
   ```

5. PR 본문은 `.github/PULL_REQUEST_TEMPLATE.md` 양식을 따릅니다.

## 커밋 메시지 규칙

가벼운 형태의 Conventional Commits를 권장합니다.

```
feat: 지원 현황 필터 추가
fix: 로그인 401 응답 메시지 한국어로 통일
docs: README에 Docker 실행 안내 추가
test: validators의 partial=true 케이스 보강
chore: ESLint flat config로 마이그레이션
```

## 코드 스타일

- 새 파일 첫 줄에는 한국어 한 줄 주석으로 파일의 역할을 적습니다. 루트 `verify-workbook` 스크립트가 이를 검사합니다.
- ESLint와 Prettier 설정은 프로그램마다 별도로 둡니다(공유 설정 X). 작업하는 폴더의 `eslint.config.js`와 `.prettierrc.json`을 따릅니다.
  - 8번: `08-fullstack-portfolio-project/eslint.config.js` (JS, React)
  - 모노레포: `monorepo-mini-app/eslint.config.js` (typescript-eslint + React)
- 자동 정리: 각 폴더에서 `npm run lint:fix && npm run format`.

## 테스트 정책

- 서버: 새 엔드포인트나 검증 로직을 추가하면 `server/**/*.test.js`에 단위 테스트를 추가하고, supertest 통합 흐름이 영향을 받으면 `server/api.test.js`에 케이스를 더합니다.
- 프론트: 새 컴포넌트는 적어도 렌더 smoke 테스트를 작성합니다.
- 데이터 손실 위험이 있는 변경(데이터 마이그레이션, 저장소 스키마 변경)은 reviewer가 명시적으로 승인해야 합니다.

## PR 리뷰 가이드

- 변경 단위가 큰 PR은 작게 쪼개도록 정중히 요청합니다.
- 보안에 영향을 주는 변경(인증, CORS, CSP, 파일 업로드)은 적어도 두 명이 보고, 가능하면 [16-security/](./16-security/)의 항목 중 어디에 해당하는지 명시합니다.
- 기능 추가는 README와 학습 연결 문서([learning-map.md](./08-fullstack-portfolio-project/learning-map.md))에 한 줄이라도 반영합니다.

## 라이선스

기여하는 모든 코드는 루트 [LICENSE](./LICENSE)(MIT)에 따라 배포됨에 동의하는 것으로 간주합니다.
