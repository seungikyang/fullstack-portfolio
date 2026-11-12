// 사용자의 기록을 파일에 저장하고 다시 읽는 파일이다. 서버를 껐다 켜도 저장한 내용이 남는다.
// JSON은 이름과 값을 짝지어 적는 자료 형식이다. 이 앱은 별도 DB 대신 JSON 파일 하나를 사용한다.
import fs from "node:fs";
import path from "node:path";

// 역할 나누기: index.js는 요청을 받고 답하기, validators.js는 입력 검사, 이 파일은 읽기·저장하기.
// 이렇게 나누면 저장 방법을 바꿀 때 화면이나 입력 검사까지 모두 고칠 필요가 줄어든다.

// 처음 만들 파일의 빈 자료다. counters는 새 기록에 붙일 다음 번호를 기억한다.
const initialData = {
  counters: {
    users: 1,
    applications: 1,
    projects: 1,
    workbookHistory: 1
  },
  users: [],
  applications: [],
  projects: [],
  workbooks: [],
  workbookHistory: []
};

// 새 사용자가 아직 저장하지 않았을 때 보여줄 기본 워크북 값이다.
const emptyWorkbook = {
  targetRole: "",
  targetDate: "",
  weeklyGoal: "",
  nextAction: "",
  resumeReady: false,
  portfolioReady: false,
  selfIntroReady: false,
  mockInterviewReady: false,
  reflection: ""
};

// 자료를 글자로 바꿨다가 다시 읽어 별도의 복사본을 만든다. 이 자료의 글자·숫자·참/거짓 값을 복사한다.
// 예전 저장 이력을 복사해두면 현재 워크북을 수정해도 과거 내용이 같이 바뀌지 않는다.
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

// 대소문자와 앞뒤 공백이 달라도 같은 이메일 계정으로 찾도록 통일한다.
function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

// 날짜를 '2026-10-03T13:00:00.000Z'처럼 일정한 형식으로 적어 시간 순서를 비교하기 쉽게 한다.
function now() {
  return new Date().toISOString();
}

// 화면에 필요한 사용자 정보만 골라 돌려준다. 저장한 비밀번호 해시는 화면으로 보내지 않는다.
export function toPublicUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  };
}

// 클래스는 관련 자료와 동작을 모아놓은 틀이다. JsonStore는 기록의 추가·읽기·수정·삭제를 맡는다.
export class JsonStore {
  constructor(filePath) {
    // 'data/기록.json' 같은 짧은 경로를 전체 경로로 바꿔 실제 사용할 파일 위치를 정한다.
    this.filePath = path.resolve(filePath);
    this.ensureFile();
  }

