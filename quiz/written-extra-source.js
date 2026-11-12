// README·개념 확인·설명 문장에 남아 있던 문항의 선택지 원본입니다.
// 이미 검토한 같은 주제의 선택지를 공유하되 원문 위치와 ID는 따로 보존합니다.
const coverage = require("./written-extra-coverage.json");

const aliases = {
  "01": ["H01", "H02", "H03"],
  "02": ["I06", "R02-02", "F01"],
  "03": ["I08", "I09", "I12"],
  "04": ["I13", "I14", "I19"],
  "05": ["I17", "M03", "R05-03"],
  "06": ["I20", "R06-02", "I24"],
  "07": ["R07-01", "E01", "I19"],
  "08": ["R08-01", "R08-02", "R08-03", "R08-04", "F05", "R08-06", "I30"],
  "09": ["I32", "I33", "I34", "R09-04", "I35"],
  10: ["R10-01", "I36", "I37", "I38", "I39", "D5"],
  11: ["I41", "I42", "I43", "I44", "I45", "F14"],
  12: ["I47", "I48", "I50", "I49", "R12-05"],
  13: ["I52", "I51", "R13-03", "R13-04", "I53", "I54"],
  14: ["I55", "I56", "I57", "R14-04", "R14-05", "R14-06"],
  15: ["N1", "O1", "I62", "S2"],
  16: ["I65", "I66", "I67", "I68", "R16-05", "I69", "I23"],
  M: ["F24", "RM-02", "F25", "RM-04", "RM-05"],
  A: ["I30", "RA-02", "R08-04", "I31"],
};

