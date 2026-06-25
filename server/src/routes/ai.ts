import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { db } from '../db'
import { cleanupHtmlSource, wrapInFullHtml, parseLLMResponse } from '../lib/html-cleanup'
import { validateHtml, autoFixHtml } from '../lib/html-validator'
import { getProviderConfig, getDefaultProvider, getDefaultApiKey, getDefaultBaseUrl, getDefaultModel } from '../lib/provider-catalog'

const router = Router()

const PLATFORM_API_KEY = getDefaultApiKey()
const PLATFORM_BASE_URL = getDefaultBaseUrl()
const PLATFORM_MODEL = getDefaultModel()

// ─── System Prompt ────────────────────────────
// 基于 Ironsmith 的约束设计，约 40 条规则
// 核心：LLM 只生成 <body> 内的内容，平台提供完整的 HTML 框架

const SYSTEM_PROMPT = `You are an expert web developer for the LongMarch platform.
Your task is to write HTML content that goes inside a <body> tag.

=== FRAMEWORK RULES ===
1. Generate ONLY the content that goes inside <body> tags
2. Do NOT include <html>, <head>, <body>, <meta>, <title>, <DOCTYPE> tags
3. Do NOT include <link> tags for stylesheets (Tailwind CSS is provided by the platform)
4. Do NOT include <script src="..."> for external libraries (use inline JS only)
5. Do NOT include <style> tags for global CSS (use inline style="" or Tailwind classes)
6. The platform provides: Tailwind CSS, custom colors (primary #8B1A1A, accent #D4A843, surface #141414, background #0a0a0a, text #fafafa)

=== CODE ORGANIZATION ===
7. Use semantic HTML tags (header, nav, main, section, article, footer)
8. Use Tailwind CSS utility classes for styling
9. Keep JavaScript in a single <script> block at the end of the content
10. All event handlers use inline onclick (no addEventListener for simple cases)

=== FUNCTIONAL CONSTRAINTS (NEGATIVE) ===
11. Do NOT add backend, server, or API calls (no fetch to external APIs)
12. Do NOT add analytics, tracking, or cookies
13. Do NOT add auth, login, or user accounts
14. Do NOT add external links (href="https://...") - keep the app self-contained
15. Do NOT make the app overly complex - it must fit in a single file
16. Do NOT use eval() or new Function() - security risk
17. Do NOT use document.write() - deprecated
18. Do NOT add pop-ups, banners, or ads

=== UI/UX PATTERNS ===
19. Dark theme is default: use dark background colors (#0a0a0a, #141414)
20. Use the platform's color system: text-white, text-zinc-400, bg-primary (#8B1A1A), text-accent (#D4A843)
21. Use responsive design with Tailwind classes (flex, grid, md:, lg:)
22. Add hover states and transitions for interactive elements
23. Use rounded corners (rounded-lg, rounded-xl) for modern look
24. Add proper spacing with padding and gap utilities

=== OUTPUT FORMAT ===
25. Return ONLY the content that goes inside <body> tags
26. No markdown fences (no \`\`\`html or \`\`\`)
27. No explanation text before or after the code
28. No thinking blocks or reasoning text
29. No comments explaining obvious code
30. No TODO, FIXME, or placeholder comments

=== COMPLEXITY BOUNDARY ===
31. If the user's request is too complex, simplify it to fit in a single file
32. Prefer focused utilities over full applications
33. One screen = one page; do not create multi-page navigation (use tabs or sections instead)
34. Maximum ~100 HTML elements total (divs, buttons, inputs, etc.)
35. JavaScript should be under 200 lines

=== LANGUAGE ===
36. Use Chinese or English based on the user's description language
37. Keep text concise and clear
38. Use proper typography (font sizes, weights, line heights)

=== RETURN FORMAT ===
Return a JSON object with this exact structure:
{"content": "the HTML content that goes inside <body> tags"}`

