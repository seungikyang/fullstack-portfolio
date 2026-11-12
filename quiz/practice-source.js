// 같은 원리를 다른 입력으로 반복해 익히는 130유형 × 20개 응용 문제입니다.
// 실행 가능한 JavaScript 문제는 테스트에서 코드를 별도로 실행해 정답을 확인합니다.
const { addExpandedPractice } = require("./expanded-practice-source.js");
const { addTechnologyPractice } = require("./technology-practice-source.js");
const refs = {
  html: "01-html-css/README.md",
  css: "01-html-css/README.md",
  javascript: "02-javascript-basics/README.md",
  dom: "02-javascript-basics/README.md",
  react: "03-react-todo/README.md",
  http: "04-node-board-api/README.md",
  sql: "10-sql-oracle/README.md",
  cs: "15-cs-fundamentals/README.md",
  node: "04-node-board-api/README.md",
  typescript: "09-typescript/README.md",
  database: "05-database-mongodb/README.md",
  auth: "06-login-auth/README.md",
  deploy: "07-project-deploy/README.md",
  "career-hub": "08-fullstack-portfolio-project/README.md",
  spring: "11-java-spring/README.md",
  testing: "12-testing/README.md",
  git: "13-git-collab/README.md",
  docker: "14-docker-deploy/README.md",
  security: "16-security/README.md",
  "note-hub": "monorepo-mini-app/README.md",
};

