# 9단계 TypeScript

[HTML 목차](../index.html) · 학습 흐름. [문제 풀기](./problems.md) → [단계별 힌트](./hints.md) → [정답 비교](./answers.md) → [완료 체크](../student-checklist.md)

## 목표

JavaScript에 정적 타입을 입혀 컴파일 시점에 오류를 잡는 능력을 익힙니다. 신규 프로젝트의 대부분은 TypeScript 기반이라, SI/SW 채용에서도 TS 경험 여부를 점점 더 자주 묻습니다.

3단계에서 만든 React 컴포넌트와 4단계에서 만든 Express 라우터에 타입을 입히는 것이 핵심 실습입니다.

## 기술을 쓰는 이유와 동작 흐름

처음 보는 용어는 [전체 기술 안내서](../technology-guide.md)와 함께 읽으세요. 아래 흐름은 실습을 이해하기 위한 안내이며, 빈칸과 완료 체크는 직접 진행합니다.

| 기술 | 무엇이고, 왜 필요한가요? | 이 실습에서는 어떻게 쓰나요? |
| --- | --- | --- |
| TypeScript | JavaScript 코드의 값에 자료형 약속을 붙이는 언어입니다. 실행 전에 잘못된 값 전달을 발견하도록 돕습니다. | [React 연습](./starter/03-react-todo.tsx)과 [Express 연습](./starter/04-express-typed.ts)에서 컴포넌트 입력·요청·응답의 형태를 표현합니다. |
| 타입 선언·제네릭 | 타입 선언은 값의 형태를 이름 붙이는 방법이고, 제네릭은 사용할 자료형을 나중에 정하는 방법입니다. 같은 규칙을 여러 곳에서 재사용합니다. | [제네릭 fetch 연습](./starter/06-generic-fetch.ts)이 호출하는 쪽의 자료형과 결과를 연결합니다. |
| tsc·tsconfig | tsc는 TypeScript 검사 도구이고, tsconfig는 검사 설정 파일입니다. 프로젝트 전체를 같은 기준으로 검사하게 합니다. | [tsconfig.json](./tsconfig.json)의 엄격한 검사와 `noEmit` 설정을 [package.json](./package.json)의 명령이 사용합니다. |

**자료형을 확인하는 순서:** 선언된 입력·출력 형태 작성 → `typecheck` 실행 → tsc가 사용 위치와 약속 비교 → 오류의 파일·줄 확인 → 수정 후 다시 검사. 여기서 `dev`는 검사 결과를 계속 갱신하는 명령이며 웹 서버를 열지 않습니다.

**직접 관찰하기:** 자료형 한 곳을 바꿨을 때 어느 사용 위치에서 오류가 발생하는지 살펴보세요. 이 단계는 JavaScript 파일을 생성하지 않고, 타입 표기나 `as`만으로 실제 API 응답을 검증하지도 않습니다. Career Hub에 타입을 도입할 때도 16단계에서 배우는 실행 중 입력 검증이 별도로 필요합니다.

## 실행 방법

```bash
cd 09-typescript
npm install
npm run dev
```

- `npm run typecheck`로 컴파일 오류를 확인합니다.
- 이 단계는 타입 연습 전용이라 JavaScript 산출물을 만들지 않습니다. `npm run build`도 기존 사용자를 위한 `typecheck` 별칭이며 production build 경험으로 설명하지 않습니다.

막히면 `hints.md`의 1단계부터 3단계까지 필요한 만큼만 보고, 그래도 해결되지 않을 때만 `answers.md`와 비교합니다.

## 완료 기준

- `npm run typecheck`가 오류 없이 통과합니다.
- React 컴포넌트의 props와 state에 인터페이스 또는 타입 별칭이 적용됐습니다.
- Express 라우터의 `Request`, `Response` 제네릭이 명시됐습니다.
- `any`를 의도적으로 쓴 곳이 한 군데도 없습니다.

