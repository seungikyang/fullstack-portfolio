# 3단계 정답 확인

[문제로 돌아가기](./problems.md) · [단계별 힌트로 돌아가기](./hints.md) · [완료 체크](../student-checklist.md) · [다음 단계](../04-node-board-api/README.md)

먼저 직접 풀어본 뒤 확인하세요. React에서는 화면에 보이는 값이 state에서 나온다는 감각을 잡는 것이 핵심입니다. 아래 번호는 코드 안의 `빈칸` 번호와 같습니다.

## 빈칸 1 (App.jsx · 남은 개수)

```jsx
const remainingCount = todos.filter((todo) => !todo.done).length;
```

## 빈칸 2 (App.jsx · 새 Todo title)

```jsx
const title = input.trim();
```

## 빈칸 3 (App.jsx · 완료 토글)

```jsx
done: !todo.done;
```

## 빈칸 4 (App.jsx · 입력값 저장)

```jsx
onChange={(event) => setInput(event.target.value)}
```

## 빈칸 5 (App.jsx · onToggle에 id 전달)

```jsx
onToggle={() => toggleTodo(todo.id)}
```

## 빈칸 6 (TodoItem.jsx · 버튼 클릭 연결)

```jsx
<button type="button" onClick={onToggle}>
  {todo.done ? "되돌리기" : "완료"}
</button>
```

## 자기 점검

- 입력창에 글자를 입력하면 화면에 글자가 그대로 보여야 합니다.
- 추가 버튼을 누르면 Todo가 목록에 생겨야 합니다.
- 완료 버튼을 누르면 취소선이 생기고 남은 개수가 줄어야 합니다.
- 되돌리기를 누르면 취소선이 사라지고 남은 개수가 늘어야 합니다.
