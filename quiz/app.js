// 기존 문항과 기록 키를 그대로 사용합니다. 사용자 데이터는 textContent로 표시합니다.
(() => {
  const core = window.QuizCore;
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(window.location.search);
  const written = params.get("bank") === "written";
  const storageKey = written
    ? "fullstack-written-choice-v1"
    : "fullstack-basics-quiz-v1";
  const sessionKey = `${storageKey}:session`;
  const viewTitles = {
    home: "학습 홈",
    practice: "문제 풀기",
    review: "오답노트",
    records: "학습 기록",
  };
  const icons = {
    html: "</>",
    css: "#",
    javascript: "JS",
    dom: "DOM",
    react: "Re",
    http: "API",
    node: "N",
    database: "DB",
    auth: "KEY",
    deploy: "GO",
    "career-hub": "CH",
    typescript: "TS",
    sql: "SQL",
    spring: "J",
    testing: "✓",
    git: "git",
    docker: "CI",
    cs: "CS",
    security: "SEC",
    "note-hub": "NH",
  };
  const mapSize = 30;
  let bank;
  let answers = {};
  let pendingAnswers = {};
  let queue = [];
  let position = 0;
  let mapPage = 0;
  let selected = null;
  let graded = false;
  let started = false;
  let view = "home";
  let filters = { category: "all", mode: "all", search: "" };
  let answerStorageFailed = false;
  let sessionStorageFailed = false;

  function el(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function action(text, listener, className = "secondary") {
    const button = el("button", text, className);
    button.type = "button";
    button.addEventListener("click", listener);
    return button;
  }
  function storageNotice() {
    const failed = answerStorageFailed || sessionStorageFailed;
    $("storage-message").hidden = !failed;
    $("storage-message").textContent =
      "브라우저에 기록을 저장할 수 없습니다. 지금은 계속 풀 수 있지만 새로고침하면 이번 기록이 사라질 수 있습니다. 학습 기록에서 파일로 내보내 보관하세요.";
    $("save-status").textContent = failed
      ? "현재 화면에서만 기록"
      : "브라우저 자동 저장";
    $("save-status").classList.toggle("warning", failed);
  }
  function saveAnswers(reset = false) {
    try {
      const latest = core.restore(localStorage.getItem(storageKey), bank);
      // 읽어온 최신 다른 문항은 유지하고, 이 화면에서 제출한 답만 덮어씁니다.
      answers = reset ? {} : { ...latest, ...pendingAnswers };
      localStorage.setItem(
        storageKey,
        JSON.stringify({ version: bank.version, answers }),
      );
      pendingAnswers = {};
      answerStorageFailed = false;
      return true;
    } catch {
      answerStorageFailed = true;
      return false;
    } finally {
      storageNotice();
    }
  }
  function saveSession() {
    if (!bank) return;
    sessionStorageFailed = false;
    try {
      const serialized = JSON.stringify({
        version: bank.version,
        view,
        ...filters,
        entry: params.toString(),
        queueIds: queue.map((q) => q.id),
        questionId: queue[position]?.id || null,
        draft: graded ? null : selected,
        retry:
          !graded &&
          Boolean(
            queue[position] && Object.hasOwn(answers, queue[position].id),
          ),
        started,
      });
      // 탭별 위치를 보존하고 마지막 위치도 남겨 새 탭에서 이어 풀 수 있게 한다.
      for (const storageName of ["sessionStorage", "localStorage"]) {
        try {
          window[storageName].setItem(sessionKey, serialized);
        } catch {
          sessionStorageFailed = true;
        }
      }
    } catch {
      sessionStorageFailed = true;
    }
    storageNotice();
  }
  function syncFilterInputs() {
    $("category").value = filters.category;
    $("mode").value = filters.mode;
    $("search").value = filters.search;
  }
  function showView(nextView, focus = false) {
    view = nextView;
    $("home-view").hidden = view !== "home";
    $("practice-view").hidden = view !== "practice" && view !== "review";
    $("records-view").hidden = view !== "records";
    $("view-label").textContent = viewTitles[view];
    $("practice-title").textContent =
      view === "review" ? "오답을 이해하면, 한 걸음 더." : "문제 풀기";
    $("practice-description").textContent =
      view === "review"
        ? "이전에 틀린 문제를 정답을 가린 채 다시 풀어요. 맞힌 문제는 다음 오답 목록에서 빠집니다."
        : "보기 하나를 선택한 뒤 정답과 해설을 확인하세요.";
    $("refresh-review").hidden = view !== "review";
    for (const button of document.querySelectorAll("[data-view]")) {
      if (button.dataset.view === view)
        button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    }
    renderResume();
    saveSession();
    if (focus) {
      const target =
        view === "records"
          ? $("records-title")
          : view === "home"
            ? $("main")
            : $("practice-title");
      target.focus();
    }
  }
  function startSelection(category = "all", mode = "all", search = "") {
    filters = { category, mode, search };
    syncFilterInputs();
    applyFilters(false, true);
  }
  function renderResume() {
    const q = started && queue[position];
    $("resume").textContent = q ? "이어서 풀기 →" : "첫 문제 풀기 →";
    if (q) {
      $("resume-title").textContent = "차곡차곡,\n어제보다 한 걸음 더.";
      const category = bank.categories.find((c) => c.id === q.category).title;
      $("resume-description").textContent =
        `${category} · ${q.id} · 목록 ${position + 1} / ${queue.length}\n${q.question}`;
    } else {
      $("resume-title").textContent = "오늘도 한 문제씩,\n나의 실력으로.";
      $("resume-description").textContent =
        "보기 하나를 고르는 것부터 시작해 보세요.\n정답을 확인하면 해설과 원문 학습 자료가 이어집니다.";
    }
  }
  function renderStats() {
    const total = core.stats(bank.questions, answers);
    function metric(id, count, suffix) {
      $(id).replaceChildren(
        document.createTextNode(count.toLocaleString()),
        el("small", suffix),
      );
    }
    metric(
      "stat-answered",
      total.answered,
      ` / ${bank.questions.length.toLocaleString()}`,
    );
    metric("stat-correct", total.correct, "문항");
    metric("stat-wrong", total.wrong, "문항");
    $("stat-rate").textContent = total.answered
      ? `${Math.round((total.correct / total.answered) * 100)}%`
      : "—";
    $("rate-caption").textContent = total.answered
      ? `푼 ${total.answered.toLocaleString()}문항 기준`
      : "첫 문제를 풀어 보세요";
    $("review-count").textContent = total.wrong;
    $("progress").value = total.answered;
    $("progress").max = bank.questions.length;
    $("progress-text").textContent =
      `${total.answered.toLocaleString()} / ${bank.questions.length.toLocaleString()}문항 풀이 · ${Math.round((total.answered / bank.questions.length) * 100)}% 진행`;
    $("score-text").textContent = `정답 ${total.correct} · 오답 ${total.wrong}`;
    renderSubjects();
  }
  function renderSubjects() {
    $("subjects").replaceChildren();
    $("records-body").replaceChildren();
    for (const c of core.categoryStats(bank, answers)) {
      const rate = c.total ? Math.round((c.answered / c.total) * 100) : 0;
      const card = el("article", undefined, "subject-card");
      card.setAttribute("aria-label", c.title);
      const top = el("div", undefined, "subject-top");
      const icon = el("span", icons[c.id] || "Q", "subject-icon");
      icon.setAttribute("aria-hidden", "true");
      top.append(icon, el("span", `${c.total.toLocaleString()}문항`));
      const count = el("div", undefined, "subject-progress");
      count.append(
        el("span", `${c.answered} / ${c.total} 풀이`),
        el("span", `${rate}%`),
      );
      const progress = el("progress");
      progress.max = c.total || 1;
      progress.value = c.answered;
      progress.setAttribute("aria-label", `${c.title} 풀이 진도`);
      const actions = el("div", undefined, "subject-actions");
      if (c.wrong)
        actions.append(
          action(
            `오답 ${c.wrong} 복습`,
            () => startSelection(c.id, "wrong"),
            "inline-button",
          ),
        );
      else
        actions.append(
          el(
            "span",
            c.answered === c.total ? "모두 풀었어요 ✓" : "나의 속도로 차근차근",
            "muted",
          ),
        );
      actions.append(
        action(c.answered ? "이어서 학습 →" : "학습 시작 →", () =>
          startSelection(c.id, c.answered < c.total ? "unanswered" : "all"),
        ),
      );
      card.append(top, el("h3", c.title), count, progress, actions);
      $("subjects").append(card);
      const row = el("tr");
      const title = el("th", c.title);
      title.scope = "row";
      const answered = el("td", `${c.answered} / ${c.total} · ${rate}%`);
      answered.append(progress.cloneNode());
      const wrong = el("td");
      wrong.append(
        c.wrong
          ? action(
              `${c.wrong} 복습 →`,
              () => startSelection(c.id, "wrong"),
              "inline-button",
            )
          : document.createTextNode("0"),
      );
      const learn = el("td");
      learn.append(
        action("문제 풀기 →", () => startSelection(c.id), "inline-button"),
      );
      row.append(title, answered, el("td", String(c.correct)), wrong, learn);
      $("records-body").append(row);
    }
  }
  function renderFeedback() {
    const q = queue[position];
    const correct = selected === q.answer;
    $("feedback").hidden = false;
    $("feedback").classList.toggle("incorrect", !correct);
    $("result-title").textContent = correct
      ? "✓ 정답이에요. 이유도 확인해 보세요."
      : "다시 배울 기회예요. 해설을 확인해 보세요.";
    $("correct-answer").textContent =
      `정답 ${q.answer + 1}번 · ${q.choices[q.answer]}`;
    $("explanation").textContent = q.explanation;
    $("reference").href = `../${q.reference}`;
    for (const input of $("choices").querySelectorAll("input")) {
      input.disabled = true;
      const label = input.closest("label");
      const n = Number(input.value);
      label.classList.toggle("correct", n === q.answer);
      label.classList.toggle("wrong", n === selected && !correct);
      label.querySelector(".answer-badge")?.remove();
      if (n === q.answer || n === selected)
        label.lastElementChild.append(
          el(
            "span",
            n === q.answer ? "✓ 정답" : "× 선택한 오답",
            "answer-badge",
          ),
        );
    }
    $("grade").disabled = true;
    $("selection-help").textContent = "해설을 확인하고 다음 문제로 이동하세요.";
    $("queue-complete").hidden = position !== queue.length - 1;
  }
  function renderMap() {
    $("question-map").replaceChildren();
    const start = mapPage * mapSize;
    for (let i = start; i < Math.min(start + mapSize, queue.length); i++) {
      const q = queue[i];
      const status = core.status(q, answers);
      const mark = status === "correct" ? "✓" : status === "wrong" ? "×" : "○";
      const button = action(`${i + 1} ${mark}`, () => moveTo(i), status);
      button.setAttribute(
        "aria-label",
        `${i + 1}번 ${q.id} ${status === "correct" ? "정답" : status === "wrong" ? "오답" : "미풀이"}`,
      );
      if (i === position) button.setAttribute("aria-current", "true");
      $("question-map").append(button);
    }
    $("map-page").textContent =
      `${mapPage + 1} / ${Math.ceil(queue.length / mapSize)}`;
    $("map-previous").disabled = mapPage === 0;
    $("map-next").disabled = start + mapSize >= queue.length;
  }
  function renderQuestion(focus = false, restored = null) {
    const q = queue[position];
    $("practice-layout").hidden = !q;
    $("empty").hidden = Boolean(q);
    $("queue-summary").textContent =
      `선택한 목록 ${queue.length.toLocaleString()}문항 · 적용 시점의 목록을 유지합니다. 최신 기록은 다시 적용해 주세요.`;
    if (!q) {
      selected = null;
      graded = false;
      const review = filters.mode === "wrong";
      $("empty-title").textContent = review
        ? "이 범위에는 복습할 오답이 없어요."
        : "이 조건에 맞는 문제가 없습니다.";
      $("empty-description").textContent = review
        ? "다른 과목을 공부하거나 전체 문제에서 새로운 문제를 풀어 보세요."
        : "다른 과목이나 학습 범위를 선택해 보세요.";
      return;
    }
    const retry = restored ? restored.retry : filters.mode === "wrong";
    selected =
      !retry && Object.hasOwn(answers, q.id)
        ? answers[q.id]
        : (restored?.draft ?? null);
    graded = !retry && Object.hasOwn(answers, q.id);
    $("question-category").textContent = bank.categories.find(
      (c) => c.id === q.category,
    ).title;
    $("question-position").textContent = `${position + 1} / ${queue.length}`;
    $("question-id").textContent =
      `${q.id} · ${q.type === "concept" ? "개념·상황" : "코드·계산 반복 연습"}${q.sourceId ? ` · 원문 ${q.sourceId}` : ""}`;
    $("question-title").textContent = q.question;
    $("question-code").textContent = q.code || "";
    $("code-block").hidden = !q.code;
    $("feedback").hidden = true;
    $("queue-complete").hidden = true;
    for (const label of $("choices").querySelectorAll("label")) label.remove();
    q.choices.forEach((choice, n) => {
      const label = el("label", undefined, "choice");
      const input = el("input");
      input.type = "radio";
      input.name = "answer";
      input.value = String(n);
      input.checked = n === selected;
      input.addEventListener("change", () => {
        selected = n;
        $("grade").disabled = false;
        $("selection-help").textContent =
          `${n + 1}번을 선택했습니다. 정답 확인을 눌러 제출하세요.`;
        saveSession();
      });
      const text = el("span");
      text.append(
        el("span", `${n + 1}.`, "choice-number"),
        document.createTextNode(choice),
      );
      label.append(input, text);
      $("choices").append(label);
    });
    $("grade").disabled = selected === null || graded;
    $("selection-help").textContent =
      selected === null
        ? "보기 하나를 선택해 주세요."
        : "선택한 보기를 복원했어요. 정답 확인을 눌러 제출하세요.";
    $("previous").disabled = position === 0;
    $("next").disabled = position === queue.length - 1;
    $("jump").max = queue.length;
    $("jump").value = position + 1;
    if (graded) renderFeedback();
    mapPage = Math.floor(position / mapSize);
    renderMap();
    if (focus) $("question-title").focus();
  }
  function applyFilters(shuffle = false, focus = false) {
    filters = {
      category: $("category").value,
      mode: $("mode").value,
      search: $("search").value.slice(0, 1000),
    };
    queue = core.filter(
      bank.questions,
      answers,
      filters.category,
      filters.mode,
      filters.search,
    );
    if (shuffle) queue = core.shuffle(queue);
    position = 0;
    started = true;
    renderQuestion();
    showView(filters.mode === "wrong" ? "review" : "practice", focus);
  }
  function moveTo(target) {
    if (target < 0 || target >= queue.length) return;
    position = target;
    renderQuestion(true);
    saveSession();
  }
  function goReview() {
    if (bank) startSelection("all", "wrong");
  }
  for (const button of document.querySelectorAll("[data-view]")) {
    button.addEventListener("click", () => {
      if (!bank) return;
      const nextView = button.dataset.view;
      if (nextView === "review") return goReview();
      if (nextView === "practice" && (!started || filters.mode === "wrong"))
        return startSelection();
      showView(nextView, true);
    });
  }
  $("filters").addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilters(false, true);
  });
  $("shuffle").addEventListener("click", () => applyFilters(true, true));
  $("refresh-review").addEventListener("click", () => {
    syncFilterInputs();
    applyFilters(false, true);
  });
  $("stats-review").addEventListener("click", goReview);
  $("all-subjects").addEventListener("click", () => startSelection());
  $("empty-action").addEventListener("click", () => startSelection());
  $("back-home").addEventListener("click", () => showView("home", true));
  $("resume").addEventListener("click", () => {
    if (!started || !queue.length) return startSelection();
    showView(filters.mode === "wrong" ? "review" : "practice", true);
  });
  $("answer-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (selected === null || graded || !queue[position]) return;
    answers = core.grade(queue[position], selected, answers);
    pendingAnswers[queue[position].id] = selected;
    graded = true;
    saveAnswers();
    renderStats();
    renderFeedback();
    renderMap();
    saveSession();
  });
  $("previous").addEventListener("click", () => moveTo(position - 1));
  $("next").addEventListener("click", () => moveTo(position + 1));
  $("retry-question").addEventListener("click", () => {
    renderQuestion(true, { retry: true, draft: null });
    saveSession();
  });
  $("jump-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const target = Number($("jump").value);
    if (Number.isInteger(target)) moveTo(target - 1);
  });
  $("map-previous").addEventListener("click", () => {
    if (mapPage > 0) {
      mapPage--;
      renderMap();
    }
  });
  $("map-next").addEventListener("click", () => {
    if ((mapPage + 1) * mapSize < queue.length) {
      mapPage++;
      renderMap();
    }
  });
  $("reset").addEventListener("click", () => {
    if (
      !window.confirm(
        `이 브라우저의 ${written ? "기존 워크북 455문항" : "기본기 3000제"} 풀이 기록과 이어 풀기 위치를 모두 지울까요?`,
      )
    )
      return;
    answers = {};
    pendingAnswers = {};
    saveAnswers(true);
    started = false;
    filters = { category: "all", mode: "all", search: "" };
    syncFilterInputs();
    queue = [...bank.questions];
    position = 0;
    renderQuestion();
    renderStats();
    $("backup-message").hidden = true;
    showView("home", true);
  });
  $("export").addEventListener("click", () => {
    const data = {
      format: "fullstack-workbook-progress",
      version: bank.version,
      answers,
      exportedAt: new Date().toISOString(),
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const link = el("a");
    link.href = url;
    link.download = `fullstack-${written ? "written" : "basics"}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  $("import").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    $("backup-message").hidden = false;
    try {
      if (file.size > 1024 * 1024)
        throw new Error("1MB 이하의 학습 기록 파일을 선택해 주세요.");
      const imported = core.readBackup(await file.text(), bank);
      pendingAnswers = { ...pendingAnswers, ...imported };
      answers = { ...answers, ...imported };
      const saved = saveAnswers();
      renderStats();
      renderQuestion(false, { retry: !graded, draft: selected });
      saveSession();
      $("backup-message").textContent =
        `${Object.keys(imported).length}문항 기록을 합쳤습니다.${saved ? "" : " 브라우저 저장은 실패했습니다. 현재 화면에서만 유지됩니다."}`;
    } catch (error) {
      $("backup-message").textContent = error.message;
    }
    event.target.value = "";
  });
  async function load() {
    $("retry-load").hidden = true;
    $("load-message").hidden = false;
    $("load-message").textContent = "문제를 불러오는 중입니다…";
    try {
      const response = await fetch(
        written ? "./written-questions.json" : "./questions.json",
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!core.validBank(data)) throw new Error("문제 데이터 형식 오류");
      bank = data;
      $(written ? "written-bank" : "basics-bank").setAttribute(
        "aria-current",
        "page",
      );
      $("bank-description").textContent = written
        ? "기존 워크북의 설명·자가 점검·면접 질문을 선택형으로 학습해요."
        : "20개 과목, 3,000문항으로 쌓는 풀스택 개발 기본기.";
      $("subject-description").textContent =
        `${bank.categories.length}개 과목 · ${bank.questions.length.toLocaleString()}문항 · 모든 문제에 해설과 원문 링크`;
      $("daily-plan").textContent = written
        ? "기존 워크북 455문항 · 문서 안 풀이와 기록 공유"
        : "개념·상황 400문항 + 코드·계산 반복 2,600문항";
      document.title = `${written ? "기존 워크북 455문항" : "기본기 3000제"} | 풀스택 웹 문제집`;
      while ($("category").options.length > 1) $("category").remove(1);
      for (const c of bank.categories) {
        const option = el("option", c.title);
        option.value = c.id;
        $("category").append(option);
      }
      let session = null;
      try {
        answers = core.restore(localStorage.getItem(storageKey), bank);
        session = core.restoreSession(localStorage.getItem(sessionKey), bank);
      } catch {
        answerStorageFailed = true;
      }
      try {
        session =
          core.restoreSession(sessionStorage.getItem(sessionKey), bank) ||
          session;
      } catch {
        sessionStorageFailed = true;
      }
      if (session) {
        filters = {
          category: session.category,
          mode: session.mode,
          search: session.search,
        };
        const byId = new Map(bank.questions.map((q) => [q.id, q]));
        queue = session.queueIds.map((id) => byId.get(id));
        position = Math.max(
          0,
          queue.findIndex((q) => q.id === session.questionId),
        );
        started = session.started;
        view = session.view;
      } else {
        queue = [...bank.questions];
      }
      syncFilterInputs();
      $("load-message").hidden = true;
      $("quiz").hidden = false;
      renderStats();
      // 새로운 문서 링크는 저장 위치보다 우선하고, 같은 주소의 새로고침은 선택도 복구합니다.
      const question = bank.questions.find(
        (q) => q.id === params.get("question"),
      );
      const category = bank.categories.find(
        (c) => c.id === params.get("category"),
      );
      if (
        core.shouldFollowEntry(
          session,
          params.toString(),
          window.performance.getEntriesByType("navigation")[0]?.type,
        ) &&
        (question || category || params.get("mode") === "wrong")
      ) {
        startSelection(
          question ? "all" : category?.id || "all",
          params.get("mode") === "wrong" ? "wrong" : "all",
          question?.id || "",
        );
      } else {
        renderQuestion(false, session);
        showView(view);
      }
    } catch {
      bank = null;
      $("quiz").hidden = true;
      $("load-message").hidden = false;
      $("load-message").textContent =
        "문제를 불러오지 못했습니다. 저장소 루트에서 npm run serve:workbook을 실행한 뒤 다시 불러오기를 눌러 주세요.";
      $("retry-load").hidden = false;
    }
  }
  $("retry-load").addEventListener("click", load);
  window.addEventListener("storage", (event) => {
    if (!bank || (event.key !== storageKey && event.key !== null)) return;
    try {
      const currentId = queue[position]?.id;
      const previousAnswer = answers[currentId];
      answers = {
        ...core.restore(localStorage.getItem(storageKey), bank),
        ...pendingAnswers,
      };
      renderStats();
      if (graded && previousAnswer !== answers[currentId])
        renderQuestion(false, { retry: false });
      else renderMap();
    } catch {
      /* 저장소가 차단돼도 현재 화면의 풀이를 유지합니다. */
    }
  });
  load();
})();
