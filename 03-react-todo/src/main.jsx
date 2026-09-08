// React 앱을 HTML의 root 요소에 연결하는 진입 파일
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./App.css";

// 이 파일은 연결만 담당합니다. 실제 학습 순서는 App.jsx의 컴포넌트 → state → 이벤트 → props입니다.
// HTML의 #root에 App 컴포넌트를 넣고, StrictMode로 개발 중 흔한 실수를 더 엄격하게 확인합니다.
createRoot(document.querySelector("#root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
