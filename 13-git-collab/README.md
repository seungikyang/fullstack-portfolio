# 13단계 Git 협업

## 목표

혼자 쓰는 `add`, `commit`, `push`를 넘어 SI/SW 팀이 실제로 쓰는 협업 흐름을 익힙니다. 브랜치 전략, Pull Request, 충돌 해결, 리뷰 응대까지 다룹니다.

신입 채용에서 코드 실력보다 협업 매너로 먼저 떨어지는 경우가 많습니다. 이 단계는 그 매너의 기본을 만듭니다.

## 실행 방법

연습용 저장소를 GitHub에 하나 새로 만들고, 동일 저장소를 두 폴더에 클론해 "두 명이 협업하는 상황"을 흉내냅니다.

```bash
# 빈 저장소 하나 생성 (GitHub UI에서 생성 후)
git clone https://github.com/<your>/collab-practice.git ~/collab-practice-A
git clone https://github.com/<your>/collab-practice.git ~/collab-practice-B
```

A 폴더는 개발자 A의 작업 공간, B 폴더는 개발자 B의 작업 공간이라고 가정합니다.

## 완료 기준

- feature 브랜치를 만들어 main으로 PR을 올린 경험이 있습니다.
- 같은 줄을 두 브랜치가 동시에 수정한 충돌을 직접 해결했습니다.
- 한 번 이상 force push의 위험을 체감하고 안전한 대안(`--force-with-lease`)을 확인했습니다.
- `.gitignore`로 `.env`와 `node_modules`를 제외했습니다.
- 커밋 메시지를 의미 단위로 나눌 수 있다는 것을 직접 시연했습니다.

## 취업 연결

SI/SW 실무에서 Git은 다음과 같이 쓰입니다.

- main 브랜치는 운영에 배포되는 코드입니다. 직접 push 금지가 표준입니다.
- 기능 단위로 브랜치를 만들고 PR로 리뷰를 받습니다.
- 충돌은 "버그"가 아니라 "두 명이 같은 곳을 만진 신호"입니다.

이 단계가 끝나면 "main 보호, feature 브랜치, PR 리뷰, 충돌 해결까지 한 사이클을 경험했다"고 설명할 수 있어야 합니다.

## 핵심 개념

- 브랜치 모델. Git Flow, GitHub Flow, Trunk-based.
- 머지 vs 리베이스. 언제 어떤 것이 더 깔끔한가.
- 충돌(conflict)이 발생하는 정확한 조건.
- `--force-with-lease`가 `--force`보다 안전한 이유.
- `.gitignore`의 작동 원리.
- 커밋 메시지 규칙. Conventional Commits 또는 한국어 동사형.

## 면접 연습

- main 브랜치 보호가 왜 필요한가요?
- merge와 rebase 중 무엇을 언제 쓰나요?
- 같은 파일을 두 사람이 수정했는데 충돌이 안 났습니다. 왜 그럴까요?
- `git reset --hard`와 `git revert`의 차이를 설명해보세요.
- force push가 위험한 이유와 안전하게 대체하는 방법을 설명해보세요.
- 비밀번호가 들어간 파일을 실수로 커밋했습니다. 어떻게 대응하나요?
