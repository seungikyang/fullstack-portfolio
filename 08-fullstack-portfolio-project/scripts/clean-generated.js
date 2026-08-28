// 제출용 압축 전에 생성된 빌드 결과와 로컬 데이터를 정리하는 스크립트
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 스크립트를 어느 폴더에서 실행해도 Career Hub 루트를 기준으로 경로를 계산한다.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// 소스가 아니라 다시 만들 수 있거나 로컬 실행 중 생기는 파일만 정리 대상으로 둔다.
const targets = [
  path.join(root, "dist"),
  path.join(root, "coverage"),
  path.join(root, "data", "career-hub.json")
];

// force:true라서 대상이 없어도 실패하지 않으며, 폴더는 recursive:true로 안쪽까지 지운다.
for (const target of targets) {
  await fs.rm(target, { recursive: true, force: true });
}

console.log("빌드 결과와 로컬 실행 데이터를 정리했습니다.");
