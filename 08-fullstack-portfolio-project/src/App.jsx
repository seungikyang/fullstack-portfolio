// Career Hub의 화면과 버튼 동작을 모아둔 파일이다.
// 컴포넌트는 로그인 창, 기록 목록처럼 화면을 나눈 작은 조각이다.
// 읽는 순서: 공통 도구 → 로그인 → 요약 숫자 → 워크북 → 지원 기록 → 프로젝트 → 전체 화면(App).
// 저장 버튼의 흐름: 입력값 모으기 → request로 서버에 보내기 → 서버의 답 받기 → 목록 다시 읽기.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { generateProjectReadme, getProjectReadmeFilename } from "./project-readme.js";
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

// API는 화면이 서버에게 자료를 요청하는 창구다. API_BASE는 그 창구가 있는 서버 주소다.
// 빈 문자열이면 현재 페이지의 주소를 사용한다. 개발 중에는 Vite가 /api 요청을 서버로 전달한다.
const API_BASE = import.meta.env.VITE_API_URL || "";
export function shouldShowDemo(env = import.meta.env) {
  // 환경 변수는 실행할 때 정하는 설정값이다. 글자 "true"로 설정했을 때만 예제 계정을 보여준다.
  return env.VITE_SHOW_DEMO === "true";
}

const SHOW_DEMO = shouldShowDemo();
// select는 선택 메뉴다. 아래 목록은 선택 가능한 값이고, empty로 시작하는 객체는 새 입력 칸의 기본값이다.
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

// 각 준비 단계를 완료했는지 true(맞음)/false(아님)로 계산한다.
// Boolean은 값을 true 또는 false로 바꾸며, &&는 조건이 모두 맞아야 통과한다는 뜻이다.
// 서버의 dashboardFor도 같은 조건을 사용하므로 화면과 서버의 준비도 숫자가 같다.
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
    usedIn: "함수, 조건문, 배열 처리, 이벤트 핸들러",
    evidence: [
      "submit과 click 이벤트에서 JavaScript 함수 실행",
      "지원 기록과 프로젝트 배열을 map으로 카드 목록 렌더링",
      "조건문으로 생성·수정 모드와 화면 표시 내용 선택"
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
      "201, 204, 400, 404 상태 코드를 CRUD와 입력 오류에 맞게 반환",
      "Express 미들웨어에서 CORS와 JSON body를 처리한 뒤 라우트 실행"
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
      "JsonStore 클래스로 JSON 읽기·쓰기를 라우트 파일 밖에 분리",
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
      "프론트엔드 fetch 요청을 Express API 응답과 연결",
      "Vite build 결과물을 Express가 정적 파일로 제공",
      "README, .env.example, npm scripts와 배포 설정으로 실행 방법을 문서화"
    ]
  }
];

