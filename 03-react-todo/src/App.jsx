// Todo 목록의 상태와 화면 구성을 관리하는 React 컴포넌트
import { useState } from "react";
import { TodoItem } from "./components/TodoItem.jsx";

const starterTodos = [
  { id: 1, title: "HTML 구조 복습하기", done: true },
  { id: 2, title: "JavaScript 이벤트 다시 풀기", done: false }
];

export default function App() {
  const [input, setInput] = useState("");
  const [todos, setTodos] = useState(starterTodos);
  const remainingCount = 0; // 빈칸 1. 완료되지 않은 Todo 개수를 계산하세요. (힌트: todos.filter)

  function addTodo(event) {
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

    setTodos([...todos, nextTodo]);
    setInput("");
  }

  function toggleTodo(id) {
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

