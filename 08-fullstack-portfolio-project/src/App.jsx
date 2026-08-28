// Career Hub의 로그인, 대시보드, CRUD 화면을 구성하는 React 컴포넌트
import { useCallback, useEffect, useMemo, useState } from "react";
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
export function shouldShowDemo(env = import.meta.env) {
  // 환경 변수는 문자열이므로 정확히 "true"일 때만 데모 계정을 화면에 표시한다.
  return env.VITE_SHOW_DEMO === "true";
}

const SHOW_DEMO = shouldShowDemo();
// select가 받을 수 있는 값과 새 폼의 초기 모양을 컴포넌트 밖에서 한 번만 만든다.
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

// 워크북 입력과 실제 프로젝트·지원 기록을 네 단계 완료 여부로 바꾸는 순수 함수다.
// 서버의 dashboardFor와 같은 조건을 써서 화면과 API의 준비도가 일치한다.
export function getWorkbookSteps(workbook, dashboard = {}) {
  return [
    {
      number: "01",
      title: "목표 정하기",
      description: "지원할 직무와 첫 지원일을 정합니다.",
      next: "목표 직무와 목표 지원일을 입력하세요.",
      done: Boolean(workbook.targetRole && workbook.targetDate)
    },
    {
      number: "02",
      title: "이번 주 실행",
      description: "이번 주 목표를 오늘 할 한 가지 행동으로 줄입니다.",
      next: "이번 주 목표와 날짜가 들어간 다음 행동을 적으세요.",
      done: Boolean(workbook.weeklyGoal && workbook.nextAction)
    },
    {
      number: "03",
      title: "제출 자료 만들기",
      description: "프로젝트를 완성하고 이력서와 포트폴리오를 점검합니다.",
      next: "프로젝트 한 개를 완료하고 제출 자료 두 항목을 확인하세요.",
      done: Boolean(
        workbook.resumeReady &&
        workbook.portfolioReady &&
        (dashboard?.completedProjectCount || 0) > 0
      )
    },
    {
      number: "04",
      title: "지원하고 설명하기",
      description: "실제 지원 기록과 자기소개·모의 면접 근거를 남깁니다.",
      next: "지원 기록을 남기고 자기소개와 모의 면접을 완료하세요.",
      done: Boolean(
        workbook.selfIntroReady &&
        workbook.mockInterviewReady &&
        (dashboard?.startedApplicationCount || 0) > 0
      )
    }
  ];
}

// 학습 1~7단계가 이 포트폴리오의 어느 코드로 연결됐는지 보여줄 정적 설명 데이터다.
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

// 모든 fetch 호출에서 주소·인증 헤더·JSON 처리·오류 변환을 공통으로 담당한다.
async function request(path, { method = "GET", token, body } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  // DELETE 성공(204)은 본문이 없으므로 response.json()을 호출하면 안 된다.
  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "요청 처리에 실패했습니다.");
  }

  return data;
}

// 저장된 YYYY-MM-DD 값을 한국어 화면용 날짜로 바꾸고, 빈 값은 안내 문구로 표시한다.
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

// 로그인과 회원가입 폼을 한 화면에서 mode 상태로 전환해 재사용한다.
function LoginScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: SHOW_DEMO ? "demo@careerhub.dev" : "",
    password: SHOW_DEMO ? "demo1234" : ""
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    // 브라우저의 기본 폼 전송(페이지 새로고침)을 막고 fetch로 API를 호출한다.
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
          목표 직무부터 포트폴리오, 지원, 면접 준비까지 한 곳에 기록하는 취업 워크북입니다.
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

        {SHOW_DEMO && (
          <p className="hint-text">데모 계정은 demo@careerhub.dev / demo1234 입니다.</p>
        )}
      </section>
    </main>
  );
}