// ─── Repair Prompt ────────────────────────────
// 当验证失败时，让 LLM 修复错误

const REPAIR_PROMPT = `You are a HTML repair assistant. Given HTML code with validation errors, fix them and return the corrected HTML.

Rules:
- Fix ONLY the validation errors, do not change the app's functionality or design
- Keep the same structure and content as much as possible
- Return ONLY the corrected HTML content (what goes inside <body> tags)
- No markdown fences, no explanation text
- Return JSON: {"content": "fixed HTML"}

Common fixes:
- Unclosed tags: add missing closing tags
- Mismatched tags: ensure opening and closing tags match
- Nested errors: fix improper tag nesting (e.g., block inside inline)
- Self-closing tags: use proper syntax for img, input, br, etc.`

// ─── Demo Templates ───────────────────────────

function createDemoArchive(name: string): string {
  return `<div class="header">
    <h1>📚 ${name}</h1>
    <input class="search" placeholder="Search items..." id="search" oninput="filterItems()">
  </div>
  <div class="container">
    <div class="timeline" id="timeline">
      <div class="item" data-term="2024 video tutorial">
        <div class="date">2024-06</div>
        <div class="content">
          <h3>Latest Update</h3>
          <p>New content has been added to this archive.</p>
          <span class="tag">Video</span>
        </div>
      </div>
      <div class="item" data-term="2023 article">
        <div class="date">2023-12</div>
        <div class="content">
          <h3>Historical Entry</h3>
          <p>An important milestone documented in this collection.</p>
          <span class="tag">Article</span>
        </div>
      </div>
      <div class="item" data-term="2022 review">
        <div class="date">2022-08</div>
        <div class="content">
          <h3>Early Collection</h3>
          <p>The foundation of this archive starts here.</p>
          <span class="tag">Review</span>
        </div>
      </div>
    </div>
  </div>
  <script>
    function filterItems() {
      const q = document.getElementById('search').value.toLowerCase();
      document.querySelectorAll('.item').forEach(item => {
        item.style.display = item.dataset.term.toLowerCase().includes(q) ? 'flex' : 'none';
      });
    }
  </script>`
}

function createDemoCalculator(name: string): string {
  return `<div class="calc">
    <div class="display">
      <div class="prev" id="prev"></div>
      <div class="curr" id="curr">0</div>
    </div>
    <div class="buttons">
      <button class="btn btn-clear" onclick="clearAll()">AC</button>
      <button class="btn btn-del" onclick="del()">⌫</button>
      <button class="btn btn-op" onclick="appendOp('/')">÷</button>
      <button class="btn btn-op" onclick="appendOp('*')">×</button>
      <button class="btn btn-num" onclick="appendNum('7')">7</button>
      <button class="btn btn-num" onclick="appendNum('8')">8</button>
      <button class="btn btn-num" onclick="appendNum('9')">9</button>
      <button class="btn btn-op" onclick="appendOp('-')">−</button>
      <button class="btn btn-num" onclick="appendNum('4')">4</button>
      <button class="btn btn-num" onclick="appendNum('5')">5</button>
      <button class="btn btn-num" onclick="appendNum('6')">6</button>
      <button class="btn btn-op" onclick="appendOp('+')">+</button>
      <button class="btn btn-num" onclick="appendNum('1')">1</button>
      <button class="btn btn-num" onclick="appendNum('2')">2</button>
      <button class="btn btn-num" onclick="appendNum('3')">3</button>
      <button class="btn btn-num" onclick="appendNum('.')">.</button>
      <button class="btn btn-num" onclick="appendNum('0')">0</button>
      <button class="btn btn-eq" onclick="calculate()">=</button>
    </div>
  </div>
  <script>
    let curr = '0', prev = '', op = null;
    function update() { document.getElementById('curr').textContent = curr; document.getElementById('prev').textContent = prev + (op ? ' ' + op : ''); }
    function appendNum(n) { if (curr === '0' && n !== '.') curr = n; else if (n === '.' && curr.includes('.')) return; else curr += n; update(); }
    function appendOp(o) { if (op) calculate(); prev = curr; curr = '0'; op = o; update(); }
    function calculate() { if (!op || !prev) return; const a = parseFloat(prev), b = parseFloat(curr); let r; switch(op) { case '+': r = a + b; break; case '-': r = a - b; break; case '*': r = a * b; break; case '/': r = b === 0 ? 'Error' : a / b; break; } curr = String(r); prev = ''; op = null; update(); }
    function clearAll() { curr = '0'; prev = ''; op = null; update(); }
    function del() { curr = curr.length > 1 ? curr.slice(0, -1) : '0'; update(); }
  </script>`
}

