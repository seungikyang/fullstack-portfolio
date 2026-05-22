// 제출용 압축 전에 생성된 빌드 결과와 로컬 데이터를 정리하는 스크립트
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const targets = [
  path.join(root, "dist"),
  path.join(root, "coverage"),
  path.join(root, "data", "career-hub.json")
];

for (const target of targets) {
  await fs.rm(target, { recursive: true, force: true });
}

console.log("빌드 결과와 로컬 실행 데이터를 정리했습니다.");

