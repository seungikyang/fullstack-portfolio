---
name: job-hunt-preparation
description: SI/SW 신입 취업 준비를 총괄하는 오케스트레이터. "이력서 작성", "자기소개서", "지원 준비", "회사 리서치", "면접 일정", "모의 면접", "지원 결과 회고", "이력서 다시", "자소서 수정", "마감 다가오는데", "취업 우선순위", "회사 X 준비" 등을 요청하면 반드시 이 스킬을 사용하라. career-prep-strategist를 메인으로 사용하고 si-job-fit-coach·portfolio-doc-editor와 협업한다.
---

# job-hunt-preparation — 취업 준비 오케스트레이터

학습이 어느 정도 쌓이고 8번 포트폴리오가 동작하는 시점부터 실제 채용 절차를 준비할 때 사용하는 워크플로우.

## 언제 트리거되는가

- "이력서 처음 만들어줘", "이력서 한 줄 자기소개"
- "자기소개서 [문항]에 대해 쓰고 싶어"
- "회사 X 지원 준비", "회사 X 회사 리서치"
- "이번 주 취업 우선순위 뭐로 잡을까?"
- "모의 면접 진행해줘"
- "지원 결과 회고 작성"
- "마감 다가오는데 뭐부터 해야 해?"
- "Career Hub에 회사 지원 등록"

## 운영 모드: 하이브리드

- **Phase 0~1 (현황·우선순위):** career-prep-strategist 단독 — 사용자 학습 상태와 포트폴리오 상태 점검 후 우선순위 권장
- **Phase 2 (산출물 작성):** career-prep-strategist + si-job-fit-coach 협업
  - career-prep-strategist가 초안 작성
  - si-job-fit-coach가 기술 진술의 SI 톤·근거 강도 검수
- **Phase 3 (문서 일관성):** portfolio-doc-editor 자문 — 이력서 진술과 resume-assets.md가 어긋나지 않는지 확인
- **Phase 4 (모의 면접):** si-job-fit-coach 주도, career-prep-strategist 일정·회고 관리

모든 Agent 호출에 `model: "opus"` 명시.

## Phase 0: 컨텍스트 확인

진입 시:
1. `_workspace/job-hunt/`가 존재하는가?
   - 이력서·자소서 버전이 누적되었는가?
2. `_workspace/job-hunt/applications/`에 진행 중인 회사가 있는가?
3. 사용자 요청이 신규 산출물 작성인지 기존 갱신인지 판별
4. 학습 진행 상태(`_workspace/study/`)도 살짝 참조하여 어필 가능한 트랙이 무엇인지 파악

작업 디렉토리: 저장소 루트 (`_workspace/job-hunt/`)

## Phase 1: 우선순위 권장 (요청 시)

사용자가 "뭐부터 해야 해?"라고 하면 career-prep-strategist의 우선순위 알고리즘 실행:
1. 포트폴리오 `npm run verify` 통과 여부
2. 트랙 11(Spring) 진행
3. 트랙 15(CS 기초) 답안
4. 자소서 템플릿 확보
5. 지원 회사 리스트

각 항목의 현 상태와 권장 액션을 표로 제공.

## Phase 2: 산출물 작성

### 이력서 작성/갱신
1. career-prep-strategist가 초안 → `_workspace/job-hunt/resume_v{N}.md`
2. si-job-fit-coach가 기술 진술 검수 (코드 근거 정확한지, SI 톤인지)
3. portfolio-doc-editor가 resume-assets.md와 일치 여부 검증
4. 사용자 승인 후 PDF 변환 안내 (수동: 마크다운 → PDF 도구)

### 자소서 작성
1. 사용자에게 회사·문항·글자수 받기
2. career-prep-strategist가 STAR 압축 초안 → `_workspace/job-hunt/applications/{회사명}/cover-letter.md`
3. si-job-fit-coach가 기술 부분 검수
4. 사용자가 본인 톤으로 수정 → 최종 저장

### 회사 리서치
career-prep-strategist 단독 → `_workspace/job-hunt/applications/{회사명}/research.md` 표 작성

### 지원 트래킹
**다리(meta):** Career Hub의 application CRUD를 직접 사용. 사용자가 본인의 포트폴리오로 본인 지원을 관리 — 이것 자체가 면접 어필 포인트.

- Career Hub 실행 후 application 등록 안내
- 또는 `_workspace/job-hunt/applications-tracker.md`에 마크다운 표로 누적

## Phase 3: 일정 관리

`_workspace/job-hunt/schedule.md`에 주차별 일정 누적. 사용자가 "이번 주 일정 보여줘"라고 하면 이 파일에서 추출. 마감일 가까운 항목은 강조.