function createDemoTimeline(name: string): string {
  return `<div class="header">
    <h1>📅 ${name}</h1>
    <p>Explore the history and milestones</p>
  </div>
  <div class="container">
    <div class="timeline">
      <div class="event">
        <div class="dot"></div>
        <div class="card">
          <div class="year">2024</div>
          <h3>Major Milestone</h3>
          <p>An important event that shaped the course of this timeline.</p>
        </div>
      </div>
      <div class="event">
        <div class="dot"></div>
        <div class="card">
          <div class="year">2022</div>
          <h3>Development Phase</h3>
          <p>Key developments during this period.</p>
        </div>
      </div>
      <div class="event">
        <div class="dot"></div>
        <div class="card">
          <div class="year">2020</div>
          <h3>The Beginning</h3>
          <p>Where it all started.</p>
        </div>
      </div>
    </div>
  </div>`
}

function createDemoDashboard(name: string): string {
  return `<div class="header">
    <h1>📊 ${name}</h1>
  </div>
  <div class="container">
    <div class="stats">
      <div class="stat">
        <div class="label">Total</div>
        <div class="value">1,234</div>
        <div class="change">+12.5% this month</div>
      </div>
      <div class="stat">
        <div class="label">Active</div>
        <div class="value">892</div>
        <div class="change">+8.3% this month</div>
      </div>
      <div class="stat">
        <div class="label">New</div>
        <div class="value">156</div>
        <div class="change">+24.1% this month</div>
      </div>
      <div class="stat">
        <div class="label">Growth</div>
        <div class="value">18.7%</div>
        <div class="change">+2.4% this month</div>
      </div>
    </div>
    <div class="chart">
      <h3>Performance Overview</h3>
      <div class="bar-row"><div class="bar-label">Item A</div><div class="bar-track"><div class="bar-fill" style="width:85%"></div></div><div class="bar-value">85</div></div>
      <div class="bar-row"><div class="bar-label">Item B</div><div class="bar-track"><div class="bar-fill" style="width:72%"></div></div><div class="bar-value">72</div></div>
      <div class="bar-row"><div class="bar-label">Item C</div><div class="bar-track"><div class="bar-fill" style="width:60%"></div></div><div class="bar-value">60</div></div>
      <div class="bar-row"><div class="bar-label">Item D</div><div class="bar-track"><div class="bar-fill" style="width:45%"></div></div><div class="bar-value">45</div></div>
    </div>
  </div>`
}

