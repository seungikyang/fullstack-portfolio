# 5단계 문제

[단계 설명](./README.md) · [DB 요청 모음](./requests.http) · 학습 흐름. [문제](./problems.md) → [단계별 힌트](./hints.md) → [정답 비교](./answers.md) → [완료 체크](../student-checklist.md)

## 실습 파일 바로 열기

모델을 먼저 완성한 뒤 서버의 생성·수정·삭제 빈칸을 순서대로 채우세요.

- [Post 모델 실습 코드 보기](./src/models/Post.js?view=source)
- [서버 실습 코드 보기](./src/server.js?view=source)
- [DB 연결 코드 보기](./src/db.js?view=source)
- [DB 요청 코드 보기](./requests.http?view=source)

빈칸은 `src/models/Post.js`의 1번, 그다음 `src/server.js`의 2~8번 순서입니다.

## 문제 1. 모델 완성하고 이해하기 (Post.js · 빈칸 1)

`src/models/Post.js`의 `author` 기본값 빈칸을 채우세요. 작성자를 입력하지 않았을 때 쓸 이름입니다. (예: `"익명"`)

아래 4지선다 M01~M03에서 required·trim·timestamps의 역할을 확인하세요.

## 문제 2. 데이터 생성하기 (server.js · 빈칸 2, 3, 4)

`POST /posts`에서 요청 body의 `title`, `content`, `author`를 읽어 `Post.create`에 전달하세요. `author`가 없으면 기본값을 쓰도록 `req.body.author || "익명"` 형태로 넣습니다.

## 문제 3. 데이터 수정하기 (server.js · 빈칸 5, 6, 7)

`PUT /posts/:id`에서 요청 body 값으로 게시글의 `title`, `content`, `author`를 수정하세요.

## 문제 4. 데이터 삭제하기 (server.js · 빈칸 8)

`DELETE /posts/:id`에서 URL 파라미터의 id(`req.params.id`)로 게시글을 삭제하세요.

## 문제 5. 오류 읽기

MongoDB 연결 오류를 읽고 아래 4지선다 M04에서 적절한 점검 방법을 고르세요. 실제 연결 상태와 오류 메시지를 확인합니다.

<!-- written-choice:start -->
## 설명·개념 확인 — 4지선다

모델·연결 오류 설명 문제 · [웹에서 채점하기](../quiz/index.html?bank=written&category=database)

보기 네 개 중 하나를 선택하고 접힌 정답·해설을 확인하세요.

### M01. title의 required

title의 required — 알맞은 설명 또는 답변 방식을 고르세요.

1. 제목을 무조건 암호화한다.
2. 제목을 자동으로 영어로 번역한다.
3. 모든 조회를 O(1)로 만든다.
4. 제목이 없는 문서가 저장되지 않도록 필수값을 검사한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 4번**

required는 필수값 검증입니다. 형식·길이·권한은 요구에 맞춰 별도로 확인합니다.

</details>

### M02. 문자열 trim

문자열 trim — 알맞은 설명 또는 답변 방식을 고르세요.

1. 문자열 앞뒤 공백을 정리한다.
2. 문자열의 모든 내부 공백을 삭제한다.
3. 문자열을 해시로 바꾼다.
4. 입력을 SQL 구문으로 실행한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 1번**

trim은 앞뒤 공백 제거입니다. 문자열 내용의 모든 공백 제거 또는 보안 정화를 뜻하지 않습니다.

</details>

### M03. Mongoose timestamps

Mongoose timestamps — 알맞은 설명 또는 답변 방식을 고르세요.

1. 비밀번호 원문을 두 개 복제한다.
2. createdAt과 updatedAt을 관리한다.
3. 모든 테이블에 외래 키를 생성한다.
4. 브라우저의 화면 크기를 저장한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 2번**

timestamps 옵션은 생성·갱신 시각을 관리합니다. 실제 응답 필드와 모델 설정을 확인합니다.

</details>

### M04. MongoDB 연결 실패의 점검

MongoDB 연결 실패의 점검 — 알맞은 설명 또는 답변 방식을 고르세요.

1. 연결 오류가 나면 CSS 색상을 바꾼다.
2. 항상 모든 DB 데이터를 삭제한다.
3. 오류 유형을 보고 연결 주소·인증·네트워크·DB 실행 상태를 구분해 확인한다.
4. 비밀번호를 공개 저장소에 올려 해결한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 3번**

서로 다른 실패 원인을 구분해야 합니다. 연결 오류 메시지만으로 입력 코드의 모든 오류를 단정하지 않습니다.

</details>
<!-- written-choice:end -->
