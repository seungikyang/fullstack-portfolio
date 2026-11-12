// 서술형 전환 원본으로 웹 문제집과 문서의 4지선다 구간을 함께 생성합니다.
const fs = require("node:fs");
const path = require("node:path");
const { groups } = require("../quiz/written-source.js");
const {
  buildExtraGroups,
  coverage: extraCoverage,
} = require("../quiz/written-extra-source.js");
const coverage = require("../quiz/written-coverage.json");
const {
  buildReviewGroups,
  coverage: reviewCoverage,
} = require("../quiz/written-review-source.js");
const root = path.resolve(__dirname, "..");
const categoryTitles = {
  cs: "CS 기초 21문제",
  technical: "기술·통합 면접",
  behavioral: "인성·협업",
  intro: "자기소개",
  project: "프로젝트 설명",
  security: "보안·OWASP 2021",
  html: "HTML·CSS",
  database: "DB·MongoDB",
  deploy: "배포",
  spring: "Express·Spring",
  git: "Git 협업",
  sql: "SQL 관찰",
  integration: "종합 워크북",
  testing: "테스트",
  docker: "Docker",
  readme: "단계별 면접 질문",
  "workbook-concepts": "종합 워크북 개념 확인",
  "workbook-sentences": "종합 워크북 설명 문장",
  reading: "설명 확인",
  "self-check": "추가 설명·자가 점검",
};
function buildWrittenBank() {
  const extraItems = [
    ...extraCoverage.documents.filter((d) => !d.reuse).flatMap((d) => d.items),
    ...extraCoverage.featureSections.flatMap((s) => [...s.items, s.sentence]),
    ...extraCoverage.singles,
    ...reviewCoverage.blocks.flatMap((block) => block.items),
  ];
  const originals = new Map(
    extraItems.map((item) => [item.sourceId, item.prompt]),
  );
  // 새 문항은 뒤에 추가해 기존 W001~W451의 내용·정답·기록을 유지합니다.
  const questions = [
    ...groups,
    ...buildExtraGroups(groups),
    ...buildReviewGroups(),
  ].flatMap((g) =>
    g.rows.map((row) => {
      const [sourceId, title, correct, ...rest] = row;
      const wrong = rest.slice(0, 3);
      const explanation = rest[3];
      return {
        sourceId,
        title,
        category: g.category,
        type: "concept",
        originalPrompt:
          coverage.originals[sourceId] || originals.get(sourceId) || title,
        question: `${title} — 알맞은 설명 또는 답변 방식을 고르세요.`,
        choices: [correct, ...wrong],
        answer: 0,
        explanation,
        reference: g.file,
      };
    }),
  );
  questions.forEach((q, i) => {
    if (q.category === "workbook-concepts")
      q.question = `${q.title}\n\n빈칸 또는 개념에 알맞은 보기 하나를 고르세요.`;
    if (q.category === "workbook-sentences")
      q.question = `${q.originalPrompt}\n\n빈칸에 들어갈 내용 또는 근거 있는 설명 방식 하나를 고르세요.`;
    q.id = `W${String(i + 1).padStart(3, "0")}`;
    q.answer = i % 4;
    const correct = q.choices.shift();
    q.choices.splice(q.answer, 0, correct);
  });
  const categories = [...new Set(questions.map((q) => q.category))].map(
    (id) => ({ id, title: categoryTitles[id] }),
  );
  const bank = {
    version: "written-choice-v1",
    title: "서술형 전환 4지선다",
    description: `${questions.length}문항 · CS·기술 면접·인성·자기소개·프로젝트·단계별 면접 질문·종합 워크북·자가 점검`,
    categories,
    questions,
  };
  validateWrittenBank(bank);
  return bank;
}
function validateWrittenBank(bank) {
  const ids = new Set(),
    sourceIds = new Set(),
    stems = new Set();
  for (const q of bank.questions) {
    if (!/^W\d{3}$/.test(q.id) || ids.has(q.id) || sourceIds.has(q.sourceId))
      throw new Error(`문항 ID 오류: ${q.id}`);
    ids.add(q.id);
    sourceIds.add(q.sourceId);
    if (stems.has(q.question)) throw new Error(`문항 중복: ${q.id}`);
    stems.add(q.question);
    if (
      q.choices.length !== 4 ||
      new Set(q.choices).size !== 4 ||
      q.choices.some((c) => typeof c !== "string" || !c.trim())
    )
      throw new Error(`보기 오류: ${q.id}`);
    if (
      !Number.isInteger(q.answer) ||
      q.answer < 0 ||
      q.answer > 3 ||
      typeof q.explanation !== "string" ||
      q.explanation.length < 15
    )
      throw new Error(`정답·해설 오류: ${q.id}`);
    if (!fs.existsSync(path.join(root, q.reference)))
      throw new Error(`참조 오류: ${q.id}`);
  }
  for (const id of Object.keys(coverage.originals))
    if (!sourceIds.has(id)) throw new Error(`원문 전환 누락: ${id}`);
  for (const section of coverage.featureSections)
    for (const item of section.items)
      if (!sourceIds.has(item.sourceId))
        throw new Error(`꼬리질문 전환 누락: ${item.sourceId}`);
  const extraItems = [
    ...extraCoverage.documents.flatMap((d) => d.items),
    ...extraCoverage.featureSections.flatMap((s) => [...s.items, s.sentence]),
    ...extraCoverage.singles,
    ...extraCoverage.appended,
    ...extraCoverage.inlineReferences,
    ...extraCoverage.tail.items,
    ...reviewCoverage.blocks.flatMap((block) => block.items),
  ];
  for (const item of extraItems)
    if (!sourceIds.has(item.sourceId))
      throw new Error(`추가 원문 전환 누락: ${item.sourceId}`);
}
function renderQuestion(
  q,
  { heading = "###", title = `${q.sourceId}. ${q.title}` } = {},
) {
  return `${heading} ${title}\n\n${q.question}\n\n${q.choices.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n\n<details>\n<summary>정답·해설 확인</summary>\n\n**정답: ${q.answer + 1}번**\n\n${q.explanation}\n\n</details>\n`;
}
const fullDocs = new Set([
  "15-cs-fundamentals/problems.md",
  "17-interview-prep/interview-cards.md",
  "17-interview-prep/behavioral-questions.md",
  "17-interview-prep/self-intro-templates.md",
  "17-interview-prep/project-pitch-template.md",
]);
const startMarker = "<!-- written-choice:start -->";
const endMarker = "<!-- written-choice:end -->";
function replaceGenerated(content, generated) {
  const block = `${startMarker}\n${generated.trim()}\n${endMarker}`;
  if (content.includes(startMarker)) {
    const start = content.indexOf(startMarker),
      end = content.indexOf(endMarker, start);
    if (end === -1) throw new Error("4지선다 종료 표시 누락");
    return (
      content.slice(0, start) + block + content.slice(end + endMarker.length)
    );
  }
  return `${content.trimEnd()}\n\n${block}\n`;
}