function createDemoTodo(name: string): string {
  return `<div class="app">
    <h1>✅ ${name}</h1>
    <div class="input-row">
      <input id="input" placeholder="Add a new task..." onkeydown="if(event.key==='Enter') addTask()">
      <button onclick="addTask()">Add</button>
    </div>
    <div class="filters">
      <button class="active" onclick="setFilter('all')">All</button>
      <button onclick="setFilter('active')">Active</button>
      <button onclick="setFilter('done')">Done</button>
    </div>
    <div class="list" id="list"></div>
  </div>
  <script>
    let tasks = [{text:'Welcome to your new app!',done:false},{text:'Click the circle to mark done',done:true},{text:'Hover and click × to delete',done:false}];
    let filter = 'all';
    function render() {
      const list = document.getElementById('list');
      list.innerHTML = '';
      const filtered = tasks.filter(t => filter === 'all' || (filter === 'done' ? t.done : !t.done));
      filtered.forEach((t, i) => {
        const div = document.createElement('div');
        div.className = 'task ' + (t.done ? 'done' : '');
        div.innerHTML = '<div class="check" onclick="toggle('+i+')">' + (t.done ? '✓' : '') + '</div><div class="text">' + escape(t.text) + '</div><div class="del" onclick="remove('+i+')">×</div>';
        list.appendChild(div);
      });
    }
    function escape(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    function addTask() { const input = document.getElementById('input'); const text = input.value.trim(); if(!text) return; tasks.push({text,done:false}); input.value=''; render(); }
    function toggle(i) { tasks[i].done = !tasks[i].done; render(); }
    function remove(i) { tasks.splice(i,1); render(); }
    function setFilter(f) { filter = f; document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active')); event.target.classList.add('active'); render(); }
    render();
  </script>`
}

function createDemoPortfolio(name: string): string {
  return `<div class="hero">
    <div class="avatar">👤</div>
    <h1>${name}</h1>
    <p>A showcase of creative work and projects built with passion.</p>
  </div>
  <div class="container">
    <div class="projects">
      <div class="project">
        <div class="thumb">🎨</div>
        <div class="info">
          <h3>Project One</h3>
          <p>An amazing project description here.</p>
          <div class="tags"><span>Design</span><span>UI</span></div>
        </div>
      </div>
      <div class="project">
        <div class="thumb">💻</div>
        <div class="info">
          <h3>Project Two</h3>
          <p>Another fantastic project showcase.</p>
          <div class="tags"><span>Dev</span><span>Web</span></div>
        </div>
      </div>
      <div class="project">
        <div class="thumb">📱</div>
        <div class="info">
          <h3>Project Three</h3>
          <p>A mobile-first creative solution.</p>
          <div class="tags"><span>Mobile</span><span>App</span></div>
        </div>
      </div>
    </div>
  </div>`
}

function selectDemoTemplate(description: string, name: string): { content: string; preview: string } {
  const desc = description.toLowerCase()
  let bodyContent = ''

  if (desc.includes('calc') || desc.includes('convert') || desc.includes('math') || desc.includes('计算')) {
    bodyContent = createDemoCalculator(name)
  } else if (desc.includes('archive') || desc.includes('collection') || desc.includes('收集') || desc.includes('存档')) {
    bodyContent = createDemoArchive(name)
  } else if (desc.includes('timeline') || desc.includes('history') || desc.includes('时间线') || desc.includes('历史')) {
    bodyContent = createDemoTimeline(name)
  } else if (desc.includes('dashboard') || desc.includes('track') || desc.includes('chart') || desc.includes('仪表板') || desc.includes('追踪')) {
    bodyContent = createDemoDashboard(name)
  } else if (desc.includes('todo') || desc.includes('task') || desc.includes('list') || desc.includes('待办') || desc.includes('清单')) {
    bodyContent = createDemoTodo(name)
  } else if (desc.includes('portfolio') || desc.includes('showcase') || desc.includes('展示') || desc.includes('作品')) {
    bodyContent = createDemoPortfolio(name)
  } else {
    bodyContent = createDemoArchive(name)
  }

  const fullHtml = wrapInFullHtml(bodyContent, name)
  return { content: fullHtml, preview: bodyContent }
}

// ─── User Provider Config ──────────────────────

interface UserProviderConfig {
  apiKey: string
  baseUrl: string
  model: string
  providerId: string
  isUserKey: boolean
}

