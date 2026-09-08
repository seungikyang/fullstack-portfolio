// 문제 1에서 읽을 파일: 게시글의 스키마와 모델을 정의합니다.
import mongoose from "mongoose";

// 스키마는 MongoDB 문서의 필드, 자료형, 필수값처럼 데이터 규칙을 정의합니다.
const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      default: "____", // 빈칸 1. 작성자가 없을 때 사용할 기본 이름을 문자열로 넣으세요. (예: "익명")
      trim: true
    }
  },
  {
    // 작성·수정 시각을 Mongoose가 자동으로 기록하게 합니다.
    timestamps: true
  }
);

// 모델은 위 스키마 규칙을 사용해 실제 게시글 모음을 생성·조회·수정·삭제하는 도구입니다.
export const Post = mongoose.model("Post", PostSchema);
