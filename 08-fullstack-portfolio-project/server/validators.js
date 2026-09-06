// API 요청 값을 검증하고 저장 가능한 형태로 정리하는 파일
// Set은 허용 목록에 값이 있는지 빠르게 검사할 때 쓰기 좋다.
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
// 서버에서도 길이를 제한해야 API를 직접 호출한 과도한 입력까지 막을 수 있다.
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

// 문자열과 숫자만 문자열로 정리하고, 객체처럼 예상하지 못한 값은 빈 문자열로 만든다.
function text(value) {
  if (typeof value !== "string" && typeof value !== "number") {
    return "";
  }

  return String(value).trim();
}

// 기술 스택은 배열과 "React, Express" 문자열 입력을 모두 같은 배열 형태로 바꾼다.
function stackList(value) {
  if (Array.isArray(value)) {
    return value.map(text).filter(Boolean);
  }

  return text(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

// 발견한 오류를 즉시 throw하지 않고 배열에 모아 프론트가 한 번에 확인하게 한다.
function validateLength(errors, label, value, maxLength) {
  if (value.length > maxLength) {
    errors.push(`${label}은 ${maxLength}자 이하여야 합니다.`);
  }
}

// 기술 스택의 전체 개수와 각 항목 길이를 별도로 제한한다.
function validateStack(errors, value) {
  if (value.length > stackLimit) {
    errors.push(`기술 스택은 ${stackLimit}개 이하여야 합니다.`);
  }

  if (value.some((item) => item.length > textLimits.stackItem)) {
    errors.push(`기술 스택 항목은 ${textLimits.stackItem}자 이하여야 합니다.`);
  }
}

// 형식뿐 아니라 2026-02-30처럼 실제로 존재하지 않는 날짜도 왕복 변환으로 거른다.
function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// URL 클래스로 파싱한 뒤 사용자가 클릭할 수 있는 http(s) 주소만 허용한다.
function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// 학습용 앱에 필요한 기본 이메일 형태(문자@문자.문자)를 확인한다.
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// 지원 기록 입력을 검사하고, 저장소에 넘길 정리된 value를 함께 만든다.
// partial=true인 PATCH 요청은 전달된 필드만 검사해 나머지 값을 보존한다.
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

// 프로젝트 생성(전체 필드)과 수정(전달된 필드)을 같은 규칙으로 검증한다.
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

// 워크북은 일부 항목만 자주 저장하므로, 요청에 들어온 필드만 골라 검증한다.
export function validateWorkbook(payload = {}) {
  const errors = [];
  const value = {};

  // 허용 목록에 있는 키만 value에 넣어 임의의 필드가 저장소로 넘어가지 않게 한다.
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

// 회원가입 값은 이메일을 소문자로 통일하고 비밀번호 길이를 확인한다.
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

// 로그인도 회원가입과 같은 이메일 정규화 규칙을 사용해야 같은 계정을 찾을 수 있다.
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
