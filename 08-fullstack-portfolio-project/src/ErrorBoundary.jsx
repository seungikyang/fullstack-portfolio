// 화면을 그리다가 문제가 생겼을 때, 빈 화면 대신 오류와 '다시 시도' 버튼을 보여준다.
// 컴포넌트는 화면의 한 조각이다. 이 컴포넌트는 안쪽 화면을 감싸고 오류를 확인한다.
// 버튼의 비동기 요청 오류까지 모두 잡는 것은 아니므로, 요청 함수에는 별도의 try/catch가 있다.
import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    // null은 '오류 없음'이라는 뜻으로 쓴다. 오류가 들어오면 안내 화면으로 바뀐다.
    this.state = { error: null };
  }

  // 안쪽 화면을 그리다가 오류가 나면 React가 이 함수를 호출해 오류를 기억한다.
  static getDerivedStateFromError(error) {
    return { error };
  }

  // React가 오류 정보와 문제가 난 화면 위치를 알려주면 개발자가 볼 수 있게 기록한다.
  componentDidCatch(error, info) {
    // 이 앱에서는 브라우저 개발자 도구의 Console에 기록한다.
    console.error("ErrorBoundary 잡음:", error, info);
  }

  // '다시 시도'를 누르면 기억한 오류를 비우고 화면을 다시 그려본다.
  // 오류의 원인 자체를 고치는 것은 아니므로 같은 문제가 있으면 안내가 다시 나타난다.
  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    // children은 이 컴포넌트 안에 넣은 화면이다. 오류가 없으면 그 화면을 그대로 보여준다.
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
        <p>새로고침 후에도 같은 오류가 보이면 아래 메시지를 GitHub 이슈로 알려주세요.</p>
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
