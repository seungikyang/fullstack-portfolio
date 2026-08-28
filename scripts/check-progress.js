// 학습자가 각 단계의 남은 빈칸 개수를 확인하는 진행률 스크립트
// 실행 방법: `npm run progress`(보기만) 또는 `npm run verify:learning`(완료 검증)
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
// student-checklist.md에 있어야 할 체크 항목 수. 문서를 고치면 이 숫자도 함께 맞춘다.
const EXPECTED_CHECKLIST_TOTAL = 106;
// 빈칸(____)을 세는 학습 단계 폴더. 08·11·13·15·17은 코드 빈칸 대신 서술형/생성형이라 제외한다.
const stages = [
  "01-html-css",
  "02-javascript-basics",
  "03-react-todo",
  "04-node-board-api",
  "05-database-mongodb",
  "06-login-auth",
  "07-project-deploy",
  "09-typescript",
  "10-sql-oracle",
  "12-testing",
  "14-docker-deploy",
  "16-security",
];

// 빈칸을 셀 때 볼 파일 확장자와, 확장자가 없는 특수 파일 이름들
const sourceExtensions = new Set([
  ".html",
  ".css",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".sql",
  ".yml",
]);

const sourceFileNames = new Set(["Dockerfile", ".dockerignore"]);
const ignoredDirectories = new Set([
  ".git",
  "coverage",
  "dist",
  "node_modules",
]);

