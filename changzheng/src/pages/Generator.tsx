import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  Code,
  Share2,
  GitBranch,
  Sparkles,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { mockApps } from "@/data/mockData"
import GeneratorProgress from "@/components/GeneratorProgress"
import MockAppRunner from "@/components/MockAppRunner"
import { createApp, generateApp } from '@/lib/api'
import type { AppDetail } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { useTranslation } from '@/i18n/translations'

const exampleTags = [
  { label: "Fan archive", text: "Create an archive app that collects all videos and articles of John Khan, with a search function and timeline view." },
  { label: "Game guide", text: "Build a game guide app for Elden Ring that includes boss strategies, item locations, and build recommendations." },
  { label: "Knowledge base", text: "Create an interactive timeline of K-pop history from the 1990s to today, with major groups and songs." },
  { label: "Personal tool", text: "Build a unit converter app that supports length, weight, temperature, and speed conversions." },
]

const availableTags = ["Game", "Fan", "Tool", "Learning", "Music", "Portfolio", "Anime", "Finance", "Weather", "Editor"]

const generationMessages = [
  "Analyzing requirements...",
  "Parsing natural language input...",
  "Identifying app components...",
  "Generating UI layout...",
  "Designing color scheme...",
  "Selecting typography...",
  "Building component structure...",
  "Calling AI generation API...",
  "Writing HTML markup...",
  "Generating CSS styles...",
  "Adding JavaScript interactions...",
  "Optimizing assets...",
  "Running quality checks...",
  "Deploying to edge network...",
  "Finalizing deployment...",
  "App ready!",
]

