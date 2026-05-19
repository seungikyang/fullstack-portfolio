// Todo 한 개의 표시와 완료 버튼을 담당하는 React 컴포넌트
export function TodoItem({ todo, onToggle }) {
  return (
    <li className={todo.done ? "todo-item is-done" : "todo-item"}>
      <span>{todo.title}</span>
      {/* 빈칸 6. 클릭하면 부모에게서 받은 onToggle 함수를 실행하세요. */}
      <button type="button" onClick={() => {}}>
        {todo.done ? "되돌리기" : "완료"}
      </button>
    </li>
  );
}
