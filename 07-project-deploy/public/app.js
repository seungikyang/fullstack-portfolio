// 미니 블로그 화면에서 API 호출과 게시글 렌더링을 담당하는 브라우저 스크립트
const API_BASE = "____"; // 빈칸 1. 같은 서버를 호출하려면 빈 문자열로 바꾸세요.

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

function renderPosts(posts) {
  postList.innerHTML = "";

  for (const post of posts) {
    const article = document.createElement("article");
    article.className = "post-card";

    const title = document.createElement("h3");
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
  const response = await fetch(`${API_BASE}/api/posts`);
  const posts = await response.json();
  renderPosts(posts);
}

postForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    title: "____", // 빈칸 4. titleInput.value.trim()을 넣으세요.
    author: "____", // 빈칸 5. authorInput.value.trim()을 넣으세요.
    content: "____" // 빈칸 6. contentInput.value.trim()을 넣으세요.
  };

  await fetch(`${API_BASE}/api/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  postForm.reset();
  await loadPosts();
});

refreshButton.addEventListener("click", loadPosts);

loadPosts();

