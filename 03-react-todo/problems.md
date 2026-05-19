# 3단계 문제

각 문제 번호는 코드 안의 `빈칸` 번호와 똑같습니다. `App.jsx`를 위에서 아래로 읽으면 빈칸이 1번부터 순서대로 나옵니다.

## 문제 1. 남은 할 일 개수 계산하기 (App.jsx · 빈칸 1)

완료되지 않은 Todo만 세어 `remainingCount`에 저장하세요.

힌트는 `todos.filter((todo) => !todo.done).length`입니다.

## 문제 2. 새 Todo 추가하기 (App.jsx · 빈칸 2)

`addTodo` 함수에서 빈 문자열로 둔 `title`을 입력값으로 바꾸세요.

- 앞뒤 공백을 제거해야 합니다. (`input.trim()`)
- 빈 문자열이면 추가하지 않아야 합니다. (이미 처리되어 있습니다)

## 문제 3. 완료 상태 바꾸기 (App.jsx · 빈칸 3)

`toggleTodo`에서 선택한 Todo의 `done` 값을 반대로 바꾸세요.

힌트는 `!todo.done`입니다.

## 문제 4. 입력값을 state에 저장하기 (App.jsx · 빈칸 4)

입력창의 `setInput("____")` 부분을 실제 입력값으로 바꾸세요.

힌트는 이벤트 객체의 `event.target.value`입니다.

## 문제 5. 컴포넌트에 props 연결하기 (App.jsx · 빈칸 5, TodoItem.jsx · 빈칸 6)

- `App.jsx`에서 `onToggle`에 클릭한 Todo의 `id`를 넘기세요. (`todo.id`)
- `TodoItem.jsx`의 버튼 `onClick`이 부모에게서 받은 `onToggle`을 실행하도록 연결하세요.
