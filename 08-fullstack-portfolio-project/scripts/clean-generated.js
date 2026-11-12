// 제출용 파일을 압축하기 전에 만들어진 결과물과 내 컴퓨터의 실행 기록을 지우는 도구다.
// 주의: 아래 data/career-hub.json에는 사용자·지원·프로젝트 기록이 들어 있다. 이 도구를 실행하면 삭제된다.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 이 파일 위치를 기준으로 Career Hub 폴더를 찾는다. 실행한 위치가 달라도 같은 대상을 정리한다.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// dist는 배포 화면, coverage는 테스트 검사 결과, JSON 파일은 로컬 실행 기록이다.
// 화면과 서버의 원본 코드는 정리 목록에 넣지 않는다.
const targets = [
  path.join(root, "dist"),
  path.join(root, "coverage"),
  path.join(root, "data", "career-hub.json")
];

// force:true는 파일이 없어도 오류를 내지 않는다. recursive:true는 폴더 안의 파일까지 지운다.
for (const target of targets) {
  await fs.rm(target, { recursive: true, force: true });
}

console.log("빌드 결과와 로컬 실행 데이터를 정리했습니다.");