// [정답, 오답 3개, 해설]. 각 오답은 이 문항의 명시된 조건에서 틀립니다.
const answers = {
  RD05: [
    "GET은 조회, POST는 생성 등 요청 처리, PUT은 대상 상태 교체, DELETE는 삭제에 사용한다.",
    "GET은 반드시 데이터를 삭제하고 DELETE는 목록 조회에만 사용한다.",
    "PUT은 항상 숫자를 1씩 증가시키고 같은 요청을 반복하면 반드시 누적된다.",
    "POST와 DELETE는 이름만 다르고 모든 API에서 동작이 항상 같다.",
    "HTTP 메서드의 의미와 실제 API 계약을 함께 봅니다. PUT은 대상 상태 교체, PATCH는 부분 변경의 대표적 사용이며 요청 본문·응답·멱등성 조건도 구분합니다.",
  ],
  "R16-03": [
    "XSS는 브라우저의 스크립트 실행, CSRF는 인증된 원치 않는 요청을 유도하며 위험도는 권한·피해·방어 조건으로 평가한다.",
    "XSS는 모든 상황에서 CSRF보다 반드시 피해가 작다.",
    "CSRF는 서버 저장소의 모든 데이터를 반드시 스크립트로 실행한다.",
    "두 공격은 이름만 다르고 원인과 방어가 항상 같다.",
    "두 공격의 실행 경로와 인증 정보 전달 조건을 구분합니다. 위험도를 단정하지 않고 실제 권한·민감 작업·보호 수단·영향 범위를 평가합니다.",
  ],
  "R02-02": [
    "input.value는 문자열이므로 산술 계산 전에 Number로 변환한다.",
    "Number는 입력값을 자동으로 DB에 저장한다.",
    "문자열 두 개를 +로 연결하면 항상 숫자 덧셈이 된다.",
    "Number를 쓰면 빈 입력·NaN 검증이 모두 필요 없어진다.",
    "문자열 연결과 숫자 덧셈을 구분합니다. 변환 결과가 유효한 숫자인지와 빈 입력인지도 별도로 검증합니다.",
  ],
  "R05-03": [
    "환경별 DB 연결 주소와 비밀 값을 코드에서 분리해 주입한다.",
    "환경 변수에 넣으면 노출된 비밀번호를 바꿀 필요가 없다.",
    "환경 변수는 DB 연결 오류를 자동으로 없앤다.",
    "DB 주소는 모든 실행 환경에서 반드시 같아야 한다.",
    "환경마다 연결 정보가 다를 수 있습니다. 환경 변수도 노출될 수 있으므로 실제 시크릿을 저장소에 커밋하지 않습니다.",
  ],
  "R06-02": [
    "Authorization: Bearer 헤더로 보내고 서버에서 서명·만료를 검증한다.",
    "JWT를 URL에 넣으면 요청 로그에 절대 남지 않는다.",
    "클라이언트가 보낸 JWT payload를 검증 없이 신뢰한다.",
    "Bearer 헤더를 쓰면 XSS나 토큰 탈취 가능성이 사라진다.",
    "Bearer는 토큰 전달 형식입니다. HTTPS와 안전한 저장·로그 처리, 서버의 서명·만료 검증이 함께 필요합니다.",
  ],
  "R07-01": [
    "클릭 이벤트 → 입력 읽기 → fetch 요청 → 라우터 처리 → 응답 확인 → 화면 갱신",
    "화면 갱신 → 서버 응답 생성 → 사용자의 클릭",
    "클릭하면 브라우저가 서버 DB 파일을 직접 수정한다.",
    "fetch를 호출하기 전에 서버 응답 본문이 반드시 도착한다.",
    "사용자 이벤트를 처리한 프론트가 HTTP 요청을 보내고 서버 응답을 받아 화면을 갱신합니다. 실패 응답도 확인합니다.",
  ],
  "R08-01": [
    "목표·행동·제출 준비·면접/지원 진행의 네 조건 묶음을 각각 한 단계로 집계한다.",
    "로그인만 하면 준비도가 항상 100%다.",
    "지원 기록 수가 곧 준비도 백분율이다.",
    "프로젝트 한 개를 생성하면 네 단계가 모두 완료된다.",
    "server/index.js의 dashboardFor와 src/App.jsx의 getWorkbookSteps는 목표 직무·지원일, 주간 목표·다음 행동, 제출 체크·완료 프로젝트, 면접 체크·진행 지원 기록을 확인합니다.",
  ],
  "R08-02": [
    "App이 사용자·토큰·워크북·목록을 state로 관리하고 자식에 데이터와 갱신 함수를 props로 전달한다.",
    "자식 컴포넌트가 서버 JSON 파일을 브라우저에서 직접 연다.",
    "React state에 값을 넣으면 서버 저장도 자동 완료된다.",
    "props를 변경하면 부모의 state를 직접 수정해도 된다.",
    "src/App.jsx에서 App과 각 Section의 역할을 나눕니다. API 응답을 받은 뒤 state를 갱신하는 흐름과 서버의 영속 저장은 별개입니다.",
  ],
  "R08-03": [
    "GET 조회·POST 생성·PATCH 수정·DELETE 삭제로 나누고 생성 201, 인증 실패 401 등으로 응답한다.",
    "모든 API는 GET으로 데이터를 수정한다.",
    "입력 오류·인증 실패·서버 오류를 모두 200으로 응답한다.",
    "없는 리소스는 언제나 생성 성공 201로 응답한다.",
    "server/index.js에서 리소스와 작업에 맞는 HTTP 메서드와 상태 코드를 사용합니다. 클라이언트는 성공 여부와 오류 원인을 구분합니다.",
  ],
  "R08-04": [
    "bcrypt cost 10으로 해시하고 HS256·2시간 JWT를 발급하며 Bearer 토큰을 검증한다.",
    "비밀번호 원문을 JWT payload에 넣어 보호한다.",
    "JWT 서명은 클라이언트에서만 검사하고 서버는 건너뛴다.",
    "운영 JWT_SECRET은 예제 값이어도 항상 허용된다.",
    "server/auth.js의 hashPassword, signToken, requireAuth를 연결하고, server/index.js의 requireUser가 서명이 맞는 토큰이라도 저장소에 같은 번호·이메일의 사용자가 있을 때만 통과시킵니다. assertAuthConfig는 운영에서 32자 이상의 비예제 JWT_SECRET을 요구합니다. 해시 비용과 정책은 실제 코드 기준입니다.",
  ],
  "R08-06": [
    "데모 시드 없는 임시 저장소에서 가입·로그인·워크북·준비도·지원/프로젝트 CRUD를 HTTP로 확인한다.",
    "화면 색상만 검사하고 HTTP 요청은 보내지 않는다.",
    "실제 운영 계정과 저장 파일을 반드시 초기화한다.",
    "스크립트가 있다는 사실만으로 실행 통과를 증명한다.",
    "scripts/api-smoke-test.js는 임시 데이터 파일과 SEED_DEMO=false를 사용합니다. 검증 경험은 실제 통과 로그가 있을 때 설명합니다.",
  ],
  "R09-04": [
    "암시적 any와 null/undefined 가능성 등 엄격한 정적 검사를 묶어 켠다.",
    "외부 JSON의 실제 값까지 실행 중 자동으로 검사한다.",
    "HTTP 실패를 컴파일 시점에 모두 없앤다.",
    "strict를 켜면 명시적으로 작성한 any도 문법적으로 금지된다.",
    "strict는 여러 컴파일러 검사 옵션을 묶습니다. 명시적 any나 네트워크·외부 데이터의 런타임 검증까지 자동으로 해결하지는 않습니다.",
  ],
  "R10-01": [
    "기본 키는 한 행의 대표 식별자이며 NULL을 허용하지 않고, 유니크 제약은 중복을 제한한다.",
    "기본 키는 같은 테이블에 여러 독립 기본 키를 둘 수 있다.",
    "기본 키는 모든 DB에서 NULL을 허용한다.",
    "유니크 제약은 모든 DB에서 NULL을 똑같이 처리한다.",
    "테이블의 기본 키는 하나이며 여러 컬럼을 묶은 복합 키일 수 있습니다. 유니크 제약의 NULL 처리 세부 사항은 DB 구현을 확인합니다.",
  ],
  "R12-05": [
    "테스트별 DB·스키마·데이터 초기화나 적용 가능한 트랜잭션 rollback으로 상태를 격리한다.",
    "모든 테스트가 운영 DB를 공유해야 안전하다.",
    "테스트 순서가 고정되면 공유 데이터 문제는 사라진다.",
    "외부 프로세스의 모든 커밋도 테스트 트랜잭션 하나로 자동 취소된다.",
    "다른 테스트가 남긴 데이터에 결과가 의존하지 않게 합니다. rollback 범위는 연결·트랜잭션 경계를 따르므로 모든 작업이 같은 범위에 있는지 확인합니다.",
  ],
  "R13-03": [
    "서로 겹치지 않는 변경은 Git이 같은 파일에서도 자동 병합할 수 있다.",
    "같은 파일을 두 사람이 고치면 반드시 충돌한다.",
    "충돌이 없으면 업무 로직도 반드시 올바르다.",
    "Git은 최신 작성자의 파일만 무조건 선택한다.",
    "텍스트 병합의 충돌 여부와 프로그램의 의미적 충돌은 다릅니다. 자동 병합 후에도 코드와 테스트 결과를 확인합니다.",
  ],
  "R13-04": [
    "reset --hard는 브랜치·인덱스·작업 트리를 되돌릴 수 있고 revert는 역변경 커밋을 만든다.",
    "reset --hard는 미커밋 변경을 항상 별도 커밋으로 보존한다.",
    "revert는 공유된 모든 과거 커밋을 삭제한다.",
    "둘은 작업 트리와 히스토리에 주는 영향이 완전히 같다.",
    "reset --hard는 미커밋 변경을 잃게 할 수 있습니다. 공유 이력을 유지하며 취소할 때는 역변경 커밋을 만드는 revert를 검토합니다.",
  ],
  "R14-04": [
    "필요한 런타임이 있는 작은 이미지를 선택하고 네이티브 모듈·libc·실행 호환성과 실제 크기를 확인한다.",
    "이름에 alpine이 있으면 모든 라이브러리가 반드시 호환된다.",
    "베이스 이미지가 작으면 앱 실행 검증이 필요 없다.",
    "모든 빌드 도구를 운영 이미지에 넣어야 크기가 최소다.",
    "작은 베이스는 포함 파일이 적어 크기를 줄일 수 있습니다. Alpine의 musl 차이 등 실행 조건을 확인하고 최종 이미지의 크기와 동작을 측정합니다.",
  ],
  "R14-05": [
    "docker run의 -e/--env-file 또는 compose의 environment/env_file 등으로 실행 설정을 주입한다.",
    "컨테이너의 환경 변수는 Dockerfile에만 고정할 수 있다.",
    "-p 옵션이 모든 환경 변수를 자동 주입한다.",
    "환경 변수를 쓰면 컨테이너 접근 권한과 로그 보안이 필요 없다.",
    "실행 환경에 맞게 변수를 주입합니다. 비밀 값에는 플랫폼의 시크릿 관리 기능을 고려하며 이미지·로그에 노출되지 않게 합니다.",
  ],
  "R14-06": [
    "Dockerfile·이미지 레이어·빌드 이력에 비밀 값이 남아 이미지 공유 시 노출될 수 있다.",
    "최종 파일에서 지우면 과거 레이어의 비밀 값도 항상 제거된다.",
    "레지스트리에 올린 이미지 안의 비밀 값은 아무도 읽을 수 없다.",
    "SECRET이라는 이름을 쓰면 값이 자동으로 암호화된다.",
    "비밀 값은 이미지에 고정하지 않습니다. 실행 시점 주입과 시크릿 관리 기능을 사용하고 이미 노출된 값은 폐기·교체합니다.",
  ],
  "R16-05": [
    "salt는 같은 비밀번호의 해시를 다르게 하고 bcrypt의 조절 가능한 비용은 빠른 범용 SHA-256보다 추측 비용을 높인다.",
    "salt는 복호화 키라 DB 유출 시 원문 비밀번호를 되돌린다.",
    "SHA-256이 빠르므로 비밀번호 대입 공격도 반드시 느려진다.",
    "bcrypt 비용을 높이면 같은 비밀번호의 입력 길이가 바뀐다.",
    "salt와 계산 비용의 역할을 구분합니다. 비밀번호 저장에는 목적에 맞는 비용 조절 가능한 해시를 사용하며 비용 값은 실행 환경과 정책을 확인합니다.",
  ],
  "RM-02": [
    "공유 코드·패키지 수·빌드 그래프·캐시·변경 영향 관리 요구에 맞춰 도구를 선택한다.",
    "모노레포에는 npm workspaces를 사용할 수 없다.",
    "패키지가 두 개여도 반드시 모든 빌드 도구를 함께 설치한다.",
    "캐시 도구를 쓰면 의존성 그래프를 확인할 필요가 없다.",
    "작은 구조에서는 npm workspaces로 시작할 수 있습니다. 추가 도구는 캐시·빌드 범위 등 실제로 해결해야 할 요구가 있을 때 검토합니다.",
  ],
  "RM-04": [
    "빌드한 Web 정적 파일과 API 런타임을 한 이미지에 담아 같은 서버·포트로 제공한다.",
    "개발용 Vite 서버 세 개를 운영에서 반드시 동시에 실행한다.",
    "API와 Web은 항상 별도 저장소로 분리해야 한다.",
    "단일 이미지이면 DB까지 무조건 이미지 내부 파일로 저장한다.",
    "monorepo-mini-app/Dockerfile의 런타임은 API와 web/dist를 함께 담습니다. 별도 DB 서비스와 프론트/API의 개발 실행 구조는 구분합니다.",
  ],
  "RM-05": [
    "프로세스 생존뿐 아니라 store.ping()으로 저장소 사용 가능 여부를 확인한다.",
    "프로세스가 있으면 DB 연결과 테이블도 항상 정상이다.",
    "헬스체크는 회원의 비밀번호 원문을 반환해야 한다.",
    "DB 헬스체크가 성공하면 모든 업무 쿼리의 정확성이 증명된다.",
    "Note Hub의 /api/health는 저장소 상태를 확인합니다. PostgreSQL 스키마 준비와 ping 성공은 기본 가용성 근거이며 업무 기능 검증은 별도로 필요합니다.",
  ],
  "RA-02": [
    "별도 DB 없이 실행할 수 있는 JSON 저장소를 쓰고, 다중 서버 확장 시 DB 트랜잭션과 제약 도입을 검토한다.",
    "파일 rename 한 번으로 여러 서버의 모든 동시 수정도 직렬화된다.",
    "JSON 파일은 트랜잭션 DB와 모든 동시성 보장이 같다.",
    "저장소 파일만 바꾸면 라우터와 생성 지점은 검토할 필요가 없다.",
    "server/data-store.js의 JsonStore와 server/index.js의 생성 지점을 함께 봅니다. 임시 파일 rename은 파일 교체를 돕지만 여러 서버의 read-modify-write 전체를 잠그지는 않습니다.",
  ],
  V01: [
    "서버에서 body·params·query를 검증하고 프론트 검증은 사용자 경험을 돕는 보조 수단으로 둔다.",
    "브라우저 검증이 있으므로 서버는 모든 입력을 신뢰한다.",
    "JWT가 있으면 요청 body 검증은 필요 없다.",
    "검증에 실패한 값도 먼저 저장한 뒤 사용자에게 알린다.",
    "HTTP 클라이언트는 브라우저 UI를 거치지 않을 수 있습니다. 서버에서 검증을 통과한 값만 업무 로직에 넘기고 실패에는 적절한 오류를 반환합니다.",
  ],
  V02: [
    "서버가 지원 기록을 JSON 파일에 저장하고 새로고침 후 API로 다시 읽기 때문이다.",
    "React state는 브라우저 종료 후에도 항상 같은 값을 보존한다.",
    "JWT payload에 모든 지원 기록을 자동 저장하기 때문이다.",
    "HTML 태그가 서버 파일 쓰기를 대신하기 때문이다.",
    "Career Hub의 server/data-store.js가 기록을 영속 저장하고 API 조회가 저장 데이터를 다시 읽습니다. 화면 state만으로 서버의 저장 결과를 보존하는 것은 아닙니다.",
  ],
};