// 폴더를 재귀적으로 내려가며(하위 폴더까지) 세어야 할 파일 경로를 모두 모은다
function walk(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      // 결과물·라이브러리 폴더는 학습 코드가 아니므로 건너뛴다
      if (ignoredDirectories.has(entry.name)) {
        continue;
      }

      // 하위 폴더 안의 파일도 같은 방식으로 수집한다(재귀 호출)
      files.push(...walk(fullPath));
      continue;
    }

    if (
      sourceExtensions.has(path.extname(entry.name)) ||
      sourceFileNames.has(entry.name)
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

// 파일 내용에서 전용 빈칸 표시(____)가 몇 번 나오는지 센다
function countPlaceholders(content) {
  return content.match(/____/g)?.length || 0;
}

// 한 단계 폴더의 모든 파일에서 빈칸 개수를 더한다
function countStagePlaceholders(stagePath) {
  return walk(stagePath).reduce(
    (total, file) => total + countPlaceholders(fs.readFileSync(file, "utf8")),
    0,
  );
}

// 체크리스트의 "## N단계" 제목을 진행 구간 이름으로 바꾼다
function phaseForHeading(heading) {
  if (heading === "최종 취업 준비") {
    return "최종 취업 준비";
  }

  const stage = Number(heading.match(/^(\d+)단계/)?.[1]);

  if (stage >= 1 && stage <= 8) {
    return "풀스택 기초";
  }

  if (stage >= 9 && stage <= 14) {
    return "SI 실전 보강";
  }

  if (stage >= 15 && stage <= 17) {
    return "채용 직전 마감";
  }

  return null;
}

// student-checklist.md를 한 줄씩 읽어 `- [ ]` / `- [x]` 항목만 집계한다
function checklistProgress(checklist) {
  const phases = {
    "풀스택 기초": { completed: 0, total: 0 },
    "SI 실전 보강": { completed: 0, total: 0 },
    "채용 직전 마감": { completed: 0, total: 0 },
    "최종 취업 준비": { completed: 0, total: 0 },
  };
  let currentHeading = "";
  let nextItem = null;
  let completed = 0;
  let total = 0;

  for (const line of checklist.split(/\r?\n/)) {
    // "## 제목" 줄을 만나면 지금 읽는 구간(heading)을 바꾼다
    const headingMatch = line.match(/^## (.+)$/);

    if (headingMatch) {
      currentHeading = headingMatch[1];
      continue;
    }

    // `- [x] 할 일` 형태가 아니면 집계 대상이 아니다
    const itemMatch = line.match(/^- \[([ xX])\] (.+)$/);

    if (!itemMatch) {
      continue;
    }

    const isCompleted = itemMatch[1].toLowerCase() === "x";
    total += 1;
    completed += isCompleted ? 1 : 0;

    // "다음에 할 일"은 아직 끝내지 않은 첫 번째 항목 하나만 기록한다
    if (!isCompleted && !nextItem) {
      nextItem = { heading: currentHeading, task: itemMatch[2] };
    }

    const phase = phaseForHeading(currentHeading);

    if (!phase) {
      continue;
    }

    phases[phase].total += 1;
    phases[phase].completed += isCompleted ? 1 : 0;
  }

  return { completed, phases, nextItem, total };
}

// 학습 완료 검증(--verify)에서 실패 사유를 모아 반환한다
function learningVerificationErrors({ completed, total, totalBlanks }) {
  const errors = [];

  if (totalBlanks > 0) {
    errors.push(`전용 ____ 토큰이 ${totalBlanks}개 남아 있습니다.`);
  }

  if (completed < total) {
    errors.push(`학습 체크리스트가 ${completed}/${total}개 완료 상태입니다.`);
  }

  if (total !== EXPECTED_CHECKLIST_TOTAL) {
    errors.push(
      `학습 체크리스트 항목 수가 ${total}개입니다. ${EXPECTED_CHECKLIST_TOTAL}개여야 합니다.`,
    );
  }

  return errors;
}

// 스크립트의 실제 동작. progress(보기)와 verify:learning(검사) 두 모드에서 함께 쓴다.
function run({ rootDirectory = root, verifyLearning = false } = {}) {
  let totalBlanks = 0;

  // 1) 단계별 남은 빈칸 개수를 세어 보여준다
  for (const stage of stages) {
    const stageBlanks = countStagePlaceholders(path.join(rootDirectory, stage));
    totalBlanks += stageBlanks;
    console.log(`${stage}: 남은 빈칸 표시 ${stageBlanks}개`);
  }

  console.log(`전체 남은 빈칸 표시 ${totalBlanks}개`);

  if (totalBlanks === 0) {
    console.log("모든 빈칸을 채웠습니다. 이제 실행 검증을 진행하세요.");
  } else {
    console.log("아직 공부할 빈칸이 남아 있습니다. 한 단계씩 채워보세요.");
  }

  // 2) 체크리스트 진행률을 집계해 보여준다
  const checklist = fs.readFileSync(
    path.join(rootDirectory, "student-checklist.md"),
    "utf8",
  );
  const { completed, phases, nextItem, total } = checklistProgress(checklist);

  console.log("\n취업 준비 체크 진행률");

  for (const [name, phase] of Object.entries(phases)) {
    const percent =
      phase.total === 0 ? 0 : Math.round((phase.completed / phase.total) * 100);
    console.log(
      `${name}: ${phase.completed}/${phase.total}개 완료 (${percent}%)`,
    );
  }

  const totalPercent = total === 0 ? 0 : Math.round((completed / total) * 100);
  console.log(
    `전체 체크리스트: ${completed}/${total}개 완료 (${totalPercent}%)`,
  );

  if (nextItem) {
    console.log(`다음 체크 항목: ${nextItem.heading} — ${nextItem.task}`);
  } else {
    console.log("취업 준비 체크리스트를 모두 완료했습니다.");
  }

  // 3) --verify 모드일 때만 실패 조건을 검사한다. 실패해도 exitCode만 남기고 즉시 종료하지 않는다.
  if (verifyLearning) {
    const errors = learningVerificationErrors({
      completed,
      total,
      totalBlanks,
    });

    for (const error of errors) {
      console.error(`학습 검증 실패: ${error}`);
    }

    if (errors.length > 0) {
      process.exitCode = 1;
    }
  }

  return { completed, phases, nextItem, total, totalBlanks };
}

// 직접 실행됐을 때만 동작한다. 다른 파일에서 require하면 함수만 내보낸다(테스트에서 재사용).
if (require.main === module) {
  run({ verifyLearning: process.argv.includes("--verify") });
}

module.exports = {
  EXPECTED_CHECKLIST_TOTAL,
  checklistProgress,
  countPlaceholders,
  countStagePlaceholders,
  learningVerificationErrors,
  phaseForHeading,
  run,
};
