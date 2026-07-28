// Markdown 제목과 웹 앵커가 공유하는 GitHub 방식의 식별자를 만든다
function markdownSlug(value) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s+/g, "-");
}

module.exports = { markdownSlug };