function term(correct, wrong1, wrong2, wrong3, explanation) {
  return [correct, wrong1, wrong2, wrong3, explanation];
}
const concepts = {
  "01": [
    term(
      "시맨틱",
      "인증",
      "트랜잭션",
      "쿼리",
      "시맨틱 요소는 문서 안의 역할과 구조를 표현합니다. 모양은 CSS로 별도 지정합니다.",
    ),
    term(
      "h1",
      "title",
      "head",
      "meta",
      "h1은 본문 최상위 제목이고 title은 브라우저 탭의 문서 제목입니다.",
    ),
    term(
      "alt",
      "href",
      "method",
      "action",
      "alt는 대체 텍스트를 제공합니다. 정보를 담은 이미지는 의미를 설명하고 장식 이미지는 빈 alt를 사용합니다.",
    ),
    term(
      "행과 열의 2차원",
      "서버 인증",
      "DB 스키마",
      "HTTP 요청",
      "Grid는 행과 열을 함께 설계하기 적합하고 Flexbox는 주로 한 축의 배치에 사용합니다.",
    ),
    term(
      "column",
      "row",
      "static",
      "block",
      "flex-direction: column은 주축을 세로로 둡니다. row는 가로 방향입니다.",
    ),
  ],
  "02": [
    term(
      "DOM",
      "JWT",
      "SQL",
      "ORM",
      "DOM은 문서를 객체 형태로 다루는 모델입니다. 요소를 찾아 내용·속성·이벤트를 다룹니다.",
    ),
    term(
      "이벤트",
      "스키마",
      "커밋",
      "인덱스",
      "클릭이나 입력 같은 사건을 이벤트라고 합니다. 등록한 리스너가 해당 이벤트에 반응합니다.",
    ),
    term(
      "value",
      "textContent",
      "length",
      "status",
      "입력 요소의 현재 값은 value로 읽습니다. 보통 문자열이므로 계산 전에 변환·검증합니다.",
    ),
    term(
      "push",
      "pop",
      "shift",
      "slice",
      "push는 배열 끝에 원소를 추가하고 원본 배열을 변경합니다. pop은 끝 원소를 제거합니다.",
    ),
    term(
      "화면 표시 책임",
      "비밀번호 원문",
      "DB 접속 암호",
      "운영 포트 번호",
      "데이터 변경과 렌더링 책임을 나누면 같은 상태로 화면을 다시 그리고 로직을 검증하기 쉽습니다.",
    ),
  ],
  "03": [
    term(
      "state",
      "서버 로그 파일",
      "Git 커밋",
      "Docker 이미지",
      "React state는 렌더에 사용하는 상태입니다. setter로 새 값을 요청하면 다음 렌더에 반영합니다.",
    ),
    term(
      "props",
      "쿠키 원문",
      "스레드",
      "인덱스",
      "props는 부모가 자식에 넘기는 입력입니다. 자식에서 props를 직접 수정하지 않습니다.",
    ),
    term(
      "불변성",
      "포트 고정",
      "암호 복호화",
      "전역 공유 메모리",
      "새 배열·객체를 만들어 원본 상태를 보존하면 변경 추적과 상태 스냅샷을 유지하기 쉽습니다.",
    ),
    term(
      "value",
      "status",
      "token",
      "port",
      "입력 변경 이벤트의 target.value를 읽어 제어된 입력 state의 갱신 함수로 전달합니다.",
    ),
    term(
      "안정적인 항목 식별자",
      "비밀번호",
      "브라우저 포트",
      "SQL 테이블 수",
      "key는 같은 목록에서 항목을 식별합니다. 재정렬 가능한 목록은 안정적인 데이터 id를 사용합니다.",
    ),
  ],
  "04": [
    term(
      "GET",
      "DELETE",
      "PATCH",
      "CONNECT",
      "GET은 리소스 조회를 위한 메서드입니다. 이 게시판의 목록 라우트도 GET을 사용합니다.",
    ),
    term(
      "201",
      "404",
      "401",
      "500",
      "201 Created는 새 리소스가 생성된 성공 응답에 사용합니다. 모든 성공이 201인 것은 아닙니다.",
    ),
    term(
      "204",
      "201",
      "409",
      "500",
      "204 No Content는 성공했지만 응답 본문이 없는 경우에 사용합니다. 본문을 함께 보내지 않습니다.",
    ),
    term(
      "params",
      "body",
      "query",
      "headers",
      "라우트 경로의 :id는 req.params.id입니다. 쿼리와 JSON body는 다른 입력 위치입니다.",
    ),
    term(
      "json",
      "static",
      "listen",
      "setHeader",
      "express.json()은 적용 조건에 맞는 JSON 요청 본문을 파싱해 req.body에 제공합니다. 입력 검증은 따로 합니다.",
    ),
  ],
  "05": [
    term(
      "Mongoose",
      "React",
      "Vitest",
      "Vite",
      "이 트랙은 Mongoose로 스키마·모델을 정의하고 MongoDB의 문서를 저장·조회합니다.",
    ),
    term(
      "Schema",
      "Response",
      "Router",
      "Component",
      "Mongoose Schema는 필드 모양과 검증·기본값 등의 규칙을 정의합니다. 모델은 스키마를 사용합니다.",
    ),
    term(
      "영속성",
      "이벤트 버블링",
      "리렌더링",
      "타입 단언",
      "영속 저장소는 프로세스 종료 후에도 데이터를 보존합니다. 메모리 배열과 구분합니다.",
    ),
    term(
      "new",
      "required",
      "unique",
      "trim",
      "이 실습의 new: true 옵션은 변경 후 문서를 받는 조건입니다. 생략하면 기본적으로 변경 전 문서를 받을 수 있습니다.",
    ),
    term(
      "next",
      "listen",
      "render",
      "push",
      "이 실습의 오류 전달에서는 next(error)를 사용해 중앙 오류 미들웨어로 넘깁니다.",
    ),
  ],
  "06": [
    term(
      "비밀번호 해시",
      "원문",
      "Base64만 적용한 값",
      "공개 URL",
      "비밀번호는 원문으로 저장하지 않고 비밀번호 저장용 해시로 비교합니다. Base64는 보호 수단이 아닙니다.",
    ),
    term(
      "해시 계산",
      "JWT 글자 수",
      "비밀번호 최대 길이",
      "HTTP 상태",
      "bcrypt의 cost는 해시 계산 작업량을 조절합니다. 비밀번호 글자 수나 salt 문자열 길이가 아닙니다.",
    ),
    term(
      "JWT",
      "DOM",
      "SQL",
      "CSS",
      "이 트랙은 로그인 성공 시 서명 JWT를 발급합니다. 서버가 이후 요청의 토큰을 검증합니다.",
    ),
    term(
      "Authorization",
      "Content-Length",
      "Accept-Language",
      "Cache-Control",
      "Bearer 인증 토큰은 Authorization 헤더에 전달합니다. 토큰 서명·만료 검증은 서버 역할입니다.",
    ),
    term(
      "401",
      "201",
      "204",
      "301",
      "인증 정보가 없거나 유효하지 않은 경우 401을 사용합니다. 인증됐지만 권한이 부족한 403과 구분합니다.",
    ),
  ],
  "07": [
    term(
      "static",
      "json",
      "listen",
      "status",
      "express.static은 지정한 디렉터리의 정적 파일을 제공합니다. JSON 본문 파서와 역할이 다릅니다.",
    ),
    term(
      '빈 문자열("")',
      "https://other.example",
      "Bearer token",
      "*",
      "이 실습은 같은 서버의 상대 API 경로를 사용하므로 API_BASE가 빈 문자열입니다. 실제 호출 경로 계약을 확인합니다.",
    ),
    term(
      "fetch",
      "bcrypt",
      "useState",
      "COMMIT",
      "fetch로 HTTP 요청을 보내고 응답 상태와 본문을 확인합니다. 네트워크·HTTP 실패를 처리합니다.",
    ),
    term(
      "환경",
      "태그",
      "SQL 집계",
      "이벤트 대상",
      "환경 변수로 환경마다 달라지는 설정을 주입합니다. 실제 비밀 값은 저장소에 커밋하지 않습니다.",
    ),
    term(
      "README",
      ".gitignore만",
      "JWT payload",
      "회원 비밀번호",
      "README에 준비 조건과 실행·검증 명령을 남기면 다른 사람이 같은 절차로 동작을 확인할 수 있습니다.",
    ),
  ],
  "08": [
    term(
      "Career Hub",
      "Note Hub",
      "Spring Initializr",
      "MongoDB Compass",
      "8단계 제출용 앱 이름은 Career Hub입니다. Note Hub는 별도 모노레포 데모입니다.",
    ),
    term(
      "지원 현황 · 프로젝트",
      "결제 카드 · 계좌 이체",
      "재고 · 배송",
      "지도 좌표 · 날씨",
      "Career Hub는 취업 워크북과 지원 기록, 포트폴리오 프로젝트를 관리하는 앱입니다.",
    ),
    term(
      "Vite",
      "Mongoose",
      "JUnit",
      "MyBatis",
      "8단계 프론트는 React와 Vite를 사용합니다. vite.config.js와 프론트 실행 스크립트로 확인합니다.",
    ),
    term(
      "Express",
      "Spring MVC",
      "Django",
      "Flask",
      "8단계 API는 Node.js와 Express로 구성합니다. Spring은 11단계에서 별도로 학습합니다.",
    ),
    term(
      "JWT",
      "평문 비밀번호",
      "CSS 선택자",
      "DB 기본키만",
      "bcrypt 비밀번호 해시와 서명 JWT 인증을 함께 사용합니다. JWT는 서버에서 검증합니다.",
    ),
    term(
      "MongoDB",
      "Flexbox",
      "Vitest",
      "HTML",
      "MongoDB나 PostgreSQL로 저장소를 바꾸려면 CRUD 메서드 계약과 생성 지점, 동시성 처리를 검토합니다.",
    ),
    term(
      "verify",
      "serve:workbook",
      "progress",
      "build:quiz",
      "Career Hub의 package.json에서 verify가 lint·format·build·unit/API 테스트·제출 감사를 연결합니다.",
    ),
    term(
      "data-store",
      "styles",
      "openapi-sync.test",
      "validators.test",
      "server/data-store.js의 JsonStore가 데이터 접근과 파일 쓰기를 담당합니다. 라우터는 그 메서드를 호출합니다.",
    ),
    term(
      "passwordHash",
      "공개 사용자 이름",
      "프로젝트 제목",
      "공개 생성 시각",
      "비밀번호 해시는 공개 사용자 응답에 포함하면 안 됩니다. 내부 저장 필드와 응답 DTO를 구분합니다.",
    ),
    term(
      "trim 후 소문자화",
      "대문자화만",
      "Base64 인코딩만",
      "문자열 뒤집기",
      "server/data-store.js의 normalizeEmail은 양끝 공백과 대소문자 차이를 정리해 이메일 비교를 일관되게 합니다.",
    ),
    term(
      "데이터 저장",
      "화면 색상",
      "이미지 배치",
      "브라우저 제목",
      "파일 저장 로직을 라우터와 분리합니다. 현재 구체 클래스 연결은 교체 시 생성 지점 변경도 필요하다는 한계가 있습니다.",
    ),
    term(
      "helmet",
      "bcrypt",
      "Vite",
      "Mongoose",
      "server/index.js에서 helmet으로 기본 보안 헤더와 명시한 정책을 설정합니다. 사용자 권한 검사는 별도입니다.",
    ),
    term(
      "express-rate-limit",
      "express.static",
      "React key",
      "pino-pretty",
      "요청 횟수 제한은 express-rate-limit으로 설정합니다. 한도와 대상은 실제 서버 코드를 확인합니다.",
    ),
    term(
      "1mb",
      "unlimited",
      "JWT",
      "GET",
      "현재 server/index.js의 express.json은 limit: 1mb입니다. 너무 큰 JSON 본문을 제한하며 업무 필드 길이는 별도 검증합니다.",
    ),
    term(
      "pino",
      "bcrypt",
      "supertest",
      "Vite",
      "server/logger.js의 pino와 요청 로깅 미들웨어 pino-http가 구조적 로그를 남깁니다. 비밀 값은 가립니다.",
    ),
    term(
      "X-Request-Id",
      "X-Password",
      "X-Database-URL",
      "X-JWT-Secret",
      "X-Request-Id는 같은 요청의 로그를 연결하는 식별자입니다. 요청 추적 헤더에 비밀 값을 넣지 않습니다.",
    ),
    term(
      "그레이스풀",
      "무조건 즉시 강제",
      "전체 DB 삭제",
      "비밀키 출력",
      "종료 시 새 요청 수신을 멈추고 진행 중 작업을 정리하는 그레이스풀 셧다운과 강제 종료 타임아웃을 구분합니다.",
    ),
  ],
  "09": [
    term(
      "컴파일·타입 검사",
      "사용자 클릭 이후만",
      "DB 커밋 이후만",
      "서버 장애 이후만",
      "TypeScript는 실행 전에 정적 타입 불일치를 찾습니다. 외부 JSON과 환경의 실제 동작은 런타임 검증도 필요합니다.",
    ),
    term(
      "interface",
      "useEffect",
      "INNER JOIN",
      "Dockerfile",
      "interface나 type으로 객체 구조에 이름을 붙입니다. 타입은 실행 시 객체를 자동 검증하는 코드는 아닙니다.",
    ),
    term(
      "유니온",
      "교착",
      "인덱스",
      "트랜잭션",
      "string | number는 두 타입 중 하나를 표현하는 유니온입니다. 사용 전에 필요한 타입을 좁힙니다.",
    ),
    term(
      "타입 좁히기",
      "비밀번호 해싱",
      "이벤트 캡처",
      "커밋 되돌리기",
      "typeof·instanceof 같은 조건으로 가능한 타입 범위를 줄여 해당 타입의 연산을 안전하게 사용합니다.",
    ),
    term(
      "타입 매개변수",
      "HTTP 헤더",
      "DB 테이블 이름",
      "비밀번호 원문",
      "제네릭의 T는 호출자가 지정하는 타입 매개변수입니다. 실행 중 응답을 자동 검증하지는 않습니다.",
    ),
  ],
  10: [
    term(
      "DDL",
      "DCL",
      "TCL",
      "HTTP",
      "CREATE·ALTER·DROP 같은 구조 정의 명령은 DDL입니다. 데이터 조작·권한·트랜잭션 제어와 구분합니다.",
    ),
    term(
      "DML",
      "DDL",
      "DCL",
      "TCL",
      "이 워크북은 조회와 INSERT·UPDATE·DELETE를 DML 범주로 묶습니다. 자료에 따라 SELECT를 DQL로 따로 분류하기도 합니다.",
    ),
    term(
      "유일",
      "무작위 중복",
      "NULL만으로",
      "행 순서만으로",
      "기본 키는 NULL 없이 각 행을 유일하게 식별합니다. 여러 컬럼을 묶은 복합 키도 가능합니다.",
    ),
    term(
      "참조 무결성",
      "화면 반응형",
      "JWT 서명",
      "이벤트 전파",
      "외래 키는 참조 대상 키와의 관계를 제한해 참조 무결성을 돕습니다. 삭제·갱신 정책도 함께 확인합니다.",
    ),
    term(
      "왼쪽",
      "오른쪽만",
      "일치한",
      "마지막 입력",
      "LEFT JOIN은 왼쪽의 미일치 행도 남기고 오른쪽 열을 NULL로 채웁니다. 일대다 매칭은 행을 늘릴 수 있습니다.",
    ),
    term(
      "원자성",
      "인증",
      "캐시",
      "비동기 이벤트",
      "원자성은 트랜잭션의 작업을 모두 반영하거나 모두 취소하는 성질입니다. 송금의 출금·입금을 함께 다룹니다.",
    ),
    term(
      "쓰기·유지 관리",
      "HTML 파싱",
      "TLS 인증서",
      "이미지 대체 텍스트",
      "인덱스는 조회에 도움이 될 수 있지만 데이터 변경 시 유지 비용과 저장 공간이 추가됩니다.",
    ),
  ],
  11: [
    term(
      "Controller",
      "Repository",
      "CSS Grid",
      "Docker volume",
      "Controller는 HTTP 입력을 받아 업무 계층과 응답으로 연결합니다. 업무 규칙 자체는 Service에서 다룹니다.",
    ),
    term(
      "Service",
      "Controller의 HTML만",
      "DB 인덱스",
      "브라우저 쿠키",
      "Service는 비즈니스 규칙과 여러 저장 작업의 업무 단위를 구성합니다. 요청·저장 책임을 나눕니다.",
    ),
    term(
      "Repository",
      "React state",
      "HTML main",
      "CORS Origin",
      "Repository는 데이터 접근을 담당합니다. Service가 저장소 계약을 통해 업무 데이터를 사용합니다.",
    ),
    term(
      "의존성 주입(DI)",
      "문자열 연결 SQL",
      "강제 push",
      "이벤트 버블링",
      "컨테이너가 관리하는 의존 객체를 필요한 곳에 주입받으면 구현 교체와 테스트 대체가 쉬워집니다.",
    ),
    term(
      "DTO",
      "JWT secret",
      "Docker layer",
      "Git branch",
      "DTO는 요청·응답의 데이터를 표현합니다. 저장용 Entity와 공개·검증 범위가 다를 수 있습니다.",
    ),
  ],
  12: [
    term(
      "단위",
      "전체 운영 배포",
      "수동 네트워크",
      "이미지 빌드",
      "단위 테스트는 작은 동작을 독립적으로 확인합니다. 의존성과 검증 범위를 명시해야 합니다.",
    ),
    term(
      "통합",
      "문자 인코딩",
      "단순 포맷",
      "Git 기록",
      "통합 테스트는 모듈·계층 경계를 연결해 함께 동작하는 흐름을 검증합니다.",
    ),
    term(
      "모킹",
      "해싱",
      "리베이스",
      "프로젝션",
      "모킹은 외부 의존성을 제어 가능한 대체물로 바꿉니다. 실제 연결은 필요한 통합 테스트로 확인합니다.",
    ),
    term(
      "Assert",
      "Auth",
      "Array",
      "Async",
      "AAA는 준비 Arrange, 실행 Act, 단언 Assert입니다. 실제 결과가 기대를 만족하는지 확인합니다.",
    ),
    term(
      "supertest",
      "helmet",
      "bcrypt",
      "Mongoose",
      "supertest는 Express 앱 등에 HTTP 요청을 보내 응답을 검증하는 테스트 도구입니다.",
    ),
  ],
  13: [
    term(
      "feature",
      "detached만",
      "remote만",
      "tag만",
      "이 워크북에서는 기능별 작업 브랜치를 feature 브랜치로 부릅니다. 이름 규칙은 팀 컨벤션을 따릅니다.",
    ),
    term(
      "Pull Request(PR)",
      "JWT",
      "HTTP GET",
      "Docker image",
      "PR은 변경 검토와 병합을 요청하는 단위입니다. 변경 목적과 검증 근거를 함께 남깁니다.",
    ),
    term(
      "병합 충돌",
      "자동 DB 삭제",
      "JWT 만료",
      "컴파일 완료",
      "겹치는 내용을 다르게 고쳐 자동 결합할 수 없으면 병합 충돌을 해결해야 합니다.",
    ),
    term(
      "protected",
      "public password",
      "unlimited",
      "temporary only",
      "보호 규칙으로 직접 push와 검증 없이 병합하는 것을 제한합니다. 필요한 리뷰·CI 조건을 설정합니다.",
    ),
    term(
      "rebase",
      "fetch만",
      "status만",
      "ignore",
      "rebase는 커밋을 다른 기반 위에 재적용해 이력을 다시 만들 수 있습니다. 공유 이력 재작성은 협의가 필요합니다.",
    ),
  ],
  14: [
    term(
      "Dockerfile",
      ".gitignore",
      "package-lock만",
      "README의 제목만",
      "Dockerfile은 이미지 빌드 단계와 실행 설정을 정의합니다. 빌드 context에 필요한 파일이 있어야 합니다.",
    ),
    term(
      "ENTRYPOINT",
      "SELECT",
      "useState",
      "MERGE",
      "CMD와 ENTRYPOINT의 역할·조합을 구분합니다. 실행 시 전달하는 인자와 기본 명령에 영향을 줍니다.",
    ),
    term(
      "npm ci",
      "git push",
      "docker stop",
      "DROP TABLE",
      "의존성 정의와 lockfile을 먼저 복사한 뒤 npm ci를 실행하면 소스만 바뀔 때 설치 단계 캐시 재사용에 도움이 됩니다.",
    ),
    term(
      "compose",
      "query",
      "commit",
      "bcrypt",
      "Docker Compose는 여러 서비스와 네트워크·볼륨·설정을 함께 정의하고 실행합니다.",
    ),
    term(
      "CI workflow",
      "JWT payload",
      "DB 인덱스",
      "화면 class",
      "GitHub Actions workflow의 트리거와 job으로 push·PR 시 검증을 자동 실행합니다. 실제 통과 로그를 확인합니다.",
    ),
    term(
      ".dockerignore",
      ".env의 비밀 값",
      "JWT secret",
      "DB 행",
      ".dockerignore는 빌드 context의 불필요한 파일을 제외합니다. .gitignore와 적용 대상이 다릅니다.",
    ),
  ],
  15: [
    term(
      "응용",
      "물리",
      "네트워크",
      "데이터 링크",
      "HTTP는 응용 계층 프로토콜입니다. TCP와 IP 같은 전송·네트워크 계층의 역할과 구분합니다.",
    ),
    term(
      "연결 설정·전송 순서·재전송 보장",
      "데이터그램 경계",
      "포트 번호 사용",
      "애플리케이션의 데이터 송신",
      "UDP는 연결 없는 데이터그램 전송입니다. 순서·재전송을 자체 보장하지 않으며 실제 지연과 속도는 환경·구현에 따라 달라집니다.",
    ),
    term(
      "실행",
      "물리 서버 전체",
      "인터넷 도메인",
      "DB 테이블",
      "스레드는 프로세스 안의 실행 단위입니다. 같은 프로세스의 자원을 공유해 동기화가 필요할 수 있습니다.",
    ),
    term(
      "dirty",
      "CSS",
      "Git",
      "TLS",
      "dirty read는 다른 트랜잭션의 미커밋 데이터를 읽는 현상입니다. 격리 수준의 최소 보장과 DB 실제 구현을 구분합니다.",
    ),
    term(
      "시간·공간 비용의 증가율",
      "실제 밀리초의 고정값",
      "서버 IP 주소",
      "HTTP 상태 번호",
      "Big-O는 입력 크기에 따른 비용의 점근적 증가를 표현합니다. 실제 실행 시간은 측정 조건에도 영향을 받습니다.",
    ),
  ],
  16: [
    term(
      "DB·게시글 등 저장소",
      "TCP 헤더에만",
      "Git 브랜치 이름만",
      "서버 포트 번호",
      "저장형 XSS는 저장된 악성 데이터가 이후 출력될 때 스크립트로 실행되는 문제입니다. 출력 문맥에 맞는 방어가 필요합니다.",
    ),
    term(
      "삽입·반영",
      "해시 후 비교만",
      "완전히 삭제",
      "서버 메모리에서만 폐기",
      "반사형 XSS는 요청 입력을 안전하게 처리하지 않고 응답에 반영할 때 발생할 수 있습니다.",
    ),
    term(
      "출력 문맥에 맞는 인코딩",
      "Base64만",
      "JWT 발급만",
      "글자 수 계산만",
      "HTML 텍스트·속성·URL·스크립트의 문맥이 다릅니다. 문맥에 맞는 인코딩과 필요한 검증을 사용합니다.",
    ),
    term(
      "파라미터화",
      "입력 문자열 연결",
      "비밀번호 출력",
      "검증 생략",
      "SQL 구조와 사용자 값을 분리해 매개변수로 바인딩합니다. 입력을 SQL 코드로 합치지 않습니다.",
    ),
    term(
      "인증된 상태의 원치 않는 요청",
      "컴파일 오류만",
      "서버 OS 설치",
      "Git 태그",
      "CSRF는 브라우저가 자동으로 보내는 인증 정보 등을 악용합니다. 토큰·SameSite·요청 검증 등 조건에 맞는 방어가 필요합니다.",
    ),
    term(
      "허용할 구체적인 Origin과 credentials 허용 조건을 함께 설정한다.",
      "Allow-Origin: *만 두면 credential 응답 읽기가 항상 허용된다.",
      "CORS가 사용자별 권한 검사를 대신한다.",
      "모든 요청 Origin을 검증 없이 반사하면 안전하다.",
      "브라우저는 credential 응답에 와일드카드 Allow-Origin을 허용하지 않습니다. 검증한 구체적 Origin을 사용하며 서버 인증·권한·CSRF 검사는 별도입니다.",
    ),
  ],
  17: [
    term(
      "검증",
      "추측만",
      "과장",
      "은폐",
      "구현한 내용과 함께 실행 명령·관찰 결과·해결한 오류·코드 위치를 연결해야 설명의 근거가 됩니다.",
    ),
    term(
      "Result",
      "Repository",
      "Render",
      "Request",
      "STAR는 상황 Situation, 과제 Task, 행동 Action, 결과 Result로 경험을 구성합니다.",
    ),
    term(
      "사용자 문제",
      "비밀번호 원문",
      "모든 의존성 버전만",
      "서버 IP만",
      "프로젝트 설명은 해결하려는 사용자 문제에서 시작한 뒤 기능·기술·검증 근거를 연결합니다.",
    ),
    term(
      "한계와 선택의 이유",
      "확인하지 않은 운영 성과",
      "다른 사람의 성과만",
      "사용자 비밀번호",
      "장점뿐 아니라 대안과 현재 한계를 설명하면 선택의 근거가 드러납니다. 직접 경험한 범위만 말합니다.",
    ),
  ],
  M: [
    term(
      "모노레포",
      "세션",
      "단일 SQL 행",
      "CSS 레이어",
      "모노레포는 여러 패키지를 한 저장소에서 관리합니다. 모든 앱이 하나의 프로세스라는 뜻은 아닙니다.",
    ),
    term(
      "workspaces",
      "passwordHash",
      "Authorization",
      "font-size",
      "npm workspaces로 루트와 각 패키지의 의존성·실행 구성을 관리합니다. 패키지 빌드 순서도 확인합니다.",
    ),
    term(
      "shared",
      "private-password",
      "styles-only",
      "docker-volume",
      "@note-hub/shared가 API와 Web에서 사용하는 타입과 계약을 담습니다. package.json의 의존성과 import를 확인합니다.",
    ),
    term(
      "타입 검사",
      "모든 HTTP 요청 전송",
      "DB 데이터 자동 삭제",
      "브라우저 설치",
      "공유 타입으로 정적 계약 불일치를 찾습니다. 실제 JSON 값과 네트워크 실패는 런타임에서 검증합니다.",
    ),
    term(
      "교체와 테스트",
      "원문 비밀번호 출력",
      "항상 이중 저장",
      "인증 생략",
      "NotesStore 계약 뒤의 구현을 교체해 메모리와 PostgreSQL을 비교하고 테스트 의존성을 제어합니다.",
    ),
    term(
      "PostgreSQL · InMemory",
      "InMemory · PostgreSQL",
      "MongoDB · Oracle",
      "항상 JSON · 항상 JSON",
      "현재 Note Hub는 DATABASE_URL이 있으면 PostgreSQL, 없으면 InMemory 구현을 선택합니다. 메모리 데이터는 재시작 시 사라집니다.",
    ),
  ],
};

