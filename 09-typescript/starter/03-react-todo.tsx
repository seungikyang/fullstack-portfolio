// 3단계 Todo 컴포넌트를 TypeScript로 다시 작성하는 연습 파일

import { useState } from 'react';

// TODO: Todo 인터페이스에 id(string), text(string), done(boolean) 필드를 추가하세요.
interface Todo {
  id: ____;
  text: ____;
  done: ____;
}

// TODO: TodoItem이 받는 props 인터페이스를 정의하세요.
interface TodoItemProps {
  todo: ____;
  onToggle: (id: ____) => void;
}

function TodoItem({ todo, onToggle }: ____) {
  return (
    <li onClick={() => onToggle(todo.id)}>
      {todo.done ? '[x]' : '[ ]'} {todo.text}
    </li>
  );
}

export function TodoList() {
  // TODO: useState에 Todo[] 제네릭을 명시하세요.
  const [todos, setTodos] = useState<____>([]);

  function toggle(id: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }

  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={toggle} />
      ))}
    </ul>
  );
}
