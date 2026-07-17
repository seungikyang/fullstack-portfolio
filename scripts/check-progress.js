// 학습자가 각 단계의 남은 빈칸 개수를 확인하는 진행률 스크립트
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
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
  "16-security"
];

const sourceExtensions = new Set([
  ".html",
  ".css",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".sql",
  ".yml"
]);

const sourceFileNames = new Set([
  "Dockerfile",
  ".dockerignore"
]);
const ignoredDirectories = new Set([".git", "coverage", "dist", "node_modules"]);

function walk(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) {
        continue;
      }

      files.push(...walk(fullPath));
      continue;
    }

    if (sourceExtensions.has(path.extname(entry.name)) || sourceFileNames.has(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function countPlaceholders(content) {
  return content.match(/____/g)?.length || 0;
}

function countStagePlaceholders(stagePath) {
  return walk(stagePath).reduce(
    (total, file) => total + countPlaceholders(fs.readFileSync(file, "utf8")),
    0
  );
}

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

function checklistProgress(checklist) {
  const phases = {
    "풀스택 기초": { completed: 0, total: 0 },
    "SI 실전 보강": { completed: 0, total: 0 },
    "채용 직전 마감": { completed: 0, total: 0 },
    "최종 취업 준비": { completed: 0, total: 0 }
  };
  let currentHeading = "";
  let nextItem = null;

  for (const line of checklist.split(/\r?\n/)) {
    const headingMatch = line.match(/^## (.+)$/);

    if (headingMatch) {
      currentHeading = headingMatch[1];
      continue;
    }

    const itemMatch = line.match(/^- \[([ xX])\] (.+)$/);

    if (!itemMatch) {
      continue;
    }

    const phase = phaseForHeading(currentHeading);

    if (!phase) {
      continue;
    }

    const isCompleted = itemMatch[1].toLowerCase() === "x";
    phases[phase].total += 1;
    phases[phase].completed += isCompleted ? 1 : 0;

    if (!isCompleted && !nextItem) {
      nextItem = { heading: currentHeading, task: itemMatch[2] };
    }
  }

  return { phases, nextItem };
}

function run({ rootDirectory = root, verifyLearning = false } = {}) {
  let totalBlanks = 0;

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

  const checklist = fs.readFileSync(path.join(rootDirectory, "student-checklist.md"), "utf8");
  const { phases, nextItem } = checklistProgress(checklist);

  console.log("\n취업 준비 체크 진행률");

  for (const [name, phase] of Object.entries(phases)) {
    const percent = phase.total === 0 ? 0 : Math.round((phase.completed / phase.total) * 100);
    console.log(`${name}: ${phase.completed}/${phase.total}개 완료 (${percent}%)`);
  }

  if (nextItem) {
    console.log(`다음 체크 항목: ${nextItem.heading} — ${nextItem.task}`);
  } else {
    console.log("취업 준비 체크리스트를 모두 완료했습니다.");
  }

  if (verifyLearning && totalBlanks > 0) {
    console.error(`학습 검증 실패: 전용 ____ 토큰이 ${totalBlanks}개 남아 있습니다.`);
    process.exitCode = 1;
  }

  return { phases, nextItem, totalBlanks };
}

if (require.main === module) {
  run({ verifyLearning: process.argv.includes("--verify") });
}

module.exports = {
  checklistProgress,
  countPlaceholders,
  countStagePlaceholders,
  phaseForHeading,
  run
};
