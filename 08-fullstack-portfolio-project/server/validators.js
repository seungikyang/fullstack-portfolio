// 사용자가 보낸 입력이 규칙에 맞는지 검사하고 저장할 모양으로 정리하는 파일이다.
// 화면에서 검사했어도 서버에서 다시 확인한다. 화면을 거치지 않고 요청을 보낼 수도 있기 때문이다.
// Set은 중복 없이 값을 모은 목록이다. has로 '허용한 값 중에 있는가?'를 확인한다.
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
// 항목마다 최대 글자 수를 정한다. 입력이 너무 길어서 파일이 커지는 일을 줄인다.
const textLimits = {
  name: 80,
  email: 254,
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

// 검사 결과는 { value, errors }다. value는 정리한 입력, errors는 발견한 문제 목록이다.
// 예: 회사명이 비어 있으면 errors에 안내를 넣는다. 서버는 문제 목록이 비었을 때만 저장한다.

// 글자와 숫자는 글자로 바꾸고 앞뒤 공백을 지운다. 예상하지 못한 종류의 값은 빈 글자로 만든다.
function text(value) {
  if (typeof value !== "string" && typeof value !== "number") {
    return "";
  }

  return String(value).trim();
}

// 'React, Express'처럼 받은 기술 목록을 ['React', 'Express'] 모양의 배열(자료 목록)로 바꾼다.
// split은 쉼표에서 나누고, map은 각 항목을 정리하고, filter(Boolean)은 비어 있는 항목을 뺀다.
// 'React, React'처럼 같은 기술을 두 번 적으면 Set으로 한 번만 남긴다.
function stackList(value) {
  const items = Array.isArray(value)
    ? value.map(text)
    : text(value)
        .split(",")
        .map((item) => item.trim());

  return [...new Set(items.filter(Boolean))];
}

// 항목 이름 뒤에 붙일 조사를 고른다. 마지막 글자에 받침이 있으면 '은', 없으면 '는'이다.
// 예: '회사명은', '지원 메모는'. 한글 글자는 28개씩 묶여 있고 묶음의 첫 글자가 받침 없는 글자다.
// URL처럼 한글이 아닌 글자로 끝나면 '은'을 쓴다.
function topicParticle(label) {
  const offset = label.charCodeAt(label.length - 1) - 0xac00;
  const isHangul = offset >= 0 && offset <= 11171;
  return isHangul && offset % 28 === 0 ? "는" : "은";
}

// 글자 수를 넘었으면 문제 목록에 설명을 넣는다. 한 번에 여러 입력 문제를 알려줄 수 있다.
function validateLength(errors, label, value, maxLength) {
  if (value.length > maxLength) {
    errors.push(`${label}${topicParticle(label)} ${maxLength}자 이하여야 합니다.`);
  }
}

// 기술 이름이 너무 많거나 이름 하나가 너무 길지 않은지 따로 확인한다.
function validateStack(errors, value) {
  if (value.length > stackLimit) {
    errors.push(`기술 스택은 ${stackLimit}개 이하여야 합니다.`);
  }

  if (value.some((item) => item.length > textLimits.stackItem)) {
    errors.push(`기술 스택 항목은 ${textLimits.stackItem}자 이하여야 합니다.`);
  }
}

// 먼저 '연도-월-일' 모양인지 확인한다. 정규식(/.../)은 글자가 정해진 모양에 맞는지 찾는 규칙이다.
// 날짜로 읽었다가 다시 글자로 바꿔 원래와 비교한다. 2월 30일처럼 없는 날짜는 바뀌므로 걸러진다.
function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// URL 도구로 웹 주소를 읽어본다. http 또는 https로 시작하는 웹 링크만 허용한다.
function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// 글자@글자.글자 모양인지 확인한다. 이 검사만으로 실제 이메일 계정이 있는지는 알 수 없다.
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// 본문이 [] 같은 배열이면 항목이 하나도 없어 검사를 그냥 통과하므로, 이름·값 짝(객체)만 받는다.
const objectBodyError = "요청 본문은 JSON 객체여야 합니다.";

function isObjectBody(payload) {
  return payload !== null && typeof payload === "object" && !Array.isArray(payload);
}

// 지원 기록을 새로 만들 때는 필수 항목을 모두 검사한다.
// 수정할 때는 partial=true로 보내 이번에 받은 항목만 검사한다. 보내지 않은 값은 그대로 남는다.
// 기본 상태값은 새로 만들 때만 쓴다. 수정 때 빈 값을 보내면 기존 상태를 덮어쓰지 않고 오류로 알린다.
export function validateApplication(payload = {}, partial = false) {
  if (!isObjectBody(payload)) {
    return { value: {}, errors: [objectBodyError] };
  }

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
    value.status = text(payload.status) || (partial ? "" : "준비중");
    if (!applicationStatuses.has(value.status)) {
      errors.push("지원 상태가 올바르지 않습니다.");
    }
  }

  if (!partial || payload.priority !== undefined) {
    value.priority = text(payload.priority) || (partial ? "" : "보통");
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

// 프로젝트도 추가할 때는 필수 항목 전체를, 수정할 때는 이번에 보낸 항목만 검사한다.
export function validateProject(payload = {}, partial = false) {
  if (!isObjectBody(payload)) {
    return { value: {}, errors: [objectBodyError] };
  }

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
    value.status = text(payload.status) || (partial ? "" : "개발중");
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

// 워크북은 목표만 바꾸는 것처럼 일부 항목만 저장할 수 있으므로 받은 항목만 검사한다.
export function validateWorkbook(payload = {}) {
  if (!isObjectBody(payload)) {
    return { value: {}, errors: [objectBodyError] };
  }

  const errors = [];
  const value = {};

  // field는 항목 이름이다. 정해둔 항목만 value에 넣어 모르는 항목이 파일에 저장되지 않게 한다.
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

  // 준비 상태는 글자 'true'가 아니라 true/false 값이어야 한다. 보내지 않은 항목은 건너뛴다.
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

// 이메일의 영문 대소문자를 통일하고 비밀번호 길이를 검사한다.
// 비밀번호의 공백은 실제 비밀번호 일부일 수 있으므로 앞뒤 공백을 지우지 않는다.
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

  if (Buffer.byteLength(password, "utf8") > 72) {
    errors.push("비밀번호는 UTF-8 기준 72바이트 이하여야 합니다.");
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
  } else if (Buffer.byteLength(password, "utf8") > 72) {
    errors.push("비밀번호는 UTF-8 기준 72바이트 이하여야 합니다.");
  }

  return {
    value: { email, password },
    errors
  };
}
