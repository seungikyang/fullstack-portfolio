// Career Hub의 로그인, 대시보드, CRUD 화면을 구성하는 React 컴포넌트
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Code2,
  Database,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Rocket,
  Server,
  ShieldCheck,
  Trash2
} from "lucide-react";

// 빈 문자열이면 같은 주소로 요청한다. 개발 중에는 Vite 프록시가, 배포 후에는 Express가 /api를 처리한다.
const API_BASE = import.meta.env.VITE_API_URL || "";
const applicationStatuses = ["준비중", "지원완료", "코딩테스트", "면접", "합격", "불합격"];
const projectStatuses = ["계획", "개발중", "완료"];
const priorities = ["낮음", "보통", "높음"];

const emptyApplication = {
  company: "",
  role: "",
  status: "준비중",
  dueDate: "",
  stack: "",
  contact: "",
  memo: "",
  priority: "보통"
};

const emptyProject = {
  name: "",
  summary: "",
  status: "개발중",
  stack: "",
  repoUrl: "",
  deployUrl: "",
  highlight: ""
};

const stageConnections = [
  {
    stage: "1단계",
    title: "HTML과 CSS",
    folder: "01-html-css",
    icon: LayoutDashboard,
    usedIn: "로그인 화면, 사이드바, 대시보드, 카드형 목록 화면",
    evidence: [
      "시맨틱 구조를 main, aside, section, header로 나눔",
      "CSS grid와 flexbox로 대시보드와 입력 폼을 반응형 배치",
      "모바일에서 사이드바와 폼이 한 열로 자연스럽게 변경"
    ]
  },
  {
    stage: "2단계",
    title: "JavaScript 기초",
    folder: "02-javascript-basics",
    icon: Code2,
    usedIn: "폼 입력 처리, 배열 렌더링, 이벤트 핸들러",
    evidence: [
      "입력값을 state로 읽고 submit 이벤트에서 API 요청으로 변환",
      "지원 기록과 프로젝트 배열을 map으로 카드 목록 렌더링",
      "수정, 삭제, 새로고침 버튼 클릭 이벤트 처리"
    ]
  },
  {
    stage: "3단계",
    title: "React",
    folder: "03-react-todo",
    icon: BookOpen,
    usedIn: "Career Hub의 전체 프론트엔드",
    evidence: [
      "LoginScreen, StatGrid, ApplicationSection, ProjectSection으로 컴포넌트 분리",
      "token, user, applications, projects를 state로 관리",
      "props로 목록 데이터와 갱신 함수를 자식 컴포넌트에 전달"
    ]
  },
  {
    stage: "4단계",
    title: "Node.js와 Express API",
    folder: "04-node-board-api",
    icon: Server,
    usedIn: "Career Hub REST API 서버",
    evidence: [
      "GET, POST, PATCH, DELETE API로 지원 현황과 프로젝트 CRUD 구현",
      "201, 204, 400, 401, 404, 409 상태 코드를 상황별로 반환",
      "서버 health API와 정적 파일 제공을 함께 구성"
    ]
  },
  {
    stage: "5단계",
    title: "데이터베이스",
    folder: "05-database-mongodb",
    icon: Database,
    usedIn: "JSON 파일 저장소와 저장소 계층 분리",
    evidence: [
      "사용자, 지원 기록, 프로젝트 데이터를 파일에 저장해 재시작 후에도 보존",
      "JsonStore 클래스로 저장소 로직을 분리해 DB 교체가 쉽도록 설계",
      "create, read, update, delete 흐름을 데이터 계층에서 관리"
    ]
  },
  {
    stage: "6단계",
    title: "로그인 기능",
    folder: "06-login-auth",
    icon: ShieldCheck,
    usedIn: "회원가입, 로그인, 보호 API",
    evidence: [
      "bcryptjs로 비밀번호를 해시해 저장",
      "jsonwebtoken으로 JWT를 발급하고 Authorization 헤더를 검증",
      "인증된 사용자만 지원 기록과 프로젝트 API에 접근 가능"
    ]
  },
  {
    stage: "7단계",
    title: "프로젝트와 배포",
    folder: "07-project-deploy",
    icon: Rocket,
    usedIn: "제출 가능한 fullstack 포트폴리오 형태",
    evidence: [
      "Vite build 결과물을 Express가 정적 파일로 제공",
      "README, .env.example, npm scripts로 실행과 배포 준비를 문서화",
      "api-smoke-test로 인증과 CRUD 핵심 흐름을 자동 검증"
    ]
  }
];

async function request(path, { method = "GET", token, body } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "요청 처리에 실패했습니다.");
  }

  return data;
}

