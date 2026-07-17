---
name: portfolio-improvement
description: Career Hub 풀스택 포트폴리오(08-fullstack-portfolio-project)를 SI/Java-Spring 채용 제출용으로 다듬는 종합 개선 워크플로우. "포트폴리오 개선", "면접 준비 보강", "이력서 문장 다듬기", "코드·문서 동기화", "SI 적합성 점검", "다시 진단", "수정 실행", "submission 점검", "포트폴리오 다시", "Q&A 보강", "면접 답안", "리뷰", "리팩터" 등을 요청하면 반드시 이 스킬을 사용하라. 5인 전문가 팀(si-job-fit-coach, portfolio-doc-editor, code-quality-reviewer, test-coverage-analyst, qa-integration-checker)이 병렬 진단 후 사용자 승인 항목만 실제 수정한다.
---

# portfolio-improvement — 포트폴리오 종합 개선 오케스트레이터

Career Hub 포트폴리오(`08-fullstack-portfolio-project/`)를 SI/Java-Spring 채용 제출 기준으로 끌어올리는 5인 팀 워크플로우.

## 언제 트리거되는가

다음 표현이 등장하면 이 스킬을 호출한다:
- "포트폴리오를 더 좋게", "면접 준비 보강", "SI 적합성 점검", "리뷰 받기"
- "이력서 문장 다듬기", "resume-assets 개선", "README와 코드 동기화"
- "다시 진단", "이전 결과 기반으로 다시", "특정 부분만 다시"
- "submission-checklist 점검", "제출 전 검토", "면접 Q&A 보강"
- "코드 품질 점검", "테스트 누락", "OpenAPI 정합성"

단순 질문(예: "JWT가 뭐죠?")은 이 스킬 없이 직접 답한다.

## 운영 모드: 에이전트 팀 (하이브리드)

- **Phase 0~1 (컨텍스트·범위):** 메인 Codex가 직접 처리
- **Phase 2 (진단):** 에이전트 팀 — 5명이 병렬로 자기 영역 스캔
- **Phase 3 (통합 보고):** 에이전트 팀 — si-job-fit-coach가 리더로서 우선순위 보고서 작성
- **Phase 4 (사용자 승인):** 메인 Codex가 사용자와 대화
- **Phase 5 (수정 실행):** 에이전트 팀 — 승인된 항목만 담당 에이전트가 수정
- **Phase 6 (회귀 검증):** qa-integration-checker가 단독 검증

에이전트 호출 방식과 모델은 현재 Codex 런타임에서 제공되는 설정을 사용한다. 저장소에 특정 모델명을 고정하지 않는다.

## Phase 0: 컨텍스트 확인

워크플로우 진입 시 가장 먼저 다음을 점검한다:

1. 작업 디렉토리에 `_workspace/`가 존재하는가?
2. 존재한다면 사용자 요청 분석:
   - **부분 재실행:** "면접 Q&A만 다시", "README만", "보안 부분만" → 해당 에이전트만 호출 + 기존 `_workspace/` 유지
   - **새 실행:** "처음부터 다시", "전체 다시" → 기존 `_workspace/`를 `_workspace_prev/`로 이동 후 시작
   - **이어서 실행:** "승인된 항목 수정 실행" → 가장 최근 `_workspace/04_priority_report.md`의 승인 항목을 읽어 Phase 5부터 시작
3. 존재하지 않으면 **초기 실행**으로 Phase 1부터 시작

`_workspace/`는 `08-fullstack-portfolio-project/_workspace/`에 생성한다. (포트폴리오 루트가 아닌 포트폴리오 폴더 내부)

## Phase 1: 범위 확인

사용자에게 다음 중 어떤 범위인지 확인한다 (이미 명확하면 건너뜀):

| 범위 | 호출 에이전트 |
|------|--------------|
| 종합 진단 | 5명 모두 |
| SI 적합성 + 면접 Q&A | si-job-fit-coach + code-quality-reviewer (근거 보강) |
| 문서 동기화만 | portfolio-doc-editor + qa-integration-checker |
| 코드·테스트 점검만 | code-quality-reviewer + test-coverage-analyst + qa-integration-checker |

## Phase 2: 병렬 진단

선택된 에이전트들은 현재 런타임이 제공하는 위임 도구로 독립 작업을 배정한다. 병렬 실행이 가능하면 서로 겹치지 않는 읽기 전용 진단만 병렬화하고, 수정은 파일 소유권을 분리하거나 순차로 진행한다.

각 에이전트는:
1. 자기 영역만 분석
2. `_workspace/02_{agent}_findings.md`에 결과 저장
3. 다른 에이전트의 발견이 자기 영역과 겹치면 메시지로 협의

진단 산출물 파일명 규칙:
- `_workspace/02_si-fit_findings.md`
- `_workspace/02_doc-sync_findings.md`
- `_workspace/02_code-quality_findings.md`
- `_workspace/02_test-coverage_findings.md`
- `_workspace/02_qa-integration_findings.md`

## Phase 3: 통합 보고서 작성

si-job-fit-coach가 리더로서 다른 에이전트의 모든 발견을 종합한다.

산출물: `_workspace/04_priority_report.md`

구조:
```markdown
# Career Hub 포트폴리오 개선 진단 보고서

## 한 눈에 보기
- 강점 3개
- 약점 3개
- 제출 가능 여부: ✅ / ⚠️ 보강 필요 / ❌ 큰 작업 필요

## 항목별 우선순위 (체크박스 형태)
- [ ] **[높음/즉시]** [코드 품질] server/auth.js JWT 만료 누락 — 30분 작업
- [ ] **[높음/즉시]** [문서 동기화] README API 표와 실제 라우트 불일치 — 15분 작업
- [ ] **[중간]** [SI 적합성] data-store 동시성 설명 미흡 — 면접 답안 보강 1시간
- [ ] **[중간]** [테스트] 만료 JWT 테스트 누락 — 20분
- [ ] **[낮음]** [문서] resume-assets STAR 강화 — 30분

## 면접 Q&A 초안 (별도 파일)
👉 `_workspace/03_interview_qa.md` 참조
```

