# 13단계 Git 협업 문제 모음

[단계 설명](./README.md) · 학습 흐름. [문제](./problems.md) → [단계별 힌트](./hints.md) → [정답 비교](./answers.md) → [완료 체크](../student-checklist.md)

## 문제 진행 방식

이 단계는 별도 starter 코드가 없는 명령·협업형 문제입니다. 이 문서를 실행 지시서로 사용하고, 별도로 만든 A·B 연습 저장소에서 명령을 실행하세요.

각 문제는 실제 명령을 직접 실행하는 실습입니다. 결과 출력 또는 캡처를 `notes.md` 같은 메모에 남기세요. 막히면 먼저 `hints.md`의 1~3단계를 순서대로 보고, 마지막에만 `answers.md`와 비교합니다.

## 1번. feature 브랜치 만들고 PR 올리기

A 작업 공간에서.

1. `git checkout -b feat/add-readme`로 새 브랜치 생성.
2. README.md를 한 줄 수정 후 커밋.
3. `git push -u origin feat/add-readme`로 원격에 올림.
4. GitHub에서 main으로 PR 생성.

검증. main 브랜치를 직접 수정하지 않고, PR을 통해서만 main에 반영됐는지 확인.

## 2번. main 브랜치 보호 설정

GitHub Repository Settings → Branches에서.

- main을 보호 브랜치로 지정.
- "Require a pull request before merging" 체크.
- "Require linear history" 체크 (선택).
- 직접 push가 막히는지 `git push origin main`으로 확인.

검증. 에러 메시지를 캡처하거나 그대로 옮겨 적으세요.

## 3번. 충돌 만들기와 해결하기

A와 B 두 작업 공간을 사용합니다.

1. A에서 `feat/edit-line` 브랜치를 만들고 README의 1번째 줄을 "A가 고침"으로 수정 후 커밋, push, PR 머지.
2. B에서 main을 pull하지 않은 채 `feat/edit-line-b` 브랜치를 만들고 같은 1번째 줄을 "B가 고침"으로 수정 후 커밋, push.
3. B가 PR을 올리면 충돌이 표시됩니다.
4. B의 작업 공간에서 다음으로 해결.
   ```bash
   git fetch origin
   git rebase origin/main
   # 충돌 파일 편집 후
   git add <file>
   git rebase --continue
   git push --force-with-lease
   ```

검증. PR이 머지 가능 상태로 바뀝니다.

## 4번. .gitignore 적용 시점 실수

```bash
echo "SECRET=abc" > .env
git add .env
git commit -m "실수로 .env 커밋"
echo ".env" > .gitignore
git add .gitignore
git commit -m ".gitignore 추가"
```

이 상태에서 `.env`는 여전히 추적됩니다. 다음 명령으로 추적을 해제하세요.

```bash
git rm --cached .env
git commit -m ".env 추적 해제"
```

추가로. 이미 GitHub에 푸시됐다면 비밀이 노출된 것입니다. 비밀번호와 토큰은 즉시 갱신해야 합니다.

검증. `git ls-files | grep .env`가 빈 결과를 반환해야 합니다.

## 5번. 의미 있는 커밋 분리

`starter/messy.diff`처럼 여러 파일을 한 번에 수정한 상황을 가정합니다.

- `git add -p`로 헝크(hunk) 단위로 골라 추가.
- 한 커밋은 한 가지 의도만 담도록 분리.

검증. `git log --oneline`이 "auth 추가", "버튼 색 변경", "README 오타 수정" 같은 세 개의 커밋으로 나뉘었는지 확인.

## 6번. 안전한 force push

```bash
git push --force-with-lease
```

- 아래 4지선다 G01에서 `--force`와의 차이를 고릅니다.
- 다른 사람이 같은 브랜치를 push한 상태에서 둘을 각각 시도해 결과를 비교.

## 7번. 커밋 메시지 규칙 적용

다음 규칙 중 하나를 정해 일관되게 적용합니다.

- Conventional Commits. `feat:`, `fix:`, `refactor:`, `chore:` 접두어.
- 한국어 동사형. "auth 미들웨어 추가", "Post 수정 버그 수정".

아래 4지선다 G02에서 읽기 좋은 커밋 메시지의 기준을 고르세요.

## 자가 점검 — 4지선다

보기 하나를 고르고 접힌 정답·해설을 확인하세요. 실제 실습 완료 여부는 실행 기록과 완료 체크에서 확인합니다.

