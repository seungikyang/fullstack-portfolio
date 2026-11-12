# 1단계 정답 확인

[문제로 돌아가기](./problems.md) · [단계별 힌트로 돌아가기](./hints.md) · [완료 체크](../student-checklist.md) · [다음 단계](../02-javascript-basics/README.md)

먼저 직접 풀어본 뒤 확인하세요. 정답은 하나만 있는 것이 아니며, 아래 코드는 초보자가 안정적으로 통과할 수 있는 예시입니다.

## HTML 예시

```html
<title>홍길동의 자기소개</title>
<h1>안녕하세요, 저는 홍길동입니다.</h1>
<p class="intro">
  웹 개발 분야에 관심이 있고, SI/SW 개발자로 성장하고 싶습니다.
</p>
<img
  src="https://placehold.co/320x320?text=Profile"
  alt="홍길동의 프로필 이미지"
  class="profile-image"
/>
<p>
  저는 문제 해결을 좋아하고, 앞으로 사용자가 편하게 쓰는 웹서비스를 만들 수 있는
  개발자가 되고 싶습니다.
</p>
<a class="contact-link" href="mailto:study@example.com">연락하기</a>
```

## CSS 예시

```css
body {
  font-family: Arial, "Apple SD Gothic Neo", sans-serif;
}

.profile-card {
  display: flex;
  align-items: center;
}

.contact-link:hover {
  background: #1d4ed8;
}

.skill-grid {
  display: grid;
}

@media (max-width: 640px) {
  .profile-card {
    flex-direction: column;
  }
}
```

## 자기 점검 — 4지선다

먼저 보기 하나를 고르고 정답·해설을 확인하세요.

### H01. header·main·section을 나누는 이유

header·main·section을 나누는 이유 — 알맞은 설명 또는 답변 방식을 고르세요.

1. 문서의 역할과 내용 구조를 의미에 맞게 표현한다.
2. 브라우저 요청의 JWT를 자동 검증한다.
3. 모든 텍스트를 자동으로 데이터베이스에 저장한다.
4. 이미지 파일을 항상 압축한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 1번**

시맨틱 태그는 문서 구조를 표현합니다. 사용자와 보조 기술이 내용을 이해하는 데 도움을 줍니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W133)

### H02. 한 줄 정렬과 행·열 배치

한 줄 정렬과 행·열 배치 — 알맞은 설명 또는 답변 방식을 고르세요.

1. 둘은 데이터 저장 방식이다.
2. 한 방향 정렬은 Flexbox, 행과 열을 함께 설계하는 배치는 Grid가 적합할 수 있다.
3. Flexbox는 서버에만 사용할 수 있다.
4. Grid를 사용하면 반응형을 만들 수 없다.

<details>
<summary>정답·해설 확인</summary>

**정답: 2번**

배치 요구를 기준으로 선택합니다. 도구 이름만으로 어느 화면에도 같은 해답이 되지는 않습니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W134)

### H03. 모바일 레이아웃을 조정하는 이유

모바일 레이아웃을 조정하는 이유 — 알맞은 설명 또는 답변 방식을 고르세요.

1. 화면이 작으면 모든 사용자의 계정을 삭제해야 한다.
2. 모바일 브라우저는 HTML을 읽을 수 없다.
3. 좁은 화면에서도 내용을 읽고 버튼을 조작할 수 있도록 한다.
4. 모바일에서는 항상 1920px 폭을 강제해야 한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 3번**

콘텐츠와 조작 가능성을 유지하도록 배치와 크기를 조정합니다. 실제 작은 화면에서 확인합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W135)
