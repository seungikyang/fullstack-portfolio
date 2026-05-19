// 게시글 데이터를 MongoDB에 저장하기 위한 Mongoose 모델 파일
import mongoose from "mongoose";

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
    timestamps: true
  }
);

export const Post = mongoose.model("Post", PostSchema);

