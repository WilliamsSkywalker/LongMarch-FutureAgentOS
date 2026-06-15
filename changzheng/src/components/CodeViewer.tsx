import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { useTranslation } from '@/i18n/translations'

interface CodeFile {
  filename: string
  content: string
}

interface CodeViewerProps {
  code: CodeFile[]
}

function simpleHighlight(content: string, filename: string): string {
  const isHtml = filename.endsWith('.html') || filename.endsWith('.htm')
  const isCss = filename.endsWith('.css')
  const isJs = filename.endsWith('.js') || filename.endsWith('.ts') || filename.endsWith('.jsx') || filename.endsWith('.tsx')

  let html = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  if (isHtml) {
    // HTML tags
    html = html.replace(/(&lt;\/?)([\w-]+)/g, '<span style="color:#f87171">$1$2</span>')
    // Attributes
    html = html.replace(/([\w-]+)(=)/g, '<span style="color:#fbbf24">$1</span><span style="color:#e5e7eb">$2</span>')
    // Strings
    html = html.replace(/"([^"]*)"/g, '<span style="color:#4ade80">"$1"</span>')
  } else if (isCss) {
    // CSS properties
    html = html.replace(/([\w-]+)(\s*:)/g, '<span style="color:#fbbf24">$1</span><span style="color:#e5e7eb">$2</span>')
    // CSS values (numbers with units)
    html = html.replace(/(\d+(?:\.\d+)?(?:px|rem|em|%|s|ms|vh|vw|deg|fr)?)/g, '<span style="color:#4ade80">$1</span>')
    // CSS selectors
    html = html.replace(/([.#][\w-]+)/g, '<span style="color:#f87171">$1</span>')
    // Comments
    html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#6b7280">$1</span>')
  } else if (isJs) {
    // Keywords
    const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'from', 'export', 'default', 'new', 'this', 'true', 'false', 'null', 'undefined']
    keywords.forEach((kw) => {
      const regex = new RegExp(`\\b(${kw})\\b`, 'g')
      html = html.replace(regex, '<span style="color:#f87171">$1</span>')
    })
    // Strings
    html = html.replace(/'([^']*)'/g, '<span style="color:#4ade80">\'$1\'</span>')
    html = html.replace(/`([^`]*)`/g, '<span style="color:#4ade80">`$1`</span>')
    // Comments
    html = html.replace(/(\/\/.*)/g, '<span style="color:#6b7280">$1</span>')
  }

  return html
}

export default function CodeViewer({ code }: CodeViewerProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [copied, setCopied] = useState(false)
  const { t } = useTranslation()

  if (!code || code.length === 0) {
    return (
      <div className="rounded-xl bg-[#0D0D0D] p-6 text-center text-sm text-muted-foreground">
        {t('cvNoCode')}
      </div>
    )
  }

  const activeFile = code[activeTab]
  const lines = activeFile.content.split('\n')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = activeFile.content
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-[#0D0D0D]">
      {/* Tabs */}
      <div className="flex items-center border-b border-border/50 bg-[#141414]">
        {code.map((file, index) => (
          <button
            key={file.filename}
            onClick={() => {
              setActiveTab(index)
              setCopied(false)
            }}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors border-b-2',
              activeTab === index
                ? 'text-foreground border-primary bg-[#0D0D0D]'
                : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-[#1a1a1a]'
            )}
          >
            {file.filename}
          </button>
        ))}
      </div>

      {/* Code Block */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-7 gap-1 text-xs text-muted-foreground hover:text-foreground bg-[#1a1a1a]/80"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              {t('cvCopied')}
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              {t('cvCopy')}
            </>
          )}
        </Button>

        <div className="overflow-auto max-h-[600px]">
          <pre className="p-4 text-sm leading-relaxed font-mono">
            {lines.map((line, i) => (
              <div key={i} className="flex">
                <span className="select-none text-[#52525B] w-10 text-right pr-3 shrink-0 text-xs pt-0.5">
                  {i + 1}
                </span>
                <code
                  className="flex-1 text-[#e5e7eb] whitespace-pre"
                  dangerouslySetInnerHTML={{
                    __html: simpleHighlight(line, activeFile.filename) || '&nbsp;',
                  }}
                />
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  )
}