function getUserProviderConfig(userId: number): UserProviderConfig {
  // 1. Check if user has their own API key
  const userKey = db.prepare(
    'SELECT provider, api_key, model, base_url FROM user_api_keys WHERE user_id = ? AND is_active = 1 ORDER BY id DESC LIMIT 1'
  ).get(userId) as { provider: string; api_key: string; model: string; base_url: string } | undefined

  if (userKey) {
    return {
      apiKey: userKey.api_key,
      baseUrl: userKey.base_url,
      model: userKey.model,
      providerId: userKey.provider,
      isUserKey: true,
    }
  }

  // 2. Fall back to platform default
  return {
    apiKey: PLATFORM_API_KEY || '',
    baseUrl: PLATFORM_BASE_URL,
    model: PLATFORM_MODEL,
    providerId: 'deepseek',
    isUserKey: false,
  }
}

// ─── LLM Call ────────────────────────────────

async function callLLM(
  description: string,
  name: string,
  tags: string[],
  config: UserProviderConfig
): Promise<{ code: string; preview: string; cleanupIssues: string[]; validation: any }> {
  const userMessage = `Build an app called "${name}".

Description: ${description}
${tags.length > 0 ? `Tags: ${tags.join(', ')}` : ''}

Please generate the HTML content that goes inside the <body> tag. Follow the system instructions exactly.`

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as any
    throw new Error(errorData.error?.message || `LLM API error: ${response.status}`)
  }

  const data = await response.json() as any
  const rawContent = data.choices?.[0]?.message?.content || ''

  // Parse JSON from the response
  let parsed = parseLLMResponse(rawContent)
  if (!parsed) {
    console.error('Failed to parse LLM response, attempting raw HTML extraction:', rawContent.substring(0, 200))
    const htmlMatch = rawContent.match(/<\w[\s\S]*?<\/\w+>/)
    if (htmlMatch) {
      parsed = { code: rawContent, preview: rawContent }
    } else {
      throw new Error('LLM returned invalid format - could not parse JSON or HTML')
    }
  }

  // Step 1: Cleanup
  const cleanup = cleanupHtmlSource(parsed.code, name)
  let bodyContent = cleanup.html

  // Step 2: Validation
  let validation = validateHtml(bodyContent)

  // Step 3: Auto-fix
  if (!validation.valid) {
    console.log('Validation failed, attempting auto-fix:', validation.errors)
    bodyContent = autoFixHtml(bodyContent)
    validation = validateHtml(bodyContent)
    if (validation.valid) {
      cleanup.issues.push('Auto-fixed HTML errors')
    }
  }

  // Step 4: Wrap in full HTML
  const fullHtml = wrapInFullHtml(bodyContent, name)

  return {
    code: fullHtml,
    preview: cleanup.preview,
    cleanupIssues: cleanup.issues,
    validation,
  }
}

// ─── Repair Loop ─────────────────────────────

async function repairWithLLM(
  originalHtml: string,
  validationErrors: any[],
  name: string,
  config: UserProviderConfig
): Promise<string | null> {
  const repairMessage = `The following HTML code has validation errors. Please fix them.

=== VALIDATION ERRORS ===
${validationErrors.map((e: any) => `- ${e.message}`).join('\n')}

=== CURRENT HTML ===
${originalHtml}

=== INSTRUCTIONS ===
Fix the validation errors while preserving the app's functionality and design.
Return ONLY the corrected HTML content (inside <body> tags).
Return JSON: {"content": "fixed HTML"}`

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: REPAIR_PROMPT },
        { role: 'user', content: repairMessage },
      ],
      temperature: 0.3, // Lower temperature for precise fixes
      max_tokens: 4000,
    }),
  })

  if (!response.ok) {
    return null
  }

  const data = await response.json() as any
  const rawContent = data.choices?.[0]?.message?.content || ''

  let parsed = parseLLMResponse(rawContent)
  if (!parsed) {
    // Try to extract HTML directly
    const bodyMatch = rawContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    if (bodyMatch) return bodyMatch[1]
    return rawContent.includes('<') ? rawContent : null
  }

  return parsed.code
}

