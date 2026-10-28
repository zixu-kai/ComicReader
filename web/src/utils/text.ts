/** 拆分多作者：支持英文逗号、中文逗号、顿号、&、/ 等分隔符 */
export function splitAuthors(input?: string | null): string[] {
  if (!input) return []
  return input
    .split(/[,，、&/|;；]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}
