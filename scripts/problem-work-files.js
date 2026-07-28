// 웹 문제 화면에서 편집할 수 있는 단계별 실습 파일 계약
const path = require("node:path");

const problemWorkTracks = {
  "01-html-css": {
    files: ["starter/index.html", "starter/styles.css"],
  },
  "02-javascript-basics": {
    files: ["starter/app.js"],
  },
  "03-react-todo": {
    files: ["src/App.jsx", "src/components/TodoItem.jsx"],
  },
  "04-node-board-api": {
    files: ["src/server.js", "requests.http"],
  },
  "05-database-mongodb": {
    files: ["src/models/Post.js", "src/server.js", "src/db.js", "requests.http"],
  },
  "06-login-auth": {
    files: ["src/server.js", "src/auth.js", "src/users.js", "requests.http"],
  },
  "07-project-deploy": {
    files: ["public/app.js", "src/server.js"],
  },
  "09-typescript": {
    files: [
      "starter/01-basic-types.ts",
      "starter/02-interface-design.ts",
      "starter/03-react-todo.tsx",
      "starter/04-express-typed.ts",
      "starter/05-narrowing.ts",
      "starter/06-generic-fetch.ts",
    ],
  },
  "10-sql-oracle": {
    files: [
      "starter/01-ddl.sql",
      "starter/02-select.sql",
      "starter/03-aggregate.sql",
      "starter/04-join.sql",
      "starter/05-subquery.sql",
      "starter/06-transaction.sql",
      "starter/07-index.sql",
    ],
  },
  "11-java-spring": {
    files: [],
    guideLinks: ["./starter/README.md"],
    marker: "프로젝트 생성형 문제",
  },
  "12-testing": {
    files: [
      "starter/js/src/calculator.ts",
      "starter/js/src/calculator.test.ts",
      "starter/js/src/app.ts",
      "starter/js/src/app.test.ts",
      "starter/js/src/notification.ts",
      "starter/js/src/mailer.ts",
      "starter/js/src/notification.test.ts",
    ],
    guideLinks: ["../11-java-spring/starter/README.md"],
  },
  "13-git-collab": {
    files: [],
    marker: "명령·협업형 문제",
  },
  "14-docker-deploy": {
    files: [
      "starter/node-board/Dockerfile",
      "starter/node-board/.dockerignore",
      "starter/spring-board/Dockerfile",
      "starter/compose-postgres/docker-compose.yml",
      "starter/compose-postgres/.env.example",
      "starter/.github/workflows/ci.yml",
    ],
  },
  "15-cs-fundamentals": {
    files: [],
    marker: "서술형 문제",
  },
  "16-security": {
    files: [
      "starter/01-xss-stored.js",
      "starter/02-xss-reflected.js",
      "starter/03-sql-injection.js",
      "starter/03-sql-injection-setup.sql",
      "starter/04-csrf-demo/vulnerable.html",
      "starter/04-csrf-demo/protected.js",
      "starter/05-cors.js",
    ],
  },
};

const editableProblemPaths = new Set(
  Object.entries(problemWorkTracks).flatMap(([folder, track]) =>
    track.files.map((file) => path.posix.join(folder, file)),
  ),
);

function problemTrackForPath(relativePath) {
  const normalizedPath = relativePath.split(path.sep).join("/");
  const folder = normalizedPath.split("/")[0];
  return problemWorkTracks[folder] ? folder : null;
}

module.exports = {
  editableProblemPaths,
  problemTrackForPath,
  problemWorkTracks,
};
