// App 다음에 읽는 자식 컴포넌트입니다. Todo 한 개의 표시와 완료 버튼을 담당합니다.
export function TodoItem({ todo, onToggle }) {
  // 자식은 목록 상태를 직접 소유하지 않습니다. 받은 todo를 표시하고,
  // 사용자 행동이 생기면 onToggle로 부모에게 알려 상태 변경을 요청합니다.
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
