/**
 * HtmlValidator
 * 职责：验证 HTML 语法正确性和安全性
 * 基于 Ironsmith 的编译验证层启发
 * 纯代码规则，快速检测常见问题
 */

export interface ValidationResult {
  valid: boolean
  errors: HtmlError[]
  warnings: string[]
  stats: HtmlStats
}

export interface HtmlError {
  type: 'unclosed' | 'mismatch' | 'nesting' | 'security' | 'size'
  message: string
  line?: number
  tag?: string
}

export interface HtmlStats {
  totalTags: number
  scriptTags: number
  styleTags: number
  inlineStyles: number
  inlineScripts: number
  externalLinks: number
  hasEval: boolean
  hasDocumentWrite: boolean
  sizeBytes: number
}

export function validateHtml(html: string): ValidationResult {
  const errors: HtmlError[] = []
  const warnings: string[] = []

  // 1. 检查未闭合标签（简单正则检测，不保证 100% 准确但快速）
  const selfClosingTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'])
  const tagStack: string[] = []
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g
  let match
  let lineNum = 1

  while ((match = tagRegex.exec(html)) !== null) {
    const tagName = match[1].toLowerCase()
    const fullTag = match[0]
    const isClosing = fullTag.startsWith('</')
    const isSelfClosing = fullTag.endsWith('/>') || selfClosingTags.has(tagName)

    // 计算行号
    const tagPos = match.index
    const textBefore = html.substring(0, tagPos)
    lineNum = textBefore.split('\n').length

    if (isSelfClosing) continue

    if (isClosing) {
      if (tagStack.length === 0) {
        errors.push({ type: 'mismatch', message: `Unexpected closing tag </${tagName}>`, line: lineNum, tag: tagName })
      } else {
        const lastTag = tagStack.pop()!
        if (lastTag !== tagName) {
          errors.push({ type: 'nesting', message: `Tag mismatch: <${lastTag}> closed by </${tagName}>`, line: lineNum, tag: tagName })
          // 尝试恢复栈
          const idx = tagStack.lastIndexOf(tagName)
          if (idx !== -1) {
            tagStack.splice(idx, 1)
          }
        }
      }
    } else {
      tagStack.push(tagName)
    }
  }

  // 未闭合的标签
  for (const tag of tagStack) {
    errors.push({ type: 'unclosed', message: `Unclosed tag <${tag}>`, tag })
  }

  // 2. 安全检查
  if (html.includes('eval(')) {
    errors.push({ type: 'security', message: 'Contains eval() - security risk' })
  }
  if (html.includes('document.write')) {
    warnings.push('Contains document.write() - may cause issues in iframe')
  }
  if (html.includes('new Function(')) {
    errors.push({ type: 'security', message: 'Contains new Function() - security risk' })
  }
  if (html.includes('innerHTML') && /innerHTML\s*=\s*['"]/.test(html)) {
    warnings.push('Contains direct innerHTML assignment - potential XSS if user input is involved')
  }

  // 3. 外部链接检查
  const externalLinkMatches = html.match(/<link[^>]*href=["']https?:\/\//gi) || []
  const externalScriptMatches = html.match(/<script[^>]*src=["']https?:\/\//gi) || []
  const externalLinks = externalLinkMatches.length + externalScriptMatches.length

  if (externalLinks > 0) {
    warnings.push(`Contains ${externalLinks} external resource references`)
  }

  // 4. 大小检查
  const sizeBytes = Buffer.byteLength(html, 'utf-8')
  if (sizeBytes > 100 * 1024) { // 100KB
    warnings.push(`HTML size is ${(sizeBytes / 1024).toFixed(1)}KB - consider optimization`)
  }
  if (sizeBytes > 500 * 1024) { // 500KB
    errors.push({ type: 'size', message: `HTML size exceeds 500KB limit: ${(sizeBytes / 1024).toFixed(1)}KB` })
  }

  // 5. 统计
  const scriptTags = (html.match(/<script/gi) || []).length
  const styleTags = (html.match(/<style/gi) || []).length
  const inlineStyles = (html.match(/style="/gi) || []).length
  const inlineScripts = (html.match(/onclick=/gi) || []).length + (html.match(/onerror=/gi) || []).length
  const totalTags = (html.match(/<[a-zA-Z][^>]*>/g) || []).length

  const stats: HtmlStats = {
    totalTags,
    scriptTags,
    styleTags,
    inlineStyles,
    inlineScripts,
    externalLinks,
    hasEval: html.includes('eval('),
    hasDocumentWrite: html.includes('document.write'),
    sizeBytes,
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats,
  }
}

/**
 * 尝试自动修复常见的 HTML 错误
 * 注意：这不是完美的修复，只处理简单的情况
 */
export function autoFixHtml(html: string): string {
  let fixed = html

  // 1. 闭合常见的未闭合标签（img, input, br, hr 等）
  fixed = fixed.replace(/<(img|input|br|hr|meta|link|area|base|col|embed|param|source|track|wbr)([^>]*)>/gi, '<$1$2 />')

  // 2. 修复常见嵌套错误（div 在 p 内）
  fixed = fixed.replace(/<p[^>]*>\s*<div/gi, '<div')
  fixed = fixed.replace(/<\/div>\s*<\/p>/gi, '</div>')

  // 3. 修复多余的闭合标签
  const selfClosing = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'])
  fixed = fixed.replace(/<\/(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)>/gi, '')

  return fixed
}