// fetch는 서버에 요청을 보내는 함수다. 반복되는 요청 방법을 request 한 곳에 모았다.
// path는 요청할 창구 주소, method는 할 일(GET=조회, POST=추가, PATCH=수정, DELETE=삭제)이다.
// token은 로그인 확인표, body는 보낼 입력값이다. headers는 자료 형식과 확인표를 담는 부가 정보다.
// async/await는 서버가 답을 줄 때까지 기다렸다가 다음 줄을 실행하도록 해준다.
async function request(path, { method = "GET", token, body } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  // 서버는 숫자 상태 코드로 결과를 알린다. 204는 '성공했지만 돌려줄 내용은 없음'이다.
  // 내용이 없을 때 JSON으로 읽으려 하면 오류가 나므로 여기서 끝낸다.
  if (response.status === 204) {
    return null;
  }

  // JSON은 이름과 값을 짝지어 주고받는 자료 형식이다. 서버의 답을 JavaScript 값으로 읽는다.
  // 프록시의 502 HTML 페이지처럼 JSON이 아닌 답이 오면 읽기 오류 대신 null로 두고 아래에서 안내한다.
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || `요청 처리에 실패했습니다. (HTTP ${response.status})`);
    error.status = response.status;
    throw error;
  }

  if (data === null) {
    throw new Error("서버 응답을 읽지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  return data;
}

// '2026-10-03' 같은 저장용 날짜를 사람이 읽기 쉬운 한국어 날짜로 바꾼다.
function formatDate(value) {
  if (!value) {
    return "일정 없음";
  }

  // '2026-10-03'은 UTC 자정으로 읽히므로 UTC 기준으로 보여줘야 어느 지역에서도 날짜가 하루 밀리지 않는다.
  return new Date(value).toLocaleDateString("ko-KR", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

// mode에는 지금 로그인 화면인지 회원가입 화면인지 기억한다.
// useState는 화면의 기억 칸이다. [mode, setMode]에서 mode는 현재 값, setMode는 값을 바꾸는 함수다.
// 입력 칸의 value는 기억한 값을 표시하고, onChange는 사용자가 글자를 바꿀 때 그 값을 기억한다.
function LoginScreen({ onAuth, authError = "" }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: SHOW_DEMO ? "demo@careerhub.dev" : "",
    password: SHOW_DEMO ? "demo1234" : ""
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    // 기본 제출은 페이지를 새로 여므로 막아두고, 우리 함수가 입력값을 서버에 보낸다.
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    // try 안에서 요청을 시도한다. 실패하면 catch에서 안내하고, finally는 성공·실패 모두 실행된다.
    try {
      // 조건 ? A : B는 조건이 맞으면 A, 아니면 B를 고르는 짧은 if문이다.
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
              aria-describedby="password-help"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="8자 이상"
            />
            <span id="password-help">UTF-8 기준 72바이트 이하로 입력하세요.</span>
          </label>
          {(error || authError) && <p className="form-error">{error || authError}</p>}
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

// 서버가 계산한 지원 건수와 준비도를 다섯 개의 요약 카드로 보여준다.
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

// 워크북 입력과 이전 저장 기록을 보여주는 화면 조각이다.
// 괄호 안의 값은 바깥 App이 전달한 자료와 함수다. 이렇게 전달받는 것을 props라고 부른다.
// history는 저장 당시 내용을 따로 복사한 목록이므로 현재 입력을 바꿔도 과거 기록은 그대로다.
export function WorkbookSection({
  token,
  workbook,
  history = [],
  dashboard,
  onChanged,
  onNavigate = () => {},
  onSessionExpired = () => {}
}) {
  // 서버에서 읽은 값으로 입력 칸을 시작한다. 입력 중인 form은 저장 버튼을 눌러야 서버에 반영된다.
  const [form, setForm] = useState(workbook);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  // 서버 값이 바뀌면(첫 조회, 저장 후 재조회) 입력 칸만 그 값으로 다시 맞춘다.
  // key로 화면 전체를 새로 만들면 저장 완료 안내까지 함께 사라지므로 form 값만 교체한다.
  const workbookSignature = JSON.stringify(workbook);
  const [syncedSignature, setSyncedSignature] = useState(workbookSignature);
  if (syncedSignature !== workbookSignature) {
    setSyncedSignature(workbookSignature);
    setForm(workbook);
  }
  const [isSaving, setIsSaving] = useState(false);

  function updateField(field, value) {
    // ...current는 다른 칸의 값을 복사하고, [field]는 선택한 칸 하나만 새 값으로 바꾼다.
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
  }

  // 워크북을 저장한 뒤 onChanged를 호출해 요약 숫자와 저장 이력도 다시 읽는다.
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
      // 401은 로그인 확인표가 만료됐다는 뜻이다. 다시 눌러도 계속 실패하므로 로그인 화면으로 보낸다.
      if (submitError.status === 401) {
        onSessionExpired(submitError.message);
      }
    } finally {
      setIsSaving(false);
    }
  }

  // 지금 입력한 내용으로 안내를 계산한다. filter는 맞는 항목만 모으고, find는 첫 항목을 찾는다.
  const steps = getWorkbookSteps(form, dashboard);
  const completedSteps = steps.filter((step) => step.done).length;
  // 네 단계를 모두 끝내면 currentStep은 undefined다. 끝난 단계를 다시 하라고 안내하지 않는다.
  const currentStep = steps.find((step) => !step.done);

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
          <strong>
            {currentStep
              ? currentStep.next
              : "네 단계를 모두 완료했습니다. 지원 기록과 주간 회고를 계속 업데이트하세요."}
          </strong>
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
      <section className="workbook-history" aria-labelledby="workbook-history-title">
        <h3 id="workbook-history-title">워크북 저장 이력</h3>
        <p className="muted">
          변경한 저장값을 최신순으로 최대 100개 보관합니다. 이력 기능 도입 전 저장값은 기록되지
          않았으며, 같은 내용의 재저장은 이력을 추가하지 않습니다.
        </p>
        {history.length === 0 && (
          <p className="empty-state">
            아직 저장 이력이 없습니다. 워크북을 변경하고 저장하면 기록됩니다.
          </p>
        )}
        <div className="history-list">
          {history.map((entry) => (
            <details className="history-entry" key={entry.id}>
              <summary>
                <time dateTime={entry.savedAt}>
                  {new Date(entry.savedAt).toLocaleString("ko-KR")}
                </time>
                <span>{entry.workbook.targetRole || "목표 직무 미입력"}</span>
              </summary>
              <dl className="history-values">
                {[
                  ["목표 직무", entry.workbook.targetRole],
                  ["목표 지원일", entry.workbook.targetDate],
                  ["이번 주 목표", entry.workbook.weeklyGoal],
                  ["다음 행동", entry.workbook.nextAction],
                  ["회고", entry.workbook.reflection]
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value || "미입력"}</dd>
                  </div>
                ))}
                {[
                  ["이력서", entry.workbook.resumeReady],
                  ["포트폴리오", entry.workbook.portfolioReady],
                  ["자기소개", entry.workbook.selfIntroReady],
                  ["모의 면접", entry.workbook.mockInterviewReady]
                ].map(([label, ready]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{ready ? "준비 완료" : "준비 중"}</dd>
                  </div>
                ))}
              </dl>
            </details>
          ))}
        </div>
      </section>
    </section>
  );
}

