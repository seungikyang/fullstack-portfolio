# 9단계 정답 예시

정답을 먼저 보지 마세요. 빈칸을 채우다 막혔을 때만 확인합니다.

## 1번 정답 예시

```ts
export function add(a: number, b: number): number {
  return a + b;
}

export function greet(name: string, suffix?: string): string {
  return suffix ? `${name} ${suffix}` : name;
}

export function head<T>(items: T[]): T | undefined {
  return items[0];
}
```

설명. `suffix?: string`은 옵셔널이라 호출자가 생략할 수 있습니다. `head<T>`는 제네릭이라 호출 시 `head([1,2,3])`은 `number | undefined`, `head(['a'])`는 `string | undefined`로 추론됩니다.

## 2번 정답 예시

```ts
export type Role = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export function createUser(email: string, name: string): User {
  return {
    id: crypto.randomUUID(),
    email,
    name,
    role: 'user',
  };
}
```

설명. 유니온 리터럴 `'admin' | 'user'`는 문자열인데도 두 값만 허용하므로 오타를 컴파일 단계에서 잡습니다.

## 3번 정답 예시

```tsx
interface Todo {
  id: string;
  text: string;
  done: boolean;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
}

function TodoItem({ todo, onToggle }: TodoItemProps) {
  return (
    <li onClick={() => onToggle(todo.id)}>
      {todo.done ? '[x]' : '[ ]'} {todo.text}
    </li>
  );
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  // ...
}
```

설명. `useState<Todo[]>([])`는 초기값이 빈 배열이라도 타입이 명확합니다. 명시하지 않으면 `never[]`로 추론돼 이후 추가가 막힙니다.

## 4번 정답 예시

```ts
import { Request, Response } from 'express';

interface Post {
  id: number;
  title: string;
  content: string;
}

interface PostParams {
  id: string;
}

interface CreatePostBody {
  title: string;
  content: string;
}

interface ErrorResponse {
  error: string;
}

const posts: Post[] = [];

app.get('/posts/:id', (req: Request<PostParams>, res: Response<Post | ErrorResponse>) => {
  const post = posts.find((p) => p.id === Number(req.params.id));
  if (!post) return res.status(404).json({ error: 'not found' });
  res.json(post);
});

app.post('/posts', (req: Request<{}, Post, CreatePostBody>, res: Response<Post>) => {
  const next: Post = { id: posts.length + 1, ...req.body };
  posts.push(next);
  res.status(201).json(next);
});
```

설명. `Request<Params, ResBody, ReqBody>` 순서를 기억하세요. 응답 타입을 `Post | ErrorResponse`로 두면 호출자가 분기 처리를 강제받습니다.

## 5번 정답 예시

```ts
export function formatValue(value: string | number | Date): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toFixed(2);
  if (value instanceof Date) return value.toISOString();
  // 도달 불가
  const _exhaustive: never = value;
  return _exhaustive;
}
```

설명. `never` 변수에 할당하는 패턴은 "모든 분기를 처리했는지" 컴파일러가 검사하게 만듭니다. 새 타입이 유니온에 추가되면 여기서 컴파일 오류가 납니다.

## 6번 정답 예시

```ts
export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

// 사용
interface User { id: string; name: string; }
const me = await fetchJson<User>('/api/me');
```

설명. 호출자가 타입을 지정하므로 응답 모델을 명시할 수 있습니다. 다만 런타임에서 실제 응답이 다를 수 있어 zod 같은 런타임 검증 라이브러리를 함께 쓰는 실무 패턴도 있습니다.

## 자주 막히는 부분

- `Property 'X' does not exist on type 'Y'`. 객체의 키가 정의에 없을 때. 인터페이스에 추가하거나 옵셔널(`X?`)로 정의합니다.
- `Type 'undefined' is not assignable to type 'string'`. 옵셔널 값을 그대로 썼을 때. `value ?? ''` 또는 조건 분기로 좁힙니다.
- `Element implicitly has an 'any' type`. 인덱스 시그니처가 없는 객체를 동적 키로 접근할 때. `Record<string, T>`로 선언하세요.
