// JSON 파일 기반으로 사용자와 포트폴리오 데이터를 저장하는 저장소 파일
import fs from "node:fs";
import path from "node:path";

// DB 대신 JSON 파일 하나에 저장할 전체 자료 구조와 자동 증가 번호의 초기값이다.
const initialData = {
  counters: {
    users: 1,
    applications: 1,
    projects: 1
  },
  users: [],
  applications: [],
  projects: [],
  workbooks: []
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

// 객체를 복제해 initialData 같은 공통 기본값이 실수로 바뀌지 않게 한다.
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

// 대소문자와 앞뒤 공백이 달라도 같은 이메일 계정으로 찾도록 통일한다.
function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

// 모든 날짜를 시간대가 포함된 ISO 문자열로 저장하면 정렬과 전송이 단순해진다.
function now() {
  return new Date().toISOString();
}

// API 응답에는 passwordHash를 제외한 공개 가능한 사용자 정보만 담는다.
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

// 라우터는 파일 처리 방법을 몰라도 되도록 CRUD를 이 클래스 한곳에 모은다.
export class JsonStore {
  constructor(filePath) {
    // 상대 경로가 들어와도 절대 경로로 고정해 실행 위치에 따라 파일이 달라지지 않게 한다.
    this.filePath = path.resolve(filePath);
    this.ensureFile();
  }

  // 상위 폴더와 데이터 파일이 없으면 처음 실행에 필요한 빈 구조를 만든다.
  ensureFile() {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });

    if (!fs.existsSync(this.filePath)) {
      this.write(clone(initialData));
    }
  }

  // 매 요청마다 최신 파일을 읽고, 예전 파일에 새 필드가 없어도 기본 구조로 보완한다.
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

  // 임시 파일을 완성한 뒤 rename해 원본이 절반만 쓰인 상태로 남을 위험을 줄인다.
  write(data) {
    const tempPath = `${this.filePath}.tmp`;
    fs.writeFileSync(tempPath, `${JSON.stringify(data, null, 2)}\n`);
    fs.renameSync(tempPath, this.filePath);
  }

  // users/applications/projects가 각자의 다음 번호를 사용하게 한다.
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

  // 저장한 워크북이 없으면 파일을 바꾸지 않고 화면용 기본값만 반환한다.
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

  // 첫 저장은 새 워크북을 만들고, 이후 저장은 전달된 필드만 덮어쓴다.
  updateWorkbook(userId, payload) {
    const data = this.read();
    const timestamp = now();
    let workbook = data.workbooks.find((item) => item.userId === String(userId));

    if (!workbook) {
      workbook = {
        userId: String(userId),
        ...clone(emptyWorkbook),
        createdAt: timestamp,
        updatedAt: timestamp
      };
      data.workbooks.push(workbook);
    }

    Object.assign(workbook, payload, { updatedAt: timestamp });
    this.write(data);
    return workbook;
  }

  // 이메일 중복을 다시 확인한 뒤 비밀번호 원문이 아닌 해시만 저장한다.
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

  // ── 지원 기록 CRUD ── 모든 조회·수정·삭제에 userId 조건을 넣어 다른 계정 데이터를 막는다.
  listApplications(userId) {
    return this.read()
      .applications.filter((application) => application.userId === String(userId))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); // 최근 수정한 기록이 먼저 보인다.
  }

  // 검증기가 정리한 payload에 서버가 관리하는 id·소유자·시간을 붙인다.
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

  // 같은 id라도 현재 로그인 사용자 소유가 아니면 찾지 못한 것으로 처리한다.
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

  // 삭제 전후 배열 길이를 비교해 실제 삭제 여부를 boolean으로 알려준다.
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

  // ── 포트폴리오 프로젝트 CRUD ── 지원 기록과 같은 소유권·시간 규칙을 사용한다.
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

  // 부분 수정이므로 요청에 들어온 값과 updatedAt만 기존 객체에 합친다.
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
