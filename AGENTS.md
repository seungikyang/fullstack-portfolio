# AGENTS.md

이 저장소에서 Codex가 따라야 할 프로젝트 컨텍스트.

## 저장소 성격

이 저장소는 SI/SW 채용을 위한 풀스택 학습 워크북입니다. 17개 학습 트랙(`01-html-css` ~ `17-interview-prep`) + 제출용 포트폴리오(`08-fullstack-portfolio-project` Career Hub) + 모노레포 데모(`monorepo-mini-app`)로 구성됩니다.

작업할 때 반드시 인지할 점:

- 사용자는 신입 학습자이며, SI/Java-Spring 채용을 목표로 합니다.
- 빈칸·TODO·`____` 표시는 학습자가 직접 채우는 부분이라 함부로 채우지 않습니다.
- 코드 변경은 `08-fullstack-portfolio-project/` 내부에 한정되는 경우가 대부분이며, 다른 트랙은 학습 자료입니다.

## 3-허브 하네스

사용자의 채용 준비는 세 단계로 진행됩니다. 각 단계마다 전용 오케스트레이터 스킬이 트리거됩니다.

### Phase A — 공부 (`study-progress` 스킬)

**목적:** 트랙 1~17을 학습하고 빈칸·TODO를 직접 채우며 면접에서 자기 말로 설명할 수 있게 만든다.

**트리거:** "공부 시작", "이번 트랙 안내", "빈칸 봐줘", "에러 났어", "다음 트랙 추천", "answers 보기 전 힌트", "진도 확인", "이 코드 채웠는데 검토", "방금 배운 게 8번 어디 쓰여?"

**핵심 에이전트:** `learning-guide` (단계적 힌트 모델, 정답 즉공개 금지)
**산출물 위치:** `_workspace/study/`

### Phase B — 포트폴리오 (`portfolio-improvement` 스킬)

**목적:** Career Hub(`08-fullstack-portfolio-project/`)를 SI 채용 제출 기준으로 다듬는다.

**트리거:** "포트폴리오 개선·점검·리뷰", "면접 Q&A 보강", "SI 적합성 점검", "README/learning-map/resume-assets 동기화", "submission 점검", "코드 품질 점검", "테스트 누락", "OpenAPI 정합성"

**핵심 에이전트:** `si-job-fit-coach`(리더), `portfolio-doc-editor`, `code-quality-reviewer`, `test-coverage-analyst`, `qa-integration-checker`
**산출물 위치:** `08-fullstack-portfolio-project/_workspace/`

### Phase C — 취업 준비 (`job-hunt-preparation` 스킬)

**목적:** 이력서·자소서·지원 트래킹·일정·모의 면접·결과 회고를 진행한다.

**트리거:** "이력서 작성", "자기소개서", "회사 X 지원 준비", "이번 주 취업 우선순위", "모의 면접", "지원 결과 회고", "마감 다가오는데"

**핵심 에이전트:** `career-prep-strategist`(리더), `si-job-fit-coach`(기술 검수), `portfolio-doc-editor`(자료 일관성)
**산출물 위치:** `_workspace/job-hunt/`

## 허브 간 인계 규칙

세 허브는 서로 인계가 가능합니다:

- **공부 → 포트폴리오:** 트랙 학습 후 그 결과가 8번 포트폴리오에 반영되어야 할 때
- **공부 ↔ 취업:** 모의 면접 중 학습 부족 발견 시 → 공부로 인계, 보강 후 복귀
- **포트폴리오 ↔ 취업:** 자소서·이력서 작성 시 8번 포트폴리오 진술과 일치해야 할 때
- 각 허브의 `_workspace/`를 상호 참조하여 일관성 유지

## 단일 질문은 허브 없이

다음 같은 단발성 질문은 위 스킬을 호출하지 않고 직접 답합니다:

- "JWT가 뭐죠?", "ESLint 에러 해석", "이 명령어 뭔지" 같은 정보성 질문
- 코드 한 줄 설명, 라이브러리 비교 등

## 구성 요약

**에이전트 7명** (`.codex/agents/`).

- `learning-guide` — 트랙 학습 코치 (Phase A)
- `si-job-fit-coach` — SI 적합성·기술 면접 (Phase B 리더 + Phase C 기술 검수)
- `portfolio-doc-editor` — 포트폴리오 문서 동기화 (Phase B + Phase C 자료 일관성)
- `code-quality-reviewer` — OWASP·Express 약점 (Phase B)
- `test-coverage-analyst` — Vitest 누락 (Phase B)
- `qa-integration-checker` — 경계면 정합성 (Phase B)
- `career-prep-strategist` — 이력서·자소서·지원 전략 (Phase C 리더)