완료로 표시하기 전 [학습 근거 4종](../student-checklist.md#단계마다-남길-4종-근거)에 typecheck 명령, 검사 결과, 해결한 타입 오류, 바꾼 타입·컴포넌트 위치를 기록합니다.

## 취업 연결

SI/SW 실무에서 TypeScript는 다음과 같은 가치를 가집니다.

- 인터페이스 변경이 잦은 SI 프로젝트에서 컴파일 단계에서 깨지는 곳을 미리 찾습니다.
- API 응답 타입을 정의해 프론트엔드와 백엔드가 같은 모델을 공유합니다.
- IDE 자동완성이 강해져 인수인계와 유지보수가 쉬워집니다.

이 단계가 끝나면 "JavaScript 프로젝트에 TypeScript를 점진적으로 도입하고 props와 API 응답 타입을 정의했다"고 설명할 수 있어야 합니다.

## 핵심 개념

- 기본 타입(`string`, `number`, `boolean`, `null`, `undefined`)과 리터럴 타입.
- `interface` 대 `type` 별칭. 언제 어떤 것을 쓰는가.
- 제네릭(`Array<T>`, `Promise<T>`, `Record<K, V>`).
- 유니온 타입(`A | B`)과 좁히기(`typeof`, `in`, 사용자 정의 가드).
- `unknown`과 `any`의 차이. `any` 금지의 이유.
- `tsconfig.json`의 `strict` 옵션.

## 면접 연습

<!-- written-choice:start -->
4지선다 문제입니다. 보기 하나를 고르고 접힌 정답·해설을 확인하세요.

### R09-01. `any`와 `unknown`의 차이를 설명해보세요.

`any`와 `unknown`의 차이를 설명해보세요.

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. unknown은 모든 메서드를 검사 없이 호출할 수 있다.
2. any는 외부 JSON을 자동으로 검증한다.
3. unknown은 사용 전에 타입을 좁혀야 하고 any는 많은 타입 검사를 우회한다.
4. unknown은 number만 받을 수 있다.

<details>
<summary>정답·해설 확인</summary>

**정답: 3번**

외부 입력은 unknown으로 받아 런타임 검증과 타입 좁히기를 적용할 수 있습니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W203)

### R09-02. `interface`와 `type`을 각각 언제 쓰나요?

`interface`와 `type`을 각각 언제 쓰나요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. interface는 숫자 리터럴 유니온만 정의한다.
2. type 별칭은 객체 구조를 표현할 수 없다.
3. 둘 중 하나를 쓰면 런타임 JSON 검증이 자동으로 된다.
4. 객체 구조는 둘 다 표현할 수 있고 type은 유니온 등에도 사용하며 interface는 선언 병합이 가능하다.

<details>
<summary>정답·해설 확인</summary>

**정답: 4번**

표현하려는 타입과 확장·병합 요구에 따라 선택합니다. 두 도구 모두 정적 타입입니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W204)

### R09-03. 제네릭을 쓰는 이유를 자기 말로 설명해보세요.

제네릭을 쓰는 이유를 자기 말로 설명해보세요.

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 입력과 출력 사이의 타입 관계를 재사용 가능한 형태로 표현한다.
2. 제네릭은 모든 입력을 항상 any로 바꾼다.
3. 제네릭은 API 응답 데이터를 자동으로 검사한다.
4. 제네릭 함수는 한 가지 타입으로만 호출할 수 있다.

<details>
<summary>정답·해설 확인</summary>

**정답: 1번**

타입 매개변수로 관계를 유지합니다. 실제 네트워크 값의 검증은 별도로 필요합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W205)

### R09-04. `strict: true`로 켜면 어떤 검사가 추가되나요?

`strict: true`로 켜면 어떤 검사가 추가되나요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 외부 JSON의 실제 값까지 실행 중 자동으로 검사한다.
2. 암시적 any와 null/undefined 가능성 등 엄격한 정적 검사를 묶어 켠다.
3. HTTP 실패를 컴파일 시점에 모두 없앤다.
4. strict를 켜면 명시적으로 작성한 any도 문법적으로 금지된다.

<details>
<summary>정답·해설 확인</summary>

**정답: 2번**

strict는 여러 컴파일러 검사 옵션을 묶습니다. 명시적 any나 네트워크·외부 데이터의 런타임 검증까지 자동으로 해결하지는 않습니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W206)

### R09-05. 컴파일 단계 오류와 런타임 오류의 차이를 설명해보세요.

컴파일 단계 오류와 런타임 오류의 차이를 설명해보세요.

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 컴파일에 성공하면 모든 네트워크 요청도 성공한다.
2. 타입 오류는 실행 중 서버에서만 발견된다.
3. 정적 타입 검사를 통과해도 외부 입력이나 실행 환경 때문에 런타임 오류가 생길 수 있다.
4. TypeScript는 모든 API 응답을 자동으로 변환한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 3번**

정적 검사와 실제 실행 검증을 구분합니다. 런타임 데이터는 선언한 타입과 다를 수 있습니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W207)

<!-- written-choice:end -->
