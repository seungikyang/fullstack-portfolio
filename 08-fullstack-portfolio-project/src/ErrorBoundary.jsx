// React 트리에서 발생한 예외를 잡아 흰 화면(white screen of death)을 방지하는 경계 컴포넌트.
// React 19 기준 클래스형 ErrorBoundary가 여전히 표준 방식이다.
import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    // error가 null이면 정상 화면, 값이 있으면 아래의 복구 안내 화면을 렌더링한다.
    this.state = { error: null };
  }

  // 자식 렌더링 중 예외가 발생하면 React가 호출해 다음 렌더링 상태를 정한다.
  static getDerivedStateFromError(error) {
    return { error };
  }

  // 화면을 바꾸는 역할과 별도로 오류 상세·컴포넌트 위치를 기록하는 생명주기 메서드다.
  componentDidCatch(error, info) {
    // 운영에서는 Sentry 같은 외부 수집기로 보내는 것이 일반적이다.
    // 학습용으로는 콘솔에만 출력한다.
    console.error("ErrorBoundary 잡음:", error, info);
  }

  // 오류 상태를 지워 자식 컴포넌트를 다시 렌더링해보는 버튼 동작이다.
  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    // 정상일 때는 ErrorBoundary 자신의 UI 없이 감싼 children을 그대로 보여준다.
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div
        role="alert"
        style={{
          maxWidth: "640px",
          margin: "80px auto",
          padding: "32px",
          border: "1px solid #ef4444",
          borderRadius: "12px",
          background: "#fef2f2",
          color: "#7f1d1d",
          fontFamily: "system-ui, sans-serif"
        }}
      >
        <h1 style={{ marginTop: 0 }}>화면을 표시하다가 오류가 발생했습니다</h1>
        <p>아래 메시지를 새로고침 후에도 같은 오류가 보이면 GitHub 이슈로 알려주세요.</p>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            background: "#fff",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #fecaca",
            color: "#991b1b"
          }}
        >
          {String(this.state.error?.message || this.state.error)}
        </pre>
        <button
          type="button"
          onClick={this.handleReset}
          style={{
            marginTop: "16px",
            padding: "10px 16px",
            background: "#dc2626",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }
}
