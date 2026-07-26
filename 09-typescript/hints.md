# 9단계 단계별 힌트

[단계 설명](./README.md) · [문제로 돌아가기](./problems.md) · [완료 체크](../student-checklist.md)

한 번에 모두 읽지 말고, 막힌 문제의 1단계부터 차례로 확인하세요.

## 1번. 기본 타입 붙이기

### 1단계. 개념 환기

- 함수 타입은 매개변수 타입과 반환 타입으로 구성됩니다.
- 옵셔널 매개변수는 값이 없을 수 있음을 표시합니다.
- 제네릭은 호출 시점까지 구체 타입을 보존합니다.

### 2단계. 접근 방향

- 함수 본문이 사용하는 연산을 보고 입력과 출력 타입을 먼저 추론하세요.
- `greet`의 suffix만 생략 가능하게 두고 나머지 문자열 타입은 명시하세요.
- `head`는 배열이 비었을 때 값을 반환하지 못한다는 점을 반환 타입에 반영하세요.

### 3단계. 시그니처 수준

```ts
function add(a: /* 숫자 타입 */, b: /* 숫자 타입 */): /* 반환 타입 */;
function greet(name: /* 문자열 */, suffix?: /* 문자열 */): /* 반환 타입 */;
function head<T>(items: /* T의 배열 */): /* T 또는 값 없음 */;
```

## 2번. 인터페이스 설계

### 1단계. 개념 환기

- 유니온 리터럴 타입은 허용할 문자열 값을 제한합니다.
- 인터페이스는 객체가 가져야 할 필드와 타입을 한곳에 정의합니다.

### 2단계. 접근 방향

- 먼저 역할 타입을 두 문자열 값의 유니온으로 만드세요.
- `User`의 각 필드에 실제 데이터 성격에 맞는 원시 타입 또는 역할 타입을 연결하세요.
- `createUser`의 반환 객체가 인터페이스를 만족하도록 반환 타입을 명시하세요.

### 3단계. 타입 형태 수준

```ts
type Role = /* 허용할 두 역할의 유니온 */;

interface User {
  id: /* 식별자 타입 */;
  email: /* 이메일 타입 */;
  name: /* 이름 타입 */;
  role: Role;
}

function createUser(email: string, name: string): User;
```

## 3번. React 컴포넌트 타입

### 1단계. 개념 환기

- props 타입에는 전달받는 데이터와 콜백의 매개변수·반환 타입이 모두 포함됩니다.
- 빈 배열만 초기값으로 주면 원소 타입을 충분히 추론하지 못할 수 있습니다.

### 2단계. 접근 방향

- Todo 데이터 타입과 TodoItem props 타입을 분리해 작성하세요.
- `onToggle`이 무엇을 받아 어떤 값을 반환하지 않는지 표현하세요.
- `useState` 제네릭에는 배열 전체의 타입을 넣으세요.

### 3단계. React 시그니처 수준

```tsx
interface TodoProps {
  todo: /* Todo 타입 */;
  onToggle: (id: /* Todo id 타입 */) => void;
}

function TodoItem(props: TodoProps) {
  // 기존 JSX
}

const [todos, setTodos] = useState</* Todo 배열 타입 */>([]);
```

## 4번. Express 라우터 타입

### 1단계. 개념 환기

- Express `Request` 제네릭은 URL 파라미터, 응답 body, 요청 body 같은 위치의 타입을 구분합니다.
- URL 파라미터는 HTTP에서 문자열로 전달됩니다.
- 성공 응답과 오류 응답은 서로 다른 객체 형태일 수 있습니다.

### 2단계. 접근 방향

- 게시글, id 파라미터, 생성 body, 오류 응답 타입을 각각 정의하세요.
- GET 단건 라우트의 응답을 게시글 또는 오류의 유니온으로 표현하세요.
- POST 라우트의 요청 body와 응답 body 자리를 제네릭 순서에 맞춰 채우세요.

### 3단계. Express 시그니처 수준

```ts
app.get(
  "/posts/:id",
  (req: Request<IdParams>, res: Response<Post | ErrorResponse>) => {},
);

app.post(
  "/posts",
  (req: Request<{}, Post, CreatePostBody>, res: Response<Post>) => {},
);
```

위 타입 이름을 starter의 인터페이스와 연결하고 구현 본문은 직접 완성하세요.

## 5번. 유니온과 좁히기

### 1단계. 개념 환기

- 원시 타입은 `typeof`, 클래스 인스턴스는 `instanceof`로 좁힐 수 있습니다.
- 모든 경우를 처리한 뒤 남은 타입이 `never`가 되면 누락된 분기를 컴파일러가 찾을 수 있습니다.

### 2단계. 접근 방향

- 입력 유니온을 문자열, 숫자, 날짜의 세 분기로 나누세요.
- 각 분기에서 결과가 항상 문자열인지 확인하세요.
- 마지막에 남은 값이 없다는 사실을 `never` 변수로 검사하세요.

### 3단계. 타입 가드 수준

```ts
function formatValue(value: string | number | Date): string {
  if (typeof value === /* 원시 타입 이름 */) {
    return /* 문자열 결과 */;
  }

  if (value instanceof /* 날짜 생성자 */) {
    return /* 날짜의 문자열 결과 */;
  }

  const exhaustive: never = value;
  return exhaustive;
}
```

## 6번. 제네릭 함수

### 1단계. 개념 환기

- `Promise<T>`는 비동기 작업이 완료되면 `T` 타입 값이 나온다는 뜻입니다.
- 제네릭 호출부가 지정한 타입은 함수의 반환 타입까지 이어져야 합니다.

### 2단계. 접근 방향

- 함수 이름 뒤에 타입 매개변수를 선언하세요.
- `res.json()` 결과를 그 타입으로 다루고 함수 반환 타입도 같은 타입으로 연결하세요.
- 호출부에서는 기대하는 응답 모델을 타입 인자로 넘기세요.

### 3단계. 제네릭 시그니처 수준

```ts
async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return /* res.json 결과를 T로 연결 */;
}

const value = await fetchJson</* 기대 응답 타입 */>("/api/path");
```

3단계까지 확인한 뒤에도 막히면 마지막으로 [정답 예시와 비교하세요](./answers.md).