// 같은 수준 또는 상위 제목까지만 교체해 실행 안내·학습 기록을 보존합니다.
function replaceSection(
  content,
  level,
  headings,
  generated,
  { preserveMarkers = false } = {},
) {
  const prefix = "#".repeat(level);
  const heading = headings.find((title) =>
    content.includes(`${prefix} ${title}\n`),
  );
  if (!heading) throw new Error(`전환 대상 제목 누락: ${headings.join(" / ")}`);
  const start = content.indexOf(`${prefix} ${heading}\n`);
  const after = start + `${prefix} ${heading}\n`.length;
  const next = new RegExp(`^#{1,${level}} `, "m").exec(content.slice(after));
  let end = next ? after + next.index : content.length;
  if (preserveMarkers) {
    // 이 섹션 바로 뒤의 생성 구간 시작 표시를 지우지 않습니다.
    const marker = /^<!-- written-choice:(?:start|end) -->/m.exec(
      content.slice(after, end),
    );
    if (marker) end = after + marker.index;
  }
  const remaining = content.slice(end);
  return (
    content.slice(0, start) +
    generated.trimEnd() +
    (remaining ? "\n\n" + remaining : "\n")
  );
}

function quizLink(file, q) {
  const target = path.posix.relative(
    path.posix.dirname(file),
    "quiz/index.html",
  );
  return `${target}?bank=written${q ? `&question=${q.id}` : ""}`;
}