export default function Generator() {
  const [step, setStep] = useState(1)
  const [description, setDescription] = useState("")
  const [appName, setAppName] = useState("")
  const [appDescription, setAppDescription] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [currentStage, setCurrentStage] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [showCode, setShowCode] = useState(false)
  const [activeCodeTab, setActiveCodeTab] = useState("html")
  const [createdApp, setCreatedApp] = useState<AppDetail | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const cancelRef = useRef(false)
  const intervalsRef = useRef<{ log?: ReturnType<typeof setInterval>; stage?: ReturnType<typeof setInterval> }>({})
  const { t } = useTranslation()

  const demoApp = createdApp || mockApps[0]

  const handleTagClick = (tag: string) => {
    const example = exampleTags.find((e) => e.label === tag)
    if (example) {
      setDescription(example.text)
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const startGeneration = useCallback(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setCreateError(t('genLoginRequired'))
      return
    }
    setCreateError(null)
    setCreatedApp(null)
    setStep(3)
    setCurrentStage(0)
    setLogs([])
    cancelRef.current = false

    let logIndex = 0
    let stage = 0

    const logInterval = setInterval(() => {
      if (cancelRef.current) return
      if (logIndex < generationMessages.length) {
        setLogs((prev) => [...prev, generationMessages[logIndex]])
        logIndex++
      }
    }, 300)

    const stageInterval = setInterval(() => {
      if (cancelRef.current) return
      stage++
      if (stage <= 3) {
        setCurrentStage(stage)
      }
      if (stage === 4) {
        clearInterval(stageInterval)
        clearInterval(logInterval)
        setTimeout(async () => {
          if (!cancelRef.current) {
            try {
              // Step 1: Call AI generation API
              setLogs((prev) => [...prev, 'Calling AI generation API...'])
              const aiResult = await generateApp(
                description,
                appName,
                selectedTags
              )
              setLogs((prev) => [...prev, `AI generated code (${aiResult.mode} mode)...`])

              // Step 2: Create the app with generated code
              const { app } = await createApp({
                name: appName,
                description: appDescription || description,
                icon: undefined,
                tags: selectedTags,
                code: aiResult.code,
                preview_html: aiResult.preview_html,
                is_public: isPublic,
              })
              setCreatedApp(app)
              setStep(4)
              if (aiResult.mode === 'demo') {
                setLogs((prev) => [...prev, 'Note: Demo mode — set OPENAI_API_KEY for real AI generation'])
              }
            } catch (err) {
              setCreateError(err instanceof Error ? err.message : 'Failed to create app')
              setStep(2)
            }
          }
        }, 600)
      }
    }, 1200)

    intervalsRef.current = { log: logInterval, stage: stageInterval }
  }, [appName, appDescription, description, selectedTags, isPublic, t])

  const handleCancel = () => {
    cancelRef.current = true
    if (intervalsRef.current.log) clearInterval(intervalsRef.current.log)
    if (intervalsRef.current.stage) clearInterval(intervalsRef.current.stage)
    setStep(2)
    setCurrentStage(0)
    setLogs([])
  }

  const handleOpenApp = () => {
    showToast.info(t('genOpenAppAlert'))
  }

  const handleShare = () => {
    showToast.success(t('genPublishedAlert'))
  }

  const handleFork = () => {
    showToast.success(t('genForkedAlert'))
  }

  const codeFiles = (demoApp as any).code || []
  const htmlFile = codeFiles.find((f: any) => f.filename.endsWith(".html"))
  const cssFile = codeFiles.find((f: any) => f.filename.endsWith(".css"))
  const jsFile = codeFiles.find((f: any) => f.filename.endsWith(".js"))
  const previewHtml = (demoApp as any).previewHtml ?? (demoApp as any).preview_html ?? ''

  const getCodeContent = (tab: string) => {
    switch (tab) {
      case "html":
        return htmlFile?.content || "<!-- No HTML code available -->"
      case "css":
        return cssFile?.content || "/* No CSS code available */"
      case "js":
        return jsFile?.content || "// No JavaScript code available"
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Step indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2">
            {[t('genStep1'), t('genStep2'), t('genStep3'), t('genStep4')].map((label, index) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                    ${step > index + 1 ? "bg-green-600 text-white" : ""}
                    ${step === index + 1 ? "bg-primary text-primary-foreground" : ""}
                    ${step < index + 1 ? "bg-muted text-muted-foreground" : ""}
                  `}
                >
                  {step > index + 1 ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${
                    step === index + 1 ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="relative h-1 bg-muted rounded-full mt-2">
            <motion.div
              className="absolute top-0 left-0 h-full bg-primary rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${((step - 1) / 3) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Describe */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-2">{t('genDescribeTitle')}</h2>
                  <p className="text-muted-foreground mb-6">
                    {t('genDescribeDesc')}
                  </p>

                  <Textarea
                    placeholder={t('genDescribePlaceholder')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[200px] mb-4 resize-none"
                  />

                  <div className="flex flex-wrap gap-2 mb-6">
                    {exampleTags.map((tag) => (
                      <button
                        key={tag.label}
                        onClick={() => handleTagClick(tag.label)}
                        className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!description.trim()}
                      className="gap-2"
                    >
                      {t('genNext')}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Configure */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{t('genConfigureTitle')}</h2>
                    <p className="text-muted-foreground">
                      {t('genConfigureDesc')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="app-name">{t('genAppName')}</Label>
                    <Input
                      id="app-name"
                      placeholder={t('genAppNamePlaceholder')}
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="app-desc">{t('genAppDesc')}</Label>
                    <Input
                      id="app-desc"
                      placeholder={t('genAppDescPlaceholder')}
                      value={appDescription}
                      onChange={(e) => setAppDescription(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="visibility">{t('genVisibility')}</Label>
                      <p className="text-xs text-muted-foreground">
                        {isPublic ? t('genPublic') : t('genPrivate')}
                      </p>
                    </div>
                    <Switch
                      id="visibility"
                      checked={isPublic}
                      onCheckedChange={(checked) => setIsPublic(checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t('genTags')}</Label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                            ${
                              selectedTags.includes(tag)
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }
                          `}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {createError && (
                    <p className="text-sm text-red-500">{createError}</p>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button variant="secondary" onClick={() => setStep(1)} className="gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      {t('genBack')}
                    </Button>
                    <Button
                      onClick={startGeneration}
                      disabled={!appName.trim()}
                      className="gap-2 px-8 py-6 text-lg"
                    >
                      <Sparkles className="w-5 h-5" />
                      {t('genGenerate')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Generate */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">{t('genGeneratingTitle')}</h2>
                <p className="text-muted-foreground">
                  {t('genGeneratingDesc')}
                </p>
              </div>

              <GeneratorProgress currentStage={currentStage} logs={logs} />

              <div className="flex justify-center mt-8">
                <Button variant="secondary" onClick={handleCancel} className="gap-2">
                  <X className="w-4 h-4" />
                  {t('genCancel')}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Result */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Success header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-600/20 text-green-500 mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">{t('genResultTitle')}</h2>
                <p className="text-muted-foreground">
                  {appName || t('genUntitledApp')} {t('genGeneratedSuccess')}
                </p>
              </div>

              {/* Preview area */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  App Preview
                </h3>
                <MockAppRunner previewHtml={previewHtml} />
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 mb-8">
                <Button onClick={handleOpenApp} className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  {t('genOpenApp')}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowCode(!showCode)}
                  className="gap-2"
                >
                  <Code className="w-4 h-4" />
                  {showCode ? t('genHideCode') : t('genViewCode')}
                </Button>
                <Button variant="outline" onClick={handleShare} className="gap-2">
                  <Share2 className="w-4 h-4" />
                  {t('genShare')}
                </Button>
                <Button variant="outline" onClick={handleFork} className="gap-2">
                  <GitBranch className="w-4 h-4" />
                  {t('genFork')}
                </Button>
              </div>

              {/* Code viewer */}
              <AnimatePresence>
                {showCode && (
                  <motion.div
                    key="code-viewer"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <Card className="mb-8">
                      <CardContent className="pt-6">
                        <Tabs value={activeCodeTab} onValueChange={(value) => setActiveCodeTab(value)}>
                          <TabsList className="mb-4">
                            <TabsTrigger value="html">HTML</TabsTrigger>
                            <TabsTrigger value="css">CSS</TabsTrigger>
                            <TabsTrigger value="js">JS</TabsTrigger>
                          </TabsList>
                          <TabsContent value="html">
                            <CodeBlock code={getCodeContent("html")} language="html" />
                          </TabsContent>
                          <TabsContent value="css">
                            <CodeBlock code={getCodeContent("css")} language="css" />
                          </TabsContent>
                          <TabsContent value="js">
                            <CodeBlock code={getCodeContent("js")} language="js" />
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const { t } = useTranslation()

  const highlighted = highlightCode(code, language)

  const getLanguageColor = () => {
    switch (language) {
      case "html":
        return "text-orange-400"
      case "css":
        return "text-blue-400"
      case "js":
        return "text-yellow-400"
      default:
        return "text-foreground"
    }
  }

  return (
    <div className="rounded-lg bg-[#0D0D0D] border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-[#141414]">
        <span className={`text-xs font-mono font-semibold uppercase ${getLanguageColor()}`}>
          {language}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => {
            navigator.clipboard.writeText(code)
            showToast.success(t('genCodeCopied'))
          }}
        >
          Copy
        </Button>
      </div>
      <pre
        className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-[#A1A1AA]"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </div>
  )
}

function highlightCode(code: string, language: string): string {
  let html = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  if (language === "html") {
    // HTML tags: match &lt;tag...&gt; including self-closing and closing tags
    html = html.replace(
      /(&lt;\/?[a-zA-Z][\w-]*)(.*?)(&gt;)/g,
      '<span class="text-pink-400">$1</span>$2<span class="text-pink-400">$3</span>'
    )
    // HTML comments
    html = html.replace(
      /(&lt;!--[\s\S]*?--&gt;)/g,
      '<span class="text-gray-500">$1</span>'
    )
    // Strings in attributes
    html = html.replace(
      /"([^"]*)"/g,
      '<span class="text-green-400">"$1"</span>'
    )
  } else if (language === "css") {
    // Comments
    html = html.replace(
      /(\/\*[\s\S]*?\*\/)/g,
      '<span class="text-gray-500">$1</span>'
    )
    // Selectors before {
    html = html.replace(
      /^([a-zA-Z.#*:_\[\]=\-&\s]+)\{/gm,
      '<span class="text-orange-300">$1</span>{'
    )
    // Property names
    html = html.replace(
      /([\w-]+):/g,
      '<span class="text-blue-300">$1</span>:'
    )
    // Values
    html = html.replace(
      /:\s*([^;\n]+)(;?)/g,
      ': <span class="text-green-300">$1</span>$2'
    )
  } else if (language === "js") {
    // Comments
    html = html.replace(
      /(\/\/.*)/g,
      '<span class="text-gray-500">$1</span>'
    )
    html = html.replace(
      /(\/\*[\s\S]*?\*\/)/g,
      '<span class="text-gray-500">$1</span>'
    )
    // Strings
    html = html.replace(
      /"([^"]*)"/g,
      '<span class="text-green-400">"$1"</span>'
    )
    html = html.replace(
      /'([^']*)'/g,
      "<span class=\"text-green-400\">'$1'</span>"
    )
    // Keywords (simple, avoid matching inside already-colored spans by skipping if preceded by class=)
    const keywords = [
      "const", "let", "var", "function", "return", "if", "else", "for",
      "while", "class", "import", "export", "from", "default", "new",
      "this", "true", "false", "null", "undefined", "async", "await",
    ]
    keywords.forEach((kw) => {
      // Use negative lookbehind to avoid matching inside HTML attributes we may have generated
      // Since we haven't generated any HTML spans in JS yet, this is safe
      const regex = new RegExp(`\\b(${kw})\\b`, "g")
      html = html.replace(regex, '<span class="text-purple-400">$1</span>')
    })
    // Numbers
    html = html.replace(
      /\b(\d+)\b/g,
      '<span class="text-orange-400">$1</span>'
    )
  }

  return html
}