**스킬 5개** (`.agents/skills/`).

- `study-progress` — Phase A 오케스트레이터
- `portfolio-improvement` — Phase B 오케스트레이터
- `job-hunt-preparation` — Phase C 오케스트레이터
- `si-interview-patterns` — SI 면접 패턴 + Java/Spring 다리 참조
- `portfolio-doc-standards` — 포트폴리오 문서 표준

에이전트 호출 방식과 모델은 현재 Codex 런타임 설정을 따릅니다. 저장소 문서는 특정 모델명이나 제거된 팀 명령을 전제로 하지 않습니다.

## 작업 영역과 .gitignore 권장

세 허브가 사용하는 작업 폴더는 학습/지원 진행 기록이라 git에 올리지 않는 편이 좋습니다. 다음을 `.gitignore`에 추가 권장:

```
_workspace/
08-fullstack-portfolio-project/_workspace/
```

## 공통 작업 규칙

- 모든 작업은 `/Users/seungik.yang/Documents/fullstack` 루트에서 시작합니다. 수정 전에 `pwd -P`와 `git rev-parse --show-toplevel`이 같은지 확인하고, 명령별 `workdir`도 루트 또는 루트 아래의 명시적 하위 폴더만 사용합니다.
- 임시 복사본이나 별도 Git worktree에서 소스를 수정하지 않습니다. 런타임이 임시 작업 공간을 만든 경우 변경 파일과 커밋을 루트와 먼저 대조하고, 필요한 작업을 루트에 보존한 뒤 검증된 정확한 임시 경로만 정리합니다.
- 사용자가 명시적으로 허락하지 않은 파일은 수정하지 않습니다.
- 코드 수정 후에는 가능하면 `npm run lint`와 `npm test`(또는 `npm run verify`)로 회귀를 확인합니다.
- 문서를 수정할 때는 코드와의 일치(파일 경로, 라인, API 시그니처)를 우선합니다.
- 사용자의 학습 의도가 있는 영역(빈칸·TODO·`____`)은 채우지 않습니다.
- 모든 산출물은 신입 톤(거짓·과장 금지, 코드 근거 인용, STAR 형식)을 유지합니다.

## 변경 이력

| 날짜       | 변경 내용                               | 대상                                                                                                                                   | 사유                                                                                         |
| ---------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 2026-05-26 | 초기 구성                               | 전체 (에이전트 5 + 스킬 3)                                                                                                             | SI/Spring 채용 적합성 + 문서 동기화 중심 종합 개선 하네스 신규 구축                          |
| 2026-05-26 | 3-허브 구조로 확장                      | 에이전트 2 추가(learning-guide, career-prep-strategist), 스킬 2 추가(study-progress, job-hunt-preparation), si-job-fit-coach 범위 확장 | 사용자 요구: 루트 워크북 학습 → 포트폴리오 → 취업 준비 전 과정을 하나의 하네스로             |
| 2026-07-17 | 현재 Codex 구조와 취업 근거 기준 동기화 | 에이전트·스킬 하네스와 공개 문서                                                                                                       | 실제 경로·런타임에 맞추고 실행 명령·관찰 결과·해결 오류·코드 위치를 공통 근거로 사용         |
| 2026-07-19 | HTML 학습 동선과 검증 루프 완성         | 01~17단계 문서·Career Hub·루트 검증기                                                                                                  | 설명→문제→정답 비교→완료 체크→다음 단계를 연결하고 배포 CORS·HTTP 오류·OpenAPI 계약을 재검증 |
| 2026-07-24 | 폴더별 실행 지도와 취업 검증 루프 완성  | 01~17단계 실행 계약·Career Hub·Note Hub·HTML 목차·의존성                                                                               | 준비→실행→확인→취업 증거를 연결하고 접근 제어·API 계약·자동·브라우저 검증을 반복             |
| 2026-07-26 | 단계별 힌트와 배포 계약 완성 루프       | 01~17단계 힌트·학습 완료 계약·Career Hub·Note Hub·루트 작업 규칙                                                                       | 정답 전 힌트→106개 완료 조건→배포 경계 테스트→루트 자동·브라우저 재검증을 연결               |
| 2026-07-26 | Orca 실행 이력과 데이터 변환 중복 정리  | `history.html`·Note Hub shared/API/Web                                                                                                 | 공식 Orca 탭 생성 근거를 남기고 태그 정규화·PostgreSQL 행 변환의 동일 규칙을 한 곳으로 통합  |