function renderLinkedQuestion(q, file, options) {
  return (
    renderQuestion(q, options) +
    `\n[웹에서 이 문제 채점하기](${quizLink(file, q)})\n`
  );
}
function buildWrittenDocuments(bank) {
  const output = {};
  for (const g of groups) {
    if (g.file === "feature-implementation-workbook.md") continue;
    const sourceIds = new Set(g.rows.map((row) => row[0]));
    const questions = bank.questions.filter((q) => sourceIds.has(q.sourceId));
    const category = g.category;
    const quizLink = `../quiz/index.html?bank=written&category=${category}`;
    const rendered = questions.map((q) => renderQuestion(q)).join("\n");
    if (fullDocs.has(g.file)) {
      let nav =
        "[단계 설명](./README.md) · [웹에서 채점하기](" +
        quizLink +
        ") · [완료 체크](../student-checklist.md)";
      if (g.category === "cs")
        nav += " · [단계별 힌트](./hints.md) · [정답 비교](./answers.md)";
      output[g.file] =
        `# ${g.title} — 4지선다\n\n${nav}\n\n## 문제 진행 방식\n\n이 문서는 4지선다 문제입니다. 보기 네 개 중 가장 알맞은 답 하나를 고른 뒤 접힌 정답·해설을 확인하세요. 웹에서는 채점·오답 복습·진행 기록을 사용할 수 있습니다.\n\n${g.category === "cs" ? "네트워크 6문제, OS 5문제, DB 이론 5문제, 자료구조 5문제입니다.\n\n" : "개인 경험을 묻던 문항은 근거 있는 답변 방식을 선택하는 문제로 바꿨습니다. 선택지의 원칙이 본인의 실제 경험을 대신하지는 않습니다.\n\n"}${rendered}`;
    } else {
      const header = `## 설명·개념 확인 — 4지선다\n\n${g.title} · [웹에서 채점하기](${quizLink})\n\n보기 네 개 중 하나를 선택하고 접힌 정답·해설을 확인하세요.\n\n`;
      output[g.file] = replaceGenerated(
        fs.readFileSync(path.join(root, g.file), "utf8"),
        header + rendered,
      );
    }
  }
  const cs = bank.questions.filter((q) => q.category === "cs");
  output["15-cs-fundamentals/answers.md"] =
    "# CS 기초 21문제 정답·해설\n\n[문제](./problems.md) · [단계별 힌트](./hints.md) · [완료 체크](../student-checklist.md) · [다음 단계](../16-security/README.md)\n\n문제의 보기를 먼저 선택한 뒤 확인하세요.\n\n" +
    cs
      .map(
        (q) =>
          `## ${q.sourceId}. ${q.title}\n\n**정답: ${q.answer + 1}번 — ${q.choices[q.answer]}**\n\n${q.explanation}\n`,
      )
      .join("\n");
  const bySource = new Map(bank.questions.map((q) => [q.sourceId, q]));
  let feature = fs.readFileSync(
    path.join(root, "feature-implementation-workbook.md"),
    "utf8",
  );
  for (const section of coverage.featureSections) {
    const start = feature.indexOf(`## ${section.heading}\n`);
    if (start < 0) throw new Error(`워크북 섹션 누락: ${section.heading}`);
    const next = feature.indexOf("\n## ", start + 1);
    const end = next === -1 ? feature.length : next;
    const part = feature.slice(start, end);
    const block =
      "### 면접 개념 확인 — 4지선다\n\n[웹에서 전체 전환 문제 풀기](./quiz/index.html?bank=written)\n\n" +
      section.items
        .map((item, i) => {
          const q = bySource.get(item.sourceId);
          return renderQuestion(
            {
              ...q,
              question: `${item.prompt}\n\n알맞은 설명 또는 답변 방식을 고르세요.`,
            },
            { heading: "####", title: `${i + 1}. ${q.title}` },
          );
        })
        .join("\n") +
      "\n";
    const updated = part.replace(
      /^### (?:면접 꼬리질문[^\n]*|면접 개념 확인 — 4지선다)\n[\s\S]*?(?=^### |$(?![\s\S]))/m,
      block,
    );
    if (updated === part && !part.includes("면접 개념 확인"))
      throw new Error(`워크북 문항 구간 누락: ${section.heading}`);
    feature = feature.slice(0, start) + updated + feature.slice(end);
  }
  for (const section of extraCoverage.featureSections) {
    const start = feature.indexOf(`## ${section.heading}\n`);
    const next = feature.indexOf("\n## ", start + 1);
    const end = next === -1 ? feature.length : next;
    if (start < 0) throw new Error(`추가 워크북 섹션 누락: ${section.heading}`);
    let part = feature.slice(start, end);
    for (const block of section.blocks) {
      const title = block.heading.replace(/ 빈칸$/, "") + " 확인 — 4지선다";
      const rendered =
        `### ${title}\n\n보기 하나를 고른 뒤 접힌 정답·해설을 확인하세요.\n\n` +
        block.items
          .map((item) =>
            renderLinkedQuestion(
              bySource.get(item.sourceId),
              "feature-implementation-workbook.md",
              { heading: "####" },
            ),
          )
          .join("\n");
      part = replaceSection(part, 3, [block.heading, title], rendered);
    }
    const sentence = bySource.get(section.sentence.sourceId);
    part = replaceSection(
      part,
      3,
      ["설명 문장", "설명 문장 확인 — 4지선다"],
      "### 설명 문장 확인 — 4지선다\n\n" +
        renderLinkedQuestion(sentence, "feature-implementation-workbook.md", {
          heading: "####",
        }),
    );
    feature = feature.slice(0, start) + part + feature.slice(end);
  }
  feature = replaceSection(
    feature,
    2,
    [extraCoverage.tail.heading],
    `## ${extraCoverage.tail.heading}\n\n` +
      extraCoverage.tail.items
        .map((item) =>
          renderLinkedQuestion(
            {
              ...bySource.get(item.sourceId),
              question: `${item.prompt}\n\n보기 하나를 고르세요.`,
            },
            extraCoverage.tail.file,
            { title: item.title },
          ),
        )
        .join("\n"),
  );
  output["feature-implementation-workbook.md"] = feature;

  for (const doc of extraCoverage.documents) {
    const current =
      output[doc.file] || fs.readFileSync(path.join(root, doc.file), "utf8");
    const rendered = doc.items
      .map((item) => {
        const q = bySource.get(item.sourceId);
        return renderLinkedQuestion(
          {
            ...q,
            question: `${item.prompt}\n\n보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.`,
          },
          doc.file,
        );
      })
      .join("\n");
    // Prettier가 주석 뒤에 넣은 빈 줄은 문서를 재생성해도 보존한다.
    const markerBreak = current.includes(`${startMarker}\n\n`) ? "\n\n" : "\n";
    output[doc.file] = replaceSection(
      current,
      2,
      [doc.heading],
      `## ${doc.heading}\n\n${startMarker}${markerBreak}4지선다 문제입니다. 보기 하나를 고르고 접힌 정답·해설을 확인하세요.\n\n${rendered}\n${endMarker}`,
    );
  }

  for (const item of extraCoverage.singles) {
    let current =
      output[item.file] || fs.readFileSync(path.join(root, item.file), "utf8");
    const q = bySource.get(item.sourceId);
    if (item.heading) {
      output[item.file] = replaceSection(
        current,
        3,
        [item.heading],
        `### ${item.heading}\n\n${renderLinkedQuestion(q, item.file, { heading: "####" })}`,
      );
    } else {
      const replacement = `아래 4지선다 ${item.sourceId}에서 새로고침 후 기록이 유지되는 이유를 고르세요.`;
      if (
        !current.includes(item.originalText) &&
        !current.includes(replacement)
      )
        throw new Error(`설명 확인 원문 누락: ${item.sourceId}`);
      current = current.replace(item.originalText, replacement);
      output[item.file] = replaceGenerated(
        current,
        `## 설명 확인 — 4지선다\n\n${renderLinkedQuestion(q, item.file)}`,
      );
    }
  }

  for (const item of extraCoverage.appended) {
    let current =
      output[item.file] || fs.readFileSync(path.join(root, item.file), "utf8");
    if (
      !current.includes(item.originalText) &&
      !current.includes(item.replacement)
    )
      throw new Error(`추가 문제 원문 누락: ${item.sourceId}`);
    current = current.replace(item.originalText, item.replacement);
    output[item.file] = current.replace(
      endMarker,
      `\n${renderLinkedQuestion(bySource.get(item.sourceId), item.file)}\n${endMarker}`,
    );
  }

  for (const block of reviewCoverage.blocks) {
    const current =
      output[block.file] ||
      fs.readFileSync(path.join(root, block.file), "utf8");
    const start = block.parent ? current.indexOf(`## ${block.parent}\n`) : 0;
    if (start < 0) throw new Error(`자가 점검 상위 섹션 누락: ${block.parent}`);
    const next = block.parent ? current.indexOf("\n## ", start + 1) : -1;
    const end = next < 0 ? current.length : next;
    const part = current.slice(start, end);
    const heading = `${block.heading} — 4지선다`;
    const generated =
      `${"#".repeat(block.level)} ${heading}\n\n` +
      (block.intro ? `${block.intro}\n\n` : "") +
      "보기 하나를 고르고 접힌 정답·해설을 확인하세요. 실제 실습 완료 여부는 실행 기록과 완료 체크에서 확인합니다.\n\n" +
      block.items
        .map((item) =>
          renderLinkedQuestion(bySource.get(item.sourceId), block.file, {
            heading: "#".repeat(block.level + 1),
          }),
        )
        .join("\n") +
      (block.outro ? `\n${block.outro}\n` : "");
    output[block.file] =
      current.slice(0, start) +
      replaceSection(part, block.level, [block.heading, heading], generated, {
        preserveMarkers: true,
      }) +
      current.slice(end);
  }

  // 다른 문서에 반복되어 있던 설명 문제도 같은 선택지·정답으로 제공합니다.
  const reusedSections = [
    {
      file: "01-html-css/answers.md",
      heading: "자기 점검",
      sources: ["H01", "H02", "H03"],
    },
    {
      file: "15-cs-fundamentals/README.md",
      heading: "취업 연결",
      intro:
        "SI/SW 면접의 CS 질문을 네 보기로 확인합니다. 정답을 고른 뒤 관련 코드와 실행 근거를 함께 확인하세요.",
      sources: ["R15-01", "R15-02", "R15-03", "R15-04"],
    },
  ];
  for (const block of reusedSections) {
    const current =
      output[block.file] ||
      fs.readFileSync(path.join(root, block.file), "utf8");
    const heading = `${block.heading} — 4지선다`;
    output[block.file] = replaceSection(
      current,
      2,
      [block.heading, heading],
      `## ${heading}\n\n${block.intro || "먼저 보기 하나를 고르고 정답·해설을 확인하세요."}\n\n` +
        block.sources
          .map((id) => renderLinkedQuestion(bySource.get(id), block.file))
          .join("\n"),
      { preserveMarkers: true },
    );
  }
  // 실습 소스의 설명 질문도 기존 선택형 문항으로 연결합니다. 코드 빈칸은 바꾸지 않습니다.
  for (const item of extraCoverage.inlineReferences) {
    const current =
      output[item.file] || fs.readFileSync(path.join(root, item.file), "utf8");
    const replacement = item.replacement.replace(
      "{quizLink}",
      quizLink(item.file, bySource.get(item.sourceId)),
    );
    if (!current.includes(item.originalText) && !current.includes(replacement))
      throw new Error(`소스 설명 질문 누락: ${item.file}: ${item.sourceId}`);
    output[item.file] = current.replace(item.originalText, replacement);
  }
  return output;
}
if (require.main === module) {
  const bank = buildWrittenBank();
  fs.writeFileSync(
    path.join(root, "quiz/written-questions.json"),
    JSON.stringify(bank, null, 2) + "\n",
  );
  for (const [file, content] of Object.entries(buildWrittenDocuments(bank)))
    fs.writeFileSync(path.join(root, file), content);
  console.log(`서술형 전환 ${bank.questions.length}문항과 문서 생성 완료`);
}
module.exports = {
  buildWrittenBank,
  validateWrittenBank,
  buildWrittenDocuments,
};
