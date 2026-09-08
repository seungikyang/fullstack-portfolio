// 읽기 순서 2 · 문제 1~3: 화면 요소 선택 → fetch 요청 → 응답 렌더링
const API_BASE = "____"; // 빈칸 1. 같은 서버를 호출하려면 빈 문자열로 바꾸세요.

// 자주 사용하는 화면 요소를 한 번 찾아 두고, 이벤트와 렌더링에서 다시 사용합니다.
const postForm = document.querySelector("#postForm");
const titleInput = document.querySelector("#titleInput");
const authorInput = document.querySelector("#authorInput");
const contentInput = document.querySelector("#contentInput");
const postList = document.querySelector("#postList");
const refreshButton = document.querySelector("#refreshButton");

function formatDate(value) {
  return new Date(value).toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

// 함수 정의는 실행할 작업을 미리 준비합니다. 실제 첫 실행은 파일 맨 아래 loadPosts()에서 시작합니다.
function renderPosts(posts) {
  // fetch로 받은 목록을 화면에 다시 그리기 전에 이전 내용을 비웁니다.
  postList.innerHTML = "";

  for (const post of posts) {
    const article = document.createElement("article");
    article.className = "post-card";

    const title = document.createElement("h3");
    // 각 게시글마다 제목, 작성자·날짜, 본문 요소를 차례로 준비합니다.
    title.textContent = "____"; // 빈칸 2. post.title을 넣으세요.

    const meta = document.createElement("p");
    meta.className = "post-meta";
    meta.textContent = `작성자: ____ · 작성일: ____`; // 빈칸 3. 작성자와 날짜를 넣으세요.

    const content = document.createElement("p");
    content.textContent = post.content;

    article.append(title, meta, content);
    postList.append(article);
  }
}

async function loadPosts() {
  // 실행 순서: fetch로 GET 요청 → HTTP 응답 대기 → JSON 변환 → renderPosts 호출
  const response = await fetch(`${API_BASE}/api/posts`);
  const posts = await response.json();
  // 네트워크 작업이 끝난 뒤 받은 데이터를 화면 요소로 바꾸는 함수에 넘깁니다.
  renderPosts(posts);
}

postForm.addEventListener("submit", async (event) => {
  // 브라우저 기본 제출 대신 JavaScript가 API를 호출하므로 페이지 새로고침을 막습니다.
  event.preventDefault();

  const payload = {
    title: "____", // 빈칸 4. titleInput.value.trim()을 넣으세요.
    author: "____", // 빈칸 5. authorInput.value.trim()을 넣으세요.
    content: "____" // 빈칸 6. contentInput.value.trim()을 넣으세요.
  };

  // 객체를 JSON 문자열로 바꿔 서버에 보내고, 저장 응답이 올 때까지 기다립니다.
  await fetch(`${API_BASE}/api/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  // 저장이 끝난 뒤 입력 칸을 비우고 목록을 다시 받아 새 글이 포함된 화면을 그립니다.
  postForm.reset();
  await loadPosts();
});

// 새로고침 버튼도 같은 GET 요청 흐름을 다시 사용합니다.
refreshButton.addEventListener("click", loadPosts);

// 페이지에 처음 들어오면 여기서 loadPosts를 호출하며 실제 fetch 흐름이 시작됩니다.
loadPosts();
