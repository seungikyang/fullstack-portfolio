// JavaScript 기초 문법과 DOM 조작을 연습하는 파일
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
const todos = [];

welcomeButton.addEventListener("click", () => {
  const name = "____"; // 빈칸 1. 입력창의 값을 읽어오세요.

  if (name === "") {
    welcomeMessage.textContent = "이름을 입력하면 맞춤 메시지를 보여줄게요.";
    return;
  }

  welcomeMessage.textContent = `안녕하세요, ${name}님. JavaScript 공부를 시작합니다.`;
});

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

calculateButton.addEventListener("click", () => {
  const firstNumber = Number(firstNumberInput.value);
  const secondNumber = Number(secondNumberInput.value);
  const operator = operatorSelect.value;
  const result = calculate(firstNumber, operator, secondNumber);

  calculateResult.textContent = `결과는 ${result}입니다.`;
});

function renderTodos() {
  todoList.innerHTML = "";

  for (const todo of todos) {
    const item = document.createElement("____"); // 빈칸 6. 목록 태그 이름을 넣으세요.
    item.textContent = todo;
    todoList.append(item);
  }
}

todoButton.addEventListener("click", () => {
  const todo = todoInput.value.trim();

  if (todo === "") {
    return;
  }

  todos.push("____"); // 빈칸 7. 입력한 할 일을 배열에 넣으세요.
  todoInput.value = "";
  renderTodos();
});

