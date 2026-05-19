// MongoDB 연결을 담당하는 데이터베이스 설정 파일
import mongoose from "mongoose";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/fullstack_workbook";

  await mongoose.connect(uri);
  console.log("MongoDB에 연결되었습니다.");
}

