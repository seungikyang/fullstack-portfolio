// 웹 실습 코드의 저장·재로드·단축키 상태를 관리하는 브라우저 편집기
(() => {
  const workspace = document.querySelector("[data-source-workspace]");
  if (!workspace) {
    return;
  }

  const editor = workspace.querySelector("[data-source-editor]");
  const saveButton = workspace.querySelector("[data-save-source]");
  const reloadButton = workspace.querySelector("[data-reload-source]");
  const status = workspace.querySelector("[data-save-status]");
  let sourceVersion = workspace.dataset.sourceVersion;
  let savedValue = editor.value;

  const setStatus = (message, state = "idle") => {
    status.textContent = message;
    status.dataset.state = state;
  };

  const updateDirtyState = () => {
    const isDirty = editor.value !== savedValue;
    saveButton.disabled = !isDirty;
    if (isDirty) {
      setStatus("저장하지 않은 변경이 있습니다.", "dirty");
    } else {
      setStatus("저장된 파일과 내용이 같습니다.", "saved");
    }
  };

  const saveSource = async () => {
    if (saveButton.disabled) {
      return;
    }

    saveButton.disabled = true;
    setStatus("파일을 저장하고 있습니다.", "saving");

    try {
      const response = await fetch(location.href, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "X-Workbook-Edit-Token": workspace.dataset.editToken,
        },
        body: JSON.stringify({
          content: editor.value,
          version: sourceVersion,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "파일을 저장하지 못했습니다.");
      }

      sourceVersion = result.version;
      workspace.dataset.sourceVersion = sourceVersion;
      savedValue = editor.value;
      const savedAt = new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setStatus(`${savedAt}에 파일을 저장했습니다.`, "saved");
    } catch (error) {
      setStatus(error.message, "error");
      saveButton.disabled = false;
    }
  };

  editor.addEventListener("input", updateDirtyState);
  saveButton.addEventListener("click", saveSource);
  reloadButton.addEventListener("click", () => {
    if (
      editor.value === savedValue ||
      window.confirm("저장하지 않은 변경을 버리고 파일을 다시 불러올까요?")
    ) {
      location.reload();
    }
  });
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      saveSource();
    }
  });
  window.addEventListener("beforeunload", (event) => {
    if (editor.value !== savedValue) {
      event.preventDefault();
      event.returnValue = "";
    }
  });

  updateDirtyState();
})();
