// P1601~P2600: 프로그램의 기반 기술을 연습하는 50유형 × 20문항.
// fixture/check는 제작 시 실행 검증에만 쓰고 브라우저 문제 데이터에서는 제거합니다.
function addTechnologyPractice({ add, numeric, js }) {
  function browser(
    category,
    family,
    question,
    html,
    script,
    correct,
    alternatives,
    explanation,
  ) {
    add(
      category,
      family,
      question,
      `${html}\n\n// JavaScript\n${script}\nconsole.log(JSON.stringify(result));`,
      JSON.stringify(correct),
      alternatives.map((value) => JSON.stringify(value)),
      explanation,
      { check: "browser", fixture: { html, script } },
    );
  }
  function ts(family, question, code, correct, alternatives, explanation) {
    add(
      "typescript",
      family,
      question,
      `${code}\nconsole.log(JSON.stringify(result));`,
      JSON.stringify(correct),
      alternatives.map((value) => JSON.stringify(value)),
      explanation,
      { check: "typescript" },
    );
  }
  function sql(
    family,
    question,
    table,
    columns,
    rows,
    query,
    correct,
    explanation,
    alternatives = [],
  ) {
    numeric(
      "sql",
      family,
      question,
      `${table}(${columns.join(", ")})\n${rows.map((row) => row.map((v) => (v === null ? "NULL" : JSON.stringify(v))).join(", ")).join("\n")}\n\n${query};`,
      correct,
      explanation,
      alternatives,
      { check: "sql", fixture: { table, columns, rows, query } },
    );
  }
  for (let i = 1; i <= 20; i++) {
    const a = i + 7;
    const b = 2 + (i % 4);

    const checked = [`html-${i}`, `react-${i}`];
    const checkboxHtml = `<form id="skills">
  <input type="checkbox" name="skill" value="${checked[0]}" checked>
  <input type="checkbox" name="skill" value="css-${i}">
  <input type="checkbox" name="skill" value="${checked[1]}" checked>
  <input type="checkbox" name="skill" value="node-${i}" checked disabled>
</form>`;
    browser(
      "html",
      "form-checkbox-getall",
      "같은 name의 체크박스에서 다음 코드가 가져오는 배열은 무엇인가요?",
      checkboxHtml,
      `const result = new FormData(document.querySelector("#skills")).getAll("skill");`,
      checked,
      [
        [checked[0]],
        [`html-${i}`, `css-${i}`, `react-${i}`],
        [...checked, `node-${i}`],
      ],
      `getAll은 같은 name의 제출 값을 문서 순서대로 모읍니다. 값이 css-${i}인 미선택 체크박스와 값이 node-${i}인 disabled 체크박스는 제외합니다.`,
    );

    const options = Array.from(
      { length: b + 2 },
      (_, n) =>
        `<option value="${a + n}"${n % 2 === 0 ? " selected" : ""}>${a + n}</option>`,
    );
    const selectedValues = Array.from({ length: b + 2 }, (_, n) =>
      String(a + n),
    ).filter((_, n) => n % 2 === 0);
    browser(
      "html",
      "select-multiple-values",
      "multiple select에서 FormData로 읽은 값 배열은 무엇인가요? 스크립트로 선택을 바꾸지 않습니다.",
      `<form id="survey"><select name="score" multiple>${options.join("")}</select></form>`,
      'const result = new FormData(document.querySelector("#survey")).getAll("score");',
      selectedValues,
      [
        [selectedValues[0]],
        Array.from({ length: b + 2 }, (_, n) => String(a + n)),
        selectedValues.map(Number),
      ],
      `multiple select는 selected인 option을 각각 제출합니다. FormData의 값은 숫자처럼 보여도 문자열이므로 ${JSON.stringify(selectedValues)}입니다.`,
    );

    const rootSize = 12 + i;
    browser(
      "css",
      "relative-em-chain",
      "이 규칙만 있을 때 .child의 계산된 글꼴 크기는 몇 px인가요? 브라우저 확대는 100%입니다.",
      `<style>html { font-size: ${rootSize}px; } .parent { font-size: 1.5rem; } .child { font-size: 2em; }</style><div class="parent"><span class="child">문항 ${i}</span></div>`,
      'const result = parseFloat(getComputedStyle(document.querySelector(".child")).fontSize);',
      rootSize * 3,
      [rootSize, rootSize * 2, rootSize * 1.5],
      `부모의 1.5rem은 루트 ${rootSize}px의 1.5배입니다. 자식의 font-size: 2em은 부모 글꼴 크기의 2배이므로 ${rootSize} × 1.5 × 2 = ${rootSize * 3}px입니다.`,
    );
    const cell = 30 + i;
    const gap = i + 3;
    const span = 1 + (i % 3);
    browser(
      "css",
      "grid-span-internal-gaps",
      "고정 크기 grid 열을 가로지르는 .item의 테두리 상자 너비는 몇 px인가요? 다른 스타일은 없습니다.",
      `<style>.grid { display: grid; grid-template-columns: repeat(4, ${cell}px); gap: ${gap}px; } .item { grid-column: 1 / span ${span}; min-width: 0; padding: 0; border: 0; margin: 0; }</style><div class="grid"><div class="item">${i}</div></div>`,
      'const result = document.querySelector(".item").getBoundingClientRect().width;',
      cell * span + gap * (span - 1),
      [
        cell * span + gap * span,
        cell * span + gap * (span + 1),
        cell * span + gap * (span + 2),
      ],
      `${span}개 열의 너비와 그 안쪽 간격 ${span - 1}개를 합칩니다. ${cell} × ${span} + ${gap} × ${span - 1} = ${cell * span + gap * (span - 1)}px입니다.`,
    );

    js(
      "javascript",
      "closure-private-counter",
      "서로 다른 호출에서 만들어진 클로저의 출력 배열은 무엇인가요?",
      `function counter(start) { let value = start; return () => ++value; }\nconst first = counter(${a});\nconst second = counter(${a + b});\nconst result = [first(), first(), second(), first()];`,
      [a + 1, a + 2, a + b + 1, a + 3],
      [
        [a + 1, a + 2, a + 3, a + 4],
        [a, a + 1, a + b, a + 2],
        [a + 1, a + 1, a + b + 1, a + 1],
      ],
      `first와 second는 각각 별도의 value를 기억합니다. first는 세 번 호출되어 ${a + 1}, ${a + 2}, ${a + 3}을 반환하고 second의 첫 호출은 ${a + b + 1}입니다.`,
    );
    js(
      "javascript",
      "shallow-copy-nested-alias",
      "객체를 얕게 복사한 뒤 중첩 객체를 수정하면 출력은 무엇인가요?",
      `const original = { detail: { count: ${a} } };\nconst copy = { ...original };\ncopy.detail.count += ${b};\nconst result = [original.detail.count, copy.detail === original.detail];`,
      [a + b, true],
      [
        [a, false],
        [a, true],
        [a + b, false],
      ],
      `펼치기는 최상위 객체만 복사합니다. detail 참조는 공유하므로 원본의 count도 ${a + b}가 되고 참조 비교는 true입니다.`,
    );
    js(
      "javascript",
      "map-reference-keys",
      "Map에서 서로 다른 객체를 키로 사용한 결과는 무엇인가요?",
      `const key = { id: ${a} };\nconst map = new Map();\nmap.set(key, ${a});\nmap.set({ id: ${a} }, ${b});\nmap.set(key, ${a + b});\nconst result = [map.size, map.get(key)];`,
      [2, a + b],
      [
        [1, a + b],
        [3, a + b],
        [2, a],
      ],
      `내용이 같아도 새 객체는 별도 키입니다. 마지막 set은 첫 key의 값을 덮어쓰므로 항목은 2개이고 key의 값은 ${a + b}입니다.`,
    );
    js(
      "javascript",
      "array-every-some-empty",
      "조건 검사와 빈 배열의 every를 함께 출력하면 무엇인가요?",
      `const values = [${a}, ${a + 1}, ${a + 2}];\nconst result = [values.every(n => n > ${a}), values.some(n => n > ${a}), [].every(n => n > ${i})];`,
      [false, true, true],
      [
        [true, true, false],
        [false, false, false],
        [false, true, false],
      ],
      `첫 값 ${a}가 > ${a}를 만족하지 않아 every는 false이고, 뒤의 값이 만족하므로 some은 true입니다. 빈 배열의 every는 반례가 없어 true를 반환합니다.`,
    );

    const listHtml = `<ul id="list"><li>항목 ${i}</li><li>항목 ${i + 1}</li></ul>`;
    browser(
      "dom",
      "static-nodelist-live-collection",
      "요소를 추가한 뒤 처음 얻은 두 컬렉션의 길이 배열은 무엇인가요?",
      listHtml,
      `const list = document.querySelector("#list");\nconst fixed = list.querySelectorAll("li");\nconst live = list.getElementsByTagName("li");\nconst item = document.createElement("li");\nitem.textContent = "추가 ${i}";\nlist.append(item);\nconst result = [fixed.length, live.length];`,
      [2, 3],
      [
        [3, 3],
        [2, 2],
        [3, 2],
      ],
      "querySelectorAll은 조회 시점의 정적 NodeList를 반환합니다. getElementsByTagName의 HTMLCollection은 DOM 추가를 반영하므로 각각 2와 3입니다.",
    );
    browser(
      "dom",
      "delegation-closest-target",
      "span을 클릭하면 위임된 리스너가 기록하는 배열은 무엇인가요?",
      `<ul id="list"><li><button data-id="${a}"><span id="label">항목 ${i}</span></button></li></ul>`,
      'const list = document.querySelector("#list");\nconst result = [];\nlist.addEventListener("click", event => {\n  const button = event.target.closest("button[data-id]");\n  result.push([event.target.tagName, event.currentTarget.tagName, button.dataset.id]);\n});\ndocument.querySelector("#label").click();',
      [["SPAN", "UL", String(a)]],
      [
        [["BUTTON", "UL", String(a)]],
        [["SPAN", "BUTTON", String(a)]],
        [["UL", "UL", String(a)]],
      ],
      `target은 실제 클릭한 SPAN, currentTarget은 리스너가 붙은 UL입니다. closest는 자신부터 조상 방향으로 찾아 BUTTON을 얻고 dataset 값은 문자열 "${a}"입니다.`,
    );

    js(
      "react",
      "reducer-action-sequence",
      "useReducer에 넘길 이 순수 reducer를 같은 순서로 호출한 최종 state는 무엇인가요?",
      `function reducer(state, action) {\n  if (action.type === "add") return { count: state.count + action.amount };\n  if (action.type === "reset") return { count: 0 };\n  return state;\n}\nconst actions = [{ type: "add", amount: ${a} }, { type: "reset" }, { type: "add", amount: ${b} }];\nconst result = actions.reduce(reducer, { count: ${a + b} });`,
      { count: b },
      [{ count: a + b }, { count: 0 }, { count: a + b * 2 }],
      `첫 add 뒤 reset이 count를 0으로 교체합니다. 마지막 add의 ${b}만 남습니다. reducer는 이전 객체를 직접 고치지 않고 새 객체를 반환합니다.`,
    );
    js(
      "react",
      "nested-state-immutable-update",
      "중첩 state를 이 방식으로 갱신하면 원본 값과 참조 비교는 무엇인가요?",
      `const state = { profile: { score: ${a} }, theme: { mode: "light" } };\nconst next = { ...state, profile: { ...state.profile, score: ${a + b} } };\nconst result = [state.profile.score, next.profile === state.profile, next.theme === state.theme];`,
      [a, false, true],
      [
        [a + b, true, true],
        [a, false, false],
        [a + b, false, true],
      ],
      `profile까지 새 객체로 복사해 원본 score는 ${a}입니다. profile 참조는 달라지고 수정하지 않은 theme 참조는 재사용됩니다.`,
    );
    const changed = i % 2 === 0;
    const nextKey = changed ? `other-${i}` : `item-${i}`;
    numeric(
      "react",
      "key-state-preservation",
      "첫 렌더가 완료된 뒤 같은 부모 위치에서 두 번째 렌더를 했습니다. span이 표시하는 count는 얼마인가요? 클릭·Effect·Strict Mode는 없습니다.",
      `function Counter({ initial }) {\n  const [count] = useState(initial);\n  return <span>{count}</span>;\n}\n// 첫 렌더: <Counter key="item-${i}" initial={${a}} />\n// 두 번째 렌더: <Counter key="${nextKey}" initial={${a + b}} />`,
      changed ? a + b : a,
      changed
        ? `key가 바뀌어 이전 컴포넌트의 state를 버리고 새로 마운트합니다. useState의 새 초깃값 ${a + b}를 표시합니다.`
        : `컴포넌트 종류·위치·key가 같아 state ${a}를 보존합니다. initial prop이 바뀌어도 이미 만든 state의 초깃값을 다시 적용하지 않습니다.`,
      [changed ? a : a + b, 0, a + b * 2],
      {
        check: "react-key",
        fixture: {
          initial: a,
          next: a + b,
          fromKey: `item-${i}`,
          toKey: nextKey,
        },
      },
    );

    js(
      "http",
      "query-append-versus-set",
      "append 뒤 set을 호출한 쿼리의 getAll 결과는 무엇인가요?",
      `const params = new URLSearchParams();\nparams.append("tag", "react-${i}");\nparams.append("tag", "node-${i}");\nparams.set("tag", "sql-${i}");\nconst result = params.getAll("tag");`,
      [`sql-${i}`],
      [
        [`react-${i}`, `node-${i}`, `sql-${i}`],
        [`react-${i}`, `sql-${i}`],
        [`node-${i}`],
      ],
      `append는 같은 이름의 값을 추가하지만 set은 해당 이름의 기존 값들을 새 값 하나로 교체합니다. 따라서 sql-${i} 하나만 남습니다.`,
    );
    numeric(
      "http",
      "head-response-body-budget",
      "아래 HTTP 응답들의 본문 데이터만 합하면 몇 바이트인가요? 헤더·프레이밍·압축은 계산하지 않습니다.",
      `GET /file-${i}: 200, 본문 ${a * 100}바이트\nHEAD /file-${i}: 200, Content-Length: ${a * 100}, 본문 없음\nGET /file-${i} (조건부 요청): 304, 본문 없음`,
      a * 100,
      `HEAD는 GET이 보낼 본문 길이를 Content-Length로 알릴 수 있지만 응답 본문은 보내지 않습니다. 304에도 본문이 없으므로 첫 GET의 ${a * 100}바이트만 합산합니다.`,
      [a * 200, a * 300, 0],
    );
    numeric(
      "http",
      "retry-exponential-wait",
      "요청 처리 시간은 0이고 세 번의 재시도 대기만 있습니다. 네 번째 요청을 시작하는 시점은 최초 요청 후 몇 ms인가요?",
      `첫 요청: t=0\n실패 후 재시도 전 대기: ${a * 100}ms → ${a * 200}ms → ${a * 400}ms\n지터·Retry-After·추가 재시도는 없습니다. 작업 ${i}의 요청입니다.`,
      a * 700,
      `네 번째 요청 전에는 세 구간을 모두 기다립니다. ${a * 100} + ${a * 200} + ${a * 400} = ${a * 700}ms입니다. 실제 서비스의 재시도 가능 여부는 API 계약을 따라야 합니다.`,
      [a * 400, a * 800, a * 300],
    );

    js(
      "node",
      "buffer-utf8-byte-length",
      "Node.js에서 문자열 길이와 UTF-8 바이트 길이를 출력한 결과는 무엇인가요?",
      `const text = "가".repeat(${i}) + "A";\nconst result = [text.length, Buffer.byteLength(text, "utf8")];`,
      [i + 1, i * 3 + 1],
      [
        [i * 3 + 1, i * 3 + 1],
        [i + 1, i + 1],
        [i, i * 3],
      ],
      `이 예의 한글 '가'는 문자열 length에서 1, UTF-8에서는 3바이트입니다. ASCII A는 둘 다 1이므로 ${i + 1}과 ${i * 3 + 1}입니다. 본문 크기를 문자 수와 혼동하면 안 됩니다.`,
    );
    js(
      "node",
      "handler-finally-order",
      "요청 처리 함수와 비슷한 다음 코드의 로그 배열은 무엇인가요?",
      `const log = [];\nfunction handle() {\n  try { log.push("요청${i}"); throw new Error("실패${i}"); }\n  catch { log.push("오류${i}"); return ${a}; }\n  finally { log.push("정리${i}"); }\n}\nconst value = handle();\nlog.push(value);\nconst result = log;`,
      [`요청${i}`, `오류${i}`, `정리${i}`, a],
      [
        [`요청${i}`, `오류${i}`, a],
        [`요청${i}`, `정리${i}`, `오류${i}`, a],
        [`요청${i}`, `오류${i}`, a, `정리${i}`],
      ],
      "catch에서 return을 만나도 함수를 빠져나가기 전에 finally를 실행합니다. 이 finally는 반환값을 덮어쓰지 않으므로 정리 로그 뒤에 반환된 숫자를 기록합니다.",
    );
    js(
      "node",
      "route-integer-validation",
      "정수 id만 허용하는 아래 검증을 통과한 입력 배열은 무엇인가요?",
      `const inputs = ["${a}", "${a}x", "${a}.5", "0", "-${a}"];\nconst result = inputs.filter(raw => {\n  const id = Number(raw);\n  return Number.isSafeInteger(id) && id > 0;\n});`,
      [String(a)],
      [
        [String(a), `${a}x`],
        [String(a), `${a}.5`],
        [String(a), "0"],
      ],
      `Number("${a}x")는 NaN, 소수는 안전한 정수가 아니며 0과 음수는 > 0을 만족하지 않습니다. 통과한 원래 문자열 "${a}"만 남습니다. parseInt로 접두 숫자만 읽는 것과 다릅니다.`,
    );

    const threshold = a + b;
    const documents = [
      {
        _id: `one-${i}`,
        results: [
          { subject: "sql", score: a },
          { subject: "js", score: a + b * 2 },
        ],
      },
      {
        _id: `two-${i}`,
        results: [
          { subject: "sql", score: a + b },
          { subject: "js", score: a },
        ],
      },
      { _id: `three-${i}`, results: [{ subject: "sql", score: a + b * 2 }] },
    ];
    add(
      "database",
      "mongo-elemmatch-same-element",
      "문서는 아래 세 개뿐입니다. 이 MongoDB 질의가 반환하는 _id 배열은 무엇인가요?",
      `${documents.map((d) => JSON.stringify(d)).join("\n")}\n\ndb.scores.find({ results: { $elemMatch: { subject: "sql", score: { $gte: ${threshold} } } } }).sort({ _id: 1 })`,
      JSON.stringify([`three-${i}`, `two-${i}`]),
      [[`one-${i}`, `three-${i}`, `two-${i}`], [`two-${i}`], [`one-${i}`]].map(
        (value) => JSON.stringify(value),
      ),
      `$elemMatch는 같은 배열 원소가 subject와 score를 모두 만족해야 합니다. one-${i}의 높은 점수는 js 과목이라 제외합니다. _id 오름차순으로 three-${i}, two-${i}입니다.`,
    );
    add(
      "database",
      "mongo-inc-set-update",
      "표시된 문서 한 개에 updateOne을 한 번 적용한 뒤 [count, status]는 무엇인가요? 다른 쓰기는 없습니다.",
      `// 기존 문서: { _id: "record-${i}", count: ${a}, status: "준비" }\ndb.records.updateOne({ _id: "record-${i}" }, { $inc: { count: ${b} }, $set: { status: "완료" } })`,
      JSON.stringify([a + b, "완료"]),
      [
        [b, "완료"],
        [a, "완료"],
        [a + b, "준비"],
      ].map((value) => JSON.stringify(value)),
      `$inc는 기존 count ${a}에 ${b}를 더합니다. $set은 status만 완료로 바꾸므로 [${a + b}, "완료"]입니다. 문서 전체를 새 객체로 교체하는 연산이 아닙니다.`,
    );

    const nbf = 1700000000 + i * 100;
    const exp = nbf + a;
    const times = [nbf - 1, nbf, exp - 1, exp, exp + 1];
    numeric(
      "auth",
      "jwt-not-before-exp-window",
      "서명·발급자·대상 검증은 통과했습니다. 아래 시각 중 시간 조건을 통과하는 요청은 몇 개인가요? 허용 오차는 0초입니다.",
      `JWT: nbf=${nbf}, exp=${exp}\n현재 시각 후보(초): ${times.join(", ")}\n허용 조건: nbf <= now < exp`,
      2,
      `nbf 시각부터 사용할 수 있고 exp 시각부터 만료입니다. ${nbf}, ${exp - 1} 두 시각만 범위에 듭니다. NumericDate의 단위는 초이며 이 문제는 시간 조건만 계산합니다.`,
      [1, 3, 5],
    );
    js(
      "auth",
      "role-scope-intersection",
      "인증된 사용자에게 역할과 scope를 모두 요구합니다. 허용된 요청의 id 배열은 무엇인가요?",
      `const requests = [\n  { id: ${a}, role: "editor", scopes: ["notes:write"] },\n  { id: ${a + 1}, role: "viewer", scopes: ["notes:write"] },\n  { id: ${a + 2}, role: "editor", scopes: ["notes:read"] },\n  { id: ${a + 3}, role: "editor", scopes: ["notes:read", "notes:write"] }\n];\nconst result = requests.filter(r => r.role === "editor" && r.scopes.includes("notes:write")).map(r => r.id);`,
      [a, a + 3],
      [[a, a + 1, a + 3], [a, a + 2, a + 3], [a + 3]],
      "&& 조건이므로 editor 역할과 notes:write scope를 동시에 가져야 합니다. 로그인 성공만으로 모든 쓰기 권한이 생기지는 않습니다. 이 역할·scope 규칙은 별도 연습 조건입니다.",
    );

    js(
      "deploy",
      "origin-default-port-normalization",
      "URL 도구로 정규화한 origin의 출력 배열은 무엇인가요?",
      `const result = [\n  new URL("https://app${i}.example:443/path?q=1").origin,\n  new URL("https://app${i}.example:8443/path").origin\n];`,
      [`https://app${i}.example`, `https://app${i}.example:8443`],
      [
        [`https://app${i}.example:443`, `https://app${i}.example:8443`],
        [
          `https://app${i}.example/path?q=1`,
          `https://app${i}.example:8443/path`,
        ],
        [`https://app${i}.example`, `https://app${i}.example`],
      ],
      "origin에는 스킴·호스트·포트가 들어가며 경로와 쿼리는 빠집니다. HTTPS 기본 포트 443은 정규화하면서 생략하고 8443은 유지합니다.",
    );
    js(
      "deploy",
      "environment-string-boolean",
      "환경 변수를 문자열로 읽었다고 가정할 때 출력 배열은 무엇인가요?",
      `const env = { FEATURE_ENABLED: "false", LABEL: "배포${i}" };\nconst result = [Boolean(env.FEATURE_ENABLED), env.FEATURE_ENABLED === "true", env.LABEL];`,
      [true, false, `배포${i}`],
      [
        [false, false, `배포${i}`],
        [true, true, `배포${i}`],
        [false, true, `배포${i}`],
      ],
      '빈 문자열이 아닌 "false"도 Boolean으로 바꾸면 true입니다. 문자열 값 "true"와 명시적으로 비교하면 false를 얻습니다. 환경 변수의 이름만 보고 실제 boolean이라고 가정하지 않습니다.',
    );

    const date = i % 2 ? `${2020 + i}-02-30` : `${2020 + i}-04-30`;
    js(
      "career-hub",
      "calendar-date-roundtrip",
      "Career Hub의 날짜 검사와 같은 원리를 쓴 코드입니다. 출력 배열은 무엇인가요?",
      `const input = "${date}";\nconst date = new Date(input + "T00:00:00.000Z");\nconst result = [date.toISOString().slice(0, 10) === input, input];`,
      [i % 2 === 0, date],
      [
        [i % 2 !== 0, date],
        [true, date.slice(0, 7)],
        [false, date.slice(0, 7)],
      ],
      i % 2
        ? `${date}는 실제 날짜가 아닙니다. Date가 다음 달로 보정한 결과가 입력과 달라 false입니다. 형식 검사만으로 2월 30일을 허용하면 안 됩니다.`
        : `${date}는 실제 날짜여서 UTC 날짜 문자열로 되돌려도 같습니다. 실제 검증기는 날짜 형식과 유효성 검사를 함께 수행합니다.`,
    );
    const flags = {
      resumeReady: i % 2 === 0,
      portfolioReady: i % 3 === 0,
      selfIntroReady: true,
      mockInterviewReady: i % 4 === 0,
    };
    const ready = Object.values(flags).filter(Boolean).length;
    js(
      "career-hub",
      "readiness-boolean-summary",
      "Career Hub의 준비 항목을 다음 코드로 요약했습니다. [완료 수, 전체 수]는 무엇인가요?",
      `const workbook = ${JSON.stringify(flags)};\nconst label = "준비 점검 ${i}";\nconst values = Object.values(workbook);\nconst result = [values.filter(Boolean).length, values.length];`,
      [ready, 4],
      [
        [ready, 3],
        [ready + 1, 5],
        [ready - 1, 4],
      ],
      `네 boolean 중 true인 ${ready}개를 셉니다. 설명용 label은 workbook 밖에 있어 전체 수에 포함하지 않습니다. 실제 워크북의 네 준비 필드 이름을 사용한 별도 계산 연습입니다.`,
    );
    js(
      "career-hub",
      "partial-record-update",
      "지원 기록 배열에서 지정한 id의 status만 수정했습니다. 출력 배열은 무엇인가요?",
      `const records = [{ id: ${a}, company: "회사${i}", status: "준비중" }, { id: ${a + 1}, company: "다른회사", status: "준비중" }];\nconst patch = { status: "지원완료" };\nconst next = records.map(r => r.id === ${a} ? { ...r, ...patch } : r);\nconst result = [next[0].company, next[0].status, records[0].status, next[1] === records[1]];`,
      [`회사${i}`, "지원완료", "준비중", true],
      [
        [`회사${i}`, "지원완료", "지원완료", true],
        [`회사${i}`, "지원완료", "준비중", false],
        [`회사${i}`, "준비중", "준비중", true],
      ],
      "수정 대상만 새 객체를 만들고 기존 필드를 먼저 복사합니다. company와 원본 status는 유지되며 대상이 아닌 두 번째 객체의 참조는 재사용합니다.",
    );

    ts(
      "readonly-view-alias",
      "readonly 배열 참조와 원본 배열을 함께 사용한 TypeScript 출력은 무엇인가요?",
      `const source: number[] = [${a}, ${a + 1}];\nconst view: readonly number[] = source;\nsource.push(${a + b});\nconst result = [view.length, view[2]];`,
      [3, a + b],
      [
        [2, null],
        [2, a + b],
        [3, a],
      ],
      `readonly는 view를 통해 push하는 일을 타입 검사에서 막지만 배열을 복사하거나 런타임에 동결하지 않습니다. source를 수정하면 같은 배열을 보는 view도 길이 3과 ${a + b}를 읽습니다.`,
    );
    const tuple = i % 2 ? [`작업${i}`] : [`작업${i}`, 0];
    ts(
      "tuple-destructuring-default",
      "선택적 튜플 원소를 구조 분해했을 때 출력은 무엇인가요?",
      `const item: [string, number?] = ${JSON.stringify(tuple)};\nconst [label, count = ${a}] = item;\nconst result = [label, count];`,
      [`작업${i}`, i % 2 ? a : 0],
      [
        [`작업${i}`, i % 2 ? 0 : a],
        [`작업${i}`, a + 1],
        [a, `작업${i}`],
      ],
      i % 2
        ? `두 번째 원소가 undefined여서 기본값 ${a}를 사용합니다. 타입의 ?는 값이 생략될 수 있다는 뜻입니다.`
        : "두 번째 원소 0은 undefined가 아니므로 기본값으로 바뀌지 않습니다. 구조 분해 기본값은 거짓으로 취급되는 모든 값에 적용되는 규칙이 아닙니다.",
    );
    ts(
      "record-keyed-state-total",
      "Record로 정의한 상태별 숫자를 순회하는 TypeScript 출력은 무엇인가요?",
      `type Status = "draft" | "sent" | "done";\nconst counts: Record<Status, number> = { draft: ${a}, sent: ${b}, done: ${a + b} };\nconst keys: Status[] = ["sent", "done"];\nconst result = keys.reduce((sum, key) => sum + counts[key], 0);`,
      a + b * 2,
      [a + b, a * 2 + b * 2, b],
      `순회하는 키는 sent와 done뿐입니다. ${b} + ${a + b} = ${a + b * 2}입니다. Record는 세 키의 값 타입을 정의하지만 모든 키를 자동으로 순회하지는 않습니다.`,
    );

    sql(
      "not-in-null-unknown",
      "SQL의 NULL 비교 규칙을 적용했을 때 결과 행 수는 얼마인가요?",
      "numbers",
      ["value"],
      [[a], [a + 1], [a + 2], [null]],
      `SELECT COUNT(*) FROM numbers WHERE value NOT IN (${a}, NULL)`,
      0,
      `NOT IN은 ${a}와 다르고 NULL과도 다르다는 조건을 요구합니다. NULL 비교는 UNKNOWN이므로 조건이 TRUE인 행이 없습니다. NULL 자신도 남지 않아 0입니다.`,
      [1, 2, 3],
    );
    const eventRows = [
      ["A", a],
      ["A", a + 1],
      ["A", a],
      ["B", a + 1],
      ["B", a + 2],
      ["B", a + 2],
    ];
    const unionAll = i % 2 === 0;
    sql(
      "union-duplicate-elimination",
      "이 UNION 질의를 감싼 COUNT(*)의 값은 얼마인가요?",
      "events",
      ["side", "score"],
      eventRows,
      `SELECT COUNT(*) FROM (SELECT score FROM events WHERE side = 'A' UNION${unionAll ? " ALL" : ""} SELECT score FROM events WHERE side = 'B') merged`,
      unionAll ? 6 : 3,
      unionAll
        ? "UNION ALL은 두 결과의 중복까지 모두 남깁니다. 각 3행을 합쳐 총 6행입니다."
        : `UNION은 중복 score를 제거합니다. 서로 다른 값 ${a}, ${a + 1}, ${a + 2}가 남아 총 3행입니다.`,
      [unionAll ? 3 : 6, 4, 5],
    );
    const tied = 1 + (i % 3);
    const rankRows = [
      ...Array.from({ length: tied }, (_, n) => [n + 1, a + b]),
      [tied + 1, a],
      [tied + 2, a - 1],
    ];
    sql(
      "rank-ties-gap",
      "score 내림차순의 RANK를 구했습니다. 지정한 id의 r 값은 얼마인가요?",
      "scores",
      ["id", "score"],
      rankRows,
      `SELECT r FROM (SELECT id, RANK() OVER (ORDER BY score DESC) AS r FROM scores) ranked WHERE id = ${tied + 1}`,
      tied + 1,
      `앞의 동점 ${tied}행이 모두 1위이고 다음 순위는 그 행 수만큼 건너뜁니다. id ${tied + 1}의 RANK는 ${tied + 1}입니다. DENSE_RANK와 달리 동점 뒤 순위에 간격이 생길 수 있습니다.`,
      [1, tied + 2, tied + 3],
    );
    sql(
      "coalesce-sum-null-default",
      "NULL을 기본 금액으로 바꾸어 합산했습니다. total은 얼마인가요?",
      "payments",
      ["id", "amount"],
      [
        [1, a],
        [2, null],
        [3, a + b],
        [4, null],
      ],
      `SELECT SUM(COALESCE(amount, ${b})) AS total FROM payments`,
      a * 2 + b * 3,
      `NULL 두 곳에 각각 ${b}를 넣습니다. ${a} + ${b} + ${a + b} + ${b} = ${a * 2 + b * 3}입니다. SUM(amount)처럼 NULL을 건너뛰는 것과 구분합니다.`,
      [a * 2 + b, a * 2 + b * 2, b * 2],
    );

    const javaAnd = i % 2 === 0;
    const javaSource = `int value = ${a};\nboolean first = false && (++value > 0);\nboolean second = true ${javaAnd ? "&&" : "||"} (++value > 0);\nSystem.out.println(value);`;
    numeric(
      "spring",
      "java-short-circuit-side-effect",
      "Java main 메서드 안에서 아래 코드를 실행하면 출력되는 정수는 무엇인가요?",
      javaSource,
      a + (javaAnd ? 1 : 0),
      `false &&의 오른쪽은 실행하지 않습니다. true ${javaAnd ? "&&는 오른쪽도 평가해 value가 1 증가합니다" : "||는 오른쪽을 평가하지 않습니다"}. 따라서 ${a + (javaAnd ? 1 : 0)}입니다.`,
      [a + (javaAnd ? 0 : 1), a + 2, a - 1],
      { check: "java", fixture: { source: javaSource } },
    );
    const javaList = `var list = new java.util.ArrayList<Integer>(java.util.List.of(${a}, ${a + 1}, ${a + 2}, ${a + 3}));\nvar view = list.subList(1, 3);\nview.set(0, ${a + b});\nSystem.out.println(list.get(1));`;
    numeric(
      "spring",
      "java-sublist-backed-view",
      "원본의 구조를 변경하는 다른 코드는 없습니다. Java main 메서드에서 이 코드가 출력하는 값은 무엇인가요?",
      javaList,
      a + b,
      `subList(1, 3)은 원본 인덱스 1과 2를 보는 뷰입니다. view.set(0, ${a + b})는 원본 인덱스 1도 바꾸므로 ${a + b}를 출력합니다. 독립 복사본을 만든 것이 아닙니다.`,
      [a + 1, a, a + b + 1],
      { check: "java", fixture: { source: javaList } },
    );

    numeric(
      "testing",
      "parameterized-cartesian-cases",
      "모든 조합을 각각 하나의 독립 테스트로 만들면 실행할 테스트는 몇 개인가요? skip·반복 실행은 없습니다.",
      `입력 길이 후보: ${Array.from({ length: b }, (_, n) => a + n).join(", ")}\n사용자 역할 후보: viewer, editor, admin\n인증 상태 후보: 로그인, 비로그인\n각 조합을 한 번씩 검사합니다.`,
      b * 6,
      `입력 길이 ${b}가지 × 역할 3가지 × 인증 상태 2가지 = ${b * 6}개입니다. 한 번에 여러 축을 바꾸는 조건 검사는 합이 아니라 조합 수를 계산합니다.`,
      [b + 5, b * 3, b * 2],
    );
    js(
      "testing",
      "reference-versus-structure-assertion",
      "참조 동일성과 이 데이터의 직렬화 결과를 비교했습니다. 출력 배열은 무엇인가요?",
      `const expected = { count: ${a}, tags: ["학습${i}"] };\nconst actual = { count: ${a}, tags: ["학습${i}"] };\nconst alias = actual;\nconst result = [Object.is(actual, expected), Object.is(actual, alias), JSON.stringify(actual) === JSON.stringify(expected)];`,
      [false, true, true],
      [
        [true, true, true],
        [false, false, true],
        [false, true, false],
      ],
      "별도로 만든 두 객체는 내용이 같아도 참조가 다릅니다. alias는 같은 참조이고 이 예제의 직렬화 문자열은 같습니다. Vitest의 toBe는 Object.is를 사용합니다. JSON 문자열 비교는 키 순서·지원하지 않는 값 문제 때문에 일반적인 깊은 동등성 검사의 대체가 아닙니다.",
    );

    add(
      "git",
      "reset-soft-three-states",
      "충돌·추가 작업 없이 아래 reset을 실행했습니다. file.txt의 [HEAD, index, 작업 트리] 값은 무엇인가요?",
      `// 직선 이력이며 HEAD~1의 file.txt 내용: ${a - 1}\n// 실행 전 HEAD 내용: ${a}\n// 실행 전 index 내용: ${a + 1}\n// 실행 전 작업 트리 내용: ${a + 2}\ngit reset --soft HEAD~1`,
      JSON.stringify([a - 1, a + 1, a + 2]),
      [
        [a - 1, a - 1, a + 2],
        [a - 1, a - 1, a - 1],
        [a, a + 1, a + 2],
      ].map((value) => JSON.stringify(value)),
      `--soft는 HEAD만 이전 커밋으로 옮깁니다. index의 ${a + 1}과 작업 트리의 ${a + 2}는 그대로입니다. --mixed나 --hard와 구분합니다.`,
    );
    numeric(
      "git",
      "revert-appends-history",
      "revert 대상은 비어 있지 않은 일반 커밋이고 충돌 없이 새 커밋을 만들었습니다. 현재 브랜치에서 도달 가능한 커밋은 몇 개인가요?",
      `단일 직선 이력: 최초 커밋부터 HEAD까지 ${a}개\n다른 브랜치·merge·graft·얕은 이력 없음\ngit revert --no-edit HEAD`,
      a + 1,
      `revert는 기존 ${a}개를 지우지 않고 마지막 변경을 되돌리는 새 커밋 하나를 덧붙입니다. 총 ${a + 1}개입니다. reset처럼 브랜치를 과거 커밋으로 옮기는 연산과 다릅니다.`,
      [a - 1, a, 1],
    );

    const service = `api${i}`;
    const hostPort = 7000 + i;
    const containerPort = 5000 + i;
    add(
      "docker",
      "compose-service-container-endpoint",
      "두 서비스가 같은 기본 Compose 네트워크에 있습니다. web 컨테이너에서 API에 연결할 주소는 무엇인가요? API는 0.0.0.0의 표시된 컨테이너 포트에서 듣습니다.",
      `services:\n  ${service}:\n    ports: ["${hostPort}:${containerPort}"]\n  web:\n    image: example-web\n# 별도 network_mode·프록시·별칭 설정 없음`,
      `http://${service}:${containerPort}`,
      [
        `http://localhost:${hostPort}`,
        `http://${service}:${hostPort}`,
        `http://localhost:${containerPort}`,
      ],
      `같은 Compose 네트워크에서는 서비스 이름 ${service}와 컨테이너 포트 ${containerPort}를 사용합니다. ${hostPort}는 호스트에 공개한 포트이고 web의 localhost는 web 자신입니다.`,
    );
    const files = Array.from(
      { length: a },
      (_, n) => `src/file${n + 1}.${n % b === 0 ? "log" : "js"}`,
    );
    const copied = files.filter((name) => name.endsWith(".js")).length;
    numeric(
      "docker",
      "dockerignore-copy-source-filter",
      "빌드가 성공했다고 가정할 때 COPY가 /app/src/에 넣는 일반 파일은 몇 개인가요?",
      `# 빌드 컨텍스트의 src 파일 전체 목록\n${files.join("\n")}\n\n# 루트 .dockerignore\nsrc/*.log\n\n# Dockerfile의 복사 명령\nCOPY src/ /app/src/\n# 다른 파일·숨김 파일·심볼릭 링크·추가 규칙 없음`,
      copied,
      `.dockerignore에 맞는 로그 파일 ${files.length - copied}개는 빌드 컨텍스트에서 제외됩니다. 남은 js 파일 ${copied}개만 COPY 대상입니다.`,
      [files.length, files.length - copied, files.length + 1],
    );

    js(
      "cs",
      "circular-buffer-wrap",
      "원형 버퍼의 인덱스를 나머지 연산으로 이동했습니다. [새 인덱스, 그 위치의 값]은 무엇인가요?",
      `const buffer = [${a}, ${a + 1}, ${a + 2}, ${a + 3}, ${a + 4}];\nconst head = ${i % 5};\nconst steps = ${b + 5};\nconst next = (head + steps) % buffer.length;\nconst result = [next, buffer[next]];`,
      [((i % 5) + b + 5) % 5, a + (((i % 5) + b + 5) % 5)],
      [1, 2, 3].map((offset) => [
        ((i % 5) + b + 5 + offset) % 5,
        a + (((i % 5) + b + 5 + offset) % 5),
      ]),
      `길이 5로 나눈 나머지를 사용해 인덱스가 끝을 넘어가면 앞으로 돌아옵니다. (${i % 5} + ${b + 5}) % 5 = ${((i % 5) + b + 5) % 5}입니다.`,
    );
    js(
      "cs",
      "recursion-base-call-count",
      "기저 조건의 호출까지 포함한 함수 호출 횟수는 얼마인가요?",
      `let calls = 0;\nfunction sum(n) { calls++; if (n === 0) return 0; return n + sum(n - 1); }\nsum(${a});\nconst result = calls;`,
      a + 1,
      [a, a - 1, a * 2],
      `sum(${a})부터 sum(0)까지 한 번씩 호출합니다. 0에서 끝나는 호출도 포함하므로 ${a + 1}회입니다. 이 값은 합계가 아니라 호출 수입니다.`,
    );
    const nodes = [`A${i}`, `B${i}`, `C${i}`, `D${i}`, `E${i}`];
    const graph = {
      [nodes[0]]: [nodes[1], nodes[2]],
      [nodes[1]]: [nodes[3]],
      [nodes[2]]: [nodes[4]],
      [nodes[3]]: [nodes[4]],
      [nodes[4]]: [],
    };
    js(
      "cs",
      "bfs-shortest-edge-count",
      "모든 간선의 비용이 1인 방향 그래프입니다. BFS가 구한 시작점에서 목표까지의 최단 간선 수는 얼마인가요?",
      `const graph = ${JSON.stringify(graph)};\nconst queue = [["${nodes[0]}", 0]];\nconst visited = new Set(["${nodes[0]}"]);\nlet result = -1;\nwhile (queue.length) {\n  const [node, distance] = queue.shift();\n  if (node === "${nodes[4]}") { result = distance; break; }\n  for (const next of graph[node]) {\n    if (!visited.has(next)) { visited.add(next); queue.push([next, distance + 1]); }\n  }\n}`,
      2,
      [1, 3, 4],
      `${nodes[0]} → ${nodes[2]} → ${nodes[4]} 경로가 2개 간선입니다. FIFO 큐의 BFS는 가중치가 동일한 그래프에서 가까운 거리부터 방문합니다. 노드 수 3과 간선 수 2를 구분합니다.`,
    );

    js(
      "security",
      "sql-query-parameter-separation",
      "pg에 전달할 매개변수 질의 객체입니다. [질의문, 바인딩 값 배열]의 출력은 무엇인가요?",
      `const input = "제목${i}' OR '1'='1";\nconst query = { text: "SELECT id FROM notes WHERE title = $1", values: [input] };\nconst result = [query.text, query.values];`,
      ["SELECT id FROM notes WHERE title = $1", [`제목${i}' OR '1'='1`]],
      [
        [`SELECT id FROM notes WHERE title = '제목${i}' OR '1'='1'`, []],
        ["SELECT id FROM notes WHERE title = $1", []],
        ["SELECT id FROM notes WHERE title = $1", [i]],
      ],
      "질의문에는 $1이 남고 입력 전체는 values의 한 값입니다. pg는 값을 SQL 문법과 분리해 바인딩합니다. 이 코드는 질의 객체만 만들며 DB 조회 결과를 출력하는 문제가 아닙니다.",
    );
    js(
      "security",
      "url-scheme-allowlist",
      "웹 링크에 http·https만 허용하는 아래 코드가 통과시키는 URL 배열은 무엇인가요?",
      `const links = ["https://app${i}.example/path", "javascript:alert(${i})", "data:text/plain,${i}", "http://localhost:${8000 + i}/"];\nconst result = links.filter(value => ["http:", "https:"].includes(new URL(value).protocol));`,
      [`https://app${i}.example/path`, `http://localhost:${8000 + i}/`],
      [
        [`https://app${i}.example/path`],
        [`https://app${i}.example/path`, `javascript:alert(${i})`],
        [`data:text/plain,${i}`, `http://localhost:${8000 + i}/`],
      ],
      "URL로 읽을 수 있다는 사실만으로 허용할 웹 링크가 되는 것은 아닙니다. 표시한 정책은 http:와 https:만 남깁니다. 이 검사는 스킴 검사이며 외부 요청의 목적지 안전성까지 보장하는 검사는 아닙니다.",
    );

    js(
      "note-hub",
      "note-runtime-guard-boundary",
      "Note Hub shared의 현재 타입 가드와 같은 검사입니다. 네 호출의 결과 배열은 무엇인가요?",
      `function isNote(v) {\n  return typeof v === "object" && v !== null && typeof v.id === "string" &&\n    typeof v.title === "string" && typeof v.body === "string" &&\n    Array.isArray(v.tags) && typeof v.createdAt === "string";\n}\nconst note = { id: "note-${i}", title: "제목", body: "본문", tags: ["react"], createdAt: "2026-01-01T00:00:00.000Z" };\nconst result = [isNote(note), isNote({ ...note, id: ${a} }), isNote({ ...note, tags: "react" }), isNote({ ...note, tags: [${a}] })];`,
      [true, false, false, true],
      [
        [true, false, false, false],
        [true, true, false, true],
        [true, false, true, true],
      ],
      "id는 문자열, tags는 배열인지 검사합니다. 현재 이 가드는 배열 내부 원소 타입은 검사하지 않아 숫자를 담은 tags도 통과합니다. 서버의 생성 입력 검증과 응답 타입 가드가 확인하는 범위는 다릅니다.",
    );
    js(
      "note-hub",
      "note-delete-repeat-result",
      "Note Hub 메모리 저장소처럼 삭제 전후 길이를 비교합니다. 같은 id를 두 번 삭제한 출력은 무엇인가요?",
      `let notes = [{ id: "note-${i}" }, { id: "keep-${i}" }];\nfunction remove(id) {\n  const before = notes.length;\n  notes = notes.filter(note => note.id !== id);\n  return notes.length !== before;\n}\nconst first = remove("note-${i}");\nconst second = remove("note-${i}");\nconst result = [first, second, notes.length];`,
      [true, false, 1],
      [
        [true, true, 0],
        [true, true, 1],
        [false, false, 2],
      ],
      `첫 삭제는 길이를 2에서 1로 바꾸어 true입니다. 같은 id는 이미 없어 두 번째 삭제는 false이고 keep-${i} 한 개가 남습니다. HTTP 응답 코드가 아니라 저장소 함수의 반환값을 묻습니다.`,
    );
  }
}

module.exports = { addTechnologyPractice };