함께 생성:
- `_workspace/03_interview_qa.md` — si-job-fit-coach가 코드 근거가 있는 면접 Q&A 8개+

## Phase 4: 사용자 승인

메인 Codex가 `_workspace/04_priority_report.md`를 사용자에게 보여주고 묻는다:

> 다음 항목을 실제로 수정할까요? (체크박스로 선택 가능)

사용자가 선택한 항목만 Phase 5로 진행한다. "전부 좋다"라고 해도 보안 위험 외에는 한 번에 다 수정하지 말고, **3~5개 묶음 단위**로 끊어 진행한다 (한 번에 너무 많이 바꾸면 회귀 검증이 어렵다).

## Phase 5: 승인 항목 수정

승인된 항목을 영역별로 묶어 담당 에이전트에게 배정한다:
- 코드 수정 → code-quality-reviewer
- 테스트 추가 → test-coverage-analyst
- 문서 수정 → portfolio-doc-editor
- 면접 Q&A 보강 → si-job-fit-coach

각 에이전트는 수정 후 `_workspace/05_{agent}_edits_log.md`에 변경 요약을 남긴다.

**중요한 규칙:**
- 한 번에 한 에이전트씩 (병렬 X). 문서/코드가 같이 바뀌면 boundary가 깨질 수 있음.
- 각 수정 후 즉시 `npm run lint`와 `npm test`를 돌려 회귀 확인. 실패 시 해당 수정을 보고 후 다음 항목으로.
- 사용자가 명시적으로 허락하지 않은 파일은 절대 수정하지 않는다.

## Phase 6: 회귀 검증

모든 수정이 끝나면 qa-integration-checker를 단독으로 호출:
1. boundary 매트릭스 재검증
2. `_workspace/06_post-edit_qa.md`에 결과 저장
3. 새로 생긴 불일치가 있으면 사용자에게 보고하고 Phase 5로 돌아갈지 묻는다

마지막으로 다음을 사용자에게 안내:
```bash
cd 08-fullstack-portfolio-project
npm run verify   # CI와 동일한 게이트 재현
```

## Phase 7: 피드백 수집 & 변경 이력

작업 완료 후:
1. 사용자에게 "결과에서 개선할 부분이 있나요?" 한 번 묻는다 (강요 X)
2. 피드백이 있다면 다음 실행 시 반영하기 위해 `_workspace/07_user_feedback.md`에 기록
3. AGENTS.md의 변경 이력 테이블에 한 줄 추가 (날짜, 변경, 대상, 사유)

## 데이터 전달 규칙

- 모든 중간 산출물: `08-fullstack-portfolio-project/_workspace/`
- 파일명: `{phase}_{topic}.md` (예: `02_si-fit_findings.md`)
- 최종 산출물은 실제 프로젝트 파일에 직접 적용
- `_workspace/`는 `.gitignore`에 추가하도록 사용자에게 1회 안내

## 에러 핸들링

| 상황 | 처리 |
|------|------|
| 에이전트 1회 실패 | 1회 재시도, 재실패 시 해당 항목 누락 표시 후 다음 진행 |
| 두 에이전트의 결론 상충 | 둘 다 보고서에 병기, "사용자 결정 필요" 표시 |
| `npm test` 실패 | 정적 분석으로 대체, 실행 불가 사유 보고서 상단에 명시 |
| 백그라운드 서버 기동 실패 | qa-integration-checker가 정적 비교만 수행 |
| 사용자가 위험한 수정 거부 | 거부 사유를 `_workspace/07_user_feedback.md`에 기록 (다음 회 동일 권고 자제) |

## 팀 크기·실행 모드 요약

- 팀 크기: 5명 (medium scale)
- 평균 작업/팀원: 4~6개
- 통신: 현재 런타임의 작업 위임·메시지 기능 + 파일(`_workspace/`) 기록

## 테스트 시나리오

### 정상 흐름
1. 사용자: "포트폴리오 종합 점검해줘"
2. Phase 0: `_workspace/` 없음 → 초기 실행
3. Phase 1: 범위 = 종합 진단 (5명 모두)
4. Phase 2: 5명 병렬 진단, `_workspace/02_*_findings.md` 5개 생성
5. Phase 3: si-job-fit-coach가 `_workspace/04_priority_report.md` 작성
6. Phase 4: 사용자가 7개 항목 중 4개 승인
7. Phase 5: 4개 항목을 영역별로 묶어 순차 수정, 각 단계 후 lint/test 통과
8. Phase 6: qa-integration-checker boundary 재검증, 1개 새 불일치 발견 → 추가 1개 수정
9. Phase 7: 사용자 피드백 수집, AGENTS.md 변경 이력에 한 줄 기록

### 에러 흐름
1. 사용자: "이전 결과 기반으로 면접 Q&A만 다시"
2. Phase 0: `_workspace/` 존재, 부분 재실행 모드
3. Phase 2 건너뜀, si-job-fit-coach만 호출하여 `_workspace/03_interview_qa.md` 갱신
4. Phase 4: 사용자에게 새 Q&A 보여줌
5. Phase 5: 승인 항목 없음 (Q&A 파일은 이미 `_workspace/` 내라 별도 적용 안 함)
6. Phase 7: 피드백 수집
