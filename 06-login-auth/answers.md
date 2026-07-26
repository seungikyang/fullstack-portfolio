# 6단계 정답 확인

[문제로 돌아가기](./problems.md) · [단계별 힌트로 돌아가기](./hints.md) · [인증 요청 모음](./requests.http) · [완료 체크](../student-checklist.md) · [다음 단계](../07-project-deploy/README.md)

먼저 직접 풀어본 뒤 확인하세요. 로그인 기능에서는 "비밀번호를 안전하게 저장하는가"와 "보호된 API를 막는가"를 반드시 확인해야 합니다. 아래 번호는 코드 안의 `빈칸` 번호와 같습니다.

## 빈칸 1 (server.js · 비밀번호 해시)

```js
const passwordHash = await bcrypt.hash(password, 10);
```

## 빈칸 2 (server.js · 기본 이름)

```js
name: name || "학습자",
```

## 빈칸 3 (auth.js · 토큰 payload)

```js
email: user.email;
```

## 빈칸 4 (auth.js · Bearer 접두사 제거)

```js
const token = authHeader?.replace("Bearer ", "");
```

## 빈칸 5 (server.js · 로그인 비밀번호 검증)

```js
const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
```

## 자기 점검

- 회원가입 응답에 `passwordHash`가 보이면 안 됩니다.
- 같은 이메일로 다시 가입하면 409가 나와야 합니다.
- 틀린 비밀번호로 로그인하면 401이 나와야 합니다.
- 토큰 없이 `/me`를 호출하면 401이 나와야 합니다.
- 토큰을 넣고 `/me`를 호출하면 사용자 정보가 나와야 합니다.
