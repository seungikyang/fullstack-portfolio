// 생성된 4지선다 구간만 웹 폼으로 바꿉니다. Markdown 원본과 실습 빈칸은 유지합니다.
const crypto = require("node:crypto");
const bank = require("../quiz/written-questions.json");
const promptsBySource = new Map();
function collectPrompts(value) {
  if (!value || typeof value !== "object") return;
  if (value.sourceId && value.prompt) {
    const prompts = promptsBySource.get(value.sourceId) || new Set();
    prompts.add(value.prompt);
    promptsBySource.set(value.sourceId, prompts);
  }
  Object.values(value).forEach(collectPrompts);
}
[
  require("../quiz/written-coverage.json"),
  require("../quiz/written-extra-coverage.json"),
  require("../quiz/written-review-coverage.json"),
].forEach(collectPrompts);

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
}

function renderCard(q, index, workbookPath, questionText) {
  const instance = `document-quiz-${index}`;
  const answer = `${q.answer + 1}번 · ${q.choices[q.answer]}`;
  return `<section class="document-quiz" data-document-quiz data-question-id="${q.id}" data-answer="${q.answer}" data-bank-version="${escapeHtml(bank.version)}" aria-labelledby="${instance}-title">
    <div class="dq-meta"><span class="dq-kicker">직접 풀어보기 <span aria-hidden="true">/</span> ${q.id}</span><span class="dq-status" data-quiz-status>미풀이</span></div>
    <p class="dq-question" id="${instance}-title" tabindex="-1">${escapeHtml(questionText)}</p>
    <form data-quiz-form>
      <fieldset class="dq-choices"><legend class="dq-sr-only">정답이라고 생각하는 보기 하나를 선택하세요.</legend>
        ${q.choices.map((choice, n) => `<label class="dq-choice"><input type="radio" name="${instance}-answer" value="${n}" /><span class="dq-number" aria-hidden="true">${n + 1}</span><span class="dq-choice-text">${escapeHtml(choice)}</span><span class="dq-choice-state" data-choice-state></span></label>`).join("\n")}
      </fieldset>
      <div class="dq-actions"><button class="dq-grade" type="submit" data-quiz-grade disabled>정답 확인 <span aria-hidden="true">→</span></button><span class="dq-help" data-quiz-help role="status">보기 하나를 선택해 주세요.</span><button type="button" class="dq-retry" data-quiz-retry hidden>다시 풀기</button></div>
    </form>
    <div class="dq-feedback" data-quiz-feedback role="status" hidden>
      <h4 data-quiz-result></h4><p class="dq-correct">정답 ${escapeHtml(answer)}</p>
      <p class="dq-explanation">${escapeHtml(q.explanation)}</p>
      <a class="dq-focus-link" href="${escapeHtml(workbookPath)}quiz/index.html?bank=written&amp;question=${q.id}">이 문제 집중해서 풀기 <span aria-hidden="true">↗</span></a>
    </div>
    <noscript><details><summary>정답·해설 확인 (JavaScript 꺼짐)</summary><p>정답 ${escapeHtml(answer)}</p><p>${escapeHtml(q.explanation)}</p></details></noscript>
  </section>`;
}

function prepareDocumentQuizzes(markdown, workbookPath) {
  const nonce = crypto.randomBytes(16).toString("hex");
  const cards = [];
  let prepared = markdown.replace(/\r\n/g, "\n");
  for (const q of bank.questions) {
    // 문서별 안내 문구가 다르므로 생성기의 원문 질문도 함께 대조합니다.
    const variants = new Set([q.question]);
    for (const prompt of new Set([
      q.originalPrompt,
      q.title,
      ...(promptsBySource.get(q.sourceId) || []),
    ])) {
      for (const instruction of [
        "알맞은 설명 또는 답변 방식을 고르세요.",
        "보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.",
        "보기 하나를 고르세요.",
      ]) {
        variants.add(`${prompt}\n\n${instruction}`);
      }
    }
    for (const questionText of variants) {
      // 질문·네 보기·정답·해설이 모두 원본과 일치할 때만 전환합니다.
      const block = `${questionText}\n\n${q.choices.map((choice, n) => `${n + 1}. ${choice}`).join("\n")}\n\n<details>\n<summary>정답·해설 확인</summary>\n\n**정답: ${q.answer + 1}번**\n\n${q.explanation}\n\n</details>`;
      if (!prepared.includes(block)) continue;
      prepared = prepared.replaceAll(block, (match, offset) => {
        // 같은 보기를 재사용하는 문항은 문서의 명시적 ID를 우선합니다.
        const linkedId = prepared
          .slice(offset + block.length)
          .match(
            /^\s*\[웹에서 이 문제 채점하기\]\([^\n)]*[?&]question=(W\d{3})\)/,
          )?.[1];
        if (linkedId && linkedId !== q.id) return match;
        const token = `WORKBOOKQUIZ${nonce}X${cards.length}END`;
        cards.push({
          token,
          html: renderCard(q, cards.length, workbookPath, questionText),
        });
        return `\n\n${token}\n\n`;
      });
    }
  }
  return {
    markdown: prepared,
    restore(html) {
      for (const card of cards) {
        html = html.replace(`<p>${card.token}</p>`, () => card.html);
      }
      return html;
    },
  };
}

module.exports = { prepareDocumentQuizzes };
