# 9단계 문제 모음

[단계 설명](./README.md) · 학습 흐름. [문제](./problems.md) → [단계별 힌트](./hints.md) → [정답 비교](./answers.md) → [완료 체크](../student-checklist.md)

## 실습 파일 바로 열기

문제 번호와 같은 순서의 TypeScript 파일을 열어 빈칸과 TODO를 채우세요.

- [1번 기본 타입 코드 보기](./starter/01-basic-types.ts?view=source)
- [2번 인터페이스 코드 보기](./starter/02-interface-design.ts?view=source)
- [3번 React 타입 코드 보기](./starter/03-react-todo.tsx?view=source)
- [4번 Express 타입 코드 보기](./starter/04-express-typed.ts?view=source)
- [5번 타입 좁히기 코드 보기](./starter/05-narrowing.ts?view=source)
- [6번 제네릭 함수 코드 보기](./starter/06-generic-fetch.ts?view=source)

`starter/` 폴더의 `____`, `// TODO` 표시를 직접 채우세요. 막히면 `answers.md`와 비교합니다.

## 1번. 기본 타입 붙이기

`starter/01-basic-types.ts`를 열어 함수 시그니처에 타입을 채웁니다.

- `add` 함수의 인자와 반환 타입을 명시하세요.
- `greet` 함수에 옵셔널 파라미터 타입을 적용하세요.
- 배열 함수의 제네릭을 채우세요.

검증: `npx tsc --noEmit starter/01-basic-types.ts`가 통과해야 합니다.

## 2번. 인터페이스 설계

`starter/02-interface-design.ts`에서 사용자 모델을 설계합니다.

- `User` 인터페이스에 `id`, `email`, `name`, `role` 필드를 추가하세요.
- `role`은 `'admin' | 'user'` 유니온 리터럴 타입으로 정의하세요.
- `createUser` 함수가 `User` 객체를 반환하도록 작성하세요.

## 3번. React 컴포넌트 타입

`starter/03-react-todo.tsx`는 3단계 Todo 컴포넌트를 TS로 옮긴 버전입니다.

- `TodoProps` 인터페이스를 만들어 `id`, `text`, `done`, `onToggle` 시그니처를 정의하세요.
- 함수 컴포넌트 시그니처에 `React.FC<TodoProps>` 또는 인라인 타입을 적용하세요.
- `useState`의 제네릭을 명시해 초기 빈 배열에 `Todo[]` 타입이 추론되게 하세요.

## 4번. Express 라우터 타입

`starter/04-express-typed.ts`는 4단계 게시판 API의 TS 버전입니다.

- `Request<Params, ResBody, ReqBody>` 제네릭을 채우세요.
- `Post` 인터페이스를 만들고 `posts` 배열에 적용하세요.
- 에러 응답에 사용하는 `ErrorResponse` 타입을 별도로 정의하세요.

## 5번. 유니온과 좁히기

`starter/05-narrowing.ts`의 `formatValue` 함수를 완성하세요.

- 입력 타입은 `string | number | Date`.
- 각 분기에서 적절히 좁히는 가드를 작성하세요.
- 출력은 항상 `string`이 되어야 합니다.

## 6번. 제네릭 함수

`starter/06-generic-fetch.ts`에 타입 안전한 `fetchJson<T>` 함수를 작성하세요.

- 인자는 URL.
- 반환은 `Promise<T>`.
- 호출부에서 `fetchJson<User>('...')` 형태로 쓸 수 있어야 합니다.

## 자가 점검

- `tsconfig.json`의 `strict`가 `true`인지 확인했나요?
- `any`를 쓴 곳이 없는지 확인했나요?
- IDE에서 자동완성이 동작하나요?
