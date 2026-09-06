// Note Hub React 진입 파일.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";
import "./styles.css";

// index.html에 React가 들어갈 #root가 없으면 조용한 빈 화면 대신 명확히 실패한다.
const container = document.getElementById("root");
if (!container) {
  throw new Error("#root not found");
}

// StrictMode는 개발 중 컴포넌트의 안전하지 않은 부수 효과를 찾는 데 도움을 준다.
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
