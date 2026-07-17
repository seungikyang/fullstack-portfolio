---
name: portfolio-doc-standards
description: Career Hub 포트폴리오의 README.md, learning-map.md, resume-assets.md, submission-checklist.md를 채용 제출 기준으로 다듬는 문서 작성 규칙. portfolio-doc-editor 에이전트가 문서를 수정할 때, si-job-fit-coach가 면접 답안을 README에 반영할 때 반드시 이 스킬을 참조하라.
---

# portfolio-doc-standards — 포트폴리오 문서 표준

채용 담당자·면접관이 GitHub README를 30초 안에 훑어보고 "이 사람과 면접하고 싶다"고 결정하게 만드는 문서 작성 규칙.

## 사용 시점

- portfolio-doc-editor가 문서를 동기화하거나 다듬을 때
- si-job-fit-coach의 면접 답안을 README에 반영할 때
- resume-assets.md를 작성·갱신할 때

## 핵심 원칙

### 1. "검증 가능한 진술"만 남긴다

면접관은 문서를 읽으면서 "그거 어디 있어요?"를 묻습니다. 답할 수 있는 진술만 남깁니다.

| 좋은 진술 | 나쁜 진술 |
|----------|----------|
| "JWT 만료 2시간, bcrypt work factor 10" | "안전하게 인증을 구현" |
| "Vitest 32개 + supertest 12개 통과" | "충분한 테스트 작성" |
| "멀티 스테이지 Dockerfile로 최종 이미지 약 180MB" | "도커로 배포 가능" |
| "X-Request-Id 헤더로 요청 추적" | "꼼꼼한 로깅" |

### 2. 코드 근거를 인용한다

문서가 코드의 어디를 가리키는지 명시한다.

```markdown
- 저장소 분리: `server/data-store.js` — 라우터(`server/index.js`)는 이 함수만 호출
- JWT 만료: `server/auth.js`의 `TOKEN_EXPIRES_IN = "2h"`와 `signToken`
```

### 3. 30초 스캔 가능한 구조

면접관은 README를 위에서부터 읽지 않습니다. 다음 위치에 핵심을 배치한다:

1. **첫 단락 (3줄):** 이게 뭔지, 누구를 위한 건지, 어떻게 실행하는지
2. **첫 코드 블록 (5줄):** 실행 명령어 (`cd / npm install / npm run dev`)
3. **첫 표:** API 요약 또는 기술 스택
4. **첫 데모 영역:** 기본 비활성 여부와 활성화 절차, 또는 실제 배포 URL

### 4. 신입 톤을 유지

"설계", "구축", "완성"보다 "직접 작성", "동작 확인", "다음 단계는"이 신입에게 자연스럽습니다.

## 파일별 작성 표준

### README.md (08-fullstack-portfolio-project/)

**필수 섹션 순서:**
1. 프로젝트 제목 + 한 줄 설명
2. 주요 기능 (불릿 7~12개, 검증 가능한 항목만)
3. 기술 스택 (불릿)
4. 필요 환경 + 실행 방법 (코드 블록)
5. 기본 실행과 선택형 데모 시드
6. 검증 방법 (`npm run lint/test/verify`)
7. 환경 변수 표
8. Docker로 실행
9. API 요약 표
10. 면접에서 설명할 포인트 (Q&A 6~8개)
11. 다음 개선 아이디어 (불릿 3~5개)

**API 요약 표 검증:**
실제 `server/index.js`의 라우터와 `server/openapi.json`의 경로가 모두 일치해야 합니다. 한 곳이라도 다르면 즉시 면접관이 알아챈다.

**면접 포인트 작성 가이드:**
- 질문은 SI 면접에서 실제로 나올 만한 표현으로
- 답안은 STAR 형식, 1~2 문단
- 답안 끝에 코드 파일 경로 1개 이상 인용
- 가능하면 Java/Spring 다리 한 줄 추가

### learning-map.md

**구조:**
1~7단계 각각에 대해 다음 표를 채운다:

```markdown
### N단계: 01-html-css → Career Hub 적용

| 학습 내용 | 적용 위치 | 면접 한 줄 |
|----------|----------|----------|
| 시맨틱 HTML | `src/App.jsx`의 `<main>`, `<section>` | 화면 구조를 시맨틱으로 짠 이유 |
| 반응형 그리드 | `src/styles.css:42` | 모바일 대응을 어떻게 했는지 |
```

**점검 항목:**
- 인용된 파일·라인이 실제 존재하는가?
- 학습 단계와 적용 위치가 의미 있게 연결되는가? (억지 연결 금지)
- 면접관이 이 표를 가리키며 "여기 어떻게 적용했어요?"라고 물을 때 답할 수 있는가?

