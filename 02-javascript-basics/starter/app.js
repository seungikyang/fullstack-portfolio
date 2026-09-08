// 학습 순서: DOM 요소 선택 → 이벤트 연결 → 함수 호출 → 목록 렌더링
// 준비. DOM은 브라우저가 HTML을 JavaScript로 다룰 수 있게 만든 구조입니다.
// querySelector는 CSS 선택자로 이 구조에서 읽거나 바꿀 요소를 찾습니다.
const nameInput = document.querySelector("#nameInput");
const welcomeButton = document.querySelector("#welcomeButton");
const welcomeMessage = document.querySelector("#welcomeMessage");

const firstNumberInput = document.querySelector("#firstNumber");
const secondNumberInput = document.querySelector("#secondNumber");
const operatorSelect = document.querySelector("#operator");
const calculateButton = document.querySelector("#calculateButton");
const calculateResult = document.querySelector("#calculateResult");

const todoInput = document.querySelector("#todoInput");
const todoButton = document.querySelector("#todoButton");
const todoList = document.querySelector("#todoList");
// 할 일 데이터는 배열에 보관하고, 뒤의 renderTodos 함수가 이 배열을 화면 목록으로 바꿉니다.
const todos = [];

// 문제 1. addEventListener는 click 이벤트가 생겼을 때 실행할 함수를 버튼에 연결합니다.
welcomeButton.addEventListener("click", () => {
  const name = "____"; // 빈칸 1. 입력창의 값을 읽어오세요.

  if (name === "") {
    welcomeMessage.textContent = "이름을 입력하면 맞춤 메시지를 보여줄게요.";
    return;
  }

  welcomeMessage.textContent = `안녕하세요, ${name}님. JavaScript 공부를 시작합니다.`;
});

// 문제 2. 계산 규칙을 함수로 분리하면 버튼 이벤트와 실제 계산 역할을 나눌 수 있습니다.
function calculate(firstNumber, operator, secondNumber) {
  if (operator === "+") {
    return "____"; // 빈칸 2. 두 숫자를 더한 값을 반환하세요.
  }

  if (operator === "-") {
    return "____"; // 빈칸 3. 두 숫자를 뺀 값을 반환하세요.
  }

  if (operator === "*") {
    return "____"; // 빈칸 4. 두 숫자를 곱한 값을 반환하세요.
  }

  if (operator === "/") {
    if (secondNumber === 0) {
      return "0으로 나눌 수 없습니다.";
    }

    return "____"; // 빈칸 5. 두 숫자를 나눈 값을 반환하세요.
  }

  return "알 수 없는 연산자입니다.";
}

// 버튼 이벤트 안에서 입력값을 숫자로 바꾸고, 위에서 만든 calculate 함수를 호출합니다.
calculateButton.addEventListener("click", () => {
  const firstNumber = Number(firstNumberInput.value);
  const secondNumber = Number(secondNumberInput.value);
  const operator = operatorSelect.value;
  const result = calculate(firstNumber, operator, secondNumber);

  calculateResult.textContent = `결과는 ${result}입니다.`;
});

// 문제 3. 렌더링은 데이터를 화면 요소로 바꾸는 작업입니다. 현재 배열을 기준으로 목록을 다시 만듭니다.
function renderTodos() {
  todoList.innerHTML = "";

  for (const todo of todos) {
    const item = document.createElement("____"); // 빈칸 6. 목록 태그 이름을 넣으세요.
    item.textContent = todo;
    todoList.append(item);
  }
}

// 마지막 이벤트에서는 입력 확인 → 배열에 추가 → renderTodos 호출 순서로 화면을 갱신합니다.
todoButton.addEventListener("click", () => {
  const todo = todoInput.value.trim();

  if (todo === "") {
    return;
  }

  todos.push("____"); // 빈칸 7. 입력한 할 일을 배열에 넣으세요.
  todoInput.value = "";
  renderTodos();
});