## Phase 4: 모의 면접

사용자 요청 시:
1. 회사·직무 정보 받기 (없으면 일반 SI 신입)
2. si-job-fit-coach가 `si-interview-patterns` 스킬의 카테고리에서 5~8개 질문 출제
3. 사용자 답변 받기 (1답변씩 인터랙티브)
4. 각 답변 후 피드백:
   - 강점 1개
   - 약점 1개
   - 코드 근거 인용 강도 (별 1~3개)
   - 개선 표현 예시 1개
5. 전체 세션 끝나면 종합 평가 → `_workspace/job-hunt/mock-interviews/{날짜}.md`

## Phase 5: 지원 결과 회고

사용자가 결과를 공유하면:
1. career-prep-strategist가 회고 템플릿 제공:
   - 무엇이 통했는가? (서류는 어떤 점이 어필되었을지 추정)
   - 무엇이 부족했는가? (어느 질문에서 막혔는지)
   - 다음 지원 개선 액션 3개
2. `_workspace/job-hunt/retros/{회사명}_{단계}.md`에 저장
3. 회고에서 발견된 부족점이 학습 우선순위에 영향이 있다면 `study-progress`로 인계 (예: "Spring 답변이 약했다" → 트랙 11 학습 우선)

## Phase 6: 피드백 수집

세션 종료 시 한 번 묻는다:
- "이번에 만든 자료가 도움이 되었나요? 다음에 보강할 부분이 있을까요?"

피드백은 `_workspace/job-hunt/feedback.md`에 누적.

## 데이터 전달 규칙

- 모든 중간 산출물: `_workspace/job-hunt/`
- 디렉토리 구조:
  ```
  _workspace/job-hunt/
  ├── resume_v1.md, resume_v2.md   (이력서 버전)
  ├── applications/
  │   └── {회사명}/
  │       ├── research.md
  │       ├── cover-letter.md
  │       └── timeline.md
  ├── mock-interviews/{날짜}.md
  ├── retros/{회사명}_{단계}.md
  ├── schedule.md
  ├── applications-tracker.md
  └── feedback.md
  ```
- 이력서·자소서는 사용자 승인 후 최종본을 별도 위치(예: `이력서_2026.pdf`)로 export 가능 (수동 안내)

## 에러 핸들링

| 상황 | 처리 |
|------|------|
| 회사 정보 없음 | 일반 SI 신입 가정으로 진행, 정보 확보를 다음 액션 권장 |
| 사용자가 거짓 진술 시도 | 근거 부족 지적, 사실 기반 재작성 요청 |
| 모의 면접 중단 | 진행한 부분까지 저장, 다음에 이어서 |
| 학습 부족이 자소서 작성 막음 | `study-progress`로 인계, 트랙 학습 우선 권장 |
| 마감일 임박, 시간 부족 | 우선순위 알고리즘으로 최소 산출물만 작성 |

## 다른 허브와의 관계

- **study-progress와 인계:** 학습 부족이 발견되면 → study-progress로 이동, 보강 후 복귀
- **portfolio-improvement와 인계:** 포트폴리오 자체에 문제 있으면 → portfolio-improvement로 이동, 다듬은 후 복귀
- 각 허브의 `_workspace/`를 상호 참조하여 일관성 유지

## 테스트 시나리오

### 정상 흐름: 회사 X 자소서 작성
1. 사용자: "회사 ABC SI에 자소서 작성. 문항: 지원 동기 (400자)"
2. Phase 0: 신규 회사 → `_workspace/job-hunt/applications/ABC-SI/` 생성
3. Phase 1: 우선순위 점검 생략 (직접 산출물 요청)
4. Phase 2: career-prep-strategist 초안 → si-job-fit-coach 검수 → 사용자 톤 조정
5. Phase 3: schedule.md에 마감일 추가
6. Phase 6: 피드백 수집

### 에러 흐름: 모의 면접 중 학습 부족 발견
1. 사용자: "모의 면접 해줘"
2. Phase 4: si-job-fit-coach가 트랜잭션 격리 수준 질문 → 사용자 답 막힘
3. 시스템이 "트랙 11 또는 트랙 10 학습 보강 필요" 권장 → `study-progress`로 인계 제안
4. 사용자 동의 시 모의 면접 일시 중단, 학습 후 복귀

### 부분 재실행: 이력서 한 줄만 다시
1. 사용자: "이력서 첫 줄 자기소개만 다시 다듬어줘"
2. Phase 0: `resume_v2.md` 존재 확인
3. Phase 2: career-prep-strategist가 해당 라인만 수정 → `resume_v3.md` 저장
4. 다른 부분은 건드리지 않음
