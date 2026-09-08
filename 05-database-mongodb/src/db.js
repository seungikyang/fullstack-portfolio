// 사전 확인 파일: MongoDB 연결 주소와 서버 시작 전 연결 순서를 담당합니다.
import mongoose from "mongoose";

export async function connectDatabase() {
  // 배포 환경에서는 환경 변수의 주소를 쓰고, 로컬에서는 연습용 데이터베이스에 연결합니다.
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/fullstack_workbook";

  // await는 연결 작업이 끝날 때까지 다음 줄로 넘어가지 않게 합니다.
  // 연결에 실패하면 서버를 시작하지 않고 호출한 곳으로 오류를 전달합니다.
  await mongoose.connect(uri);
  console.log("MongoDB에 연결되었습니다.");
}
