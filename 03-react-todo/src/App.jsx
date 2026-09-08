// Todo 목록의 상태와 화면 구성을 관리하는 React 컴포넌트
// 읽는 순서: 컴포넌트 → state → 이벤트 함수 → 입력 연결 → 자식 props
import { useState } from "react";
import { TodoItem } from "./components/TodoItem.jsx";

const starterTodos = [
  { id: 1, title: "HTML 구조 복습하기", done: true },
  { id: 2, title: "JavaScript 이벤트 다시 풀기", done: false }
];

// 컴포넌트는 화면 한 부분을 만드는 함수입니다. App은 Todo 화면 전체를 담당합니다.
export default function App() {
  // state는 화면에 영향을 주며 바뀔 수 있는 값입니다.
  // input은 입력 칸의 현재 값, todos는 화면에 그릴 Todo 목록입니다.
  // 상태가 바뀌면 App이 다시 실행되며, 그 결과에 맞춰 화면도 다시 그려집니다.
  const [input, setInput] = useState("");
  const [todos, setTodos] = useState(starterTodos);
  // 목록에서 계산할 수 있는 값은 별도 상태로 보관하지 않으면 서로 어긋날 위험이 줄어듭니다.
  const remainingCount = 0; // 빈칸 1. 완료되지 않은 Todo 개수를 계산하세요. (힌트: todos.filter)

  // 이벤트 처리 함수는 사용자 행동을 받아 state를 변경합니다.
  function addTodo(event) {
    // form의 기본 제출은 페이지를 새로고침하므로, React가 상태로 화면을 갱신하도록 막습니다.
    event.preventDefault();

    const title = ""; // 빈칸 2. input.trim() 값으로 바꾸세요.

    if (title === "") {
      return;
    }

    const nextTodo = {
      id: Date.now(),
      title,
      done: false
    };

    // 기존 배열을 직접 고치지 않고 새 배열을 전달해야 React가 상태 변경을 분명히 감지합니다.
    setTodos([...todos, nextTodo]);
    setInput("");
  }

  function toggleTodo(id) {
    // map으로 새 배열을 만들되, 선택되지 않은 항목은 그대로 두고 대상 항목만 새 객체로 만듭니다.
    const nextTodos = todos.map((todo) => {
      if (todo.id !== id) {
        return todo;
      }

      return {
        ...todo,
        done: false // 빈칸 3. 기존 done 값을 반대로 바꾸세요. (힌트: !todo.done)
      };
    });

    setTodos(nextTodos);
  }

  return (
    <main className="todo-shell">
      <section className="todo-panel">
        <p className="eyebrow">React State Practice</p>
        <h1>Todo 목록</h1>
        <p className="summary">남은 할 일 {remainingCount}개</p>

        {/* value와 onChange를 state에 연결하면 입력 이벤트가 화면 값으로 이어집니다. */}
        <form className="todo-form" onSubmit={addTodo}>
          {/* 문제 4 안내: setInput에 입력한 값을 전달하세요. 힌트는 event.target.value 입니다. */}
          <input
            value={input}
            onChange={(event) => setInput("____") /* 빈칸 4 */}
            placeholder="새 할 일을 입력하세요"
          />
          <button type="submit">추가</button>
        </form>

        <ul className="todo-list">
          {/* props는 부모가 자식 컴포넌트에 전달하는 값입니다. 여기서는 데이터와 이벤트 함수를 내려보냅니다. */}
          {todos.map((todo) => (
            /* 문제 5 안내: 클릭한 Todo의 id를 toggleTodo에 전달하세요. 힌트는 todo.id 입니다. */
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={() => toggleTodo("____") /* 빈칸 5 */}
            />
          ))}
        </ul>
      </section>
    </main>
  );
}
