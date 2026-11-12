// 화면 프로그램이 처음 시작되는 파일이다. 여기서 Career Hub 화면을 웹 페이지에 붙인다.
// 읽는 순서: 이 파일 → App.jsx(화면과 버튼 동작) → server/index.js(서버의 처리).
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import "./styles.css";

// index.html의 id="root"인 빈 칸을 찾고, 그 안에 React로 만든 화면을 표시한다.
// render는 '코드로 적은 화면을 실제 페이지에 그린다'는 뜻이다.
createRoot(document.querySelector("#root")).render(
  // StrictMode는 개발 중 실수를 찾도록 추가 검사를 한다.
  // ErrorBoundary는 화면을 그리다가 오류가 나면 오류 안내를 보여준다.
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