export function ApplicationSection({
  token,
  applications,
  onChanged,
  onSessionExpired = () => {}
}) {
  // id는 기록을 구분하는 번호다. editingId가 비어 있으면 추가, 번호가 있으면 그 기록의 수정이다.
  const [form, setForm] = useState(emptyApplication);
  const [editingId, setEditingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  // 저장 요청이 끝나기 전에 버튼을 다시 누르면 같은 기록이 두 번 만들어지므로 처리 중에는 막는다.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  // updated는 서버가 보낸 최근 수정순, dueDate는 마감일이 빠른 순이다.
  const [sortOrder, setSortOrder] = useState("updated");
  // ' SPRING '과 'spring'을 같은 검색어로 보도록 앞뒤 공백을 지우고 영문을 소문자로 바꾼다.
  const normalizedQuery = query.trim().toLowerCase();
  const filteredApplications = applications.filter((application) => {
    // 회사·직무·스택·메모·연락처를 한 문장으로 연결해서 한 번에 검색한다.
    const searchText = [
      application.company,
      application.role,
      ...application.stack,
      application.memo,
      application.contact
    ]
      .join(" ")
      .toLowerCase();
    // 검색어가 들어 있고, 선택한 상태와 우선순위도 맞아야 목록에 남는다.
    // !statusFilter는 '상태 필터를 고르지 않았다'는 뜻이다. 그때는 어떤 상태든 통과한다.
    return (
      searchText.includes(normalizedQuery) &&
      (!statusFilter || application.status === statusFilter) &&
      (!priorityFilter || application.priority === priorityFilter)
    );
  });
  // 마감일 순서는 'YYYY-MM-DD' 글자를 그대로 비교해도 날짜 순서와 같다. 마감일이 없으면 맨 뒤에 둔다.
  // filter가 만든 새 배열을 정렬하므로 부모에게 받은 applications 순서는 바뀌지 않는다.
  const visibleApplications =
    sortOrder === "dueDate"
      ? filteredApplications.sort((a, b) => {
          if (!a.dueDate || !b.dueDate) {
            return Number(!a.dueDate) - Number(!b.dueDate);
          }
          return a.dueDate.localeCompare(b.dueDate);
        })
      : filteredApplications;

  // 같은 입력 칸을 사용하되, 추가는 POST로 보내고 기존 번호의 수정은 PATCH로 보낸다.
  async function submitApplication(event) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const path = editingId ? `/api/applications/${editingId}` : "/api/applications";
      const method = editingId ? "PATCH" : "POST";
      await request(path, { method, token, body: form });
      setForm(emptyApplication);
      setEditingId("");
      await onChanged();
    } catch (submitError) {
      setError(submitError.message);
      if (submitError.status === 401) {
        onSessionExpired(submitError.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // 선택한 카드의 값을 입력 칸에 넣는다. ['React', 'Java']는 'React, Java'로 바꿔 보여준다.
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

  // confirm은 '정말 삭제할까요?'라는 확인 창이다. 취소했거나 이미 삭제 중이면 요청하지 않는다.
  async function removeApplication(application) {
    if (deletingId || !globalThis.confirm(`${application.company} 지원 기록을 삭제할까요?`)) {
      return;
    }

    setError("");
    setDeletingId(application.id);

    try {
      await request(`/api/applications/${application.id}`, { method: "DELETE", token });
      // 수정 중이던 기록을 지웠다면 폼을 비운다. 그대로 두면 없는 기록을 PATCH해 404가 난다.
      if (editingId === application.id) {
        setEditingId("");
        setForm(emptyApplication);
      }
      await onChanged();
    } catch (deleteError) {
      setError(`지원 기록을 삭제하지 못했습니다. ${deleteError.message}`);
      if (deleteError.status === 401) {
        onSessionExpired(deleteError.message);
      }
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
        <span className="count-badge">전체 {applications.length}건</span>
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
          <button className="primary-button" type="submit" disabled={isSubmitting}>
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

      <div className="application-filters" role="search" aria-label="지원 기록 검색과 필터">
        <label>
          지원 기록 검색
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="회사, 직무, 기술 스택, 메모, 연락처"
          />
        </label>
        <label>
          상태 필터
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">전체 상태</option>
            {applicationStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label>
          우선순위 필터
          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
          >
            <option value="">전체 우선순위</option>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>
        <label>
          정렬
          <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
            <option value="updated">최근 수정순</option>
            <option value="dueDate">마감일 빠른 순</option>
          </select>
        </label>
        <button
          className="ghost-button"
          type="button"
          onClick={() => {
            setQuery("");
            setStatusFilter("");
            setPriorityFilter("");
            setSortOrder("updated");
          }}
        >
          검색·필터 초기화
        </button>
        <p className="filter-count" aria-live="polite">
          검색 결과 {filteredApplications.length}건 / 전체 {applications.length}건
        </p>
      </div>
      <div className="record-list">
        {applications.length === 0 && (
          <p className="empty-state">
            아직 지원 기록이 없습니다. 워크북에서 목표 직무를 정한 뒤 첫 공고를 기록해보세요.
          </p>
        )}
        {applications.length > 0 && filteredApplications.length === 0 && (
          <p className="empty-state">
            검색 조건에 맞는 지원 기록이 없습니다. 검색어나 필터를 바꿔보세요.
          </p>
        )}
        {visibleApplications.map((application) => (
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

export function ProjectSection({ token, projects, onChanged, onSessionExpired = () => {} }) {
  // 지원 기록처럼 프로젝트를 추가·수정·삭제하고, 저장한 프로젝트로 README 문서를 만든다.
  const [form, setForm] = useState(emptyProject);
  const [editingId, setEditingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  // 저장 요청이 끝나기 전에 버튼을 다시 누르면 같은 기록이 두 번 만들어지므로 처리 중에는 막는다.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [readmeProjectId, setReadmeProjectId] = useState("");
  const [downloadError, setDownloadError] = useState("");
  // useRef는 화면의 특정 입력 칸을 가리키는 표식을 기억한다. 미리보기 칸으로 이동할 때 쓴다.
  const readmePreviewRef = useRef(null);
  const readmeProject = projects.find((project) => project.id === readmeProjectId);
  const readme = readmeProject ? generateProjectReadme(readmeProject) : "";

  useEffect(() => {
    // useEffect는 선택한 프로젝트 번호가 바뀐 뒤 실행된다. 열린 미리보기 칸에 초점을 맞춘다.
    if (readmeProjectId) {
      readmePreviewRef.current?.focus();
    }
  }, [readmeProjectId]);

  // 문서 내용을 다운로드한다. 서버에 새로 저장하는 대신 브라우저 안에서 파일을 만든다.
  function downloadReadme() {
    let url;
    try {
      // Blob은 글자를 담은 파일 꾸러미다. createObjectURL은 그 꾸러미를 가리키는 임시 주소를 만든다.
      url = URL.createObjectURL(new Blob([readme], { type: "text/markdown;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = getProjectReadmeFilename(readmeProject);
      // a는 링크다. 저장할 이름을 정한 링크를 눌러 다운로드를 시작한다.
      link.click();
      setDownloadError("");
    } catch {
      setDownloadError("파일을 다운로드하지 못했습니다. 미리보기 내용을 복사해 저장하세요.");
    } finally {
      // 다운로드를 시작한 다음 임시 주소를 반납해서 사용한 메모리를 정리한다.
      if (url) {
        setTimeout(() => URL.revokeObjectURL(url), 0);
      }
    }
  }

  // 수정할 번호가 있으면 그 프로젝트 주소로 보내고, 없으면 새 프로젝트를 추가한다.
  async function submitProject(event) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const path = editingId ? `/api/projects/${editingId}` : "/api/projects";
      const method = editingId ? "PATCH" : "POST";
      await request(path, { method, token, body: form });
      setForm(emptyProject);
      setEditingId("");
      await onChanged();
    } catch (submitError) {
      setError(submitError.message);
      if (submitError.status === 401) {
        onSessionExpired(submitError.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // 카드의 값을 입력 칸으로 옮겨서 사용자가 고친 뒤 저장할 수 있게 한다.
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

  // 삭제한 뒤 App에 자료를 다시 읽어달라고 알려 카드 목록과 요약 숫자를 함께 바꾼다.
  async function removeProject(project) {
    if (deletingId || !globalThis.confirm(`${project.name} 프로젝트를 삭제할까요?`)) {
      return;
    }

    setError("");
    setDeletingId(project.id);

    try {
      await request(`/api/projects/${project.id}`, { method: "DELETE", token });
      // 수정 중이던 프로젝트를 지웠다면 폼을 비운다. 그대로 두면 없는 프로젝트를 PATCH해 404가 난다.
      if (editingId === project.id) {
        setEditingId("");
        setForm(emptyProject);
      }
      await onChanged();
    } catch (deleteError) {
      setError(`프로젝트를 삭제하지 못했습니다. ${deleteError.message}`);
      if (deleteError.status === 401) {
        onSessionExpired(deleteError.message);
      }
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
          <button className="primary-button" type="submit" disabled={isSubmitting}>
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

      {readmeProject && (
        <section className="readme-preview" aria-labelledby="readme-preview-title">
          <h3 id="readme-preview-title">{readmeProject.name} README 미리보기</h3>
          <p className="muted">
            저장한 프로젝트 정보로 만든 Markdown입니다. 제출 전 실행 방법과 검증 근거를 직접
            보완하세요.
          </p>
          <label>
            README Markdown
            <textarea
              ref={readmePreviewRef}
              className="readme-content"
              value={readme}
              readOnly
              rows="16"
            />
          </label>
          {downloadError && (
            <p className="form-error" role="alert">
              {downloadError}
            </p>
          )}
          <div className="form-actions">
            <button className="primary-button" type="button" onClick={downloadReadme}>
              README 파일 다운로드
            </button>
            <button className="ghost-button" type="button" onClick={() => setReadmeProjectId("")}>
              미리보기 닫기
            </button>
          </div>
        </section>
      )}

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
              <button
                className="ghost-button"
                type="button"
                aria-label={`${project.name} README 생성`}
                onClick={() => {
                  setReadmeProjectId(project.id);
                  setDownloadError("");
                }}
              >
                README 생성
              </button>
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

// 위쪽 stageConnections에 적은 학습 설명을 카드로 보여준다. 서버에 저장하는 화면은 아니다.
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
  // App은 전체 화면의 자료를 관리한다. 로그인 정보와 목록을 기억하고 필요한 화면 조각에 전달한다.
  // activeTab은 현재 메뉴 이름이다. 이 값 하나로 선택 표시와 본문을 함께 결정한다.
  const [token, setToken] = useState(() => localStorage.getItem("careerHubToken") || "");
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [workbook, setWorkbook] = useState(emptyWorkbook);
  const [workbookHistory, setWorkbookHistory] = useState([]);
  const [applications, setApplications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState("workbook");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(token));
  const loadVersion = useRef(0);

  const isAuthed = Boolean(token && user);

  // useMemo는 계산 결과를 기억한다. workbook이나 dashboard가 바뀔 때 안내 문구를 다시 계산한다.
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

  // 로그인 정보와 그 사용자의 자료를 화면의 기억 칸과 브라우저 보관함에서 모두 지운다.
  // 자료를 남겨두면 같은 브라우저에서 다음에 로그인한 사람에게 이전 사람의 기록이 보인다.
  const clearSession = useCallback(() => {
    setToken("");
    setUser(null);
    setDashboard(null);
    setWorkbook(emptyWorkbook);
    setWorkbookHistory([]);
    setApplications([]);
    setProjects([]);
    localStorage.removeItem("careerHubToken");
  }, []);

  // useCallback은 이 함수를 기억해 값이 바뀌지 않을 때 같은 함수를 다시 사용할 수 있게 한다.
  // Promise.all은 여섯 요청을 함께 보내고 모두 끝나면 결과를 받는다. 하나씩 기다리는 시간을 줄인다.
  const loadAll = useCallback(
    async (nextToken) => {
      if (!nextToken) {
        return;
      }

      const version = ++loadVersion.current;
      try {
        const [meData, dashboardData, workbookData, applicationData, projectData, historyData] =
          await Promise.all([
            request("/api/me", { token: nextToken }),
            request("/api/dashboard", { token: nextToken }),
            request("/api/workbook", { token: nextToken }),
            request("/api/applications", { token: nextToken }),
            request("/api/projects", { token: nextToken }),
            request("/api/workbook/history", { token: nextToken })
          ]);
        if (version !== loadVersion.current) return;
        setUser(meData.user);
        setDashboard(dashboardData);
        setWorkbook(workbookData);
        setWorkbookHistory(historyData);
        setApplications(applicationData);
        setProjects(projectData);
      } catch (loadError) {
        if (version !== loadVersion.current) return;
        setError(loadError.message);
        // 통신 장애는 다시 시도할 수 있도록 로그인 정보를 유지한다.
        if (loadError.status === 401) {
          clearSession();
        }
      } finally {
        if (version === loadVersion.current) setIsLoading(false);
      }
    },
    [clearSession]
  );

  // 각 화면의 저장·삭제 함수가 이 reload를 호출하면 서버의 최신 자료로 전체 화면을 맞춘다.
  const reload = useCallback(() => {
    setIsLoading(true);
    setError("");
    return loadAll(token);
  }, [loadAll, token]);

  // localStorage는 새로고침 뒤에도 남아 있는 브라우저 보관함이다. 여기에 로그인 확인표를 넣는다.
  // 보관함에 값이 있어도 서버가 확인표의 서명과 만료를 검사해야 로그인한 요청으로 인정한다.
  // 사용자 정보(user)는 여기서 넣지 않고 loadAll이 자료를 모두 읽은 뒤에 넣는다.
  // 먼저 넣으면 자료를 읽기 전의 빈 입력 화면이 열려, 그대로 저장할 때 기존 워크북이 빈 값으로 덮인다.
  function handleAuth(data) {
    loadVersion.current++;
    setIsLoading(true);
    setError("");
    setToken(data.token);
    localStorage.setItem("careerHubToken", data.token);
  }

  // 로그아웃하면 화면의 기억 칸과 브라우저 보관함에서 로그인 정보를 지운다.
  function logout() {
    loadVersion.current++;
    setError("");
    setIsLoading(false);
    clearSession();
  }

  // 저장·삭제 요청이 401로 거절되면 확인표가 만료된 것이다. 이유를 남기고 로그인 화면으로 돌아간다.
  function expireSession(message) {
    loadVersion.current++;
    setIsLoading(false);
    clearSession();
    setError(message);
  }

  useEffect(() => {
    // 로그인 확인표가 바뀌면 서버 자료를 다시 읽는다. 아래 주석은 이 동작을 검사 도구에 설명한다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll(token);
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps -- DOM 참조가 아닌 요청 세대 번호를 무효화한다.
      loadVersion.current++;
    };
  }, [loadAll, token]);

  // 확인표와 사용자 정보가 모두 준비되어야 기록 화면을 보여준다.
  if (token && !user) {
    return (
      <main className="app-layout">
        <section role="status">
          {isLoading ? (
            <p>데이터를 불러오는 중입니다.</p>
          ) : (
            <>
              <p className="form-error">{error}</p>
              <button type="button" onClick={reload}>
                다시 시도
              </button>
              <button type="button" onClick={logout}>
                로그아웃
              </button>
            </>
          )}
        </section>
      </main>
    );
  }
  if (!isAuthed) {
    return <LoginScreen onAuth={handleAuth} authError={error} />;
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

        {/* 선택한 메뉴 이름(activeTab)에 맞춰 네 화면 중 하나를 보여준다. */}
        {activeTab === "workbook" ? (
          <WorkbookSection
            token={token}
            workbook={workbook}
            history={workbookHistory}
            dashboard={dashboard}
            onChanged={reload}
            onNavigate={setActiveTab}
            onSessionExpired={expireSession}
          />
        ) : activeTab === "applications" ? (
          <ApplicationSection
            token={token}
            applications={applications}
            onChanged={reload}
            onSessionExpired={expireSession}
          />
        ) : activeTab === "projects" ? (
          <ProjectSection
            token={token}
            projects={projects}
            onChanged={reload}
            onSessionExpired={expireSession}
          />
        ) : (
          <LearningMapSection />
        )}
      </div>
    </main>
  );
}