function buildPracticeQuestions() {
  const questions = [];
  const numberChoices = (value, alternatives = []) => {
    const choices = [
      ...new Set(
        [
          value,
          ...alternatives,
          value + 1,
          value - 1,
          value + 2,
          value + 3,
        ].map(String),
      ),
    ];
    return choices.slice(0, 4);
  };
  function add(
    category,
    family,
    question,
    code,
    correct,
    distractors,
    explanation,
    extra = {},
  ) {
    const choices = [String(correct), ...distractors.map(String)];
    if (new Set(choices).size !== 4) throw new Error(`중복 보기: ${family}`);
    const index = questions.length;
    const answer = (index * 3 + Math.floor(index / 4)) % 4;
    [choices[0], choices[answer]] = [choices[answer], choices[0]];
    questions.push({
      id: `P${String(index + 1).padStart(3, "0")}`,
      category,
      type: "practice",
      family,
      question,
      code,
      choices,
      answer,
      explanation,
      reference: refs[category],
      ...extra,
    });
  }
  function numeric(
    category,
    family,
    question,
    code,
    value,
    explanation,
    alternatives = [],
    extra = {},
  ) {
    const choices = numberChoices(value, alternatives);
    add(
      category,
      family,
      question,
      code,
      choices[0],
      choices.slice(1),
      explanation,
      extra,
    );
  }
  function js(
    category,
    family,
    question,
    source,
    result,
    alternatives,
    explanation,
  ) {
    add(
      category,
      family,
      question,
      `${source}\nconsole.log(JSON.stringify(result));`,
      JSON.stringify(result),
      alternatives.map((value) => JSON.stringify(value)),
      explanation,
      { check: "javascript" },
    );
  }

  for (let i = 1; i <= 20; i += 1) {
    const a = i + 2;
    const b = (i % 5) + 2;
    const width = 140 + i * 7;
    const padding = 5 + i;
    const border = (i % 4) + 1;
    numeric(
      "css",
      "content-box",
      "다른 CSS 규칙이 없을 때 상자의 테두리까지 포함한 가로 길이는 몇 px인가요?",
      `.card { box-sizing: content-box; width: ${width}px; padding: ${padding}px; border: ${border}px solid; margin: 0; }`,
      width + 2 * padding + 2 * border,
      `content-box의 width는 내용 너비입니다. 좌우 padding ${2 * padding}px와 border ${2 * border}px를 더해 ${width + 2 * padding + 2 * border}px입니다. margin은 이 길이에 포함하지 않습니다.`,
      [width, width + padding + border, width + 2 * padding],
    );
    numeric(
      "css",
      "border-box",
      "이 상자 안의 내용 영역 너비는 몇 px인가요?",
      `.card { box-sizing: border-box; width: ${width}px; padding: ${padding}px; border: ${border}px solid; }`,
      width - 2 * padding - 2 * border,
      `border-box의 width에는 padding과 border가 포함됩니다. 내용 너비는 ${width} - ${2 * padding} - ${2 * border} = ${width - 2 * padding - 2 * border}px입니다.`,
      [width, width - padding - border, width + 2 * padding],
    );
    const columns = 2 + (i % 4);
    const gap = 4 + i;
    const cell = 45 + i * 3;
    const gridWidth = cell * columns + gap * (columns - 1);
    numeric(
      "css",
      "grid-gap",
      "자식에 최소 너비 제한이 없을 때 같은 크기의 열 하나가 차지하는 너비는 몇 px인가요?",
      `.grid { display: grid; width: ${gridWidth}px; grid-template-columns: repeat(${columns}, minmax(0, 1fr)); gap: ${gap}px; padding: 0; border: 0; }`,
      cell,
      `열 사이 간격은 ${columns - 1}개입니다. (${gridWidth} - ${gap} × ${columns - 1}) ÷ ${columns} = ${cell}px입니다. 간격을 먼저 제외합니다.`,
      [cell + gap, gridWidth, cell + columns],
    );
    const count = (i % 4) + 2;
    const itemWidth = 35 + i * 2;
    const container = 360 + i * 13;
    numeric(
      "css",
      "flex-space",
      "자식이 정확히 표시된 개수일 때 컨테이너의 오른쪽에 남는 빈 공간은 몇 px인가요?",
      `.row { display: flex; width: ${container}px; gap: ${gap}px; justify-content: flex-start; padding: 0; border: 0; }
.item { flex: 0 0 ${itemWidth}px; margin: 0; padding: 0; border: 0; }
/* .item은 ${count}개이고 모두 한 줄에 들어갑니다. */`,
      container - count * itemWidth - gap * (count - 1),
      `자식 너비 ${count * itemWidth}px와 사이 간격 ${gap * (count - 1)}px를 제외합니다. flex-grow가 0이므로 남는 공간을 자식이 나눠 갖지 않습니다.`,
    );
    const breakpoint = 520 + i * 11;
    const viewport = breakpoint + (i % 2 ? -12 : 12);
    numeric(
      "css",
      "media-cascade",
      "아래 규칙만 있고 뷰포트가 표시된 너비일 때 글꼴 크기는 몇 px인가요?",
      `/* 뷰포트 너비: ${viewport}px */
.title { font-size: ${a + 16}px; }
@media (max-width: ${breakpoint}px) { .title { font-size: ${a + 10}px; } }`,
      viewport <= breakpoint ? a + 10 : a + 16,
      `${viewport}px는 ${breakpoint}px ${viewport <= breakpoint ? "이하이므로 뒤의 미디어 쿼리가 적용됩니다" : "이하가 아니므로 기본 규칙이 적용됩니다"}. 같은 선택자에서는 적용 조건과 선언 순서를 함께 봅니다.`,
      [a + 16, a + 10, a + 22],
    );

    js(
      "javascript",
      "precedence",
      "곱셈 우선순위와 나머지 연산을 적용한 출력은 무엇인가요?",
      `const result = (${a} + ${b} * 3) % ${b + 3};`,
      (a + b * 3) % (b + 3),
      [((a + b * 3) % (b + 3)) + 1, a + b * 3, ((a + b * 3) % (b + 3)) + 2],
      `곱셈 ${b} × 3을 먼저 계산하고 ${a}를 더합니다. 그 결과 ${a + b * 3}을 ${b + 3}으로 나눈 나머지는 ${(a + b * 3) % (b + 3)}입니다.`,
    );
    js(
      "javascript",
      "string-number",
      "문자열 입력을 명시적으로 숫자로 바꾼 뒤의 출력은 무엇인가요?",
      `const input = "${a}";\nconst result = Number(input) + ${b};`,
      a + b,
      [String(a) + String(b), a * b, a + b + 1],
      `Number가 문자열 "${a}"를 숫자로 바꾸므로 덧셈 결과는 ${a + b}입니다. 변환하지 않은 문자열 + 숫자는 문자열 연결이 될 수 있습니다.`,
    );
    const values = [a, a + 1, a + 2, a + 3, a + 4];
    js(
      "javascript",
      "filter-map",
      "조건에 맞는 값만 고른 뒤 변환한 배열은 무엇인가요?",
      `const values = ${JSON.stringify(values)};\nconst result = values.filter(n => n > ${a + 1}).map(n => n * 2);`,
      values.filter((n) => n > a + 1).map((n) => n * 2),
      [
        values.map((n) => n * 2),
        values.filter((n) => n > a + 1),
        values.filter((n) => n >= a + 1).map((n) => n * 2),
      ],
      `filter는 ${a + 1}보다 큰 ${a + 2}, ${a + 3}, ${a + 4}를 남깁니다. 그 뒤 map이 남은 값 각각에 2를 곱합니다.`,
    );
    js(
      "javascript",
      "reduce-initial",
      "초깃값이 있는 reduce의 최종 합계는 무엇인가요?",
      `const result = [${a}, ${b}, ${a + b}].reduce((sum, n) => sum + n, 10);`,
      10 + 2 * (a + b),
      [2 * (a + b), 11 + 2 * (a + b), 12 + 2 * (a + b)],
      `초깃값 10에서 시작해 ${a}, ${b}, ${a + b}를 차례로 더합니다. 초기 누적값을 빠뜨리지 않아야 합니다.`,
    );
    js(
      "javascript",
      "slice-boundary",
      "원본을 바꾸지 않는 slice가 반환하는 배열은 무엇인가요?",
      `const values = ${JSON.stringify(values)};\nconst result = values.slice(1, 4);`,
      values.slice(1, 4),
      [values.slice(0, 4), values.slice(1, 3), values.slice(1)],
      `slice의 시작 인덱스 1은 포함하고 끝 인덱스 4는 제외합니다. 따라서 인덱스 1, 2, 3에 있는 값을 반환합니다.`,
    );
    js(
      "javascript",
      "spread-override",
      "객체 펼치기 뒤 같은 키를 지정했을 때 출력은 무엇인가요?",
      `const old = { count: ${a}, label: "학습" };\nconst next = { ...old, count: ${a + b} };\nconst result = [old.count, next.count];`,
      [a, a + b],
      [
        [a + b, a + b],
        [a, a],
        [a + b, a],
      ],
      `새 객체 next의 count만 ${a + b}로 덮어씁니다. old는 직접 수정하지 않았으므로 ${a}를 유지합니다.`,
    );
    const left = i % 2 ? 0 : null;
    js(
      "javascript",
      "nullish-or",
      "??와 ||가 기본값을 선택한 결과 배열은 무엇인가요?",
      `const value = ${left === null ? "null" : "0"};\nconst result = [value ?? ${a}, value || ${a}];`,
      [left ?? a, left || a],
      left === null
        ? [
            [null, a],
            [0, a],
            [a, null],
          ]
        : [
            [a, a],
            [0, 0],
            [a, 0],
          ],
      `??는 null 또는 undefined에서만 기본값을 사용합니다. ||는 0처럼 거짓으로 취급되는 값에도 기본값을 사용합니다. 여기서 value는 ${left === null ? "null" : "0"}입니다.`,
    );
    js(
      "javascript",
      "destructure-rest",
      "배열 구조 분해와 나머지 요소를 적용한 출력은 무엇인가요?",
      `const [first, , ...rest] = ${JSON.stringify(values)};\nconst result = [first, rest.length, rest[0]];`,
      [a, 3, a + 2],
      [
        [a, 4, a + 1],
        [a + 1, 3, a + 2],
        [a, 2, a + 3],
      ],
      `first는 첫 원소 ${a}입니다. 두 번째 자리는 건너뛰고 나머지 세 원소를 rest에 담으므로 rest[0]은 ${a + 2}입니다.`,
    );

    const nodes = Array.from(
      { length: 5 + i },
      (_, n) =>
        `<li class="${n % b === 0 ? "done" : "todo"}">항목 ${n + 1}</li>`,
    );
    numeric(
      "dom",
      "selector-count",
      "아래 HTML에서 document.querySelectorAll('.done').length는 얼마인가요?",
      `<ul>\n${nodes.join("\n")}\n</ul>`,
      nodes.filter((line) => line.includes('"done"')).length,
      `.done은 class에 done이 있는 요소를 고릅니다. todo 항목과 ul 자체는 포함하지 않습니다. 해당 li의 개수는 ${nodes.filter((line) => line.includes('"done"')).length}개입니다.`,
      [nodes.length, nodes.length + 1],
      { check: "dom-count" },
    );
    add(
      "dom",
      "text-content",
      "버튼을 한 번 누른 뒤 output에 보이는 문자열은 무엇인가요?",
      `<button id="button">더하기</button><input id="amount" value="${a}"><p id="output"></p>
<script>
button.addEventListener("click", () => {
  output.textContent = String(Number(amount.value) + ${b});
});
</script>
/* button, amount, output은 각 id의 요소를 참조합니다. */`,
      String(a + b),
      [String(a) + String(b), String(a * b), String(a + b + 1)],
      `input.value는 문자열입니다. Number로 ${a}를 얻고 ${b}를 더한 후 textContent에 ${a + b}를 넣습니다. HTML 태그로 해석하는 동작은 없습니다.`,
    );

    numeric(
      "react",
      "updater-queue",
      "초기 count에서 이 클릭 핸들러를 한 번 실행한 뒤 count는 얼마인가요?",
      `const [count, setCount] = useState(${a});
function click() {
  setCount(n => n + ${b});
  setCount(n => n * 2);
}`,
      (a + b) * 2,
      `함수형 갱신은 앞선 갱신 결과를 다음 함수에 전달합니다. 먼저 ${a} + ${b} = ${a + b}, 다음에 2를 곱해 ${(a + b) * 2}가 됩니다.`,
      [a * 2, a + b, a + b * 2],
    );
    numeric(
      "react",
      "snapshot-queue",
      "초기 렌더의 count로 이 클릭 핸들러를 한 번 실행한 뒤 count는 얼마인가요?",
      `const [count, setCount] = useState(${a});
function click() {
  setCount(count + ${b});
  setCount(count + ${b});
}`,
      a + b,
      `두 식 모두 같은 렌더에서 읽은 count=${a}를 사용합니다. ${a + b}로 교체하는 요청이 두 번 들어가며 ${a + b * 2}까지 누적되지 않습니다.`,
      [a + b * 2, a, b],
    );
    const todos = Array.from({ length: 4 + (i % 6) }, (_, n) => ({
      id: i * 10 + n,
      done: n % 3 === 0,
    }));
    numeric(
      "react",
      "derived-count",
      "할 일 배열에서 remaining을 state와 별도로 계산했습니다. 표시할 남은 개수는 얼마인가요?",
      `const todos = ${JSON.stringify(todos, null, 2)};
const remaining = todos.filter(todo => !todo.done).length;`,
      todos.filter((t) => !t.done).length,
      `!todo.done이 참인 미완료 항목만 셉니다. 목록에서 다시 계산하면 완료 상태와 별도 개수 state가 서로 어긋날 위험을 줄입니다.`,
      [todos.length, todos.length + 1],
    );

    const page = 2 + (i % 7);
    const size = 5 + i;
    numeric(
      "http",
      "pagination-offset",
      "page가 1부터 시작하는 API에서 이 페이지 조회 전에 건너뛸 기록 수는 얼마인가요?",
      `GET /api/records?page=${page}&pageSize=${size}
규칙: offset = (page - 1) * pageSize`,
      (page - 1) * size,
      `앞의 ${page - 1}페이지마다 ${size}개씩 있으므로 ${(page - 1) * size}개를 건너뜁니다. 실제 API마다 매개변수 계약을 먼저 확인해야 합니다.`,
      [page * size, page + size, size - 1],
    );
    const limit = 15 + i;
    const total = limit + b;
    numeric(
      "http",
      "rate-limit",
      "아래 조건에서 429 응답을 받는 요청은 몇 개인가요?",
      `한 사용자에게 한 시간 구간 동안 ${limit}회까지 허용합니다.
구간 시작 직후 같은 사용자가 ${total}회를 순서대로 요청합니다.
구간 초기화·재시도·다른 사용자는 없고, 한도를 넘은 요청은 모두 429입니다.`,
      b,
      `허용 횟수 ${limit}회를 제외한 ${total} - ${limit} = ${b}회가 제한됩니다. 429는 요청 횟수 제한의 응답입니다.`,
      [limit, total, 0],
    );

    const sqlRows = Array.from({ length: 6 }, (_, n) => ({
      id: n + 1,
      score: a + n * b,
    }));
    const threshold = a + b * (1 + (i % 3));
    const table = `scores(id, score)\n${sqlRows.map((r) => `${r.id}, ${r.score}`).join("\n")}`;
    numeric(
      "sql",
      "where-count",
      "표에 표시된 행만 있을 때 SQL 결과는 얼마인가요?",
      `${table}\n\nSELECT COUNT(*) FROM scores WHERE score > ${threshold};`,
      sqlRows.filter((r) => r.score > threshold).length,
      `WHERE가 score > ${threshold}인 행을 남긴 뒤 COUNT(*)가 그 행 수를 셉니다. 기준값과 같은 행은 > 조건에 포함하지 않습니다.`,
      [6, 0],
      {
        check: "sql",
        fixture: {
          table: "scores",
          columns: ["id", "score"],
          rows: sqlRows.map((r) => [r.id, r.score]),
          query: `SELECT COUNT(*) FROM scores WHERE score > ${threshold}`,
        },
      },
    );
    const amounts = [a * 10, a * 10 + b, a * 10 + b * 2];
    const saleRows = [
      ["A", amounts[0]],
      ["B", i * 100],
      ["A", amounts[1]],
      ["A", amounts[2]],
    ];
    numeric(
      "sql",
      "group-sum",
      "아래 집계에서 부서 A의 total 값은 얼마인가요?",
      `sales(dept, amount)\n${saleRows.map((r) => r.join(", ")).join("\n")}\n\nSELECT dept, SUM(amount) AS total FROM sales GROUP BY dept;`,
      amounts.reduce((sum, n) => sum + n, 0),
      `GROUP BY dept는 부서별로 행을 묶습니다. A의 ${amounts.join(" + ")}만 더하며 B의 ${i * 100}은 섞지 않습니다.`,
      [amounts[0], i * 100 + amounts.reduce((sum, n) => sum + n, 0)],
      {
        check: "sql",
        fixture: {
          table: "sales",
          columns: ["dept", "amount"],
          rows: saleRows,
          query: "SELECT SUM(amount) FROM sales WHERE dept = 'A'",
        },
      },
    );
    const employees = Array.from({ length: i + 3 }, (_, n) => [
      n + 1,
      n % 3 === 0 ? null : (n % 2) + 1,
    ]);
    const matching = employees.filter((r) => r[1] !== null).length;
    const empTable = `employees(id, dept_id)\n${employees.map((r) => r.map((v) => (v === null ? "NULL" : v)).join(", ")).join("\n")}
departments(id): 1, 2 (각 id는 한 번씩만 존재)`;
    numeric(
      "sql",
      "inner-join-count",
      "부서 id는 중복되지 않습니다. 이 INNER JOIN의 결과 행 수는 얼마인가요?",
      `${empTable}\n\nSELECT e.id, d.id FROM employees e INNER JOIN departments d ON e.dept_id = d.id;`,
      matching,
      `부서와 일치하는 직원 ${matching}명만 남습니다. dept_id가 NULL인 ${employees.length - matching}명은 = 조인 조건을 만족하지 않습니다.`,
      [employees.length, employees.length * 2],
      { check: "join", rows: employees, join: "INNER" },
    );
    numeric(
      "sql",
      "left-join-count",
      "부서 id는 중복되지 않습니다. 이 LEFT JOIN의 결과 행 수는 얼마인가요?",
      `${empTable}\n\nSELECT e.id, d.id FROM employees e LEFT JOIN departments d ON e.dept_id = d.id;`,
      employees.length,
      `LEFT JOIN은 왼쪽 직원 ${employees.length}명을 모두 남깁니다. 일치하지 않는 직원은 오른쪽 부서 열이 NULL이고, 부서 키가 유일하므로 직원마다 결과가 한 행입니다.`,
      [matching, employees.length * 2, 0],
      { check: "join", rows: employees, join: "LEFT" },
    );

    js(
      "cs",
      "stack",
      "스택처럼 배열의 끝에서 넣고 뺐습니다. 마지막으로 꺼낸 값은 무엇인가요?",
      `const stack = [${a}, ${a + 1}];\nstack.push(${a + 2});\nstack.pop();\nstack.push(${a + 3});\nconst result = stack.pop();`,
      a + 3,
      [a, a + 1, a + 2],
      `스택은 마지막에 넣은 값을 먼저 꺼내는 LIFO입니다. ${a + 2}를 제거한 뒤 ${a + 3}을 넣었으므로 마지막 pop은 ${a + 3}입니다.`,
    );
    js(
      "cs",
      "queue",
      "큐처럼 뒤에 넣고 앞에서 꺼냈습니다. 마지막으로 꺼낸 값은 무엇인가요?",
      `const queue = [${a}, ${a + 1}, ${a + 2}];\nqueue.push(${a + 3});\nqueue.shift();\nconst result = queue.shift();`,
      a + 1,
      [a, a + 2, a + 3],
      `큐는 먼저 들어온 값을 먼저 꺼내는 FIFO입니다. 첫 shift는 ${a}, 다음 shift는 ${a + 1}을 반환합니다.`,
    );
    js(
      "cs",
      "loop-cost",
      "바깥 반복과 안쪽 반복이 모두 끝나면 연산 횟수는 얼마인가요?",
      `let result = 0;\nfor (let row = 0; row < ${a}; row++) {\n  for (let col = 0; col < ${b}; col++) { result++; }\n}`,
      a * b,
      [a + b, a * b + 1, a * b - 1],
      `바깥 반복 ${a}회마다 안쪽 반복 ${b}회를 실행하므로 ${a * b}회입니다. 이 수치는 코드의 증가 연산 횟수이며 실제 실행 시간 단위는 아닙니다.`,
    );

    js(
      "node",
      "url-query",
      "HTTP 요청 URL의 쿼리 문자열을 숫자로 변환한 결과는 무엇인가요?",
      `const url = new URL("http://localhost/api/posts?page=${a}&limit=${b}");\nconst result = Number(url.searchParams.get("page")) + Number(url.searchParams.get("limit"));`,
      a + b,
      [String(a) + String(b), a * b, a + b + 1],
      `searchParams.get은 문자열을 반환합니다. 각 값을 Number로 변환했으므로 숫자 ${a}와 ${b}의 합 ${a + b}입니다.`,
    );
    const payload = { title: `학습 ${i}`, count: a };
    js(
      "node",
      "json-roundtrip",
      "요청 본문과 비슷한 JSON 문자열을 읽은 뒤 결과는 무엇인가요?",
      `const body = ${JSON.stringify(JSON.stringify(payload))};\nconst parsed = JSON.parse(body);\nconst result = parsed.count + ${b};`,
      a + b,
      [String(a) + String(b), a, a + b + 1],
      `JSON.parse가 문자열을 객체로 읽습니다. JSON의 count가 숫자 ${a}이므로 ${b}를 더하면 ${a + b}입니다.`,
    );
    const isString = i % 2 === 1;
    const value = isString ? String(a) : a;
    numeric(
      "typescript",
      "narrowing-runtime",
      "타입을 좁힌 뒤 이 TypeScript 함수의 반환값은 무엇인가요?",
      `function measure(value: string | number): number {
  if (typeof value === "string") return value.length;
  return value * 2;
}
measure(${JSON.stringify(value)});`,
      isString ? String(a).length : a * 2,
      `전달한 값은 ${isString ? "문자열" : "숫자"}입니다. typeof 조건에 따라 ${isString ? `문자열 "${a}"의 길이 ${String(a).length}` : `${a} × 2 = ${a * 2}`}를 반환합니다. 타입 표기는 실행 중 값 자체를 변환하지 않습니다.`,
      [isString ? a * 2 : String(a).length, a + 1, a + 2],
    );
  }
  // 기존 문항의 ID·보기 순서·정답을 유지하도록 마지막에만 추가합니다.
  addExpandedPractice({ add, numeric, js });
  addTechnologyPractice({ add, numeric, js });
  return questions;
}

module.exports = { buildPracticeQuestions };
