# 13단계 Git 협업 정답 예시

[문제로 돌아가기](./problems.md) · [완료 체크](../student-checklist.md) · [다음 단계](../14-docker-deploy/README.md)

각 문제는 명령 자체보다 "왜 그 명령을 쓰는가"를 설명할 수 있어야 합니다.

## 1번 정답 예시

```bash
git checkout -b feat/add-readme
# README.md 한 줄 수정
git add README.md
git commit -m "README 소개 문구 추가"
git push -u origin feat/add-readme
# GitHub UI에서 Compare & pull request → Create pull request
```

설명. 첫 push에서 `-u`(`--set-upstream`)를 쓰면 이후 `git push`, `git pull`이 인자 없이도 동작합니다.

## 2번 정답 예시

설정 후 직접 push 시도 시 다음과 같은 에러가 나옵니다.

```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: At least 1 approving review is required by reviewers with write access.
To github.com:<your>/collab-practice.git
 ! [remote rejected] main -> main (protected branch hook declined)
```

설명. 보호 설정은 신입이 실수로 main을 망가뜨릴 가능성을 차단합니다.

## 3번 정답 예시

```bash
# B 작업 공간
git fetch origin
git rebase origin/main

# 충돌 파일 열기
# <<<<<<< HEAD
# B가 고침
# =======
# A가 고침
# >>>>>>> origin/main
# 두 라인을 합치거나 하나만 남깁니다.

git add README.md
git rebase --continue
git push --force-with-lease
```

설명. `rebase` 대신 `merge`로 해결해도 무방합니다. 다만 PR이 머지된 뒤 history가 직선이기를 원하면 rebase가 보기 좋습니다.

## 4번 정답 예시

```bash
git rm --cached .env
git commit -m ".env 추적 해제"
git push
```

추가 설명.

- `git rm --cached`는 워킹 디렉토리의 파일은 그대로 두고 인덱스에서만 삭제합니다.
- 이미 원격에 푸시됐다면 비밀은 노출된 것으로 간주합니다. GitHub의 secret scanning이 잡았다면 즉시 토큰을 무효화하세요.
- 과거 히스토리에서까지 지우고 싶다면 `git filter-repo`가 필요한데, 강제 푸시가 발생하므로 팀과 합의해야 합니다.

## 5번 정답 예시

```bash
git add -p
# 헝크별 y/n으로 선택
git commit -m "auth 미들웨어 추가"

git add -p
git commit -m "버튼 색 변경"

git add README.md
git commit -m "README 오타 수정"
```

설명. 한 커밋에 한 의도만 담아야 rollback과 cherry-pick이 안전합니다.

## 6번 정답 예시

- `--force`. 무조건 덮어씁니다. 다른 사람이 같은 브랜치에 push해놨다면 그 커밋이 사라집니다.
- `--force-with-lease`. 원격이 마지막으로 알고 있던 SHA와 다르면 push가 거부됩니다. "내가 마지막으로 본 원격 상태가 그대로일 때만 덮어쓰기"라는 안전 장치.

검증. 다른 사용자가 같은 브랜치에 push한 상태에서 `--force-with-lease`는 다음과 같이 실패합니다.

```
 ! [rejected]   feat/foo -> feat/foo (stale info)
```

## 7번 정답 예시

```bash
# Conventional Commits
git commit -m "feat(auth): JWT 미들웨어 추가"
git commit -m "fix(post): 빈 title로 POST 시 500이 떨어지던 문제 수정"

# 한국어 동사형
git commit -m "JWT 인증 미들웨어 추가"
git commit -m "POST 게시글 생성 시 title 검증 추가"
```

설명. 어떤 규칙이든 "팀 안에서 일관"이 핵심입니다. 신입은 팀 규칙을 따라가는 자세를 보이는 것이 점수에 더 좋습니다.

## 자주 막히는 부분

- `Updates were rejected because the tip of your current branch is behind`. 원격에 새 커밋이 있는 경우. `git pull --rebase` 후 다시 push.
- `Cannot pull with rebase: You have unstaged changes`. 변경사항을 commit 또는 stash로 정리한 뒤 다시 시도.
- main을 실수로 직접 만진 경우. `git switch -c hotfix/something`으로 새 브랜치를 만들고 main은 `git reset --hard origin/main`으로 되돌리세요. 단, **공유 환경에서는 reset --hard를 함부로 쓰지 마세요**.
- 비밀번호가 들어간 커밋을 만든 경우. push 전이면 `git reset --soft HEAD~1` 후 다시 커밋. push 후라면 노출로 간주하고 비밀 갱신 + filter-repo.

## 권장 .gitignore 항목 (Node 프로젝트 기준)

```
node_modules/
dist/
.env
.env.*
!.env.example
*.log
.DS_Store
coverage/
```

설명. `.env.example`은 형식만 적힌 빈 템플릿이므로 추적 유지가 일반적입니다.
