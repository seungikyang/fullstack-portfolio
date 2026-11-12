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

`starter/` 폴더의 `____`, `// TODO` 표시를 직접 채우세요. 막히면 먼저 `hints.md`의 1~3단계를 순서대로 보고, 마지막에만 `answers.md`와 비교합니다.

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

## 자가 점검 — 4지선다

보기 하나를 고르고 접힌 정답·해설을 확인하세요. 실제 실습 완료 여부는 실행 기록과 완료 체크에서 확인합니다.

### PS09-01. tsconfig.json의 strict: true를 설명한 것은?

tsconfig.json의 strict: true를 설명한 것은? — 알맞은 설명 또는 답변 방식을 고르세요.

1. 여러 엄격한 타입 검사 옵션을 활성화하며 실제 타입 검사 결과도 확인해야 한다.
2. 모든 변수의 타입을 any로 바꾼다.
3. 외부 API의 JSON을 런타임에 자동 검증한다.
4. 실행 중 발생할 수 있는 모든 오류를 제거한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 1번**

strict는 엄격한 검사 옵션의 묶음입니다. 타입 선언과 사용을 검사하지만 런타임 입력 검증과 실행 테스트를 대신하지 않습니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W425)

### PS09-02. any 사용을 줄여 타입 안전성을 확인하는 적절한 방법은?

any 사용을 줄여 타입 안전성을 확인하는 적절한 방법은? — 알맞은 설명 또는 답변 방식을 고르세요.

1. 모든 값에 as any를 붙여 오류를 숨긴다.
2. 명시적·추론된 any를 점검하고 외부 값은 unknown에서 검증·좁히기 후 사용한다.
3. noImplicitAny만 켜면 직접 작성한 any도 모두 자동 금지된다.
4. any로 지정한 값은 모든 프로퍼티가 실제 존재한다고 보장된다.

<details>
<summary>정답·해설 확인</summary>

**정답: 2번**

any는 해당 값의 많은 타입 검사를 우회합니다. noImplicitAny는 암시적 any를 다루며 직접 쓴 any까지 모두 막는 옵션은 아닙니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W426)

### PS09-03. IDE 자동완성과 타입 검사를 확인하는 올바른 설명은?

IDE 자동완성과 타입 검사를 확인하는 올바른 설명은? — 알맞은 설명 또는 답변 방식을 고르세요.

1. 속성 제안이 나타나면 실제 서버도 반드시 정상 동작한다.
2. 자동완성 목록이 HTTP 응답 내용을 실시간 검증한다.
3. 선언된 타입의 속성 제안을 확인하고 typecheck도 실행하되 자동완성을 런타임 성공 증거로 보지 않는다.
4. 타입 오류를 무시해도 자동완성이 있으면 타입 검사는 통과한 것이다.

<details>
<summary>정답·해설 확인</summary>

**정답: 3번**

자동완성은 선언된 타입을 기반으로 도와주는 편집 기능입니다. 정적 검사 결과와 실제 실행 결과는 각각 확인합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W427)
