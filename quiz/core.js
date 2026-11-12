// 브라우저와 Node 테스트가 공유하는 채점·복습 규칙입니다. DOM 조작은 app.js에 둡니다.
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.QuizCore = api;
})(typeof globalThis === "object" ? globalThis : this, function () {
  function validChoice(value) {
    return Number.isInteger(value) && value >= 0 && value < 4;
  }
  function validBank(bank) {
    if (
      !bank ||
      typeof bank.version !== "string" ||
      !bank.version.trim() ||
      !Array.isArray(bank.categories) ||
      !bank.categories.length ||
      !Array.isArray(bank.questions) ||
      !bank.questions.length
    )
      return false;
    const categories = new Set();
    for (const c of bank.categories) {
      if (
        !c ||
        typeof c.id !== "string" ||
        !c.id ||
        categories.has(c.id) ||
        typeof c.title !== "string" ||
        !c.title.trim()
      )
        return false;
      categories.add(c.id);
    }
    const ids = new Set();
    for (const q of bank.questions) {
      if (
        !q ||
        typeof q.id !== "string" ||
        !q.id ||
        ids.has(q.id) ||
        !categories.has(q.category) ||
        typeof q.question !== "string" ||
        !q.question.trim() ||
        !Array.isArray(q.choices) ||
        q.choices.length !== 4 ||
        q.choices.some((c) => typeof c !== "string" || !c.trim()) ||
        new Set(q.choices).size !== 4 ||
        !validChoice(q.answer) ||
        typeof q.explanation !== "string" ||
        !q.explanation.trim() ||
        typeof q.reference !== "string" ||
        !/^[a-zA-Z0-9][a-zA-Z0-9_./-]*\.md$/.test(q.reference) ||
        q.reference.includes("..")
      )
        return false;
      ids.add(q.id);
    }
    return true;
  }
  function restore(raw, bank) {
    try {
      const data = JSON.parse(raw);
      if (
        !data ||
        data.version !== bank.version ||
        !data.answers ||
        typeof data.answers !== "object"
      )
        return {};
      const answers = {};
      for (const q of bank.questions) {
        if (
          Object.hasOwn(data.answers, q.id) &&
          validChoice(data.answers[q.id])
        )
          answers[q.id] = data.answers[q.id];
      }
      return answers;
    } catch {
      return {};
    }
  }
  function status(question, answers) {
    if (!Object.hasOwn(answers, question.id)) return "unanswered";
    return answers[question.id] === question.answer ? "correct" : "wrong";
  }
  function filter(
    questions,
    answers,
    category = "all",
    mode = "all",
    search = "",
  ) {
    const query = search.trim().toLocaleLowerCase();
    const exactId =
      query && questions.find((q) => q.id.toLocaleLowerCase() === query)?.id;
    return questions.filter(
      (q) =>
        (category === "all" || q.category === category) &&
        (mode === "all" || status(q, answers) === mode) &&
        (!query ||
          (exactId
            ? q.id === exactId
            : `${q.id} ${q.question} ${q.code || ""}`
                .toLocaleLowerCase()
                .includes(query))),
    );
  }
  function stats(questions, answers) {
    return questions.reduce(
      (sum, q) => {
        const state = status(q, answers);
        if (state !== "unanswered") sum.answered++;
        if (state === "correct") sum.correct++;
        if (state === "wrong") sum.wrong++;
        return sum;
      },
      { answered: 0, correct: 0, wrong: 0 },
    );
  }
  function grade(question, selected, answers) {
    if (!validChoice(selected)) throw new Error("보기를 하나 선택해 주세요.");
    return { ...answers, [question.id]: selected };
  }
  function shuffle(questions, random = Math.random) {
    const result = [...questions];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function categoryStats(bank, answers) {
    return bank.categories.map((category) => {
      const questions = bank.questions.filter(
        (q) => q.category === category.id,
      );
      return {
        ...category,
        total: questions.length,
        ...stats(questions, answers),
      };
    });
  }
  // 오답 목록은 적용 시점의 순서를 보존합니다. 재채점 뒤 새로고침해도
  // 풀던 문제를 잃지 않으며, 버전이 달라진 목록은 복구하지 않습니다.
  function restoreSession(raw, bank) {
    try {
      const data = JSON.parse(raw);
      if (
        !data ||
        data.version !== bank.version ||
        !["home", "practice", "review", "records"].includes(data.view) ||
        !["all", "unanswered", "wrong", "correct"].includes(data.mode) ||
        (data.category !== "all" &&
          !bank.categories.some((c) => c.id === data.category)) ||
        typeof data.search !== "string" ||
        data.search.length > 1000 ||
        !Array.isArray(data.queueIds) ||
        data.queueIds.length > bank.questions.length
      )
        return null;
      const allowed = new Set(
        filter(bank.questions, {}, data.category, "all", data.search).map(
          (q) => q.id,
        ),
      );
      const queueIds = [
        ...new Set(data.queueIds.filter((id) => allowed.has(id))),
      ];
      const questionId = queueIds.includes(data.questionId)
        ? data.questionId
        : queueIds[0] || null;
      return {
        view: data.view,
        category: data.category,
        mode: data.mode,
        search: data.search,
        queueIds,
        questionId,
        entry: typeof data.entry === "string" ? data.entry.slice(0, 2000) : "",
        draft:
          questionId === data.questionId && validChoice(data.draft)
            ? data.draft
            : null,
        retry: questionId === data.questionId && data.retry === true,
        started: data.started === true,
      };
    } catch {
      return null;
    }
  }
  function shouldFollowEntry(session, entry, navigationType) {
    return !session || session.entry !== entry || navigationType === "navigate";
  }
  function readBackup(raw, bank) {
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error("JSON 형식의 학습 기록 파일을 선택해 주세요.");
    }
    if (
      !data ||
      data.format !== "fullstack-workbook-progress" ||
      data.version !== bank.version ||
      !data.answers ||
      typeof data.answers !== "object" ||
      Array.isArray(data.answers)
    )
      throw new Error(
        "현재 문제집과 버전이 같은 학습 기록 파일을 선택해 주세요.",
      );
    const answers = restore(raw, bank);
    if (Object.keys(answers).length !== Object.keys(data.answers).length)
      throw new Error(
        "파일에 알 수 없는 문항이나 잘못된 답이 있습니다. 기록을 불러오지 않았습니다.",
      );
    return answers;
  }
  return {
    validBank,
    restore,
    status,
    filter,
    stats,
    grade,
    shuffle,
    categoryStats,
    restoreSession,
    shouldFollowEntry,
    readBackup,
  };
});