// 서버가 계산한 대시보드 값을 같은 모양의 요약 카드 다섯 개로 렌더링한다.
function StatGrid({ dashboard }) {
  const stats = [
    {
      label: "취업 준비도",
      value: `${dashboard.readinessPercent}%`,
      icon: CheckCircle2
    },
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

export function WorkbookSection({ token, workbook, dashboard, onChanged, onNavigate = () => {} }) {
  // 부모가 준 저장값을 폼 전용 state로 복사해 저장 전 입력을 따로 관리한다.
  const [form, setForm] = useState(workbook);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
  }

  // 저장 성공 후 onChanged로 전체 데이터를 다시 읽어 준비도까지 최신 상태로 맞춘다.
  async function submitWorkbook(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      await request("/api/workbook", { method: "PATCH", token, body: form });
      await onChanged();
      setMessage("워크북을 저장했습니다.");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSaving(false);
    }
  }

  // 아직 저장하지 않은 현재 입력도 즉시 단계 안내에 반영한다.
  const steps = getWorkbookSteps(form, dashboard);
  const completedSteps = steps.filter((step) => step.done).length;
  const currentStep = steps.find((step) => !step.done) || steps.at(-1);

  return (
    <section className="work-section" aria-labelledby="workbook-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Career Workbook</p>
          <h2 id="workbook-title">취업 준비 워크북</h2>
          <p className="muted workbook-copy">
            목표를 정하고 이번 주 행동을 기록하세요. 준비도는 목표, 실행, 제출 자료, 실제 지원의 네
            단계 근거로 계산합니다.
          </p>
        </div>
        <span className="count-badge">{dashboard?.readinessPercent || 0}%</span>
      </div>

      <div className="readiness-panel">
        <div>
          <strong>취업 준비 근거</strong>
          <span>
            {dashboard?.readinessDone || 0}/{dashboard?.readinessTotal ?? 4}개 완료
          </span>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-label="취업 준비도"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={dashboard?.readinessPercent || 0}
        >
          <span style={{ width: `${dashboard?.readinessPercent || 0}%` }} />
        </div>
      </div>

      <div className="workbook-guide" aria-live="polite">
        <div>
          <span>지금 할 일</span>
          <strong>{currentStep.next}</strong>
        </div>
        <b>{completedSteps}/4단계 완료</b>
      </div>

      <ol className="workbook-steps" aria-label="취업 준비 네 단계">
        {steps.map((step) => (
          <li
            className={step.done ? "is-complete" : step === currentStep ? "is-current" : ""}
            key={step.number}
          >
            <span className="workbook-step-number">{step.done ? "✓" : step.number}</span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.description}</p>
            </div>
            <small>{step.done ? "완료" : step === currentStep ? "지금 진행" : "대기"}</small>
          </li>
        ))}
      </ol>

      <form className="editor-grid workbook-form" onSubmit={submitWorkbook}>
        <fieldset className="workbook-block" id="workbook-goal">
          <legend>
            <span>1</span> 목표 정하기
          </legend>
          <p>채용 공고 3개에서 공통으로 보이는 직무를 고르고 첫 지원일을 정합니다.</p>
          <div className="workbook-fields">
            <label>
              목표 직무
              <input
                value={form.targetRole}
                onChange={(event) => updateField("targetRole", event.target.value)}
                placeholder="Java/Spring 백엔드 개발자"
              />
            </label>
            <label>
              목표 지원일
              <input
                type="date"
                value={form.targetDate}
                onChange={(event) => updateField("targetDate", event.target.value)}
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="workbook-block" id="workbook-week">
          <legend>
            <span>2</span> 이번 주 실행
          </legend>
          <p>측정할 수 있는 주간 결과와 오늘 바로 시작할 한 가지 행동을 적습니다.</p>
          <div className="workbook-fields single-column">
            <label>
              이번 주 목표
              <input
                value={form.weeklyGoal}
                onChange={(event) => updateField("weeklyGoal", event.target.value)}
                placeholder="예. 포트폴리오 README를 완성하고 두 곳에 지원합니다"
              />
            </label>
            <label>
              다음 행동
              <input
                value={form.nextAction}
                onChange={(event) => updateField("nextAction", event.target.value)}
                placeholder="예. 오늘 19시에 채용 공고 한 건을 분석합니다"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="workbook-block" id="workbook-assets">
          <legend>
            <span>3</span> 제출 자료 만들기
          </legend>
          <p>프로젝트를 완료 상태로 만들고 실제 제출 가능한 문서인지 확인합니다.</p>
          <div className="workbook-checks">
            <label className="check-item">
              <input
                type="checkbox"
                checked={form.resumeReady}
                onChange={(event) => updateField("resumeReady", event.target.checked)}
              />
              이력서 완성
            </label>
            <label className="check-item">
              <input
                type="checkbox"
                checked={form.portfolioReady}
                onChange={(event) => updateField("portfolioReady", event.target.checked)}
              />
              포트폴리오 제출 가능
            </label>
          </div>
          <button
            className="ghost-button step-action"
            type="button"
            onClick={() => onNavigate("projects")}
          >
            프로젝트 정리하기
          </button>
        </fieldset>

        <fieldset className="workbook-block" id="workbook-apply">
          <legend>
            <span>4</span> 지원하고 설명하기
          </legend>
          <p>공고에 실제로 지원하고 내 경험을 자기 말로 설명한 근거를 남깁니다.</p>
          <div className="workbook-checks">
            <label className="check-item">
              <input
                type="checkbox"
                checked={form.selfIntroReady}
                onChange={(event) => updateField("selfIntroReady", event.target.checked)}
              />
              자기소개 준비
            </label>
            <label className="check-item">
              <input
                type="checkbox"
                checked={form.mockInterviewReady}
                onChange={(event) => updateField("mockInterviewReady", event.target.checked)}
              />
              모의 면접 완료
            </label>
          </div>
          <button
            className="ghost-button step-action"
            type="button"
            onClick={() => onNavigate("applications")}
          >
            지원 기록 정리하기
          </button>
          <label className="reflection-field">
            주간 회고
            <textarea
              value={form.reflection}
              onChange={(event) => updateField("reflection", event.target.value)}
              rows="4"
              placeholder="한 일, 막힌 점, 다음 주에 바꿀 점을 짧게 적으세요"
            />
          </label>
        </fieldset>
        {error && <p className="form-error wide-field">{error}</p>}
        {message && (
          <p className="save-message wide-field" aria-live="polite">
            {message}
          </p>
        )}
        <div className="form-actions wide-field">
          <button className="primary-button" type="submit" disabled={isSaving}>
            <CheckCircle2 size={18} />
            {isSaving ? "저장 중" : "워크북 저장"}
          </button>
        </div>
      </form>
    </section>
  );
}

