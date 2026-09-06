// Career Hub React 앱을 브라우저 DOM에 렌더링하는 진입 파일
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import "./styles.css";

// index.html의 #root 한 곳을 React가 관리하는 화면의 시작점으로 만든다.
createRoot(document.querySelector("#root")).render(
  // StrictMode는 개발 중 잘못된 부수 효과를 찾고, ErrorBoundary는 렌더링 예외를 대신 표시한다.
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