### resume-assets.md

**문장 유형별 가이드:**

**A. 한 줄 자기소개 (50자 이내)**
> "Node·React·Docker로 SI 채용 포트폴리오를 만들고, JUnit/Spring으로 옮기는 작업을 진행 중인 신입 개발자입니다."

**B. 프로젝트 한 줄 요약 (60자 이내)**
> "Express + React Career Hub (JWT 인증, CRUD, Vitest·supertest, Docker, GitHub Actions)"

**C. 프로젝트 상세 (3~5 문장, 정량 + STAR 압축)**
> Career Hub는 SI 채용 지원자가 지원 현황과 포트폴리오를 관리하는 풀스택 미니 프로젝트입니다.
> React 19와 Express 5로 JWT 인증·CRUD·대시보드를 직접 작성했고, helmet/CSP/rate-limit으로 OWASP 기본 항목을 충족했습니다.
> Vitest·supertest 테스트와 API smoke test를 작성했으며, 최신 실행 로그가 있을 때 GitHub Actions의 format→lint→test→build→docker 검증 결과를 설명합니다.
> 멀티 스테이지 Dockerfile과 fly.io/Render 배포 매니페스트를 작성했고, 실제 배포 로그가 있을 때만 배포 경험으로 적습니다.
> 다음 단계는 JSON 저장소를 PostgreSQL Repository로 교체하고, 동일 기능을 Spring Boot로 재구현하는 것입니다.

**D. 기술 스택 한 줄 (80자 이내)**
> "Node.js, Express 5, React 19, JWT/bcrypt, pino, Vitest/supertest, ESLint/Prettier, Docker, GitHub Actions"

**E. 자기소개서용 STAR 문단 (200자 내외, 사용처별 5~7개 보관)**
- "팀 프로젝트에서 ~한 문제를 ~로 해결한 경험"
- "혼자 배운 ~을 실제 프로젝트의 ~에 적용한 경험"
- "막혔던 ~을 ~로 풀어낸 경험" (에러를 어떻게 읽었는지가 핵심)

### submission-checklist.md

**체크 항목 분류:**
1. **코드 품질** (lint, format, 빌드 통과)
2. **테스트** (단위, 통합, smoke 통과)
3. **문서** (README 4종 동기화, 기본 비활성 데모 시드와 선택형 실행 절차)
4. **GitHub** (.gitignore, 데이터 파일 제외, 커밋 메시지)
5. **이력서 자료** (resume-assets 최신화)
6. **데모 영상·스크린샷** (있다면)

각 항목은 명령어 또는 점검 절차로 검증 가능해야 한다.
```markdown
- [ ] `npm run verify` 통과 — format, lint, build, test, 제출 감사 자동화 범위
- [ ] `npm run clean:generated` 후 ZIP 압축 (node_modules 제외)
- [ ] 기본 `SEED_DEMO=false` 확인, 필요할 때만 `true`로 데모 로그인 확인
```

## 수정 작업 체크리스트

문서를 수정할 때마다 다음을 확인:

- [ ] 변경된 진술이 검증 가능한가? (코드·명령어로 확인 가능)
- [ ] 코드 근거 인용이 정확한가? (파일 존재 + 라인 일치)
- [ ] 신입 톤을 유지하는가? (과장·거창한 표현 X)
- [ ] 다른 문서와 모순되지 않는가? (특히 README ↔ learning-map)
- [ ] 1~7단계와 8번 포트폴리오 간 연결이 일관적인가?

## 금지 사항

- "완벽한", "최고의", "베스트 프랙티스" 같은 자기 평가어
- 검증 불가능한 형용사 ("꼼꼼히", "잘", "효율적으로")
- Java/Spring을 직접 사용했다는 거짓 진술 (이 프로젝트는 Node/Express)
- 의도 없이 복사한 README 템플릿 문구 ("This is a project")
- 한 줄에 너무 많은 정보 (한 문장 1주제)

## 동기화 검증 명령어 모음

수정 후 다음을 실행하여 코드-문서 일치를 확인:

```bash
cd 08-fullstack-portfolio-project

# API 요약 표 ↔ 실제 라우트
grep -E "app\.(get|post|patch|delete)" server/index.js

# 환경 변수 표 ↔ 실제 사용
grep -E "process\.env\." server/*.js scripts/*.js

# 기본 실행과 선택형 데모 시드
npm run dev   # 기본은 회원가입, 데모는 SEED_DEMO=true일 때만 확인

# 전체 동기화 게이트
npm run verify
```