### PS13-01. 검토자가 판단할 수 있는 PR 본문의 구성은?

검토자가 판단할 수 있는 PR 본문의 구성은? — 알맞은 설명 또는 답변 방식을 고르세요.

1. 해결한 문제·변경 후 동작·실행한 검증과 결과·필요한 한계
2. 제목 없이 바뀐 줄 수만
3. 실행하지 않은 테스트도 전부 통과했다고 선언
4. 코드와 관계없는 개인 계정의 비밀번호

<details>
<summary>정답·해설 확인</summary>

**정답: 1번**

검토자가 문제와 변화·검증 범위를 이해할 수 있어야 합니다. 실행한 검증과 실제 결과를 적고 확인하지 않은 부분을 구분합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W437)

### PS13-02. 충돌한 두 변경을 통합할 때 적절한 판단은?

충돌한 두 변경을 통합할 때 적절한 판단은? — 알맞은 설명 또는 답변 방식을 고르세요.

1. 마지막으로 작성한 줄이 언제나 업무적으로 옳으므로 나머지를 무조건 삭제한다.
2. 양쪽 변경의 목적과 관련 코드를 확인하고 필요한 동작을 보존해 통합한다.
3. 충돌 표시만 없으면 기능 검증은 필요 없다.
4. 충돌한 파일 전체를 비워 두면 두 변경이 모두 보존된다.

<details>
<summary>정답·해설 확인</summary>

**정답: 2번**

작성 시점만으로 변경의 정확성을 결정할 수 없습니다. 양쪽 목적과 현재 요구를 확인하고 통합 뒤 필요한 동작을 검증합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W438)

### PS13-03. .gitignore로 .env 등 공개 불필요 파일을 제외할 때 주의할 점은?

.gitignore로 .env 등 공개 불필요 파일을 제외할 때 주의할 점은? — 알맞은 설명 또는 답변 방식을 고르세요.

1. ignore에 적으면 과거 커밋에 노출된 비밀도 자동 폐기된다.
2. .gitignore는 로컬 파일의 내용을 암호화한다.
3. 규칙과 git status를 확인하며 이미 추적된 파일은 ignore 추가만으로 추적이 해제되지 않는다.
4. 이미 추적된 파일도 규칙 한 줄만 추가하면 과거 기록까지 모두 사라진다.

<details>
<summary>정답·해설 확인</summary>

**정답: 3번**

ignore는 주로 추적되지 않은 파일을 대상으로 합니다. 이미 노출된 비밀은 폐기·교체와 영향 확인이 필요하며 추적 해제와 이력 대응도 별도 작업입니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W439)

<!-- written-choice:start -->
## 설명·개념 확인 — 4지선다

Git 설명 문제 · [웹에서 채점하기](../quiz/index.html?bank=written&category=git)

보기 네 개 중 하나를 선택하고 접힌 정답·해설을 확인하세요.

### G01. force-with-lease와 force

force-with-lease와 force — 알맞은 설명 또는 답변 방식을 고르세요.

1. force-with-lease는 어떤 히스토리 변경도 하지 않는다.
2. force는 항상 다른 사람의 커밋을 보호한다.
3. 둘 모두 협의 없이 main을 덮어써도 안전하다.
4. force-with-lease는 기대한 원격 상태와 다르면 덮어쓰기를 거부할 수 있다.

<details>
<summary>정답·해설 확인</summary>

**정답: 4번**

lease는 원격 상태에 대한 조건을 검사합니다. 공유 브랜치 재작성의 안전성을 무조건 보장하지는 않습니다.

</details>

### G02. 읽기 좋은 커밋 메시지

읽기 좋은 커밋 메시지 — 알맞은 설명 또는 답변 방식을 고르세요.

1. 변경의 의도와 범위를 드러내고 팀 규칙을 일관되게 적용한다.
2. 한 커밋에 모든 무관한 변경을 숨긴다.
3. 메시지는 아무 글자여도 검토 비용이 항상 같다.
4. 접두어만 있으면 변경 설명은 필요 없다.

<details>
<summary>정답·해설 확인</summary>

**정답: 1번**

커밋은 한 가지 의도로 나누고 메시지로 변경 목적을 설명합니다. 언어보다 일관성과 구체성이 중요합니다.

</details>
<!-- written-choice:end -->
