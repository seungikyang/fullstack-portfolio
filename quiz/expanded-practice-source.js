// 기존 P001~P600 뒤에 붙이는 50유형 × 20개 연습 문제입니다.
// 실제 프로젝트 설정을 외워 맞히지 않도록 각 문제에 독립적인 조건을 적습니다.
function addExpandedPractice({ add, numeric, js }) {
  const topics = [
    "html",
    "css",
    "javascript",
    "dom",
    "react",
    "http",
    "node",
    "mongodb",
    "auth",
    "deploy",
    "portfolio",
    "typescript",
    "sql",
    "spring",
    "testing",
    "git",
    "docker",
    "network",
    "security",
    "notes",
  ];
  for (let i = 1; i <= 20; i++) {
    const a = i + 5;
    const b = 2 + (i % 4);
    const topic = topics[i - 1];

    // HTML: 제출되는 입력과 form 소유 관계.
    const fields = Array.from({ length: a }, (_, n) => ({
      name: `field${n + 1}`,
      disabled: n % b === 0,
      value: n + i,
    }));
    const form = `<form id="entry">\n${fields.map((f) => `  <input name="${f.name}" value="${f.value}"${f.disabled ? " disabled" : ""}>`).join("\n")}\n  <input value="이름 없는 입력">\n  <input type="checkbox" name="optional" value="yes">\n</form>`;
    numeric(
      "html",
      "form-successful-controls",
      "표시된 폼으로 new FormData(form)을 만들면 이름·값 쌍은 몇 개인가요? 체크박스는 선택하지 않았습니다.",
      form,
      fields.filter((f) => !f.disabled).length,
      `disabled 입력 ${fields.filter((f) => f.disabled).length}개, name이 없는 입력, 선택하지 않은 체크박스는 제외합니다. 활성화된 이름 있는 입력 ${fields.filter((f) => !f.disabled).length}개만 제출됩니다.`,
      [fields.length, fields.length + 2, fields.length + 1],
      {
        check: "html",
        fixture: { html: form, selector: "#entry", operation: "form-data" },
      },
    );
    const outsideCount = 1 + (i % 3);
    const innerCount = 2 + i;
    const ownedForm = `<form id="survey-${i}">\n${Array.from({ length: innerCount }, (_, n) => `<input name="inside${n}" value="${n + i}">`).join("\n")}\n</form>\n${Array.from({ length: outsideCount }, (_, n) => `<input form="survey-${i}" name="outside${n}" value="${i + n}">`).join("\n")}\n<input name="unowned" value="${a}">`;
    numeric(
      "html",
      "form-associated-controls",
      "이 문서에서 표시된 form의 FormData에 들어가는 이름·값 쌍은 몇 개인가요?",
      ownedForm,
      innerCount + outsideCount,
      `폼 내부 ${innerCount}개와 form 속성으로 같은 폼을 가리키는 외부 ${outsideCount}개를 합칩니다. 어느 폼에도 연결되지 않은 unowned는 제외합니다.`,
      [innerCount, outsideCount, innerCount + outsideCount + 1],
      {
        check: "html",
        fixture: {
          html: ownedForm,
          selector: `#survey-${i}`,
          operation: "form-data",
        },
      },
    );

    // CSS: 가변 공간 분배와 선택자 우선순위.
    const free = 30 * a;
    const base = 20 + i;
    const width = base * 2 + free;
    numeric(
      "css",
      "flex-grow-ratio",
      "최소·최대 너비 제한이 없을 때 첫 번째 flex 항목의 최종 너비는 몇 px인가요?",
      `.row { display: flex; width: ${width}px; gap: 0; padding: 0; border: 0; }\n.first { flex: 1 0 ${base}px; min-width: 0; }\n.second { flex: 2 0 ${base}px; min-width: 0; }\n/* 자식은 이 둘뿐이며 padding, border, margin은 모두 0입니다. */`,
      base + free / 3,
      `기본 너비 합 ${base * 2}px를 뺀 ${free}px를 grow 1:2로 나눕니다. 첫 항목은 ${base} + ${free / 3} = ${base + free / 3}px입니다.`,
      [base + free / 2, free / 3, base + (free * 2) / 3],
    );
    numeric(
      "css",
      "selector-specificity",
      "같은 작성자 스타일·같은 cascade layer이고 !important가 없을 때 이 제목의 글꼴 크기는 몇 px인가요?",
      `<h2 id="title-${i}" class="title">제목</h2>\n<style>\n#title-${i} { font-size: ${a + 10}px; }\n.title { font-size: ${a + 20}px; }\nh2 { font-size: ${a + 30}px; }\n</style>`,
      a + 10,
      `같은 중요도와 레이어에서는 id 선택자가 class 및 태그 선택자보다 우선합니다. 뒤에 나온 낮은 명시도 선언으로 덮이지 않아 ${a + 10}px입니다.`,
      [a + 20, a + 30, a + 40],
    );

    // JavaScript: 인덱스, 변경 메서드, 정렬, 선택적 접근.
    const values = [a, a + b, a + b * 2];
    js(
      "javascript",
      "map-index",
      "map 콜백의 두 번째 인수를 사용한 결과 배열은 무엇인가요?",
      `const values = ${JSON.stringify(values)};\nconst result = values.map((value, index) => value + index);`,
      values.map((v, n) => v + n),
      [values, values.map((v) => v + 1), values.map((v, n) => v + n + 1)],
      "map의 두 번째 인수는 0부터 시작하는 인덱스입니다. 첫 값에 0, 둘째에 1, 셋째에 2를 더하며 원본 배열은 바꾸지 않습니다.",
    );
    const spliceValues = [a, a + 1, a + 2, a + 3];
    js(
      "javascript",
      "splice-mutation",
      "splice로 한 원소를 교체한 뒤 원본 배열과 반환 배열을 함께 출력하면 무엇인가요?",
      `const values = ${JSON.stringify(spliceValues)};\nconst removed = values.splice(1, 1, ${a + 10});\nconst result = [values, removed];`,
      [[a, a + 10, a + 2, a + 3], [a + 1]],
      [
        [spliceValues, [a + 1]],
        [
          [a, a + 10, a + 3],
          [a + 1, a + 2],
        ],
        [[a, a + 1, a + 10, a + 3], [a + 2]],
      ],
      `splice(1, 1, ${a + 10})은 인덱스 1의 ${a + 1}을 제거하고 그 자리에 새 값을 넣습니다. 원본을 변경하며 제거한 원소를 배열로 반환합니다.`,
    );
    const unsorted = [a + 100, a + 2, a + 20];
    js(
      "javascript",
      "numeric-sort",
      "숫자 비교 함수를 전달한 sort의 결과는 무엇인가요?",
      `const values = ${JSON.stringify(unsorted)};\nconst result = [...values].sort((left, right) => left - right);`,
      [a + 2, a + 20, a + 100],
      [unsorted, [a + 100, a + 20, a + 2], [a + 20, a + 2, a + 100]],
      "left - right 비교 함수는 숫자 오름차순을 만듭니다. 펼치기로 복사한 배열을 정렬하므로 values의 원래 순서는 유지합니다.",
    );
    const profile = i % 2 ? { stats: { count: 0 } } : {};
    const optionalResult = i % 2 ? 0 : a;
    js(
      "javascript",
      "optional-chain-default",
      "선택적 접근과 null 병합 연산자를 함께 쓰면 출력은 무엇인가요?",
      `const profile = ${JSON.stringify(profile)};\nconst result = profile.stats?.count ?? ${a};`,
      optionalResult,
      [optionalResult + 1, "undefined", "null"],
      i % 2
        ? "count가 0이면 ??는 기본값으로 바꾸지 않습니다. null 또는 undefined일 때만 오른쪽 값을 사용합니다."
        : `stats가 없으므로 선택적 접근 결과가 undefined입니다. ??가 기본값 ${a}를 선택합니다.`,
    );

    // DOM: 버블링과 기본 동작 취소. fixture는 실제 DOM 검증에 사용합니다.
    const eventHtml = `<div id="parent"><button id="child">항목 ${i}</button></div>`;
    add(
      "dom",
      "event-bubbling-order",
      "버튼을 한 번 클릭했을 때 log에 쌓이는 문자열의 순서는 무엇인가요? 캡처 리스너는 없습니다.",
      `${eventHtml}\nconst log = [];\nchild.addEventListener("click", () => log.push("버튼${i}"));\nparent.addEventListener("click", () => log.push("부모${i}"));\nchild.click();\n/* child와 parent는 해당 id로 조회한 요소입니다. */`,
      `버튼${i} → 부모${i}`,
      [`부모${i} → 버튼${i}`, `버튼${i}`, `부모${i}`],
      "대상 버튼의 리스너가 실행된 뒤 이벤트가 부모로 버블링합니다. stopPropagation을 호출하지 않았으므로 부모 리스너도 실행됩니다.",
      {
        check: "dom",
        fixture: { html: eventHtml, operation: "bubble", suffix: i },
      },
    );
    numeric(
      "dom",
      "prevent-default-propagation",
      "취소 가능한 사용자 정의 이벤트를 표시된 횟수만큼 보냈습니다. 부모 리스너의 count는 얼마인가요?",
      `${eventHtml}\nlet count = 0;\nchild.addEventListener("save", event => event.preventDefault());\nparent.addEventListener("save", () => count++);\nfor (let n = 0; n < ${a}; n++) {\n  child.dispatchEvent(new Event("save", { bubbles: true, cancelable: true }));\n}`,
      a,
      "preventDefault는 기본 동작을 취소합니다. 이벤트 전파를 중단하지 않으므로 bubbles가 true인 각 이벤트가 부모에 도달합니다.",
      [0, a - 1, a * 2],
      {
        check: "dom",
        fixture: {
          html: eventHtml,
          operation: "prevent-default",
          repetitions: a,
        },
      },
    );

    // React: 상태 갱신, 의존성 비교, 순수한 불변 갱신 함수.
    numeric(
      "react",
      "mixed-update-queue",
      "초기 렌더의 count로 핸들러를 한 번 실행하면 다음 렌더의 count는 얼마인가요?",
      `const [count, setCount] = useState(${a});\nfunction click() {\n  setCount(n => n + ${b});\n  setCount(count * 2);\n  setCount(n => n + 1);\n}`,
      a * 2 + 1,
      `첫 갱신 결과 ${a + b} 다음에 스냅샷 count=${a}로 계산한 ${a * 2} 교체 요청이 들어갑니다. 마지막 함수가 1을 더해 ${a * 2 + 1}이 됩니다.`,
      [(a + b) * 2 + 1, a * 2, a + b + 1],
    );
    const dependencies = [a, a, a + 1, a + 1, a + b, a + b];
    numeric(
      "react",
      "effect-dependency-changes",
      "StrictMode가 없고 최초 마운트와 표시된 커밋만 있을 때 effect 본문은 총 몇 번 실행되나요? 각 커밋 뒤 effect는 완료됩니다.",
      `useEffect(() => { report(value); }, [value]);\n/* 마운트 및 이후 커밋의 value 순서: ${dependencies.join(", ")} */`,
      3,
      "최초 마운트에서 한 번, 의존성이 직전 커밋과 달라진 두 지점에서 각각 한 번 실행합니다. 같은 숫자로 다시 커밋된 경우는 추가 실행하지 않습니다.",
      [dependencies.length, 2, 1],
    );
    const tasks = [
      { id: a, done: false },
      { id: a + 1, done: true },
      { id: a + 2, done: false },
    ];
    js(
      "react",
      "immutable-toggle-result",
      "React 상태 갱신에 사용할 순수 함수입니다. 갱신 뒤 원본과 새 배열의 완료 상태 출력은 무엇인가요?",
      `const tasks = ${JSON.stringify(tasks)};\nconst next = tasks.map(task => task.id === ${a} ? { ...task, done: !task.done } : task);\nconst result = [tasks.map(task => task.done), next.map(task => task.done)];`,
      [
        [false, true, false],
        [true, true, false],
      ],
      [
        [
          [true, true, false],
          [true, true, false],
        ],
        [
          [false, true, false],
          [false, true, false],
        ],
        [
          [false, true, false],
          [true, false, true],
        ],
      ],
      `id=${a}인 첫 항목만 새 객체로 만들어 done을 뒤집습니다. 원본 배열이나 원본 항목의 속성을 직접 수정하지 않습니다.`,
    );

    // HTTP: 성공 응답 범위, 캐시 수명, PUT의 명시적인 계약.
    const statuses = Array.from(
      { length: a },
      (_, n) => [200, 201, 204, 301, 404, 500][(n + i) % 6],
    );
    js(
      "http",
      "http-success-range",
      "Fetch Response.ok와 같은 200 이상 300 미만 조건을 만족하는 응답은 몇 개인가요?",
      `const statuses = ${JSON.stringify(statuses)};\nconst result = statuses.filter(status => status >= 200 && status < 300).length;`,
      statuses.filter((s) => s >= 200 && s < 300).length,
      [statuses.length + 1, -1, "모두 성공"],
      "200, 201, 204는 성공 범위입니다. 301은 리다이렉트, 404와 500은 오류 범위이므로 이 조건에 포함하지 않습니다.",
    );
    const maxAge = 60 + i * 7;
    const age = i * 2;
    numeric(
      "http",
      "cache-freshness-budget",
      "응답을 받은 뒤 시간이 더 흐르지 않았고 다른 캐시 지시문이 없을 때, 신선한 캐시로 사용할 수 있는 남은 시간은 몇 초인가요?",
      `Cache-Control: public, max-age=${maxAge}\nAge: ${age}\n/* 이 연습에서는 current_age = Age이고 남은 수명 = max-age - current_age입니다. */`,
      maxAge - age,
      `이미 지난 수명 ${age}초를 허용 수명 ${maxAge}초에서 뺍니다. 남은 ${maxAge - age}초 안에서는 이 연습의 캐시 조건상 신선합니다.`,
      [maxAge, maxAge + age, age],
    );
    numeric(
      "http",
      "put-replacement-idempotence",
      "이 API 계약에서 같은 PUT 요청을 여러 번 처리한 뒤 저장된 quantity는 얼마인가요?",
      `초기 quantity: ${a}\nPUT /items/${i}\n본문: { "quantity": ${a + b} }\n처리 횟수: ${b + 2}\n계약: 매 요청마다 quantity를 본문의 숫자로 교체합니다.`,
      a + b,
      `각 요청이 quantity를 ${a + b}로 교체하므로 반복해도 최종 값은 같습니다. 표시된 API는 증가가 아닌 교체 계약을 사용합니다.`,
      [a, a + (a + b) * (b + 2), (a + b) * (b + 2)],
    );

    // Node: 명시적인 미들웨어 실행 모델, 반복 쿼리, 입력 검증.
    js(
      "node",
      "middleware-next-order",
      "Express의 next 전달을 단순화한 실행 모델입니다. 출력 배열은 무엇인가요?",
      `const trace = [];\nconst middleware = [\n  next => { trace.push("요청${i}"); next(); trace.push("복귀${i}"); },\n  next => { trace.push("검증${i}"); next(); },\n  () => { trace.push("응답${i}"); }\n];\nfunction dispatch(index) { middleware[index]?.(() => dispatch(index + 1)); }\ndispatch(0);\nconst result = trace;`,
      [`요청${i}`, `검증${i}`, `응답${i}`, `복귀${i}`],
      [
        [`요청${i}`, `복귀${i}`, `검증${i}`, `응답${i}`],
        [`응답${i}`, `검증${i}`, `요청${i}`, `복귀${i}`],
        [`요청${i}`, `검증${i}`, `응답${i}`],
      ],
      "next 호출이 다음 함수를 실행합니다. 다음 함수들이 반환하면 첫 함수의 next 뒤 코드로 돌아오므로 복귀 기록이 마지막입니다. 이 예시는 동기 함수만 사용합니다.",
    );
    const tagCount = 2 + (i % 5);
    const query = Array.from(
      { length: tagCount },
      (_, n) => `tag=${topic}${n}`,
    ).join("&");
    js(
      "node",
      "url-repeated-query",
      "같은 이름으로 여러 번 전달한 쿼리를 getAll로 읽으면 배열 길이는 얼마인가요?",
      `const url = new URL("https://example.test/notes?${query}");\nconst result = url.searchParams.getAll("tag").length;`,
      tagCount,
      [1, tagCount + 1, tagCount + 2],
      `getAll은 tag의 모든 값을 배열로 반환하므로 ${tagCount}개입니다. get은 첫 값 하나를 반환하므로 두 메서드를 구분합니다.`,
    );
    const inputs = ["", " ", topic, `${topic}-${i}`, "x".repeat(a + 5)];
    const minLength = 2;
    const maxLength = a;
    const validInputs = inputs.filter(
      (s) => s.trim().length >= minLength && s.trim().length <= maxLength,
    ).length;
    js(
      "node",
      "trim-length-validation",
      "서버 입력 검증을 단순화한 함수입니다. 허용되는 문자열은 몇 개인가요?",
      `const inputs = ${JSON.stringify(inputs)};\nconst result = inputs.filter(input => {\n  const text = input.trim();\n  return text.length >= ${minLength} && text.length <= ${maxLength};\n}).length;`,
      validInputs,
      [inputs.length, inputs.length + 1, -1],
      `trim 뒤 길이가 ${minLength} 이상 ${maxLength} 이하인 문자열만 남깁니다. 공백뿐인 입력과 최대 길이를 넘는 입력은 허용하지 않습니다.`,
    );

    // DB: MongoDB 범위 필터·프로젝션과 트랜잭션 상태 추적.
    const documents = Array.from({ length: 6 }, (_, n) => ({
      _id: n + 1,
      score: a + n * b,
    }));
    const lower = a + b;
    const upper = a + 4 * b;
    numeric(
      "database",
      "mongo-range-query",
      "표시된 MongoDB 문서만 있을 때 이 find 조건에 맞는 문서는 몇 개인가요?",
      `${JSON.stringify(documents, null, 2)}\n\ndb.scores.find({ score: { $gte: ${lower}, $lt: ${upper} } })`,
      3,
      `$gte는 ${lower} 이상, $lt는 ${upper} 미만입니다. 두 조건을 모두 만족하는 점수 ${lower}, ${lower + b}, ${lower + 2 * b}의 문서 세 개입니다.`,
      [6, 4, 2],
    );
    const projectionFields = Array.from(
      { length: b },
      (_, n) => `field${i + n}`,
    );
    const document = {
      _id: i,
      ...Object.fromEntries(projectionFields.map((key, n) => [key, a + n])),
      privateMemo: topic,
    };
    const projection = {
      _id: 0,
      ...Object.fromEntries(projectionFields.map((key) => [key, 1])),
    };
    numeric(
      "database",
      "mongo-inclusion-projection",
      "문서는 표시된 하나뿐입니다. 이 포함 프로젝션의 결과 객체에 있는 최상위 필드는 몇 개인가요?",
      `문서: ${JSON.stringify(document)}\n프로젝션: ${JSON.stringify(projection)}\ndb.entries.findOne({ _id: ${i} }, ${JSON.stringify(projection)})`,
      b,
      `값이 1인 ${b}개 필드만 포함합니다. _id: 0으로 _id를 제외했고 privateMemo는 포함 목록에 없으므로 결과에 나오지 않습니다.`,
      [b + 1, b + 2, 0],
    );
    numeric(
      "database",
      "transaction-rollback-state",
      "다른 연결의 변경이 없고 트랜잭션이 표시된 순서대로 실행될 때 ROLLBACK 뒤 balance는 얼마인가요?",
      `커밋된 초기 balance = ${a * 10}\nBEGIN;\nUPDATE accounts SET balance = balance + ${b * 10} WHERE id = ${i};\nUPDATE accounts SET balance = balance - ${b} WHERE id = ${i};\nROLLBACK;\n/* 초기 행은 하나이며 모든 UPDATE는 같은 행에 적용됩니다. */`,
      a * 10,
      `ROLLBACK은 이 트랜잭션의 두 변경을 취소합니다. 따라서 미커밋 계산값 ${a * 10 + b * 10 - b} 대신 커밋된 초기값 ${a * 10}을 유지합니다.`,
      [a * 10 + b * 10 - b, a * 10 + b * 10, a * 10 - b],
    );

    // 인증: 토큰 시각 단위와 서버의 소유권 정책.
    const issued = 1700000000 + i * 100;
    const lifetime = 300 + i * 11;
    const elapsed = i * 3;
    numeric(
      "auth",
      "jwt-exp-seconds",
      "서명 검증을 통과한 토큰입니다. 시계 오차 허용이 0일 때 exp까지 남은 시간은 몇 초인가요?",
      `JWT payload: { "iat": ${issued}, "exp": ${issued + lifetime} }\n현재 서버 시각(Unix 초): ${issued + elapsed}`,
      lifetime - elapsed,
      `exp와 현재 시각을 모두 Unix 초로 비교합니다. ${issued + lifetime} - ${issued + elapsed} = ${lifetime - elapsed}초입니다. 이 계산만으로 토큰 서명을 검증하는 것은 아닙니다.`,
      [lifetime, lifetime + elapsed, elapsed],
    );
    const userId = `user-${i}`;
    const owned = Array.from({ length: a }, (_, n) => ({
      id: n + 1,
      ownerId: n % b === 0 ? userId : "another-user",
    }));
    js(
      "auth",
      "owner-authorization-count",
      "일반 사용자는 ownerId가 자신의 id와 같은 항목만 수정할 수 있다는 서버 정책입니다. 허용되는 항목은 몇 개인가요?",
      `const userId = ${JSON.stringify(userId)};\nconst records = ${JSON.stringify(owned)};\nconst result = records.filter(record => record.ownerId === userId).length;`,
      owned.filter((r) => r.ownerId === userId).length,
      [owned.length, owned.length + 1, -1],
      "인증된 사용자 id와 각 항목의 소유자 id를 서버에서 비교합니다. id를 알고 있거나 화면에서 수정 버튼이 보인다는 이유만으로 권한이 생기지는 않습니다.",
    );

    // 실행·배포: 이 문제에 적힌 환경 변수 계약과 정확한 Origin 비교.
    const envPort = 4100 + i;
    const defaultPort = 3000 + i;
    js(
      "deploy",
      "environment-port-fallback",
      "이 실행 설정에서 최종 port 값은 얼마인가요?",
      `const env = ${JSON.stringify(i % 2 ? { PORT: String(envPort) } : {})};\nconst port = Number(env.PORT ?? ${defaultPort});\nconst result = port;`,
      i % 2 ? envPort : defaultPort,
      [i % 2 ? defaultPort : envPort, 0, -1],
      i % 2
        ? `PORT 문자열을 Number로 변환하여 ${envPort}를 사용합니다.`
        : `PORT가 undefined이므로 기본값 ${defaultPort}를 사용합니다. 실제 실행 설정마다 기본값과 검증 규칙을 확인해야 합니다.`,
    );
    const origin = `https://app${i}.example.test`;
    const origins = [
      origin,
      `${origin}:443`,
      `${origin}/`,
      `http://app${i}.example.test`,
      origin,
    ];
    js(
      "deploy",
      "cors-exact-allowlist",
      "이 서버는 입력 문자열을 정규화하지 않고 허용 목록과 정확히 비교합니다. 허용으로 판단한 요청은 몇 개인가요?",
      `const allowed = new Set([${JSON.stringify(origin)}]);\nconst originHeaders = ${JSON.stringify(origins)};\nconst result = originHeaders.filter(origin => allowed.has(origin)).length;`,
      2,
      [5, 4, 1],
      "정확히 같은 문자열 두 개만 일치합니다. 포트·후행 슬래시·스킴 차이를 자동으로 보정하는 코드는 없습니다. 이 연습은 서버 비교 규칙을 묻습니다.",
    );

    // Career Hub 형태의 연습 데이터이며 실제 앱 저장 데이터와는 독립적입니다.
    const applications = Array.from({ length: a }, (_, n) => ({
      company: `${topic}-${n}`,
      status: n % b === 0 ? "interview" : "applied",
    }));
    js(
      "career-hub",
      "career-status-summary",
      "Career Hub 형식의 연습 데이터에서 status가 interview인 지원 기록은 몇 개인가요?",
      `const applications = ${JSON.stringify(applications)};\nconst result = applications.filter(application => application.status === "interview").length;`,
      applications.filter((r) => r.status === "interview").length,
      [applications.length, applications.length + 1, -1],
      "배열의 전체 길이와 면접 상태의 개수는 다릅니다. 표시된 status를 정확히 비교해 조건에 맞는 지원 기록만 집계합니다.",
    );
    const projects = [
      { id: a, title: topic },
      { id: a + 1, title: `${topic}-api` },
    ];
    const linked = [a, a + 1, a + 2, a, a + 3];
    js(
      "career-hub",
      "career-project-link-integrity",
      "연습 지원 데이터에서 현재 프로젝트 목록에 존재하는 projectId를 가진 기록은 몇 개인가요?",
      `const projects = ${JSON.stringify(projects)};\nconst projectIds = ${JSON.stringify(linked)};\nconst knownIds = new Set(projects.map(project => project.id));\nconst result = projectIds.filter(id => knownIds.has(id)).length;`,
      3,
      [5, 2, 1],
      `현재 존재하는 프로젝트 id는 ${a}, ${a + 1}입니다. ${a}를 연결한 두 기록과 ${a + 1}을 연결한 한 기록이 유효하며, 중복 연결 기록도 각각 한 기록으로 셉니다.`,
    );

    // TypeScript: 타입 표기를 제거한 실제 실행 결과도 테스트합니다.
    const typedAdd = (family, question, code, value, explanation) => {
      const choices = [value, value + 1, value + 2, value + 3];
      add(
        "typescript",
        family,
        question,
        `${code}\nconsole.log(JSON.stringify(result));`,
        String(value),
        choices.slice(1).map(String),
        explanation,
        { check: "typescript" },
      );
    };
    const unionIsOk = i % 2 === 1;
    typedAdd(
      "discriminated-union-result",
      "구별 가능한 유니온 타입에서 kind로 분기한 출력은 무엇인가요?",
      `type Reply = { kind: "ok"; value: number } | { kind: "error"; message: string };\nconst reply: Reply = ${unionIsOk ? `{ kind: "ok", value: ${a} }` : `{ kind: "error", message: "${topic}" }`};\nfunction read(reply: Reply): number {\n  return reply.kind === "ok" ? reply.value * 2 : reply.message.length;\n}\nconst result = read(reply);`,
      unionIsOk ? a * 2 : topic.length,
      unionIsOk
        ? "kind가 ok이므로 value 속성이 있는 타입으로 좁혀집니다. 숫자 value에 2를 곱합니다."
        : "kind가 error이므로 message 속성이 있는 타입으로 좁혀집니다. 문자열 message의 길이를 반환합니다.",
    );
    typedAdd(
      "generic-property-result",
      "제네릭 함수가 선택한 객체 속성의 값은 무엇인가요?",
      `function pick<T, K extends keyof T>(item: T, key: K): T[K] { return item[key]; }\nconst item = { count: ${a}, limit: ${a + b} };\nconst result = pick(item, "limit");`,
      a + b,
      `K는 item에 존재하는 키로 제한됩니다. limit을 전달했으므로 해당 속성의 숫자 ${a + b}를 반환합니다. 제네릭 표기가 실행 중 값을 바꾸지는 않습니다.`,
    );
    typedAdd(
      "optional-property-fallback",
      "선택적 속성과 ?? 기본값을 사용한 TypeScript 출력은 무엇인가요?",
      `interface Options { limit?: number; }\nconst options: Options = ${i % 2 ? "{ limit: 0 }" : "{}"};\nconst result = options.limit ?? ${a};`,
      i % 2 ? 0 : a,
      i % 2
        ? "limit이 0이면 ??는 0을 유지합니다. optional 속성이라는 이유로 값을 제거하거나 변환하지 않습니다."
        : `limit이 없어서 undefined이므로 기본값 ${a}를 사용합니다.`,
    );

    // SQL: NULL 집계, HAVING, DISTINCT, LEFT JOIN 뒤 필터.
    const nullableRows = Array.from({ length: a }, (_, n) => [
      n + 1,
      n % b === 0 ? null : a + n,
    ]);
    const nonNullCount = nullableRows.filter((r) => r[1] !== null).length;
    numeric(
      "sql",
      "count-null-column",
      "표시된 행만 있을 때 COUNT(score)의 결과는 얼마인가요?",
      `scores(id, score)\n${nullableRows.map((r) => r.map((v) => (v === null ? "NULL" : v)).join(", ")).join("\n")}\n\nSELECT COUNT(score) FROM scores;`,
      nonNullCount,
      `COUNT(score)는 score가 NULL이 아닌 ${nonNullCount}개 행을 셉니다. 모든 행을 세는 COUNT(*)와 구분합니다.`,
      [nullableRows.length, nullableRows.length + 1, 0],
      {
        check: "sql",
        fixture: {
          table: "scores",
          columns: ["id", "score"],
          rows: nullableRows,
          query: "SELECT COUNT(score) FROM scores",
        },
      },
    );
    const groupedRows = [
      ["A", a],
      ["A", b],
      ["B", a],
      ["C", a + b + 1],
    ];
    const groupQuery = `SELECT COUNT(*) FROM (SELECT dept FROM sales GROUP BY dept HAVING SUM(amount) > ${a + b}) grouped`;
    numeric(
      "sql",
      "having-group-filter",
      "HAVING으로 남긴 그룹 수를 세는 이 SQL의 결과는 얼마인가요?",
      `sales(dept, amount)\n${groupedRows.map((r) => r.join(", ")).join("\n")}\n\n${groupQuery};`,
      1,
      `A의 합 ${a + b}는 기준과 같아 >를 만족하지 않습니다. B의 합 ${a}도 제외되고 C의 합 ${a + b + 1}만 남아 그룹은 하나입니다.`,
      [3, 2, 0],
      {
        check: "sql",
        fixture: {
          table: "sales",
          columns: ["dept", "amount"],
          rows: groupedRows,
          query: groupQuery,
        },
      },
    );
    const distinctRows = [
      [topic],
      [topic],
      [`${topic}-api`],
      [null],
      [`${topic}-db`],
      [null],
    ];
    numeric(
      "sql",
      "count-distinct-null",
      "중복 문자열과 NULL을 포함한 표에서 COUNT(DISTINCT tag)의 결과는 얼마인가요?",
      `tags(tag)\n${distinctRows.map((r) => (r[0] === null ? "NULL" : `'${r[0]}'`)).join("\n")}\n\nSELECT COUNT(DISTINCT tag) FROM tags;`,
      3,
      "COUNT(DISTINCT tag)는 NULL을 제외한 서로 다른 tag 값의 수를 셉니다. 같은 문자열이 여러 행에 있어도 한 번만 셉니다.",
      [6, 4, 2],
      {
        check: "sql",
        fixture: {
          table: "tags",
          columns: ["tag"],
          rows: distinctRows,
          query: "SELECT COUNT(DISTINCT tag) FROM tags",
        },
      },
    );
    const joinRows = Array.from({ length: a }, (_, n) => [
      n + 1,
      n % b === 0 ? null : (n % 2) + 1,
    ]);
    const joinCount = joinRows.filter((r) => r[1] === 1).length;
    numeric(
      "sql",
      "left-join-where-filter",
      "LEFT JOIN 뒤 오른쪽 열에 WHERE 조건을 적용한 결과 행 수는 얼마인가요?",
      `employees(id, dept_id)\n${joinRows.map((r) => r.map((v) => (v === null ? "NULL" : v)).join(", ")).join("\n")}\ndepartments(id): 1, 2 (각각 한 행)\n\nSELECT COUNT(*) FROM employees e LEFT JOIN departments d ON e.dept_id = d.id WHERE d.id = 1;`,
      joinCount,
      `LEFT JOIN에서 남긴 행에도 WHERE를 적용합니다. d.id가 NULL인 행은 = 1을 만족하지 않으므로 제외되고 부서 1과 연결된 ${joinCount}행만 남습니다.`,
      [joinRows.length, joinRows.length + 1, -1],
      { check: "join", rows: joinRows, join: "LEFT", where: "WHERE d.id = 1" },
    );

    // Java: 정수 나눗셈, 값 비교, Set 중복 제거.
    numeric(
      "spring",
      "java-integer-division",
      "두 피연산자가 int인 Java 코드에서 출력되는 정수는 무엇인가요?",
      `int total = ${a * b + 1};\nint groups = ${b};\nSystem.out.println(total / groups);`,
      a,
      `양수 int끼리 나누면 소수 부분을 버립니다. ${a * b + 1} / ${b}의 정수 몫은 ${a}입니다. 실수 나눗셈을 원하면 피연산자를 실수형으로 바꿉니다.`,
      [a + 1, a * b + 1, b],
    );
    const names = [topic, `${topic}-api`, topic, `${topic}-db`, topic];
    numeric(
      "spring",
      "java-string-equals-count",
      "Java에서 equals로 문자열 내용을 비교합니다. count 출력은 얼마인가요?",
      `String[] names = { ${names.map((n) => `new String("${n}")`).join(", ")} };\nint count = 0;\nfor (String name : names) {\n  if (name.equals("${topic}")) count++;\n}\nSystem.out.println(count);`,
      3,
      "equals는 문자열 내용을 비교합니다. 서로 다른 new String 객체여도 내용이 같은 세 항목이 조건을 만족합니다. ==로 객체 참조를 비교하는 것과 구분합니다.",
      [5, 0, 2],
    );
    const setValues = [a, a + 1, a, a + 2, a + 1, a + 3];
    numeric(
      "spring",
      "java-set-size",
      "Java HashSet에 표시된 정수를 차례로 넣으면 size 출력은 얼마인가요?",
      `Set<Integer> ids = new HashSet<>();\nfor (int id : new int[] { ${setValues.join(", ")} }) ids.add(id);\nSystem.out.println(ids.size());\n/* java.util.Set과 java.util.HashSet을 import했습니다. */`,
      4,
      `Set은 같은 값의 중복을 허용하지 않습니다. 서로 다른 ${a}, ${a + 1}, ${a + 2}, ${a + 3} 네 값만 남습니다. 순회 순서를 가정하는 문제는 아닙니다.`,
      [setValues.length, 3, 5],
    );

    // 테스트: 사례별 기대값과 경계의 포함 여부.
    const testCases = [
      [a, b, a + b],
      [a, 0, a],
      [0, b, b + 1],
      [-a, b, b - a],
    ];
    js(
      "testing",
      "test-case-expectations",
      "각 배열은 [입력 x, 입력 y, 기대값]입니다. 실제 함수 결과와 기대값이 같은 사례는 몇 개인가요?",
      `const cases = ${JSON.stringify(testCases)};\nfunction add(x, y) { return x + y; }\nconst result = cases.filter(([x, y, expected]) => add(x, y) === expected).length;`,
      3,
      [4, 2, 0],
      `첫째·둘째·넷째 기대값은 덧셈 결과와 같습니다. 셋째는 0 + ${b}가 ${b}인데 기대값이 ${b + 1}이어서 실패합니다. 테스트가 있다는 사실과 기대값이 올바른지는 따로 확인합니다.`,
    );
    const boundaryCases = [a - 1, a, a + 1, a + b - 1, a + b, a + b + 1];
    js(
      "testing",
      "inclusive-boundary-cases",
      "최소·최대 경계를 포함하는 검증 함수입니다. 허용하는 경계 사례는 몇 개인가요?",
      `const cases = ${JSON.stringify(boundaryCases)};\nfunction valid(value) { return value >= ${a} && value <= ${a + b}; }\nconst result = cases.filter(valid).length;`,
      4,
      [6, 2, 0],
      `최소보다 1 작은 ${a - 1}, 최대보다 1 큰 ${a + b + 1}만 제외합니다. >=와 <=이므로 경계값 자체는 허용됩니다. 배열의 각 사례를 따로 셉니다.`,
    );

    // Git: 공통 조상 이후의 커밋과 이미 추적 중인 파일.
    numeric(
      "git",
      "branch-ahead-behind",
      "표시된 선형 분기에서 feature에만 있는 커밋 수(ahead)는 얼마인가요? merge 커밋은 없습니다.",
      `공통 조상까지 커밋 ${a}개\nmain은 공통 조상 뒤에 커밋 ${b}개\nfeature는 공통 조상 뒤에 커밋 ${b + i}개\n/* 분기 뒤 양쪽에 같은 커밋은 없고 커밋은 각각 서로 다릅니다. */`,
      b + i,
      `feature에만 있는 커밋은 공통 조상 이후 feature의 ${b + i}개입니다. 공통 커밋 ${a}개와 main에만 있는 ${b}개를 더하지 않습니다.`,
      [a + b + i, b, a + b],
    );
    const files = Array.from({ length: a }, (_, n) => ({
      path: `${topic}/file${n}.log`,
      tracked: n % b === 0,
    }));
    numeric(
      "git",
      "ignore-already-tracked",
      ".gitignore에 *.log만 추가했습니다. 삭제나 git rm --cached를 하지 않았다면 계속 추적되는 표시 파일은 몇 개인가요?",
      `${files.map((f) => `${f.path}: ${f.tracked ? "이미 추적 중" : "아직 추적 안 됨"}`).join("\n")}\n\n.gitignore:\n*.log`,
      files.filter((f) => f.tracked).length,
      `.gitignore는 이미 추적 중인 파일을 자동으로 추적 해제하지 않습니다. 표시된 기존 추적 파일 ${files.filter((f) => f.tracked).length}개는 계속 추적됩니다.`,
      [0, files.length, files.length + 1],
    );

    // Docker: 포트의 방향과 선형 빌드의 캐시 무효화.
    const hostPort = 8100 + i;
    const containerPort = 3100 + i;
    numeric(
      "docker",
      "published-host-port",
      "이 컨테이너의 앱에 호스트에서 localhost로 접속할 때 URL에 쓸 포트는 무엇인가요?",
      `docker run -p 127.0.0.1:${hostPort}:${containerPort} example-app\n/* 앱은 컨테이너 안에서 0.0.0.0:${containerPort}로 수신합니다. */`,
      hostPort,
      `-p의 순서는 호스트 주소:호스트 포트:컨테이너 포트입니다. 호스트 URL은 http://127.0.0.1:${hostPort}이며 내부 수신 포트와 구분합니다.`,
      [containerPort, hostPort + containerPort, hostPort + 1],
    );
    const layerCount = 6 + i;
    const changedLayer = 2 + (i % 3);
    numeric(
      "docker",
      "linear-build-cache-invalidation",
      "이 단일 단계·선형 빌드에서 처음 캐시가 달라진 단계 이후는 모두 다시 실행합니다. 다시 실행할 단계는 몇 개인가요?",
      `캐시 가능한 단계 수: ${layerCount}\n단계 번호: 1부터 ${layerCount}\n처음 캐시가 달라진 단계: ${changedLayer}\n/* 앞 단계 캐시는 유효하고 병렬 단계, 외부 캐시, cache mount는 없습니다. */`,
      layerCount - changedLayer + 1,
      `달라진 ${changedLayer}번 단계부터 ${layerCount}번까지 포함해서 셉니다. ${layerCount} - ${changedLayer} + 1 = ${layerCount - changedLayer + 1}개 단계입니다.`,
      [layerCount - changedLayer, layerCount, changedLayer],
    );

    // CS: 이진 탐색의 실제 비교 수와 페이지 단위 할당.
    const sorted = Array.from({ length: a }, (_, n) => n * b + i);
    const target = sorted[i % sorted.length];
    let low = 0,
      high = sorted.length - 1,
      probes = 0;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      probes++;
      if (sorted[mid] === target) break;
      if (sorted[mid] < target) low = mid + 1;
      else high = mid - 1;
    }
    js(
      "cs",
      "binary-search-probes",
      "표시된 이진 탐색이 값을 찾을 때까지 mid의 값을 검사하는 횟수는 얼마인가요?",
      `const values = ${JSON.stringify(sorted)};\nconst target = ${target};\nlet low = 0, high = values.length - 1, result = 0;\nwhile (low <= high) {\n  const mid = Math.floor((low + high) / 2);\n  result++;\n  if (values[mid] === target) break;\n  if (values[mid] < target) low = mid + 1;\n  else high = mid - 1;\n}`,
      probes,
      [sorted.length, sorted.length + 1, 0],
      `정렬된 배열의 중간값을 보고 탐색 구간을 줄입니다. 표시된 target=${target}에 도달할 때까지 ${probes}번 검사합니다. 최대 복잡도와 이 입력의 실제 횟수를 구분합니다.`,
    );
    const pages = a;
    const pageSize = 4096;
    const bytes = pages * pageSize + b;
    numeric(
      "cs",
      "memory-page-ceiling",
      "빈 공간을 다른 할당과 공유하지 않고 페이지 전체를 할당할 때 필요한 페이지 수는 얼마인가요?",
      `요청 크기: ${bytes}바이트\n페이지 크기: ${pageSize}바이트\n/* 메타데이터 비용은 없고 필요한 크기를 페이지 단위로 올림합니다. */`,
      pages + 1,
      `${pages}페이지에 ${pages * pageSize}바이트가 들어가고 ${b}바이트가 더 남습니다. 남은 부분에도 한 페이지가 필요해 총 ${pages + 1}페이지입니다.`,
      [pages, pages + 2, pageSize],
    );

    // 보안: HTML 텍스트 이스케이프와 로그에서 비밀 값 제거.
    const unsafeText = `<${topic}> & "${i}"`;
    const escaped = `&lt;${topic}&gt; &amp; &quot;${i}&quot;`;
    js(
      "security",
      "html-text-escaping",
      "HTML 텍스트용 특수문자 변환 함수의 출력 문자열은 무엇인가요?",
      `const text = ${JSON.stringify(unsafeText)};\nconst entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };\nconst result = text.replace(/[&<>\"]/g, character => entities[character]);`,
      escaped,
      [
        unsafeText,
        `&lt;${topic}&gt; & "${i}"`,
        `&amp;lt;${topic}&amp;gt; &amp;amp; &amp;quot;${i}&amp;quot;`,
      ],
      "정규식이 원본에서 각 특수문자를 한 번씩 바꿉니다. 새로 생긴 &를 같은 replace 호출에서 다시 변환하지 않습니다. 이 함수는 URL·JavaScript 등 다른 문맥의 검증을 대신하지 않습니다.",
    );
    const logEntry = {
      userId: i,
      password: `pw-${topic}`,
      token: `token-${i}`,
      action: topic,
    };
    const safeEntry = {
      userId: i,
      password: "[REDACTED]",
      token: "[REDACTED]",
      action: topic,
    };
    js(
      "security",
      "log-secret-redaction",
      "로그에서 지정한 두 비밀 필드의 값을 가리는 코드입니다. 출력 객체는 무엇인가요?",
      `const entry = ${JSON.stringify(logEntry)};\nconst secrets = new Set(["password", "token"]);\nconst result = Object.fromEntries(Object.entries(entry).map(([key, value]) => [key, secrets.has(key) ? "[REDACTED]" : value]));`,
      safeEntry,
      [
        logEntry,
        {
          userId: "[REDACTED]",
          password: logEntry.password,
          token: logEntry.token,
          action: topic,
        },
        { userId: i, action: topic },
      ],
      "password와 token의 키는 유지하고 값만 가립니다. userId와 action은 유지합니다. 이 코드는 지정한 최상위 키만 처리하므로 중첩된 비밀 값에는 별도 처리가 필요합니다.",
    );

    // Note Hub 형태의 연습 데이터: 정규화와 페이지 경계.
    const tags = [
      ` ${topic.toUpperCase()} `,
      topic,
      "",
      ` ${topic}-api `,
      `${topic}-API`,
      "  ",
    ];
    js(
      "note-hub",
      "note-tag-normalization",
      "태그를 공백 제거·소문자화·빈 값 제거·중복 제거하면 출력 배열은 무엇인가요?",
      `const tags = ${JSON.stringify(tags)};\nconst result = [...new Set(tags.map(tag => tag.trim().toLowerCase()).filter(Boolean))];`,
      [topic, `${topic}-api`],
      [
        tags,
        [topic, topic, `${topic}-api`, `${topic}-api`],
        [topic, "", `${topic}-api`],
      ],
      "먼저 trim과 소문자화를 적용해 같은 태그를 같은 문자열로 만듭니다. 빈 문자열을 제외하고 Set으로 중복을 제거하며 처음 나타난 순서를 유지합니다.",
    );
    const notes = Array.from({ length: a + b }, (_, n) => ({ id: n + 1 }));
    const offset = i % 3;
    const limit = b;
    js(
      "note-hub",
      "note-pagination-extra-row",
      "한 행을 더 조회해 다음 페이지 존재 여부를 판단합니다. [반환 개수, hasMore] 출력은 무엇인가요?",
      `const notes = ${JSON.stringify(notes)};\nconst fetched = notes.slice(${offset}, ${offset + limit + 1});\nconst result = [fetched.slice(0, ${limit}).length, fetched.length > ${limit}];`,
      [limit, true],
      [
        [limit + 1, true],
        [limit, false],
        [notes.length, false],
      ],
      `offset=${offset} 뒤에 limit=${limit}보다 한 행 더 조회합니다. 조회한 ${limit + 1}행 중 ${limit}행만 반환하고 초과 행이 있어 hasMore는 true입니다.`,
    );
  }
}

module.exports = { addExpandedPractice };