function formatDate(value) {
  if (!value) {
    return "일정 없음";
  }

  return new Date(value).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function LoginScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "demo@careerhub.dev",
    password: "demo1234"
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = mode === "login" ? { email: form.email, password: form.password } : form;
      const data = await request(path, { method: "POST", body: payload });
      onAuth(data);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-panel" aria-labelledby="auth-title">
        <p className="eyebrow">Fullstack Portfolio</p>
        <h1 id="auth-title">Career Hub</h1>
        <p className="muted">
          SI/SW 지원 현황과 포트폴리오 프로젝트를 한 곳에서 관리하는 미니 fullstack 앱입니다.
        </p>

        <div className="mode-switch" aria-label="인증 모드">
          <button
            type="button"
            className={mode === "login" ? "is-active" : ""}
            onClick={() => setMode("login")}
          >
            로그인
          </button>
          <button
            type="button"
            className={mode === "register" ? "is-active" : ""}
            onClick={() => setMode("register")}
          >
            회원가입
          </button>
        </div>

        <form className="stack-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label>
              이름
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="홍길동"
              />
            </label>
          )}
          <label>
            이메일
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="study@example.com"
            />
          </label>
          <label>
            비밀번호
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="8자 이상"
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            <CheckCircle2 size={18} />
            {isSubmitting ? "처리 중" : mode === "login" ? "로그인" : "가입하기"}
          </button>
        </form>

        <p className="hint-text">데모 계정은 demo@careerhub.dev / demo1234 입니다.</p>
      </section>
    </main>
  );
}

function StatGrid({ dashboard }) {
  const stats = [
    {
      label: "지원 기록",
      value: dashboard.totalApplications,
      icon: BriefcaseBusiness
    },
    {
      label: "면접 진행",
      value: dashboard.interviewCount,
      icon: CalendarClock
    },
    {
      label: "합격",
      value: dashboard.offerCount,
      icon: CheckCircle2
    },
    {
      label: "프로젝트",
      value: dashboard.projectCount,
      icon: FolderKanban
    }
  ];

  return (
    <section className="stat-grid" aria-label="요약 지표">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <article className="stat-item" key={stat.label}>
            <Icon size={20} />
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        );
      })}
    </section>
  );
}

