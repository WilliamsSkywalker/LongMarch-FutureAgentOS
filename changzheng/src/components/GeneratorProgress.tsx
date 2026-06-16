import { Check, Circle, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

import { useTranslation } from '@/i18n/translations'

interface GeneratorProgressProps {
  currentStage: number
  logs: string[]
}

const stageKeys = ['genStageParsing', 'genStageDesigning', 'genStageBuilding', 'genStageDeploying'] as const

export default function GeneratorProgress({ currentStage, logs }: GeneratorProgressProps) {
  const { t } = useTranslation()

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Stages */}
      <div className="relative flex items-start justify-between mb-8">
        {/* Progress line background */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted -translate-y-1/2 z-0" />
        {/* Progress line fill */}
        <motion.div
          className="absolute top-4 left-0 h-0.5 bg-primary -translate-y-1/2 z-0"
          initial={{ width: "0%" }}
          animate={{ width: `${(currentStage / (stageKeys.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {stageKeys.map((key, index) => {
          const isDone = index < currentStage
          const isActive = index === currentStage
          const isPending = index > currentStage

          return (
            <div key={key} className="relative z-10 flex flex-col items-center gap-2">
              {/* Circle */}
              <motion.div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2
                  ${isDone ? "bg-green-600 border-green-600 text-white" : ""}
                  ${isActive ? "bg-primary border-primary text-white" : ""}
                  ${isPending ? "bg-background border-muted text-muted-foreground" : ""}
                `}
                animate={
                  isActive
                    ? {
                        scale: [1, 1.1, 1],
                        boxShadow: [
                          "0 0 0 0 rgba(139, 26, 26, 0.4)",
                          "0 0 0 8px rgba(139, 26, 26, 0)",
                          "0 0 0 0 rgba(139, 26, 26, 0.4)",
                        ],
                      }
                    : {}
                }
                transition={
                  isActive
                    ? {
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                    : {}
                }
              >
                {isDone && <Check className="w-4 h-4" />}
                {isActive && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPending && <Circle className="w-4 h-4" />}
              </motion.div>

              {/* Stage name */}
              <span
                className={`
                  text-xs font-medium
                  ${isDone || isActive ? "text-foreground" : "text-muted-foreground"}
                  ${isActive ? "text-primary" : ""}
                `}
              >
                {t(key)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Logs area */}
      <div className="rounded-lg border border-border bg-[#0D0D0D] p-4">
        <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">
          {t('genGenLogs')}
        </div>
        <div className="h-48 overflow-y-auto font-mono text-sm space-y-1">
          {logs.length === 0 && (
            <div className="text-muted-foreground text-xs italic">{t('genWaitingStart')}</div>
          )}
          {logs.map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="text-muted-foreground"
            >
              <span className="text-[#71717A]">[{new Date().toLocaleTimeString()}]</span>{" "}
              {log}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