const sentences = {
  "01": [
    "시맨틱 · Flexbox · Grid",
    "JWT · bcrypt · SQL",
    "서버 로그 · Git · TLS",
    "Mongoose · JPA · MyBatis",
  ],
  "02": [
    "등록한 클릭 이벤트 콜백",
    "DB 마이그레이션이 자동으로",
    "운영 컨테이너 삭제가",
    "Git force push가",
  ],
  "03": [
    "할 일 state",
    "DOM 안의 숨은 비밀번호",
    "서버 포트 번호",
    "변경 가능한 전역 원문 토큰",
  ],
  "04": ["HTTP", "CSS", "Git", "Docker 이미지 레이어"],
  "05": ["Mongoose", "React", "Vite", "Vitest"],
  "06": [
    "bcrypt · JWT",
    "Base64 · 평문 비밀번호",
    "CSS · HTML",
    "Git · Dockerfile",
  ],
  "07": ["fetch", "DROP TABLE", "bcrypt.hash", "git reset --hard"],
  "08": [
    "화면 state · 지원 기록 · 프로젝트",
    "서버 OS · 결제 · 배송",
    "비밀번호 원문 · 이미지 · CSS",
    "DB 스키마만 · 토큰 서명 · DNS",
  ],
  "09": ["타입", "공개 비밀번호", "브라우저 좌표", "Git 태그"],
  10: ["기본키·외래키 등의 제약", "CSS 선택자", "JWT 헤더", "Docker 포트"],
  11: [
    "Controller · Service · Repository",
    "HTML · CSS · 이미지",
    "Git · JWT · TLS",
    "Array · String · Number",
  ],
  12: [
    "회귀 오류",
    "서버 IP 변경만",
    "브라우저 설치 여부만",
    "모든 사용자 성격 차이",
  ],
  13: [
    "요구 의도와 양쪽 변경 내용·검증 결과",
    "항상 최신 작성자만",
    "파일 크기만",
    "충돌 표시를 지운 줄 수만",
  ],
  14: ["컨테이너 이미지", "JWT payload", "React props", "SQL 행 하나"],
  15: [
    "직접 구현하고 검증한",
    "다른 사람이 구현한 것을 내 것이라 한",
    "확인하지 않은 운영",
    "아직 구현하지 않은 것을 완료라 한",
  ],
  16: [
    "공격에 노출되는 경로와 위험",
    "모든 사용자의 권한",
    "정상 요청을 처리할 능력만",
    "실행 증거의 신뢰도만",
  ],
  17: [
    "코드와 실행 근거",
    "확인하지 않은 수치",
    "다른 사람의 담당 범위",
    "외운 기술명 개수만",
  ],
  M: [
    "공유된 API 계약",
    "사용자의 원문 비밀번호",
    "CSS 색상",
    "Docker 이미지 해시만",
  ],
};

