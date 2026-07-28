# 13단계 Git 협업 문제 모음

[단계 설명](./README.md) · 학습 흐름. [문제](./problems.md) → [단계별 힌트](./hints.md) → [정답 비교](./answers.md) → [완료 체크](../student-checklist.md)

## 문제 진행 방식

이 단계는 별도 starter 코드가 없는 명령·협업형 문제입니다. 이 문서를 실행 지시서로 사용하고, 별도로 만든 A·B 연습 저장소에서 명령을 실행하세요.

각 문제는 실제 명령을 직접 실행하는 실습입니다. 결과 출력 또는 캡처를 `notes.md` 같은 메모에 남기세요. 막히면 `answers.md`와 비교합니다.

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

- 위 명령이 그냥 `--force`와 어떻게 다른지 한 줄로 메모.
- 다른 사람이 같은 브랜치를 push한 상태에서 둘을 각각 시도해 결과를 비교.

## 7번. 커밋 메시지 규칙 적용

다음 규칙 중 하나를 정해 일관되게 적용합니다.

- Conventional Commits. `feat:`, `fix:`, `refactor:`, `chore:` 접두어.
- 한국어 동사형. "auth 미들웨어 추가", "Post 수정 버그 수정".

같은 변경을 두 규칙으로 각각 적어보고 어느 쪽이 팀에서 읽기 편한지 메모하세요.

## 자가 점검

- PR 본문에 "무엇을, 왜, 어떻게 검증했는지"가 들어 있나요?
- 충돌을 해결할 때 어느 줄을 누가 마지막에 썼는지 의식했나요?
- `.env`, `node_modules`, `dist`, `.DS_Store`가 `.gitignore`에 들어 있나요?
