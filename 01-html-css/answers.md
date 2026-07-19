# 1단계 정답 확인

[문제로 돌아가기](./problems.md) · [완료 체크](../student-checklist.md) · [다음 단계](../02-javascript-basics/README.md)

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

## 자기 점검

- `header`, `main`, `section`의 역할을 말할 수 있으면 통과입니다.
- flexbox는 프로필 카드, grid는 기술 카드 목록에 썼다고 설명할 수 있으면 통과입니다.
- 모바일에서 이미지와 글이 세로로 쌓여야 한다고 설명할 수 있으면 통과입니다.
