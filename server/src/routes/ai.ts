import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.deepseek.com/v1'
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'deepseek-v4-pro'

// ─── Demo Templates ───────────────────────────

function createDemoArchive(name: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Inter, system-ui, -apple-system, sans-serif; background: #0a0a0a; color: #fafafa; min-height: 100vh; }
  .header { padding: 24px 32px; border-bottom: 1px solid #222; background: #141414; position: sticky; top: 0; z-index: 10; }
  .header h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 12px; }
  .search { width: 100%; max-width: 500px; padding: 10px 16px; border-radius: 8px; border: 1px solid #333; background: #0a0a0a; color: #fafafa; font-size: 14px; outline: none; }
  .search:focus { border-color: #8B1A1A; }
  .container { max-width: 900px; margin: 0 auto; padding: 24px 32px; }
  .timeline { display: flex; flex-direction: column; gap: 16px; }
  .item { display: flex; gap: 16px; padding: 16px; background: #141414; border-radius: 12px; border: 1px solid transparent; transition: all 0.2s; cursor: pointer; }
  .item:hover { border-color: #8B1A1A; transform: translateX(4px); }
  .date { min-width: 70px; color: #D4A843; font-weight: 600; font-size: 13px; }
  .content h3 { font-size: 16px; margin-bottom: 4px; }
  .content p { color: #a1a1aa; font-size: 14px; }
  .tag { display: inline-block; padding: 2px 8px; border-radius: 4px; background: #8B1A1A20; color: #D4A843; font-size: 12px; margin-top: 8px; }
</style>
</head>
<body>
  <div class="header">
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
  </script>
</body>
</html>`
}

function createDemoCalculator(name: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Inter, system-ui, sans-serif; background: #0a0a0a; color: #fafafa; min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 20px; }
  .calc { width: 100%; max-width: 360px; background: #141414; border-radius: 20px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); border: 1px solid #222; }
  .display { background: #0a0a0a; border-radius: 12px; padding: 20px; text-align: right; margin-bottom: 16px; min-height: 80px; display: flex; flex-direction: column; justify-content: flex-end; }
  .display .prev { color: #71717a; font-size: 14px; min-height: 18px; }
  .display .curr { font-size: 32px; font-weight: 600; word-break: break-all; }
  .buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .btn { border: none; border-radius: 12px; padding: 16px; font-size: 18px; font-weight: 500; cursor: pointer; transition: all 0.15s; color: #fafafa; }
  .btn:hover { transform: scale(1.05); }
  .btn:active { transform: scale(0.95); }
  .btn-num { background: #222; }
  .btn-op { background: #333; color: #D4A843; }
  .btn-eq { background: #8B1A1A; grid-column: span 2; }
  .btn-clear { background: #333; color: #ef4444; }
  .btn-del { background: #333; color: #71717a; }
</style>
</head>
<body>
  <div class="calc">
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
  </script>
</body>
</html>`
}

function createDemoTimeline(name: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Inter, system-ui, sans-serif; background: #0a0a0a; color: #fafafa; min-height: 100vh; }
  .header { padding: 32px; text-align: center; border-bottom: 1px solid #222; }
  .header h1 { font-size: 2rem; font-weight: 700; margin-bottom: 8px; }
  .header p { color: #a1a1aa; }
  .container { max-width: 800px; margin: 0 auto; padding: 32px; }
  .timeline { position: relative; }
  .timeline::before { content: ''; position: absolute; left: 20px; top: 0; bottom: 0; width: 2px; background: #333; }
  .event { display: flex; gap: 20px; margin-bottom: 32px; position: relative; }
  .dot { width: 16px; height: 16px; border-radius: 50%; background: #8B1A1A; border: 3px solid #0a0a0a; flex-shrink: 0; margin-top: 4px; z-index: 1; }
  .card { background: #141414; border-radius: 12px; padding: 20px; flex: 1; border: 1px solid #222; }
  .card h3 { font-size: 18px; margin-bottom: 6px; }
  .card .year { color: #D4A843; font-size: 13px; font-weight: 600; margin-bottom: 8px; }
  .card p { color: #a1a1aa; font-size: 14px; line-height: 1.6; }
</style>
</head>
<body>
  <div class="header">
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
  </div>
</body>
</html>`
}

function createDemoDashboard(name: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Inter, system-ui, sans-serif; background: #0a0a0a; color: #fafafa; min-height: 100vh; }
  .header { padding: 24px 32px; border-bottom: 1px solid #222; background: #141414; }
  .header h1 { font-size: 1.5rem; font-weight: 700; }
  .container { max-width: 1100px; margin: 0 auto; padding: 24px 32px; }
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
  .stat { background: #141414; border-radius: 12px; padding: 20px; border: 1px solid #222; }
  .stat .label { color: #71717a; font-size: 13px; margin-bottom: 8px; }
  .stat .value { font-size: 28px; font-weight: 700; color: #fafafa; }
  .stat .change { font-size: 13px; color: #22c55e; margin-top: 4px; }
  .chart { background: #141414; border-radius: 12px; padding: 20px; border: 1px solid #222; }
  .chart h3 { font-size: 16px; margin-bottom: 16px; }
  .bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .bar-label { min-width: 60px; font-size: 13px; color: #a1a1aa; }
  .bar-track { flex: 1; height: 24px; background: #0a0a0a; border-radius: 6px; overflow: hidden; }
  .bar-fill { height: 100%; background: #8B1A1A; border-radius: 6px; transition: width 1s ease; }
  .bar-value { min-width: 40px; font-size: 13px; text-align: right; }
</style>
</head>
<body>
  <div class="header">
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
  </div>
</body>
</html>`
}

function createDemoTodo(name: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Inter, system-ui, sans-serif; background: #0a0a0a; color: #fafafa; min-height: 100vh; display: flex; justify-content: center; padding: 40px 20px; }
  .app { width: 100%; max-width: 480px; }
  .app h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 24px; text-align: center; }
  .input-row { display: flex; gap: 8px; margin-bottom: 20px; }
  .input-row input { flex: 1; padding: 12px 16px; border-radius: 8px; border: 1px solid #333; background: #141414; color: #fafafa; font-size: 14px; outline: none; }
  .input-row input:focus { border-color: #8B1A1A; }
  .input-row button { padding: 12px 20px; border-radius: 8px; border: none; background: #8B1A1A; color: #fff; font-weight: 500; cursor: pointer; transition: opacity 0.2s; }
  .input-row button:hover { opacity: 0.9; }
  .list { display: flex; flex-direction: column; gap: 8px; }
  .task { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #141414; border-radius: 8px; border: 1px solid #222; transition: all 0.2s; }
  .task:hover { border-color: #333; }
  .task.done .text { text-decoration: line-through; color: #71717a; }
  .task .check { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #333; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .task.done .check { background: #8B1A1A; border-color: #8B1A1A; }
  .task .text { flex: 1; font-size: 14px; }
  .task .del { color: #71717a; cursor: pointer; font-size: 18px; opacity: 0; transition: opacity 0.2s; }
  .task:hover .del { opacity: 1; }
  .task .del:hover { color: #ef4444; }
  .filters { display: flex; gap: 8px; margin-bottom: 16px; justify-content: center; }
  .filters button { padding: 6px 14px; border-radius: 20px; border: 1px solid #333; background: transparent; color: #a1a1aa; font-size: 13px; cursor: pointer; transition: all 0.2s; }
  .filters button.active { background: #8B1A1A; border-color: #8B1A1A; color: #fff; }
</style>
</head>
<body>
  <div class="app">
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
  </script>
</body>
</html>`
}

function createDemoPortfolio(name: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Inter, system-ui, sans-serif; background: #0a0a0a; color: #fafafa; min-height: 100vh; }
  .hero { text-align: center; padding: 60px 32px 40px; }
  .hero .avatar { width: 100px; height: 100px; border-radius: 50%; background: #8B1A1A; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 40px; }
  .hero h1 { font-size: 2rem; font-weight: 700; margin-bottom: 8px; }
  .hero p { color: #a1a1aa; max-width: 400px; margin: 0 auto; }
  .container { max-width: 900px; margin: 0 auto; padding: 0 32px 40px; }
  .projects { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
  .project { background: #141414; border-radius: 12px; overflow: hidden; border: 1px solid #222; transition: all 0.2s; cursor: pointer; }
  .project:hover { border-color: #8B1A1A; transform: translateY(-4px); }
  .project .thumb { height: 160px; background: #1a1a1a; display: flex; align-items: center; justify-content: center; font-size: 48px; }
  .project .info { padding: 16px; }
  .project .info h3 { font-size: 16px; margin-bottom: 4px; }
  .project .info p { color: #71717a; font-size: 13px; }
  .tags { display: flex; gap: 6px; margin-top: 12px; }
  .tags span { padding: 3px 10px; border-radius: 4px; background: #222; font-size: 12px; color: #D4A843; }
</style>
</head>
<body>
  <div class="hero">
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
  </div>
</body>
</html>`
}

function selectDemoTemplate(description: string, name: string): { content: string; preview: string } {
  const desc = description.toLowerCase()
  let content = ''

  if (desc.includes('calc') || desc.includes('convert') || desc.includes('math') || desc.includes('计算')) {
    content = createDemoCalculator(name)
  } else if (desc.includes('archive') || desc.includes('collection') || desc.includes('收集') || desc.includes('存档')) {
    content = createDemoArchive(name)
  } else if (desc.includes('timeline') || desc.includes('history') || desc.includes('时间线') || desc.includes('历史')) {
    content = createDemoTimeline(name)
  } else if (desc.includes('dashboard') || desc.includes('track') || desc.includes('chart') || desc.includes('仪表板') || desc.includes('追踪')) {
    content = createDemoDashboard(name)
  } else if (desc.includes('todo') || desc.includes('task') || desc.includes('list') || desc.includes('待办') || desc.includes('清单')) {
    content = createDemoTodo(name)
  } else if (desc.includes('portfolio') || desc.includes('showcase') || desc.includes('展示') || desc.includes('作品')) {
    content = createDemoPortfolio(name)
  } else {
    // Default: archive-style for most apps
    content = createDemoArchive(name)
  }

  // Extract preview from the HTML (the body content without the outer html/head)
  const bodyMatch = content.match(/<body>([\s\S]*?)<\/body>/)
  const preview = bodyMatch ? bodyMatch[1] : content

  return { content, preview }
}

// ─── Real AI Generation ──────────────────────

async function callLLM(description: string, name: string, tags: string[]): Promise<{ code: { filename: string; content: string }[]; preview_html: string }> {
  const systemPrompt = `You are an expert web developer. Create a complete, functional HTML application based on the user's description.

Requirements:
1. Output a single HTML file with embedded CSS and JavaScript
2. The app should be fully functional and interactive
3. Use modern CSS (flexbox/grid) for responsive layout
4. Dark theme with color scheme: background #0a0a0a, surface #141414, primary #8B1A1A, accent #D4A843, text #fafafa
5. Include any necessary libraries via CDN if needed
6. Make it visually polished and professional
7. Use Chinese or English based on the user's description language

Return ONLY a JSON object with NO markdown formatting:
{"code": [{"filename": "index.html", "content": "<!DOCTYPE html>..."}], "preview_html": "<div>...preview for iframe...</div>"}

User description: ${description}
App name: ${name}
Tags: ${tags.join(', ')}`

  const apiKey = OPENAI_API_KEY
  const baseUrl = OPENAI_BASE_URL
  const model = OPENAI_MODEL

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
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
  const content = data.choices?.[0]?.message?.content || ''

  // Parse JSON from the response
  let parsed: any
  try {
    // Try to extract JSON if wrapped in markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    const jsonStr = jsonMatch ? jsonMatch[1] : content
    parsed = JSON.parse(jsonStr)
  } catch (err) {
    console.error('Failed to parse LLM response:', content)
    throw new Error('LLM returned invalid JSON format')
  }

  return {
    code: parsed.code || [{ filename: 'index.html', content: parsed.content || content }],
    preview_html: parsed.preview_html || parsed.code?.[0]?.content || '',
  }
}

// ─── Route ──────────────────────────────────

router.post('/generate', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { description, name, tags } = req.body

    if (!description || !name) {
      res.status(400).json({ error: 'Description and name are required' })
      return
    }

    // Real mode with API key
    if (OPENAI_API_KEY) {
      try {
        const result = await callLLM(description, name, tags || [])
        res.json({
          code: result.code,
          preview_html: result.preview_html,
          mode: 'real',
        })
        return
      } catch (err) {
        console.error('LLM call failed, falling back to demo mode:', err)
        // Fall through to demo mode
      }
    }

    // Demo mode (no API key or LLM call failed)
    const template = selectDemoTemplate(description, name)
    res.json({
      code: [{ filename: 'index.html', content: template.content }],
      preview_html: template.preview,
      mode: 'demo',
      message: 'AI API key not configured or LLM call failed. Generated demo app. Set OPENAI_API_KEY to enable real AI generation.',
    })

  } catch (err: any) {
    console.error('AI generation error:', err)
    res.status(500).json({
      error: err.message || 'Failed to generate app',
    })
  }
})

export default router
