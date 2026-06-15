import { ExternalLink } from "lucide-react"

import { useTranslation } from '@/i18n/translations'

interface MockAppRunnerProps {
  previewHtml: string
}

export default function MockAppRunner({ previewHtml }: MockAppRunnerProps) {
  const { t } = useTranslation()
  const handleOpenNewTab = () => {
    const blob = new Blob([previewHtml], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    window.open(url, "_blank")
  }

  return (
    <div className="w-full rounded-xl border border-border overflow-hidden bg-[#0D0D0D]">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#141414] border-b border-border">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="flex-1 mx-4">
          <div className="max-w-md mx-auto px-3 py-1 rounded-md bg-[#0a0a0a] text-xs text-muted-foreground text-center truncate">
            https://changzheng.app/app/xyz-123
          </div>
        </div>
        <button
          onClick={handleOpenNewTab}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {t('cardOpen')}
        </button>
      </div>
      {/* Content area */}
      <div className="p-0">
        <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
      </div>
    </div>
  )
}