  // 처음 실행할 때 저장 폴더와 파일이 없으면 만든다. 이미 있는 파일은 그대로 둔다.
  ensureFile() {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });

    if (!fs.existsSync(this.filePath)) {
      this.write(clone(initialData));
    }
  }

  // 파일을 읽어 JavaScript 자료로 바꾼다. 예전 파일에 이력 목록 같은 새 항목이 없으면 기본값을 넣는다.
  read() {
    const content = fs.readFileSync(this.filePath, "utf8");
    const data = JSON.parse(content);

    return {
      ...clone(initialData),
      ...data,
      counters: {
        ...initialData.counters,
        ...(data.counters || {})
      }
    };
  }

  // 저장 순서: 현재 파일 읽기 → 바꿀 내용 반영 → 새 파일 저장하기.
  // 원본에 바로 쓰지 않고 .tmp 임시 파일을 완성한 뒤 원본과 교체한다.
  // 내용을 쓰는 도중에 잘못 읽을 위험을 줄인다. 여러 서버가 동시에 쓰는 충돌까지 해결하는 방식은 아니다.
  write(data) {
    const tempPath = `${this.filePath}.tmp`;
    fs.writeFileSync(tempPath, `${JSON.stringify(data, null, 2)}\n`);
    fs.renameSync(tempPath, this.filePath);
  }

  // 새 기록에 번호를 붙이고 다음 번호를 1 올린다. 예: 이번 기록은 3번, 다음 기록은 4번.
  nextId(data, key) {
    const id = String(data.counters[key]);
    data.counters[key] += 1;
    return id;
  }

  // 테스트에서 매번 같은 빈 상태로 시작할 수 있도록 전체 데이터를 초기화한다.
  reset() {
    this.write(clone(initialData));
  }

  // ── 사용자와 워크북 CRUD ──
  listUsers() {
    return this.read().users;
  }

  findUserByEmail(email) {
    const targetEmail = normalizeEmail(email);
    return this.read().users.find((user) => user.email === targetEmail) || null;
  }

  findUserById(id) {
    return this.read().users.find((user) => user.id === String(id)) || null;
  }

  // 사용자의 워크북을 찾는다. 아직 저장한 적 없으면 화면에 보여줄 빈 값만 돌려준다.
  getWorkbook(userId) {
    const workbook = this.read().workbooks.find((item) => item.userId === String(userId));

    return (
      workbook || {
        userId: String(userId),
        ...clone(emptyWorkbook),
        createdAt: "",
        updatedAt: ""
      }
    );
  }

  // filter는 내 사용자 번호에 맞는 기록만 남기고, reverse는 최근 기록부터 보이게 순서를 뒤집는다.
  getWorkbookHistory(userId) {
    return this.read()
      .workbookHistory.filter((entry) => entry.userId === String(userId))
      .reverse();
  }

  // 첫 저장은 새 워크북을 만든다. 다음부터는 입력받은 항목만 고치고 나머지는 유지한다.
  updateWorkbook(userId, payload) {
    const data = this.read();
    const timestamp = now();
    let workbook = data.workbooks.find((item) => item.userId === String(userId));
    const isFirstSave = !workbook;
    // Object.keys는 항목 이름 목록을 꺼낸다. 이 목록에 있는 항목만 저장할 값으로 고른다.
    const fields = Object.keys(emptyWorkbook);
    const changes = Object.fromEntries(
      fields
        .filter((field) => Object.hasOwn(payload, field))
        .map((field) => [field, payload[field]])
    );

    // 이미 저장된 값과 모두 같으면 여기서 끝낸다. 같은 내용을 여러 번 눌러도 이력이 쌓이지 않는다.
    if (
      !isFirstSave &&
      fields.every((field) => !Object.hasOwn(changes, field) || changes[field] === workbook[field])
    ) {
      return workbook;
    }

    if (!workbook) {
      workbook = {
        userId: String(userId),
        ...clone(emptyWorkbook),
        createdAt: timestamp,
        updatedAt: timestamp
      };
      data.workbooks.push(workbook);
    }

    // Object.assign은 현재 자료에 바뀐 항목을 합친다. updatedAt에는 마지막 수정 시간을 적는다.
    Object.assign(workbook, changes, { updatedAt: timestamp });
    // snapshot은 '저장 순간의 복사본'이다. 워크북 항목만 골라서 현재 값과 함께 파일에 저장한다.
    const snapshot = Object.fromEntries(
      ["userId", ...fields, "createdAt", "updatedAt"].map((field) => [field, workbook[field]])
    );
    data.workbookHistory.push({
      id: this.nextId(data, "workbookHistory"),
      userId: String(userId),
      savedAt: timestamp,
      workbook: clone(snapshot)
    });
    // 내 기록 중 마지막 100개만 남긴다. 다른 사용자의 이력은 이 정리 과정에서 지우지 않는다.
    const ownHistory = data.workbookHistory.filter((entry) => entry.userId === String(userId));
    const retainedIds = new Set(ownHistory.slice(-100).map((entry) => entry.id));
    data.workbookHistory = data.workbookHistory.filter(
      (entry) => entry.userId !== String(userId) || retainedIds.has(entry.id)
    );
    this.write(data);
    return workbook;
  }

  // 같은 이메일이 있는지 확인한 다음 새 사용자를 저장한다. 비밀번호는 해시로만 받는다.
  createUser({ name, email, passwordHash }) {
    const data = this.read();
    const normalizedEmail = normalizeEmail(email);

    if (data.users.some((user) => user.email === normalizedEmail)) {
      return null;
    }

    const user = {
      id: this.nextId(data, "users"),
      name: String(name || "학습자").trim(),
      email: normalizedEmail,
      passwordHash,
      createdAt: now()
    };

    data.users.push(user);
    this.write(data);
    return user;
  }

  // ── 지원 기록 추가·조회·수정·삭제 ── 사용자 번호도 확인해 다른 사람의 기록이 섞이지 않게 한다.
  listApplications(userId) {
    return this.read()
      .applications.filter((application) => application.userId === String(userId))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); // 최근 수정한 기록이 먼저 보인다.
  }

  // payload는 검사한 입력값이다. 여기에 기록 번호, 주인 번호, 저장 시간을 붙여 새 기록을 만든다.
  createApplication(userId, payload) {
    const data = this.read();
    const timestamp = now();
    const application = {
      id: this.nextId(data, "applications"),
      userId: String(userId),
      company: payload.company,
      role: payload.role,
      status: payload.status,
      dueDate: payload.dueDate || "",
      stack: payload.stack,
      contact: payload.contact || "",
      memo: payload.memo || "",
      priority: payload.priority,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    data.applications.push(application);
    this.write(data);
    return application;
  }

  // 기록 번호와 주인 번호가 모두 맞는 항목만 수정한다. 다른 사람의 번호를 알아도 수정할 수 없다.
  updateApplication(userId, id, payload) {
    const data = this.read();
    const application = data.applications.find(
      (item) => item.userId === String(userId) && item.id === String(id)
    );

    if (!application) {
      return null;
    }

    Object.assign(application, payload, { updatedAt: now() });
    this.write(data);
    return application;
  }

  // 선택한 기록을 제외한 목록을 저장한다. 개수가 줄면 true(삭제됨), 그대로면 false(찾지 못함)다.
  deleteApplication(userId, id) {
    const data = this.read();
    const beforeCount = data.applications.length;
    data.applications = data.applications.filter(
      (item) => !(item.userId === String(userId) && item.id === String(id))
    );

    if (data.applications.length === beforeCount) {
      return false;
    }

    this.write(data);
    return true;
  }

  // ── 프로젝트 추가·조회·수정·삭제 ── 지원 기록과 마찬가지로 내 사용자 번호에 맞는 자료만 다룬다.
  listProjects(userId) {
    return this.read()
      .projects.filter((project) => project.userId === String(userId))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  // 새 프로젝트에 자동 id와 생성·수정 시간을 함께 기록한다.
  createProject(userId, payload) {
    const data = this.read();
    const timestamp = now();
    const project = {
      id: this.nextId(data, "projects"),
      userId: String(userId),
      name: payload.name,
      summary: payload.summary,
      status: payload.status,
      stack: payload.stack,
      repoUrl: payload.repoUrl || "",
      deployUrl: payload.deployUrl || "",
      highlight: payload.highlight || "",
      createdAt: timestamp,
      updatedAt: timestamp
    };

    data.projects.push(project);
    this.write(data);
    return project;
  }

  // 이번에 받은 항목과 수정 시간만 덮어쓴다. 보내지 않은 항목은 이전 값을 유지한다.
  updateProject(userId, id, payload) {
    const data = this.read();
    const project = data.projects.find(
      (item) => item.userId === String(userId) && item.id === String(id)
    );

    if (!project) {
      return null;
    }

    Object.assign(project, payload, { updatedAt: now() });
    this.write(data);
    return project;
  }

  // 현재 사용자의 해당 프로젝트만 배열에서 제외하고 파일에 다시 쓴다.
  deleteProject(userId, id) {
    const data = this.read();
    const beforeCount = data.projects.length;
    data.projects = data.projects.filter(
      (item) => !(item.userId === String(userId) && item.id === String(id))
    );

    if (data.projects.length === beforeCount) {
      return false;
    }

    this.write(data);
    return true;
  }
}
