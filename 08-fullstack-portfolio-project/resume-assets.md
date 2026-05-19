# 이력서·지원서용 프로젝트 자료

이 문서는 Career Hub를 이력서, 자기소개서, 지원서, GitHub README에 사용할 때 바로 가져다 쓸 수 있는 문장 모음입니다.

## 한 줄 소개

React와 Express로 구현한 취업 준비 관리 서비스로, JWT 인증과 지원 현황·포트폴리오 프로젝트 CRUD, JSON 파일 저장소, API smoke test를 포함합니다.

## 이력서 프로젝트 항목

**Career Hub. Fullstack Portfolio Project**

- React 19와 Vite로 지원 현황·프로젝트 관리 대시보드를 구현하고, 컴포넌트 단위로 로그인, 통계, CRUD 화면을 분리했습니다.
- Express 5 기반 REST API를 설계해 회원가입, 로그인, 지원 현황 CRUD, 프로젝트 CRUD, 대시보드 지표를 제공했습니다.
- bcryptjs로 비밀번호를 해시하고 JWT 기반 인증 미들웨어로 보호 API 접근을 제어했습니다.
- JSON 파일 저장소 계층을 분리해 로컬 실행은 쉽게 유지하면서 MongoDB나 PostgreSQL로 교체 가능한 구조를 만들었습니다.
- `npm run verify`로 프론트엔드 빌드, API smoke test, 제출 전 감사가 함께 실행되도록 구성했습니다.

## 자기소개서 문장 예시

풀스택 개발자로 성장하기 위해 HTML/CSS, JavaScript, React, Node.js, 데이터 저장, 로그인, 배포 과정을 단계별로 학습한 뒤 이를 하나의 프로젝트로 통합했습니다. Career Hub는 취업 준비자가 지원 현황과 포트폴리오 프로젝트를 관리할 수 있는 서비스이며, 단순 화면 구현을 넘어 인증, CRUD, 데이터 저장, 자동 검증까지 포함했습니다. 특히 API smoke test를 작성해 회원가입, 로그인, 보호 API, 생성·수정·삭제 흐름이 실제로 동작하는지 확인했습니다.

## 면접 1분 설명

Career Hub는 SI/SW 취업 준비자가 지원 현황과 포트폴리오 프로젝트를 관리하는 fullstack 미니 프로젝트입니다. 프론트엔드는 React로 만들었고, 백엔드는 Express REST API로 구성했습니다. 회원가입과 로그인은 bcrypt 비밀번호 해시와 JWT 인증을 사용했고, 지원 기록과 프로젝트는 JSON 파일 저장소에 보존됩니다. 1~7단계에서 학습한 HTML/CSS, JavaScript, React, API, 데이터 저장, 로그인, 배포 준비를 하나의 제출용 프로젝트로 연결한 것이 핵심입니다.

## 면접 질문과 답변 포인트

### Q. 이 프로젝트에서 1~7단계 학습이 어떻게 연결되나요?

1단계 HTML/CSS는 반응형 화면과 카드 UI에, 2단계 JavaScript는 입력 처리와 이벤트에, 3단계 React는 state와 컴포넌트 구조에 쓰였습니다. 4단계 Express API는 CRUD 서버로 확장했고, 5단계 데이터 저장은 JSON 저장소 계층으로 구현했습니다. 6단계 로그인은 bcrypt와 JWT 인증으로 적용했고, 7단계 배포 준비는 README, 환경 변수, 빌드, smoke test로 연결했습니다.

### Q. DB 대신 JSON 파일을 쓴 이유는 무엇인가요?

포트폴리오를 보는 사람이 별도 DB를 설치하지 않아도 바로 실행할 수 있게 하기 위해 JSON 파일 저장소를 사용했습니다. 대신 `server/data-store.js`에 저장소 로직을 분리해 나중에 MongoDB나 PostgreSQL로 교체할 수 있게 만들었습니다.

### Q. 보안 관점에서 신경 쓴 부분은 무엇인가요?

비밀번호를 평문으로 저장하지 않고 bcryptjs로 해시했습니다. 로그인 성공 시 JWT를 발급하고, 보호 API에서는 `Authorization: Bearer 토큰` 헤더를 검증합니다. 회원가입 응답에는 `passwordHash`가 노출되지 않도록 했고, smoke test에서 이 점도 확인합니다.

### Q. 검증은 어떻게 했나요?

`npm run verify`로 Vite production build, API smoke test, 제출 전 감사 스크립트를 함께 실행합니다. smoke test는 회원가입, 로그인 실패, 로그인 성공, 보호 API, 지원 현황 CRUD, 프로젝트 CRUD, 대시보드 지표를 실제 HTTP 요청으로 확인합니다.

## 지원서에 적기 좋은 기술 키워드

- React, Vite, Component, State, Props.
- Node.js, Express, REST API, HTTP Status Code.
- JWT, bcrypt, Authentication Middleware.
- CRUD, JSON File Store, Repository Layer.
- API Smoke Test, Build Verification, Environment Variables.

## 제출 전 확인

```bash
npm install
npm run verify
npm run audit:submit
```

위 명령이 통과하면 이력서나 지원서에 “빌드와 API 검증 스크립트를 포함한 fullstack 프로젝트”라고 적을 수 있습니다.

## 참고 근거

- NCS 공정채용 안내는 채용에서 직무능력 중심 평가를 강조합니다. https://ncs.go.kr/company/ch03/CH-104-001-01.scdo
- OWASP Password Storage Cheat Sheet는 비밀번호 저장 시 안전한 해시 알고리즘 사용을 안내합니다. https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html

