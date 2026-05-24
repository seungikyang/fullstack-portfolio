// API 요청 값을 검증하고 저장 가능한 형태로 정리하는 파일
const applicationStatuses = new Set(["준비중", "지원완료", "코딩테스트", "면접", "합격", "불합격"]);

const projectStatuses = new Set(["계획", "개발중", "완료"]);
const priorities = new Set(["낮음", "보통", "높음"]);

function text(value) {
  return String(value || "").trim();
}

function stackList(value) {
  if (Array.isArray(value)) {
    return value.map(text).filter(Boolean);
  }

  return text(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function validateApplication(payload, partial = false) {
  const errors = [];
  const value = {};

  if (!partial || payload.company !== undefined) {
    value.company = text(payload.company);
    if (!value.company) {
      errors.push("회사명을 입력하세요.");
    }
  }

  if (!partial || payload.role !== undefined) {
    value.role = text(payload.role);
    if (!value.role) {
      errors.push("지원 직무를 입력하세요.");
    }
  }

  if (!partial || payload.status !== undefined) {
    value.status = text(payload.status) || "준비중";
    if (!applicationStatuses.has(value.status)) {
      errors.push("지원 상태가 올바르지 않습니다.");
    }
  }

  if (!partial || payload.priority !== undefined) {
    value.priority = text(payload.priority) || "보통";
    if (!priorities.has(value.priority)) {
      errors.push("우선순위가 올바르지 않습니다.");
    }
  }

  if (!partial || payload.stack !== undefined) {
    value.stack = stackList(payload.stack);
  }

  if (!partial || payload.dueDate !== undefined) {
    value.dueDate = text(payload.dueDate);
  }

  if (!partial || payload.contact !== undefined) {
    value.contact = text(payload.contact);
  }

  if (!partial || payload.memo !== undefined) {
    value.memo = text(payload.memo);
  }

  return { value, errors };
}

export function validateProject(payload, partial = false) {
  const errors = [];
  const value = {};

  if (!partial || payload.name !== undefined) {
    value.name = text(payload.name);
    if (!value.name) {
      errors.push("프로젝트 이름을 입력하세요.");
    }
  }

  if (!partial || payload.summary !== undefined) {
    value.summary = text(payload.summary);
    if (!value.summary) {
      errors.push("프로젝트 요약을 입력하세요.");
    }
  }

  if (!partial || payload.status !== undefined) {
    value.status = text(payload.status) || "개발중";
    if (!projectStatuses.has(value.status)) {
      errors.push("프로젝트 상태가 올바르지 않습니다.");
    }
  }

  if (!partial || payload.stack !== undefined) {
    value.stack = stackList(payload.stack);
  }

  if (!partial || payload.repoUrl !== undefined) {
    value.repoUrl = text(payload.repoUrl);
  }

  if (!partial || payload.deployUrl !== undefined) {
    value.deployUrl = text(payload.deployUrl);
  }

  if (!partial || payload.highlight !== undefined) {
    value.highlight = text(payload.highlight);
  }

  return { value, errors };
}

export function validateRegister(payload) {
  const name = text(payload.name) || "학습자";
  const email = text(payload.email).toLowerCase();
  const password = String(payload.password || "");
  const errors = [];

  if (!email.includes("@")) {
    errors.push("올바른 이메일을 입력하세요.");
  }

  if (password.length < 8) {
    errors.push("비밀번호는 8자 이상이어야 합니다.");
  }

  return {
    value: { name, email, password },
    errors
  };
}
