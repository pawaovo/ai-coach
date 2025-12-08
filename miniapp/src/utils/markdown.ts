// Markdown 文本处理工具
// 用于清理 AI 返回内容中的 Markdown 格式符号

/**
 * 清理 Markdown 格式符号，保留纯文本
 * @param text 包含 Markdown 格式的文本
 * @returns 清理后的纯文本
 */
export function cleanMarkdown(text: string): string {
  if (!text) return '';

  return text
    // 移除粗体 **text** 或 __text__
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    // 移除斜体 *text* 或 _text_（但不影响下划线分隔的单词）
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/(?<!\w)_([^_]+)_(?!\w)/g, '$1')
    // 移除删除线 ~~text~~
    .replace(/~~([^~]+)~~/g, '$1')
    // 移除行内代码 `code`
    .replace(/`([^`]+)`/g, '$1')
    // 移除标题 # ## ### 等
    .replace(/^#{1,6}\s+/gm, '')
    // 移除无序列表符号 - * +
    .replace(/^\s*[-*+]\s+/gm, '• ')
    // 移除有序列表序号（保留文本）
    .replace(/^\s*\d+\.\s+/gm, '')
    // 移除链接 [text](url) 保留文本
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // 移除图片 ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // 移除分割线 --- 或 ***
    .replace(/^[-*]{3,}\s*$/gm, '')
    // 移除引用 >
    .replace(/^>\s*/gm, '')
    // 清理多余空行
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