// ─── Generation with Repair Loop ─────────────

async function generateWithRepair(
  description: string,
  name: string,
  tags: string[],
  userId: number
): Promise<{ code: string; preview: string; mode: string; cleanupIssues: string[]; validation: any; repairAttempts: number }> {
  const config = getUserProviderConfig(userId)
  let repairAttempts = 0
  const maxRepairAttempts = 3

  // Initial generation
  let result = await callLLM(description, name, tags, config)

  // Repair loop
  while (!result.validation.valid && repairAttempts < maxRepairAttempts) {
    repairAttempts++
    console.log(`Repair attempt ${repairAttempts}/${maxRepairAttempts}...`)

    const repairedHtml = await repairWithLLM(
      result.code,
      result.validation.errors,
      name,
      config
    )

    if (!repairedHtml) {
      console.log('Repair failed: LLM returned empty response')
      break
    }

    // Cleanup and validate repaired HTML
    const cleanup = cleanupHtmlSource(repairedHtml, name)
    let bodyContent = cleanup.html
    let validation = validateHtml(bodyContent)

    if (!validation.valid) {
      bodyContent = autoFixHtml(bodyContent)
      validation = validateHtml(bodyContent)
    }

    result = {
      code: wrapInFullHtml(bodyContent, name),
      preview: cleanup.preview,
      cleanupIssues: [...result.cleanupIssues, ...cleanup.issues, `Repair attempt ${repairAttempts}`],
      validation,
    }

    if (validation.valid) {
      console.log(`Repair successful after ${repairAttempts} attempts`)
      break
    }
  }

  const mode = config.isUserKey ? 'real-user' : 'real-platform'

  return {
    code: result.code,
    preview: result.preview,
    mode,
    cleanupIssues: result.cleanupIssues,
    validation: result.validation,
    repairAttempts,
  }
}

// ─── Route ──────────────────────────────────

router.post('/generate', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { description, name, tags } = req.body
    const userId = req.user!.userId

    if (!description || !name) {
      res.status(400).json({ error: 'Description and name are required' })
      return
    }

    // Check if we have any API key (platform or user)
    const config = getUserProviderConfig(userId)
    if (!config.apiKey) {
      // No API key available, use demo mode
      const template = selectDemoTemplate(description, name)
      const validation = validateHtml(template.content)
      res.json({
        code: [{ filename: 'index.html', content: template.content }],
        preview_html: template.preview,
        mode: 'demo',
        message: 'No AI API key configured. Generated demo app. Go to Profile → API Keys to add your own key.',
        validation: {
          valid: validation.valid,
          errors: validation.errors,
          warnings: validation.warnings,
          stats: validation.stats,
        },
      })
      return
    }

    // Real AI generation with repair loop
    try {
      const result = await generateWithRepair(description, name, tags || [], userId)

      res.json({
        code: [{ filename: 'index.html', content: result.code }],
        preview_html: result.preview,
        mode: result.mode,
        cleanup_issues: result.cleanupIssues,
        repair_attempts: result.repairAttempts,
        validation: {
          valid: result.validation.valid,
          errors: result.validation.errors,
          warnings: result.validation.warnings,
          stats: result.validation.stats,
        },
      })
    } catch (err) {
      console.error('LLM call failed, falling back to demo mode:', err)
      // Fall back to demo mode
      const template = selectDemoTemplate(description, name)
      const validation = validateHtml(template.content)
      res.json({
        code: [{ filename: 'index.html', content: template.content }],
        preview_html: template.preview,
        mode: 'demo',
        message: 'AI generation failed. Generated demo app instead.',
        validation: {
          valid: validation.valid,
          errors: validation.errors,
          warnings: validation.warnings,
          stats: validation.stats,
        },
      })
    }

  } catch (err: any) {
    console.error('AI generation error:', err)
    res.status(500).json({
      error: err.message || 'Failed to generate app',
    })
  }
})

export default router
