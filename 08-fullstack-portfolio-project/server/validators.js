// API 요청 값을 검증하고 저장 가능한 형태로 정리하는 파일
const applicationStatuses = new Set(["준비중", "지원완료", "코딩테스트", "면접", "합격", "불합격"]);

const projectStatuses = new Set(["계획", "개발중", "완료"]);
const priorities = new Set(["낮음", "보통", "높음"]);
const workbookTextFields = ["targetRole", "weeklyGoal", "nextAction", "reflection"];
const workbookTextLabels = {
  targetRole: "목표 직무",
  weeklyGoal: "이번 주 목표",
  nextAction: "다음 행동",
  reflection: "주간 회고"
};
const workbookBooleanFields = {
  resumeReady: "이력서",
  portfolioReady: "포트폴리오",
  selfIntroReady: "자기소개",
  mockInterviewReady: "모의 면접"
};
const textLimits = {
  name: 80,
  email: 254,
  password: 128,
  company: 120,
  role: 120,
  contact: 500,
  memo: 2000,
  projectName: 120,
  summary: 1000,
  url: 500,
  highlight: 1000,
  targetRole: 120,
  weeklyGoal: 500,
  nextAction: 500,
  reflection: 2000,
  stackItem: 50
};
const stackLimit = 20;

function text(value) {
  if (typeof value !== "string" && typeof value !== "number") {
    return "";
  }

  return String(value).trim();
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

function validateLength(errors, label, value, maxLength) {
  if (value.length > maxLength) {
    errors.push(`${label}은 ${maxLength}자 이하여야 합니다.`);
  }
}

function validateStack(errors, value) {
  if (value.length > stackLimit) {
    errors.push(`기술 스택은 ${stackLimit}개 이하여야 합니다.`);
  }

  if (value.some((item) => item.length > textLimits.stackItem)) {
    errors.push(`기술 스택 항목은 ${textLimits.stackItem}자 이하여야 합니다.`);
  }
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateApplication(payload = {}, partial = false) {
  const errors = [];
  const value = {};

  if (!partial || payload.company !== undefined) {
    value.company = text(payload.company);
    if (!value.company) {
      errors.push("회사명을 입력하세요.");
    }
    validateLength(errors, "회사명", value.company, textLimits.company);
  }

  if (!partial || payload.role !== undefined) {
    value.role = text(payload.role);
    if (!value.role) {
      errors.push("지원 직무를 입력하세요.");
    }
    validateLength(errors, "지원 직무", value.role, textLimits.role);
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
    validateStack(errors, value.stack);
  }

  if (!partial || payload.dueDate !== undefined) {
    value.dueDate = text(payload.dueDate);
    if (value.dueDate && !isValidDate(value.dueDate)) {
      errors.push("지원 마감일이 실제 날짜가 아닙니다.");
    }
  }

  if (!partial || payload.contact !== undefined) {
    value.contact = text(payload.contact);
    validateLength(errors, "연락처 또는 링크", value.contact, textLimits.contact);
  }

  if (!partial || payload.memo !== undefined) {
    value.memo = text(payload.memo);
    validateLength(errors, "지원 메모", value.memo, textLimits.memo);
  }

  return { value, errors };
}

export function validateProject(payload = {}, partial = false) {
  const errors = [];
  const value = {};

  if (!partial || payload.name !== undefined) {
    value.name = text(payload.name);
    if (!value.name) {
      errors.push("프로젝트 이름을 입력하세요.");
    }
    validateLength(errors, "프로젝트 이름", value.name, textLimits.projectName);
  }

  if (!partial || payload.summary !== undefined) {
    value.summary = text(payload.summary);
    if (!value.summary) {
      errors.push("프로젝트 요약을 입력하세요.");
    }
    validateLength(errors, "프로젝트 요약", value.summary, textLimits.summary);
  }

  if (!partial || payload.status !== undefined) {
    value.status = text(payload.status) || "개발중";
    if (!projectStatuses.has(value.status)) {
      errors.push("프로젝트 상태가 올바르지 않습니다.");
    }
  }

  if (!partial || payload.stack !== undefined) {
    value.stack = stackList(payload.stack);
    validateStack(errors, value.stack);
  }

  if (!partial || payload.repoUrl !== undefined) {
    value.repoUrl = text(payload.repoUrl);
    validateLength(errors, "GitHub URL", value.repoUrl, textLimits.url);
    if (value.repoUrl && !isHttpUrl(value.repoUrl)) {
      errors.push("GitHub URL은 http 또는 https 주소여야 합니다.");
    }
  }

  if (!partial || payload.deployUrl !== undefined) {
    value.deployUrl = text(payload.deployUrl);
    validateLength(errors, "배포 URL", value.deployUrl, textLimits.url);
    if (value.deployUrl && !isHttpUrl(value.deployUrl)) {
      errors.push("배포 URL은 http 또는 https 주소여야 합니다.");
    }
  }

  if (!partial || payload.highlight !== undefined) {
    value.highlight = text(payload.highlight);
    validateLength(errors, "면접 강조점", value.highlight, textLimits.highlight);
  }

  return { value, errors };
}

export function validateWorkbook(payload = {}) {
  const errors = [];
  const value = {};

  for (const field of workbookTextFields) {
    if (payload[field] !== undefined) {
      value[field] = text(payload[field]);
      validateLength(errors, workbookTextLabels[field], value[field], textLimits[field]);
    }
  }

  if (payload.targetDate !== undefined) {
    value.targetDate = text(payload.targetDate);
    if (value.targetDate && !isValidDate(value.targetDate)) {
      errors.push("목표 지원일이 실제 날짜가 아닙니다.");
    }
  }

  for (const [field, label] of Object.entries(workbookBooleanFields)) {
    if (payload[field] === undefined) {
      continue;
    }

    if (typeof payload[field] !== "boolean") {
      errors.push(`${label} 준비 상태가 올바르지 않습니다.`);
      continue;
    }

    value[field] = payload[field];
  }

  return { value, errors };
}

export function validateRegister(payload = {}) {
  const name = text(payload.name) || "학습자";
  const email = text(payload.email).toLowerCase();
  const password = typeof payload.password === "string" ? payload.password : "";
  const errors = [];

  validateLength(errors, "이름", name, textLimits.name);
  validateLength(errors, "이메일", email, textLimits.email);

  if (!isValidEmail(email)) {
    errors.push("올바른 이메일을 입력하세요.");
  }

  if (password.length < 8) {
    errors.push("비밀번호는 8자 이상이어야 합니다.");
  }

  if (password.length > textLimits.password) {
    errors.push(`비밀번호는 ${textLimits.password}자 이하여야 합니다.`);
  }

  return {
    value: { name, email, password },
    errors
  };
}

export function validateLogin(payload = {}) {
  const email = text(payload.email).toLowerCase();
  const password = typeof payload.password === "string" ? payload.password : "";
  const errors = [];

  validateLength(errors, "이메일", email, textLimits.email);

  if (!isValidEmail(email)) {
    errors.push("올바른 이메일을 입력하세요.");
  }

  if (!password) {
    errors.push("비밀번호를 입력하세요.");
  } else if (password.length > textLimits.password) {
    errors.push(`비밀번호는 ${textLimits.password}자 이하여야 합니다.`);
  }

  return {
    value: { email, password },
    errors
  };
}