function ApplicationSection({ token, applications, onChanged }) {
  const [form, setForm] = useState(emptyApplication);
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");

  async function submitApplication(event) {
    event.preventDefault();
    setError("");

    try {
      const path = editingId ? `/api/applications/${editingId}` : "/api/applications";
      const method = editingId ? "PATCH" : "POST";
      await request(path, { method, token, body: form });
      setForm(emptyApplication);
      setEditingId("");
      await onChanged();
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  function startEdit(application) {
    setEditingId(application.id);
    setForm({
      company: application.company,
      role: application.role,
      status: application.status,
      dueDate: application.dueDate,
      stack: application.stack.join(", "),
      contact: application.contact,
      memo: application.memo,
      priority: application.priority
    });
  }

  async function removeApplication(id) {
    await request(`/api/applications/${id}`, { method: "DELETE", token });
    await onChanged();
  }

  return (
    <section className="work-section" aria-labelledby="applications-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Applications</p>
          <h2 id="applications-title">지원 현황</h2>
        </div>
        <span className="count-badge">{applications.length}건</span>
      </div>

      <form className="editor-grid" onSubmit={submitApplication}>
        <label>
          회사
          <input
            value={form.company}
            onChange={(event) => setForm({ ...form, company: event.target.value })}
            placeholder="회사명"
          />
        </label>
        <label>
          직무
          <input
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value })}
            placeholder="풀스택 신입 개발자"
          />
        </label>
        <label>
          상태
          <select
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value })}
          >
            {applicationStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label>
          마감일
          <input
            type="date"
            value={form.dueDate}
            onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
          />
        </label>
        <label>
          기술 스택
          <input
            value={form.stack}
            onChange={(event) => setForm({ ...form, stack: event.target.value })}
            placeholder="React, Express, MongoDB"
          />
        </label>
        <label>
          우선순위
          <select
            value={form.priority}
            onChange={(event) => setForm({ ...form, priority: event.target.value })}
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>
        <label className="wide-field">
          연락처 또는 링크
          <input
            value={form.contact}
            onChange={(event) => setForm({ ...form, contact: event.target.value })}
            placeholder="채용 담당자 이메일 또는 공고 링크"
          />
        </label>
        <label className="wide-field">
          메모
          <textarea
            value={form.memo}
            onChange={(event) => setForm({ ...form, memo: event.target.value })}
            rows="3"
            placeholder="면접에서 강조할 경험, 준비할 질문, 제출 자료"
          />
        </label>
        {error && <p className="form-error wide-field">{error}</p>}
        <div className="form-actions wide-field">
          <button className="primary-button" type="submit">
            <Plus size={18} />
            {editingId ? "수정 저장" : "지원 기록 추가"}
          </button>
          {editingId && (
            <button
              className="ghost-button"
              type="button"
              onClick={() => {
                setEditingId("");
                setForm(emptyApplication);
              }}
            >
              취소
            </button>
          )}
        </div>
      </form>

      <div className="record-list">
        {applications.map((application) => (
          <article className="record-card" key={application.id}>
            <div className="record-main">
              <div>
                <span className={`status-pill status-${application.status}`}>
                  {application.status}
                </span>
                <h3>{application.company}</h3>
                <p>{application.role}</p>
              </div>
              <div className="record-actions">
                <button title="수정" type="button" onClick={() => startEdit(application)}>
                  <Pencil size={16} />
                </button>
                <button
                  title="삭제"
                  type="button"
                  onClick={() => removeApplication(application.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="record-meta">
              <span>마감 {formatDate(application.dueDate)}</span>
              <span>우선순위 {application.priority}</span>
            </div>
            {application.stack.length > 0 && (
              <div className="tag-row">
                {application.stack.map((stack) => (
                  <span key={stack}>{stack}</span>
                ))}
              </div>
            )}
            {application.memo && <p className="record-note">{application.memo}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}

function ProjectSection({ token, projects, onChanged }) {
  const [form, setForm] = useState(emptyProject);
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");

  async function submitProject(event) {
    event.preventDefault();
    setError("");

    try {
      const path = editingId ? `/api/projects/${editingId}` : "/api/projects";
      const method = editingId ? "PATCH" : "POST";
      await request(path, { method, token, body: form });
      setForm(emptyProject);
      setEditingId("");
      await onChanged();
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  function startEdit(project) {
    setEditingId(project.id);
    setForm({
      name: project.name,
      summary: project.summary,
      status: project.status,
      stack: project.stack.join(", "),
      repoUrl: project.repoUrl,
      deployUrl: project.deployUrl,
      highlight: project.highlight
    });
  }

  async function removeProject(id) {
    await request(`/api/projects/${id}`, { method: "DELETE", token });
    await onChanged();
  }

  return (
    <section className="work-section" aria-labelledby="projects-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Portfolio</p>
          <h2 id="projects-title">포트폴리오 프로젝트</h2>
        </div>
        <span className="count-badge">{projects.length}개</span>
      </div>

      <form className="editor-grid" onSubmit={submitProject}>
        <label>
          프로젝트 이름
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Career Hub"
          />
        </label>
        <label>
          상태
          <select
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value })}
          >
            {projectStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="wide-field">
          요약
          <textarea
            value={form.summary}
            onChange={(event) => setForm({ ...form, summary: event.target.value })}
            rows="3"
            placeholder="무엇을 해결하는 프로젝트인지 한 문단으로 적으세요"
          />
        </label>
        <label>
          기술 스택
          <input
            value={form.stack}
            onChange={(event) => setForm({ ...form, stack: event.target.value })}
            placeholder="React, Express, JWT"
          />
        </label>
        <label>
          GitHub URL
          <input
            value={form.repoUrl}
            onChange={(event) => setForm({ ...form, repoUrl: event.target.value })}
            placeholder="https://github.com/..."
          />
        </label>
        <label>
          배포 URL
          <input
            value={form.deployUrl}
            onChange={(event) => setForm({ ...form, deployUrl: event.target.value })}
            placeholder="https://..."
          />
        </label>
        <label className="wide-field">
          면접에서 강조할 점
          <input
            value={form.highlight}
            onChange={(event) => setForm({ ...form, highlight: event.target.value })}
            placeholder="인증, CRUD, 검증 자동화 등"
          />
        </label>
        {error && <p className="form-error wide-field">{error}</p>}
        <div className="form-actions wide-field">
          <button className="primary-button" type="submit">
            <Plus size={18} />
            {editingId ? "수정 저장" : "프로젝트 추가"}
          </button>
          {editingId && (
            <button
              className="ghost-button"
              type="button"
              onClick={() => {
                setEditingId("");
                setForm(emptyProject);
              }}
            >
              취소
            </button>
          )}
        </div>
      </form>

      <div className="record-list">
        {projects.map((project) => (
          <article className="record-card" key={project.id}>
            <div className="record-main">
              <div>
                <span className={`status-pill project-${project.status}`}>{project.status}</span>
                <h3>{project.name}</h3>
                <p>{project.summary}</p>
              </div>
              <div className="record-actions">
                <button title="수정" type="button" onClick={() => startEdit(project)}>
                  <Pencil size={16} />
                </button>
                <button title="삭제" type="button" onClick={() => removeProject(project.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            {project.stack.length > 0 && (
              <div className="tag-row">
                {project.stack.map((stack) => (
                  <span key={stack}>{stack}</span>
                ))}
              </div>
            )}
            {project.highlight && <p className="record-note">{project.highlight}</p>}
            <div className="link-row">
              {project.repoUrl && <a href={project.repoUrl}>GitHub</a>}
              {project.deployUrl && <a href={project.deployUrl}>배포 보기</a>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function LearningMapSection() {
  return (
    <section className="work-section" aria-labelledby="learning-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Learning Trace</p>
          <h2 id="learning-title">1~7단계가 Career Hub에 쓰인 방식</h2>
          <p className="muted">
            이 화면은 기존 학습 폴더의 코드가 포트폴리오 프로젝트의 어떤 기능으로 연결되는지
            보여줍니다.
          </p>
        </div>
        <span className="count-badge">7단계 연결</span>
      </div>

      <div className="learning-grid">
        {stageConnections.map((item) => {
          const Icon = item.icon;
          return (
            <article className="learning-card" key={item.stage}>
              <div className="learning-card-head">
                <Icon size={22} />
                <div>
                  <span>{item.stage}</span>
                  <h3>{item.title}</h3>
                  <p>{item.folder}</p>
                </div>
              </div>
              <p className="used-in">{item.usedIn}</p>
              <ul>
                {item.evidence.map((evidence) => (
                  <li key={evidence}>{evidence}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("careerHubToken") || "");
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [applications, setApplications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState("applications");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(token));

  const isAuthed = Boolean(token && user);

  const nextFocus = useMemo(() => {
    if (dashboard?.upcomingCount > 0) {
      return `7일 안에 확인할 지원 건이 ${dashboard.upcomingCount}개 있습니다.`;
    }

    if ((dashboard?.completedProjectCount || 0) === 0) {
      return "완료 상태의 포트폴리오 프로젝트를 하나 이상 만들어보세요.";
    }

    return "지원 기록과 프로젝트 README를 꾸준히 업데이트하세요.";
  }, [dashboard]);

  async function loadAll(nextToken = token) {
    if (!nextToken) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [meData, dashboardData, applicationData, projectData] = await Promise.all([
        request("/api/me", { token: nextToken }),
        request("/api/dashboard", { token: nextToken }),
        request("/api/applications", { token: nextToken }),
        request("/api/projects", { token: nextToken })
      ]);
      setUser(meData.user);
      setDashboard(dashboardData);
      setApplications(applicationData);
      setProjects(projectData);
    } catch (loadError) {
      setError(loadError.message);
      setToken("");
      setUser(null);
      localStorage.removeItem("careerHubToken");
    } finally {
      setIsLoading(false);
    }
  }

  function handleAuth(data) {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("careerHubToken", data.token);
    loadAll(data.token);
  }

  function logout() {
    setToken("");
    setUser(null);
    setDashboard(null);
    setApplications([]);
    setProjects([]);
    localStorage.removeItem("careerHubToken");
  }

  useEffect(() => {
    loadAll(token);
  }, []);

  if (!isAuthed) {
    return <LoginScreen onAuth={handleAuth} />;
  }

  return (
    <main className="app-layout">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Career Hub</p>
          <h1>취업 준비 보드</h1>
        </div>
        <nav aria-label="주요 메뉴">
          <button
            className={activeTab === "applications" ? "is-active" : ""}
            type="button"
            onClick={() => setActiveTab("applications")}
          >
            <ClipboardList size={18} />
            지원 현황
          </button>
          <button
            className={activeTab === "projects" ? "is-active" : ""}
            type="button"
            onClick={() => setActiveTab("projects")}
          >
            <FolderKanban size={18} />
            프로젝트
          </button>
          <button
            className={activeTab === "learning" ? "is-active" : ""}
            type="button"
            onClick={() => setActiveTab("learning")}
          >
            <BookOpen size={18} />
            학습 연결
          </button>
        </nav>
        <button className="logout-button" type="button" onClick={logout}>
          <LogOut size={18} />
          로그아웃
        </button>
      </aside>

      <div className="content-area">
        <header className="topbar">
          <div>
            <p className="muted">안녕하세요, {user.name}님.</p>
            <h2>오늘의 취업 준비 흐름</h2>
            <p className="focus-text">{nextFocus}</p>
          </div>
          <button className="ghost-button" type="button" onClick={() => loadAll()}>
            <RefreshCw size={18} />
            새로고침
          </button>
        </header>

        {error && <p className="form-error">{error}</p>}
        {isLoading && <p className="muted">데이터를 불러오는 중입니다.</p>}
        {dashboard && <StatGrid dashboard={dashboard} />}

        {activeTab === "applications" ? (
          <ApplicationSection token={token} applications={applications} onChanged={loadAll} />
        ) : activeTab === "projects" ? (
          <ProjectSection token={token} projects={projects} onChanged={loadAll} />
        ) : (
          <LearningMapSection />
        )}
      </div>
    </main>
  );
}
