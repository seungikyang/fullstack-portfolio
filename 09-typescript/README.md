# 9단계 TypeScript

## 목표

JavaScript에 정적 타입을 입혀 컴파일 시점에 오류를 잡는 능력을 익힙니다. 신규 프로젝트의 대부분은 TypeScript 기반이라, SI/SW 채용에서도 TS 경험 여부를 점점 더 자주 묻습니다.

3단계에서 만든 React 컴포넌트와 4단계에서 만든 Express 라우터에 타입을 입히는 것이 핵심 실습입니다.

## 실행 방법

```bash
cd 09-typescript
npm install
npm run dev
```

- `npm run typecheck`로 컴파일 오류를 확인합니다.
- `npm run build`로 production 빌드가 통과되는지 확인합니다.

막히면 `answers.md`를 보고 다시 직접 고칩니다.

## 완료 기준

- `npm run typecheck`가 오류 없이 통과합니다.
- React 컴포넌트의 props와 state에 인터페이스 또는 타입 별칭이 적용됐습니다.
- Express 라우터의 `Request`, `Response` 제네릭이 명시됐습니다.
- `any`를 의도적으로 쓴 곳이 한 군데도 없습니다.

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

- `any`와 `unknown`의 차이를 설명해보세요.
- `interface`와 `type`을 각각 언제 쓰나요?
- 제네릭을 쓰는 이유를 자기 말로 설명해보세요.
- `strict: true`로 켜면 어떤 검사가 추가되나요?
- 컴파일 단계 오류와 런타임 오류의 차이를 설명해보세요.