function buildExtraGroups(baseGroups) {
  const baseRows = new Map(
    baseGroups.flatMap((g) => g.rows.map((row) => [row[0], row])),
  );
  function resolve(id, visited = new Set()) {
    if (visited.has(id)) throw new Error(`선택지 참조 순환: ${id}`);
    visited.add(id);
    if (answers[id]) return answers[id];
    if (baseRows.has(id)) return baseRows.get(id).slice(2);
    const match = /^R(\d{2}|M|A)-(\d{2})$/.exec(id);
    const target = match && aliases[match[1]]?.[Number(match[2]) - 1];
    if (!target || target === id) throw new Error(`선택지 원본 누락: ${id}`);
    return resolve(target, visited);
  }
  const groups = [];
  for (const doc of coverage.documents.filter((d) => !d.reuse)) {
    groups.push({
      file: doc.file,
      category: "readme",
      title: "단계별 면접 질문",
      rows: doc.items.map((item) => [
        item.sourceId,
        item.prompt,
        ...resolve(item.sourceId),
      ]),
    });
  }
  const conceptRows = [],
    sentenceRows = [];
  for (const section of coverage.featureSections) {
    const prefix = section.heading.startsWith("monorepo")
      ? "M"
      : section.heading.slice(0, 2);
    if (concepts[prefix].length !== section.items.length)
      throw new Error(`개념 문항 수 오류: ${prefix}`);
    section.items.forEach((item, index) =>
      conceptRows.push([
        item.sourceId,
        item.question || item.prompt,
        ...concepts[prefix][index],
      ]),
    );
    const item = section.sentence;
    sentenceRows.push([
      item.sourceId,
      `${section.heading} 설명 문장의 빈칸에 들어갈 내용`,
      ...sentences[prefix],
      "학습 주제와 실제 구현의 역할에 맞는 설명을 선택합니다. 이 문장을 자신의 경험으로 사용할 때에는 실제 코드와 실행·검증 근거가 있어야 합니다.",
    ]);
  }
  groups.push({
    file: "feature-implementation-workbook.md",
    category: "workbook-concepts",
    title: "종합 워크북 개념 확인",
    rows: conceptRows,
  });
  groups.push({
    file: "feature-implementation-workbook.md",
    category: "workbook-sentences",
    title: "종합 워크북 설명 문장",
    rows: sentenceRows,
  });
  for (const item of coverage.singles)
    groups.push({
      file: item.file,
      category: "reading",
      title: "설명 확인",
      rows: [[item.sourceId, item.prompt, ...answers[item.sourceId]]],
    });
  for (const doc of coverage.documents.filter((d) => d.reuse)) {
    const items = doc.items.filter((item) => answers[item.sourceId]);
    if (items.length)
      groups.push({
        file: doc.file,
        category: "reading",
        title: "로드맵 설명 확인",
        rows: items.map((item) => [
          item.sourceId,
          item.prompt,
          ...answers[item.sourceId],
        ]),
      });
  }
  return groups;
}

module.exports = { buildExtraGroups, coverage };
