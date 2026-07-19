# 6단계 문제

[단계 설명](./README.md) · [인증 요청 모음](./requests.http) · [막혔을 때 정답 비교](./answers.md) · [완료 체크](../student-checklist.md)

빈칸은 인증 흐름 순서대로 번호가 붙어 있습니다. 회원가입(`server.js` 빈칸 1, 2) → 토큰 발급/검증(`auth.js` 빈칸 3, 4) → 로그인(`server.js` 빈칸 5) 순서로 푸세요.

## 문제 1. 회원가입 완성하기 (server.js · 빈칸 1, 2)

- 빈칸 1: 사용자가 입력한 `password`를 `bcrypt.hash`로 해시하세요.
- 빈칸 2: 이름을 입력하지 않았을 때 사용할 기본 이름을 문자열로 넣으세요. (예: `"학습자"`)

## 문제 2. 토큰 payload 완성하기 (auth.js · 빈칸 3)

`signToken`의 JWT payload에 사용자의 `email`을 넣으세요. (`user.email`)

## 문제 3. Authorization 헤더 읽기 (auth.js · 빈칸 4)

`requireAuth`에서 `authHeader`의 `Bearer ` 접두사를 제거해 실제 토큰만 추출하세요.

힌트는 `authHeader?.replace("Bearer ", "")`입니다.

## 문제 4. 로그인 검증하기 (server.js · 빈칸 5)

로그인 코드의 `isPasswordValid` 값을 `bcrypt.compare` 결과로 바꾸세요. `bcrypt.compare`는 `await`가 필요합니다.

## 문제 5. 보호된 API 확인하기

`requests.http`를 사용해 `/me` 요청을 토큰 없이 보냈을 때와, 로그인으로 받은 토큰을 `Authorization: Bearer 토큰` 헤더에 넣어 보냈을 때 응답이 어떻게 달라지는지 확인하세요.
