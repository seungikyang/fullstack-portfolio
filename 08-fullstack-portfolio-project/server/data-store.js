// JSON 파일 기반으로 사용자와 포트폴리오 데이터를 저장하는 저장소 파일
import fs from "node:fs";
import path from "node:path";

const initialData = {
  counters: {
    users: 1,
    applications: 1,
    projects: 1
  },
  users: [],
  applications: [],
  projects: []
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function now() {
  return new Date().toISOString();
}

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

export class JsonStore {
  constructor(filePath) {
    this.filePath = path.resolve(filePath);
    this.ensureFile();
  }

  ensureFile() {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });

    if (!fs.existsSync(this.filePath)) {
      this.write(clone(initialData));
    }
  }

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

  write(data) {
    const tempPath = `${this.filePath}.tmp`;
    fs.writeFileSync(tempPath, `${JSON.stringify(data, null, 2)}\n`);
    fs.renameSync(tempPath, this.filePath);
  }

  nextId(data, key) {
    const id = String(data.counters[key]);
    data.counters[key] += 1;
    return id;
  }

  reset() {
    this.write(clone(initialData));
  }

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

  createUser({ name, email, passwordHash }) {
    const data = this.read();
    const user = {
      id: this.nextId(data, "users"),
      name: String(name || "학습자").trim(),
      email: normalizeEmail(email),
      passwordHash,
      createdAt: now()
    };

    data.users.push(user);
    this.write(data);
    return user;
  }

  listApplications(userId) {
    return this.read().applications
      .filter((application) => application.userId === String(userId))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

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

  listProjects(userId) {
    return this.read().projects
      .filter((project) => project.userId === String(userId))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

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