export function ApplicationSection({ token, applications, onChanged }) {
  // editingId가 비어 있으면 생성 모드, 값이 있으면 해당 기록의 수정 모드다.
  const [form, setForm] = useState(emptyApplication);
  const [editingId, setEditingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  // 같은 폼에서 생성은 POST, 수정은 PATCH를 선택한다.
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

  // 서버 배열 형태인 stack을 사용자가 편집하기 쉬운 쉼표 문자열로 바꿔 폼에 채운다.
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

  // 삭제는 복구가 어려우므로 confirm을 받고, 진행 중에는 같은 요청을 다시 보내지 않는다.
  async function removeApplication(application) {
    if (deletingId || !globalThis.confirm(`${application.company} 지원 기록을 삭제할까요?`)) {
      return;
    }

    setError("");
    setDeletingId(application.id);

    try {
      await request(`/api/applications/${application.id}`, { method: "DELETE", token });
      await onChanged();
    } catch (deleteError) {
      setError(`지원 기록을 삭제하지 못했습니다. ${deleteError.message}`);
    } finally {
      setDeletingId("");
    }
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
        {applications.length === 0 && (
          <p className="empty-state">
            아직 지원 기록이 없습니다. 워크북에서 목표 직무를 정한 뒤 첫 공고를 기록해보세요.
          </p>
        )}
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
                  aria-label={`${application.company} 지원 기록 삭제`}
                  disabled={deletingId === application.id}
                  title="삭제"
                  type="button"
                  onClick={() => removeApplication(application)}
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

export function ProjectSection({ token, projects, onChanged }) {
  // 지원 기록과 같은 생성/수정/삭제 패턴을 프로젝트 데이터에 적용한다.
  const [form, setForm] = useState(emptyProject);
  const [editingId, setEditingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  // editingId 유무에 따라 새 프로젝트와 기존 프로젝트의 API 경로를 고른다.
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

  // 카드의 기존 값을 폼으로 옮기면 사용자가 일부만 바꿔 PATCH할 수 있다.
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

  // 삭제 뒤 부모 데이터를 다시 불러와 카드 수와 대시보드 지표를 함께 갱신한다.
  async function removeProject(project) {
    if (deletingId || !globalThis.confirm(`${project.name} 프로젝트를 삭제할까요?`)) {
      return;
    }

    setError("");
    setDeletingId(project.id);

    try {
      await request(`/api/projects/${project.id}`, { method: "DELETE", token });
      await onChanged();
    } catch (deleteError) {
      setError(`프로젝트를 삭제하지 못했습니다. ${deleteError.message}`);
    } finally {
      setDeletingId("");
    }
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
        {projects.length === 0 && (
          <p className="empty-state">
            아직 프로젝트가 없습니다. 지원 직무와 가장 가까운 프로젝트 한 개부터 추가해보세요.
          </p>
        )}
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
                <button
                  aria-label={`${project.name} 프로젝트 삭제`}
                  disabled={deletingId === project.id}
                  title="삭제"
                  type="button"
                  onClick={() => removeProject(project)}
                >
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
              {project.repoUrl && (
                <a href={project.repoUrl} rel="noreferrer" target="_blank">
                  GitHub
                </a>
              )}
              {project.deployUrl && (
                <a href={project.deployUrl} rel="noreferrer" target="_blank">
                  배포 보기
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// 정적 stageConnections를 카드로 바꿔 학습 내용과 완성 앱의 연결 근거를 보여준다.
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
  // 최상위 App이 인증·서버 데이터·현재 탭을 소유하고 필요한 자식에게 props로 전달한다.
  const [token, setToken] = useState(() => localStorage.getItem("careerHubToken") || "");
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [workbook, setWorkbook] = useState(emptyWorkbook);
  const [applications, setApplications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState("workbook");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(token));

  const isAuthed = Boolean(token && user);

  // 관련 데이터가 바뀔 때만 오늘의 다음 행동 문구를 다시 계산한다.
  const nextFocus = useMemo(() => {
    if (!workbook.targetRole || !workbook.targetDate) {
      return "워크북에서 목표 직무와 첫 지원일을 정해보세요.";
    }

    if (!workbook.nextAction) {
      return "이번 주 목표를 오늘 실행할 한 가지 행동으로 줄여 적어보세요.";
    }

    if (dashboard?.upcomingCount > 0) {
      return `7일 안에 확인할 지원 건이 ${dashboard.upcomingCount}개 있습니다.`;
    }

    if ((dashboard?.completedProjectCount || 0) === 0) {
      return "완료 상태의 포트폴리오 프로젝트를 하나 이상 만들어보세요.";
    }

    return "지원 기록과 프로젝트 README를 꾸준히 업데이트하세요.";
  }, [dashboard, workbook]);

  // 로그인 뒤 필요한 다섯 API를 병렬 호출해 기다리는 시간을 줄인다.
  const loadAll = useCallback(async (nextToken) => {
    if (!nextToken) {
      return;
    }

    try {
      const [meData, dashboardData, workbookData, applicationData, projectData] = await Promise.all(
        [
          request("/api/me", { token: nextToken }),
          request("/api/dashboard", { token: nextToken }),
          request("/api/workbook", { token: nextToken }),
          request("/api/applications", { token: nextToken }),
          request("/api/projects", { token: nextToken })
        ]
      );
      setUser(meData.user);
      setDashboard(dashboardData);
      setWorkbook(workbookData);
      setApplications(applicationData);
      setProjects(projectData);
    } catch (loadError) {
      // 만료·변조 토큰 등으로 로딩이 실패하면 로컬 토큰도 지워 로그인 화면으로 돌린다.
      setError(loadError.message);
      setToken("");
      setUser(null);
      localStorage.removeItem("careerHubToken");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 자식 컴포넌트가 저장·삭제한 뒤 전체 화면 데이터를 다시 맞출 때 넘겨주는 함수다.
  const reload = useCallback(() => {
    setIsLoading(true);
    setError("");
    return loadAll(token);
  }, [loadAll, token]);

  // 새로고침 뒤에도 로그인 상태를 복원할 수 있도록 JWT를 localStorage에 보관한다.
  function handleAuth(data) {
    setIsLoading(true);
    setError("");
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("careerHubToken", data.token);
  }

  // 로그아웃은 메모리 state와 브라우저 저장소의 인증 정보를 모두 비운다.
  function logout() {
    setToken("");
    setUser(null);
    setDashboard(null);
    setWorkbook(emptyWorkbook);
    setApplications([]);
    setProjects([]);
    localStorage.removeItem("careerHubToken");
  }

  useEffect(() => {
    // 인증 토큰이 바뀔 때 외부 API 상태를 동기화하며, 실제 상태 갱신은 요청 완료 후 수행한다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll(token);
  }, [loadAll, token]);

  // token만 있거나 user만 있는 중간 상태는 인증 완료로 보지 않는다.
  if (!isAuthed) {
    return <LoginScreen onAuth={handleAuth} />;
  }

  return (
    <main className="app-layout">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Career Hub</p>
          <h1>취업 워크북</h1>
        </div>
        <nav aria-label="주요 메뉴">
          <button
            className={activeTab === "workbook" ? "is-active" : ""}
            type="button"
            onClick={() => setActiveTab("workbook")}
          >
            <CheckCircle2 size={18} />
            1. 취업 워크북
          </button>
          <button
            className={activeTab === "learning" ? "is-active" : ""}
            type="button"
            onClick={() => setActiveTab("learning")}
          >
            <BookOpen size={18} />
            2. 학습 연결
          </button>
          <button
            className={activeTab === "projects" ? "is-active" : ""}
            type="button"
            onClick={() => setActiveTab("projects")}
          >
            <FolderKanban size={18} />
            3. 프로젝트
          </button>
          <button
            className={activeTab === "applications" ? "is-active" : ""}
            type="button"
            onClick={() => setActiveTab("applications")}
          >
            <ClipboardList size={18} />
            4. 지원 현황
          </button>
        </nav>
        <p className="sidebar-guide">
          워크북에서 다음 행동을 정한 뒤 학습 → 프로젝트 → 지원 순서로 이동하세요.
        </p>
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
          <button className="ghost-button" type="button" onClick={reload}>
            <RefreshCw size={18} />
            새로고침
          </button>
        </header>

        {error && <p className="form-error">{error}</p>}
        {isLoading && <p className="muted">데이터를 불러오는 중입니다.</p>}
        {dashboard && <StatGrid dashboard={dashboard} />}

        {activeTab === "workbook" ? (
          <WorkbookSection
            key={JSON.stringify(workbook)}
            token={token}
            workbook={workbook}
            dashboard={dashboard}
            onChanged={reload}
            onNavigate={setActiveTab}
          />
        ) : activeTab === "applications" ? (
          <ApplicationSection token={token} applications={applications} onChanged={reload} />
        ) : activeTab === "projects" ? (
          <ProjectSection token={token} projects={projects} onChanged={reload} />
        ) : (
          <LearningMapSection />
        )}
      </div>
    </main>
  );
}
