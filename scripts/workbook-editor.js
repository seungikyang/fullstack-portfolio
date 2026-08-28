// 웹 실습 코드의 저장·재로드·단축키 상태를 관리하는 브라우저 편집기
// 문제 화면 하단 편집기에서 동작하며, 저장은 serve-workbook.js 서버의 PUT 요청으로 처리된다.
(() => {
  // data-* 속성으로 HTML과 자바스크립트를 연결한다. id 대신 data 속성을 쓰면
  // HTML 구조가 바뀌어도 "역할" 기준으로 요소를 찾을 수 있다.
  const workspace = document.querySelector("[data-source-workspace]");
  if (!workspace) {
    return; // 이 페이지에 편집기가 없으면 아무 것도 하지 않고 끝낸다
  }

  const editor = workspace.querySelector("[data-source-editor]");
  const saveButton = workspace.querySelector("[data-save-source]");
  const reloadButton = workspace.querySelector("[data-reload-source]");
  const status = workspace.querySelector("[data-save-status]");

  // 지금까지 저장된 내용과 비교용 상태.
  // savedValue와 editor.value가 다르면 "저장하지 않은 변경(dirty)"이 있는 것이다.
  let sourceVersion = workspace.dataset.sourceVersion;
  let savedValue = editor.value;
  let isSaving = false;

  // 상태 문구와 색상 상태를 한 번에 바꾸는 헬퍼 함수
  const setStatus = (message, state = "idle") => {
    status.textContent = message;
    status.dataset.state = state;
  };

  // 저장 여부에 따라 버튼 활성화와 안내 문구를 갱신한다
  const updateDirtyState = () => {
    const isDirty = editor.value !== savedValue;
    saveButton.disabled = isSaving || !isDirty;
    if (isSaving) {
      return; // 저장 중에는 문구를 덮어쓰지 않는다
    }
    if (isDirty) {
      setStatus("저장하지 않은 변경이 있습니다.", "dirty");
    } else {
      setStatus("저장된 파일과 내용이 같습니다.", "saved");
    }
  };

  // 현재 편집 내용을 서버로 보내 같은 로컬 파일에 저장한다
  const saveSource = async () => {
    // 저장 중이거나 바뀐 내용이 없으면 아무 일도 하지 않는다(중복 저장 방지)
    if (isSaving || editor.value === savedValue) {
      return;
    }

    const contentToSave = editor.value;
    isSaving = true;
    updateDirtyState();
    setStatus("파일을 저장하고 있습니다.", "saving");

    try {
      // version을 함께 보내서 "내가 읽은 파일이 최신인지" 서버가 확인하게 한다.
      // 그 사이에 다른 프로그램이 파일을 고쳤으면 서버가 충돌로 거절한다.
      const response = await fetch(location.href, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "X-Workbook-Edit-Token": workspace.dataset.editToken,
        },
        body: JSON.stringify({
          content: contentToSave,
          version: sourceVersion,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "파일을 저장하지 못했습니다.");
      }

      // 성공: 새 버전을 받아 저장 기준점을 방금 저장한 내용으로 옮긴다
      sourceVersion = result.version;
      workspace.dataset.sourceVersion = sourceVersion;
      savedValue = contentToSave;
      isSaving = false;
      const savedAt = new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      updateDirtyState();
      if (editor.value === savedValue) {
        setStatus(`${savedAt}에 파일을 저장했습니다.`, "saved");
      } else {
        // 저장 요청이 진행되는 동안 더 입력했다면 남은 변경을 알려준다
        setStatus("저장 중 추가한 변경이 남아 있습니다.", "dirty");
      }
    } catch (error) {
      isSaving = false;
      setStatus(error.message, "error");
      saveButton.disabled = editor.value === savedValue;
    }
  };

  // 이벤트 연결: 입력·클릭·단축키·페이지 이탈 네 가지 상황에 반응한다
  editor.addEventListener("input", updateDirtyState);
  saveButton.addEventListener("click", saveSource);
  reloadButton.addEventListener("click", () => {
    // 저장하지 않은 변경이 있으면 되물어보고, 확인하면 페이지를 다시 불러온다
    if (
      editor.value === savedValue ||
      window.confirm("저장하지 않은 변경을 버리고 파일을 다시 불러올까요?")
    ) {
      location.reload();
    }
  });
  // Ctrl+S(Windows) / Command+S(macOS)로도 저장할 수 있게 한다
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault(); // 브라우저 기본 "페이지 저장" 동작을 막는다
      saveSource();
    }
  });
  // 저장하지 않은 변경이 있는데 탭을 닫으려 하면 브라우저 경고를 띄운다
  window.addEventListener("beforeunload", (event) => {
    if (editor.value !== savedValue) {
      event.preventDefault();
      event.returnValue = "";
    }
  });

  // 처음 상태도 계산해 버튼과 문구를 맞춰 놓는다
  updateDirtyState();
})();
