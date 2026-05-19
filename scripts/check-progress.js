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
  "07-project-deploy"
];

const sourceExtensions = new Set([".html", ".css", ".js", ".jsx"]);

function walk(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    if (sourceExtensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

let totalBlanks = 0;

for (const stage of stages) {
  const stagePath = path.join(root, stage);
  const files = walk(stagePath);
  let stageBlanks = 0;

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");

    for (const line of content.split(/\r?\n/)) {
      const underlineMatches = line.match(/____/g);

      if (underlineMatches) {
        stageBlanks += underlineMatches.length;
        continue;
      }

      if (line.includes("빈칸")) {
        stageBlanks += 1;
      }
    }
  }

  totalBlanks += stageBlanks;
  console.log(`${stage}: 남은 빈칸 표시 ${stageBlanks}개`);
}

console.log(`전체 남은 빈칸 표시 ${totalBlanks}개`);

if (totalBlanks === 0) {
  console.log("모든 빈칸을 채웠습니다. 이제 실행 검증을 진행하세요.");
} else {
  console.log("아직 공부할 빈칸이 남아 있습니다. 한 단계씩 채워보세요.");
}
