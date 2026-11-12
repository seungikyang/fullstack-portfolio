// 문서 안의 선택형 문제도 집중 모드와 같은 저장 키·채점 규칙을 사용합니다.
(() => {
  const cards = [...document.querySelectorAll("[data-document-quiz]")];
  if (!cards.length) return;
  const core = window.QuizCore;
  const storageKey = "fullstack-written-choice-v1";
  const version = cards[0].dataset.bankVersion;
  const questions = cards.map((card) => ({
    id: card.dataset.questionId,
    answer: Number(card.dataset.answer),
  }));
  const uniqueQuestions = [
    ...new Map(questions.map((q) => [q.id, q])).values(),
  ];
  let memory = {};
  let pending = {};
  let storageAvailable = true;

  function readSaved() {
    let raw;
    try {
      raw = localStorage.getItem(storageKey);
    } catch {
      storageAvailable = false;
      return memory;
    }
    try {
      const data = JSON.parse(raw);
      if (
        !data ||
        data.version !== version ||
        typeof data.answers !== "object" ||
        !data.answers
      )
        return {};
      // 다른 문서에서 푼 문항도 보존하고 잘못된 선택 값은 제외합니다.
      return Object.fromEntries(
        Object.entries(data.answers).filter(
          ([id, value]) =>
            /^W\d{3}$/.test(id) &&
            Number.isInteger(value) &&
            value >= 0 &&
            value < 4,
        ),
      );
    } catch {
      return {};
    }
  }
  memory = readSaved();

  const summary = document.createElement("section");
  summary.className = "dq-summary";
  summary.setAttribute("aria-label", "이 페이지 학습 현황");
  const heading = document.createElement("strong");
  heading.textContent = "읽는 것에서, 풀어보는 것으로.";
  const stats = document.createElement("p");
  stats.setAttribute("role", "status");
  const progress = document.createElement("progress");
  progress.max = uniqueQuestions.length;
  progress.setAttribute("aria-label", "이 페이지 풀이한 문제 수");
  const next = document.createElement("button");
  next.type = "button";
  next.textContent = "다음 미풀이로 이동 ↓";
  const note = document.createElement("p");
  note.className = "dq-storage-note";
  note.textContent = "자동 저장 · 퀴즈 화면과 풀이 기록이 이어집니다.";
  summary.append(heading, stats, progress, next, note);
  const main =
    cards[0].closest(".problem-content") || document.querySelector("main");
  const title = main.querySelector("h1");
  if (title) title.after(summary);
  else main.prepend(summary);

  function renderStats() {
    const total = core.stats(uniqueQuestions, memory);
    stats.textContent = `${total.answered} / ${uniqueQuestions.length}문항 완료 · 정답 ${total.correct} · 오답 ${total.wrong}`;
    progress.value = total.answered;
    next.disabled = total.answered === uniqueQuestions.length;
    note.textContent = storageAvailable
      ? "자동 저장 · 퀴즈 화면과 풀이 기록이 이어집니다."
      : "저장소를 사용할 수 없어 이번 화면에서만 기록합니다. 새로고침하면 이번 기록이 사라질 수 있습니다.";
  }

  function resetCard(card) {
    card.dataset.state = "unanswered";
    card.querySelector("[data-quiz-status]").textContent = "미풀이";
    card.querySelector("[data-quiz-feedback]").hidden = true;
    card.querySelector("[data-quiz-retry]").hidden = true;
    card.querySelector("[data-quiz-grade]").disabled = true;
    card.querySelector("[data-quiz-help]").textContent =
      "보기 하나를 선택해 주세요.";
    for (const input of card.querySelectorAll('input[type="radio"]')) {
      input.checked = false;
      input.disabled = false;
      delete input.closest("label").dataset.state;
      input.closest("label").querySelector("[data-choice-state]").textContent =
        "";
    }
  }

  function showFeedback(card, selected) {
    const answer = Number(card.dataset.answer);
    const correct = selected === answer;
    card.dataset.state = correct ? "correct" : "wrong";
    card.querySelector("[data-quiz-status]").textContent = correct
      ? "✓ 정답"
      : "↻ 복습 필요";
    card.querySelector("[data-quiz-result]").textContent = correct
      ? "정답이에요! 이유까지 확인해 보세요."
      : "괜찮아요. 이 개념을 짚고 넘어가요.";
    card.querySelector("[data-quiz-feedback]").hidden = false;
    card.querySelector("[data-quiz-retry]").hidden = false;
    card.querySelector("[data-quiz-grade]").disabled = true;
    card.querySelector("[data-quiz-help]").textContent =
      `${selected + 1}번으로 제출했습니다.`;
    for (const input of card.querySelectorAll('input[type="radio"]')) {
      const value = Number(input.value);
      input.checked = value === selected;
      input.disabled = true;
      const label = input.closest("label");
      delete label.dataset.state;
      const badge = label.querySelector("[data-choice-state]");
      badge.textContent = "";
      if (value === answer) {
        label.dataset.state = "correct";
        badge.textContent = value === selected ? "✓ 내 답 · 정답" : "✓ 정답";
      } else if (value === selected) {
        label.dataset.state = "wrong";
        badge.textContent = "× 내 답";
      }
    }
  }

  function syncCard(card) {
    resetCard(card);
    if (Object.hasOwn(memory, card.dataset.questionId))
      showFeedback(card, memory[card.dataset.questionId]);
  }

  for (const card of cards) {
    const form = card.querySelector("[data-quiz-form]");
    form.addEventListener("change", () => {
      const selected = form.querySelector("input:checked");
      if (!selected || selected.disabled) return;
      card.querySelector("[data-quiz-grade]").disabled = false;
      card.querySelector("[data-quiz-help]").textContent =
        `${Number(selected.value) + 1}번 선택 · 정답 확인을 눌러 주세요.`;
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const selected = form.querySelector("input:checked");
      if (!selected || selected.disabled) return;
      // 방금 읽은 다른 탭의 기록을 유지하면서 현재 문항만 갱신합니다.
      pending[card.dataset.questionId] = Number(selected.value);
      memory = { ...readSaved(), ...pending };
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ version, answers: memory }),
        );
        storageAvailable = true;
        pending = {};
      } catch {
        storageAvailable = false;
      }
      for (const instance of cards.filter(
        (item) => item.dataset.questionId === card.dataset.questionId,
      ))
        showFeedback(instance, Number(selected.value));
      renderStats();
    });
    card.querySelector("[data-quiz-retry]").addEventListener("click", () => {
      resetCard(card);
      card.querySelector("[data-quiz-status]").textContent = "재도전";
      card.querySelector("[data-quiz-help]").textContent =
        "새 답을 제출하면 기록이 갱신됩니다.";
      card.querySelector('input[type="radio"]').focus();
    });
    syncCard(card);
  }
  next.addEventListener("click", () => {
    const card = cards.find(
      (item) => !Object.hasOwn(memory, item.dataset.questionId),
    );
    if (!card) return;
    card.querySelector(".dq-question").focus({ preventScroll: true });
    card.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
  });
  window.addEventListener("storage", (event) => {
    if (event.key !== storageKey && event.key !== null) return;
    const previous = memory;
    memory = { ...readSaved(), ...pending };
    for (const card of cards) {
      const id = card.dataset.questionId;
      // 다른 문항의 기록이 바뀌어도 현재 선택 중인 답은 유지합니다.
      if (previous[id] !== memory[id]) syncCard(card);
    }
    renderStats();
  });
  renderStats();
})();
