export interface AppItem {
  id: string
  name: string
  description: string
  author: string
  authorAvatar: string
  icon: string
  tags: string[]
  likes: number
  uses: number
  forks: number
  createdAt: string
  updatedAt: string
  code: { filename: string; content: string }[]
  previewHtml: string
  comments: Comment[]
  forkedFrom?: string
}

export interface Comment {
  id: string
  user: string
  avatar: string
  content: string
  createdAt: string
}

export interface UserProfile {
  id: string
  name: string
  avatar: string
  bio: string
  appsCount: number
  likesReceived: number
  forksReceived: number
}

export const mockUsers: UserProfile[] = [
  {
    id: 'u1',
    name: 'Alex Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    bio: 'Building the future, one agent at a time.',
    appsCount: 12,
    likesReceived: 342,
    forksReceived: 56,
  },
  {
    id: 'u2',
    name: 'Sarah Kim',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    bio: 'K-pop fan & developer. Love open source.',
    appsCount: 8,
    likesReceived: 189,
    forksReceived: 23,
  },
  {
    id: 'u3',
    name: 'Mike Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    bio: 'Game dev and Elden Ring enthusiast.',
    appsCount: 5,
    likesReceived: 120,
    forksReceived: 18,
  },
  {
    id: 'u4',
    name: 'Emma Watson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    bio: 'Philosophy student. Creating knowledge tools.',
    appsCount: 3,
    likesReceived: 67,
    forksReceived: 8,
  },
  {
    id: 'u5',
    name: 'David Liu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    bio: 'Crypto analyst. Building dashboards.',
    appsCount: 7,
    likesReceived: 234,
    forksReceived: 45,
  },
]

export const mockApps: AppItem[] = [
  {
    id: 'app-1',
    name: 'John Khan Archive',
    description: 'A comprehensive archive of all John Khan videos and articles, with search and timeline features. Perfect for fans who want to explore his content history.',
    author: 'Alex Chen',
    authorAvatar: mockUsers[0].avatar,
    icon: 'Archive',
    tags: ['Fan', 'Archive', 'Video'],
    likes: 452,
    uses: 1280,
    forks: 34,
    createdAt: '2024-11-15',
    updatedAt: '2024-12-01',
    code: [
      {
        filename: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>John Khan Archive</title>
  <style>
    body { font-family: Inter, sans-serif; background: #0a0a0a; color: #fafafa; }
    .header { padding: 24px; border-bottom: 1px solid #333; }
    .search { width: 100%; max-width: 600px; padding: 12px 16px; border-radius: 8px; border: 1px solid #333; background: #141414; color: #fafafa; }
    .timeline { padding: 24px; }
    .timeline-item { display: flex; gap: 16px; margin-bottom: 24px; padding: 16px; background: #141414; border-radius: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>John Khan Archive</h1>
    <input class="search" placeholder="Search videos and articles..." />
  </div>
  <div class="timeline">
    <div class="timeline-item">
      <div>2024-01</div>
      <div>
        <h3>Video Title Here</h3>
        <p>Description of the video content...</p>
      </div>
    </div>
  </div>
</body>
</html>`,
      },
      {
        filename: 'style.css',
        content: `/* John Khan Archive Styles */
:root { --primary: #8B1A1A; --bg: #0a0a0a; --surface: #141414; }
body { margin: 0; background: var(--bg); color: #fafafa; }
.search:focus { outline: 2px solid var(--primary); }
.timeline-item:hover { border: 1px solid var(--primary); }`,
      },
    ],
    previewHtml: `<div style="font-family: Inter, sans-serif; background: #0a0a0a; color: #fafafa; min-height: 400px;">
  <div style="padding: 24px; border-bottom: 1px solid #333;">
    <h1 style="margin: 0 0 16px 0;">John Khan Archive</h1>
    <input style="width: 100%; max-width: 600px; padding: 12px 16px; border-radius: 8px; border: 1px solid #333; background: #141414; color: #fafafa;" placeholder="Search videos and articles..." />
  </div>
  <div style="padding: 24px;">
    <div style="display: flex; gap: 16px; margin-bottom: 24px; padding: 16px; background: #141414; border-radius: 12px;">
      <div style="color: #71717A; min-width: 60px;">2024-01</div>
      <div>
        <h3 style="margin: 0 0 8px 0;">The History of Central Asia</h3>
        <p style="margin: 0; color: #A1A1AA;">An in-depth exploration of Central Asian history...</p>
      </div>
    </div>
    <div style="display: flex; gap: 16px; margin-bottom: 24px; padding: 16px; background: #141414; border-radius: 12px;">
      <div style="color: #71717A; min-width: 60px;">2023-12</div>
      <div>
        <h3 style="margin: 0 0 8px 0;">Why Was Yugoslavia Destroyed?</h3>
        <p style="margin: 0; color: #A1A1AA;">Analysis of the breakup of Yugoslavia...</p>
      </div>
    </div>
  </div>
</div>`,
    comments: [
      {
        id: 'c1',
        user: 'Sarah Kim',
        avatar: mockUsers[1].avatar,
        content: 'This is exactly what I needed! Great work on the timeline feature.',
        createdAt: '2024-11-20',
      },
      {
        id: 'c2',
        user: 'Mike Johnson',
        avatar: mockUsers[2].avatar,
        content: 'Love the search functionality. Would be great to add tags for easier filtering.',
        createdAt: '2024-11-22',
      },
    ],
  },
  {
    id: 'app-2',
    name: 'Elden Ring Guide',
    description: 'Complete guide for Elden Ring including boss strategies, item locations, and build recommendations. Updated for DLC.',
    author: 'Mike Johnson',
    authorAvatar: mockUsers[2].avatar,
    icon: 'Sword',
    tags: ['Game', 'Guide', 'Tool'],
    likes: 328,
    uses: 2100,
    forks: 67,
    createdAt: '2024-10-20',
    updatedAt: '2024-12-05',
    code: [
      {
        filename: 'index.html',
        content: `<!DOCTYPE html>
<html>
<head><title>Elden Ring Guide</title></head>
<body>
  <h1>Elden Ring Complete Guide</h1>
  <nav><a href="#bosses">Bosses</a><a href="#items">Items</a><a href="#builds">Builds</a></nav>
  <section id="bosses"><h2>Boss Strategies</h2></section>
</body>
</html>`,
      },
    ],
    previewHtml: `<div style="font-family: Inter, sans-serif; background: #0a0a0a; color: #fafafa; min-height: 400px;">
  <div style="padding: 24px; border-bottom: 1px solid #333;">
    <h1 style="margin: 0;">Elden Ring Complete Guide</h1>
    <div style="margin-top: 16px; display: flex; gap: 16px;">
      <span style="padding: 6px 12px; background: #8B1A1A; border-radius: 6px; font-size: 14px;">Bosses</span>
      <span style="padding: 6px 12px; background: #141414; border-radius: 6px; font-size: 14px;">Items</span>
      <span style="padding: 6px 12px; background: #141414; border-radius: 6px; font-size: 14px;">Builds</span>
    </div>
  </div>
  <div style="padding: 24px;">
    <h2>Malenia, Blade of Miquella</h2>
    <p style="color: #A1A1AA;">Strategy: Learn to dodge Waterfowl Dance. Use bleed weapons for maximum damage.</p>
    <div style="margin-top: 16px; padding: 16px; background: #141414; border-radius: 12px;">
      <h3 style="margin: 0 0 8px 0;">Recommended Build</h3>
      <p style="margin: 0; color: #A1A1AA;">Dual Rivers of Blood + White Mask + Lord of Blood's Exultation</p>
    </div>
  </div>
</div>`,
    comments: [
      {
        id: 'c3',
        user: 'Alex Chen',
        avatar: mockUsers[0].avatar,
        content: 'Finally a guide that actually helps with Malenia! The build recommendations are spot on.',
        createdAt: '2024-10-25',
      },
    ],
  },
  {
    id: 'app-3',
    name: 'K-pop History Timeline',
    description: 'Interactive timeline of K-pop history from the 1990s to present day. Includes major groups, songs, and cultural impact.',
    author: 'Sarah Kim',
    authorAvatar: mockUsers[1].avatar,
    icon: 'Music',
    tags: ['Music', 'Timeline', 'Fan'],
    likes: 215,
    uses: 890,
    forks: 19,
    createdAt: '2024-09-10',
    updatedAt: '2024-11-20',
    code: [
      {
        filename: 'index.html',
        content: `<html><head><title>K-pop History</title></head><body><h1>K-pop History Timeline</h1></body></html>`,
      },
    ],
    previewHtml: `<div style="font-family: Inter, sans-serif; background: #0a0a0a; color: #fafafa; min-height: 400px;">
  <div style="padding: 24px;">
    <h1 style="margin: 0 0 24px 0;">K-pop History Timeline</h1>
    <div style="display: flex; gap: 24px; margin-bottom: 24px;">
      <div style="min-width: 80px; color: #8B1A1A; font-weight: 600;">1996</div>
      <div>
        <h3 style="margin: 0 0 8px 0;">H.O.T. Debut</h3>
        <p style="margin: 0; color: #A1A1AA;">The first K-pop idol group debuts, starting the idol era.</p>
      </div>
    </div>
    <div style="display: flex; gap: 24px; margin-bottom: 24px;">
      <div style="min-width: 80px; color: #8B1A1A; font-weight: 600;">2012</div>
      <div>
        <h3 style="margin: 0 0 8px 0;">Gangnam Style</h3>
        <p style="margin: 0; color: #A1A1AA;">PSY breaks global records with Gangnam Style.</p>
      </div>
    </div>
    <div style="display: flex; gap: 24px;">
      <div style="min-width: 80px; color: #8B1A1A; font-weight: 600;">2020</div>
      <div>
        <h3 style="margin: 0 0 8px 0;">BTS Billboard #1</h3>
        <p style="margin: 0; color: #A1A1AA;">Dynamite reaches #1 on Billboard Hot 100.</p>
      </div>
    </div>
  </div>
</div>`,
    comments: [],
  },
  {
    id: 'app-4',
    name: 'Unit Converter Pro',
    description: 'A clean, fast unit converter supporting 50+ units across length, weight, temperature, speed, and more.',
    author: 'Alex Chen',
    authorAvatar: mockUsers[0].avatar,
    icon: 'Calculator',
    tags: ['Tool', 'Utility'],
    likes: 178,
    uses: 3400,
    forks: 12,
    createdAt: '2024-08-05',
    updatedAt: '2024-10-15',
    code: [],
    previewHtml: `<div style="font-family: Inter, sans-serif; background: #0a0a0a; color: #fafafa; min-height: 400px; padding: 24px;">
  <h1 style="margin: 0 0 24px 0;">Unit Converter</h1>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
    <div style="padding: 16px; background: #141414; border-radius: 12px;">
      <label style="display: block; color: #71717A; font-size: 14px; margin-bottom: 8px;">From</label>
      <input style="width: 100%; padding: 8px; background: #0a0a0a; border: 1px solid #333; border-radius: 6px; color: #fafafa;" value="100" />
      <select style="width: 100%; margin-top: 8px; padding: 8px; background: #0a0a0a; border: 1px solid #333; border-radius: 6px; color: #fafafa;"><option>Meters</option></select>
    </div>
    <div style="padding: 16px; background: #141414; border-radius: 12px;">
      <label style="display: block; color: #71717A; font-size: 14px; margin-bottom: 8px;">To</label>
      <input style="width: 100%; padding: 8px; background: #0a0a0a; border: 1px solid #333; border-radius: 6px; color: #fafafa;" value="328.084" />
      <select style="width: 100%; margin-top: 8px; padding: 8px; background: #0a0a0a; border: 1px solid #333; border-radius: 6px; color: #fafafa;"><option>Feet</option></select>
    </div>
  </div>
  <div style="margin-top: 16px; text-align: center; color: #71717A;">100 Meters = 328.084 Feet</div>
</div>`,
    comments: [
      {
        id: 'c4',
        user: 'Emma Watson',
        avatar: mockUsers[3].avatar,
        content: 'Simple and effective. Love the clean design!',
        createdAt: '2024-08-12',
      },
    ],
  },
  {
    id: 'app-5',
    name: 'Philosophy Q&A',
    description: 'An interactive Q&A platform covering major philosophical questions from ancient Greek to modern existentialism.',
    author: 'Emma Watson',
    authorAvatar: mockUsers[3].avatar,
    icon: 'Brain',
    tags: ['Learning', 'Q&A', 'Knowledge'],
    likes: 156,
    uses: 670,
    forks: 28,
    createdAt: '2024-07-20',
    updatedAt: '2024-09-01',
    code: [],
    previewHtml: `<div style="font-family: Inter, sans-serif; background: #0a0a0a; color: #fafafa; min-height: 400px; padding: 24px;">
  <h1 style="margin: 0 0 24px 0;">Philosophy Q&A</h1>
  <div style="padding: 16px; background: #141414; border-radius: 12px; margin-bottom: 16px;">
    <h3 style="margin: 0 0 8px 0; color: #D4A843;">What is the meaning of life?</h3>
    <p style="margin: 0; color: #A1A1AA;">From Aristotle to Camus, philosophers have approached this question differently...</p>
  </div>
  <div style="padding: 16px; background: #141414; border-radius: 12px; margin-bottom: 16px;">
    <h3 style="margin: 0 0 8px 0; color: #D4A843;">Do we have free will?</h3>
    <p style="margin: 0; color: #A1A1AA;">The debate between determinism and libertarian free will continues...</p>
  </div>
  <div style="padding: 16px; background: #141414; border-radius: 12px;">
    <h3 style="margin: 0 0 8px 0; color: #D4A843;">What is consciousness?</h3>
    <p style="margin: 0; color: #A1A1AA;">The hard problem of consciousness remains one of the biggest mysteries...</p>
  </div>
</div>`,
    comments: [],
  },
  {
    id: 'app-6',
    name: 'Portfolio Builder',
    description: 'A minimalist portfolio template for creatives. Just add your projects and bio. Mobile responsive.',
    author: 'Sarah Kim',
    authorAvatar: mockUsers[1].avatar,
    icon: 'Layout',
    tags: ['Portfolio', 'Template'],
    likes: 134,
    uses: 560,
    forks: 89,
    createdAt: '2024-06-15',
    updatedAt: '2024-08-20',
    code: [],
    previewHtml: `<div style="font-family: Inter, sans-serif; background: #fafafa; color: #18181B; min-height: 400px; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto;">
    <h1 style="margin: 0; font-size: 32px;">Jane Doe</h1>
    <p style="color: #52525B; margin-top: 8px;">Photographer & Visual Artist</p>
    <div style="margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
      <div style="background: #fff; border-radius: 12px; overflow: hidden;">
        <div style="height: 120px; background: #eee;"></div>
        <div style="padding: 12px;"><h3 style="margin: 0; font-size: 16px;">Project One</h3></div>
      </div>
      <div style="background: #fff; border-radius: 12px; overflow: hidden;">
        <div style="height: 120px; background: #eee;"></div>
        <div style="padding: 12px;"><h3 style="margin: 0; font-size: 16px;">Project Two</h3></div>
      </div>
    </div>
  </div>
</div>`,
    comments: [],
  },
  {
    id: 'app-7',
    name: 'Anime Tracker',
    description: 'Track your anime watchlist, get recommendations, and discover new series. Seasonal chart included.',
    author: 'Mike Johnson',
    authorAvatar: mockUsers[2].avatar,
    icon: 'Tv',
    tags: ['Fan', 'Tracker', 'Anime'],
    likes: 298,
    uses: 1540,
    forks: 43,
    createdAt: '2024-05-10',
    updatedAt: '2024-11-01',
    code: [],
    previewHtml: `<div style="font-family: Inter, sans-serif; background: #0a0a0a; color: #fafafa; min-height: 400px; padding: 24px;">
  <h1 style="margin: 0 0 24px 0;">My Anime List</h1>
  <div style="display: flex; gap: 16px; margin-bottom: 24px;">
    <div style="padding: 8px 16px; background: #8B1A1A; border-radius: 20px; font-size: 14px;">Watching 12</div>
    <div style="padding: 8px 16px; background: #141414; border-radius: 20px; font-size: 14px;">Completed 45</div>
    <div style="padding: 8px 16px; background: #141414; border-radius: 20px; font-size: 14px;">Plan to Watch 23</div>
  </div>
  <div style="padding: 16px; background: #141414; border-radius: 12px; display: flex; gap: 16px; align-items: center;">
    <div style="width: 60px; height: 80px; background: #333; border-radius: 6px;"></div>
    <div>
      <h3 style="margin: 0;">Attack on Titan</h3>
      <p style="margin: 4px 0 0 0; color: #71717A; font-size: 14px;">Episode 12 / 28</p>
    </div>
  </div>
</div>`,
    comments: [],
  },
  {
    id: 'app-8',
    name: 'Crypto Dashboard',
    description: 'Real-time crypto price tracker with portfolio management. Supports BTC, ETH, and 50+ altcoins.',
    author: 'David Liu',
    authorAvatar: mockUsers[4].avatar,
    icon: 'TrendingUp',
    tags: ['Finance', 'Dashboard', 'Tool'],
    likes: 412,
    uses: 2890,
    forks: 78,
    createdAt: '2024-04-01',
    updatedAt: '2024-12-10',
    code: [],
    previewHtml: `<div style="font-family: Inter, sans-serif; background: #0a0a0a; color: #fafafa; min-height: 400px; padding: 24px;">
  <h1 style="margin: 0 0 24px 0;">Crypto Dashboard</h1>
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
    <div style="padding: 16px; background: #141414; border-radius: 12px;">
      <div style="color: #71717A; font-size: 14px;">Bitcoin</div>
      <div style="font-size: 24px; font-weight: 600; margin-top: 4px;">$67,432</div>
      <div style="color: #166534; font-size: 14px; margin-top: 4px;">+2.4%</div>
    </div>
    <div style="padding: 16px; background: #141414; border-radius: 12px;">
      <div style="color: #71717A; font-size: 14px;">Ethereum</div>
      <div style="font-size: 24px; font-weight: 600; margin-top: 4px;">$3,521</div>
      <div style="color: #166534; font-size: 14px; margin-top: 4px;">+1.8%</div>
    </div>
    <div style="padding: 16px; background: #141414; border-radius: 12px;">
      <div style="color: #71717A; font-size: 14px;">Solana</div>
      <div style="font-size: 24px; font-weight: 600; margin-top: 4px;">$178</div>
      <div style="color: #166534; font-size: 14px; margin-top: 4px;">+5.2%</div>
    </div>
  </div>
  <div style="padding: 16px; background: #141414; border-radius: 12px;">
    <div style="color: #71717A; font-size: 14px; margin-bottom: 8px;">Portfolio Value</div>
    <div style="font-size: 28px; font-weight: 700;">$124,892.50</div>
  </div>
</div>`,
    comments: [
      {
        id: 'c5',
        user: 'Alex Chen',
        avatar: mockUsers[0].avatar,
        content: 'The portfolio tracking feature is excellent. Would love to see DeFi integration.',
        createdAt: '2024-04-15',
      },
    ],
  },
  {
    id: 'app-9',
    name: 'Weather Visualizer',
    description: 'Beautiful weather app with animated backgrounds and 7-day forecast. Uses geolocation for local weather.',
    author: 'Emma Watson',
    authorAvatar: mockUsers[3].avatar,
    icon: 'Cloud',
    tags: ['Tool', 'Weather', 'Visual'],
    likes: 87,
    uses: 430,
    forks: 15,
    createdAt: '2024-03-20',
    updatedAt: '2024-06-10',
    code: [],
    previewHtml: `<div style="font-family: Inter, sans-serif; background: linear-gradient(135deg, #1a1a2e, #16213e); color: #fafafa; min-height: 400px; padding: 24px;">
  <div style="text-align: center; padding-top: 40px;">
    <div style="font-size: 64px; margin-bottom: 16px;">☀️</div>
    <div style="font-size: 48px; font-weight: 300;">72°F</div>
    <div style="color: #A1A1AA; margin-top: 8px;">San Francisco, CA</div>
  </div>
  <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-top: 40px;">
    <div style="text-align: center; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px;">
      <div style="font-size: 12px; color: #71717A;">Mon</div>
      <div style="margin: 8px 0;">☀️</div>
      <div style="font-size: 14px;">75°</div>
    </div>
    <div style="text-align: center; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px;">
      <div style="font-size: 12px; color: #71717A;">Tue</div>
      <div style="margin: 8px 0;">🌤️</div>
      <div style="font-size: 14px;">73°</div>
    </div>
    <div style="text-align: center; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px;">
      <div style="font-size: 12px; color: #71717A;">Wed</div>
      <div style="margin: 8px 0;">☁️</div>
      <div style="font-size: 14px;">68°</div>
    </div>
  </div>
</div>`,
    comments: [],
  },
  {
    id: 'app-10',
    name: 'Markdown Editor',
    description: 'A clean, split-pane markdown editor with live preview. Supports tables, code blocks, and images.',
    author: 'David Liu',
    authorAvatar: mockUsers[4].avatar,
    icon: 'FileText',
    tags: ['Tool', 'Editor', 'Productivity'],
    likes: 245,
    uses: 1120,
    forks: 56,
    createdAt: '2024-02-15',
    updatedAt: '2024-09-25',
    code: [],
    previewHtml: `<div style="font-family: Inter, sans-serif; background: #0a0a0a; color: #fafafa; min-height: 400px; padding: 24px;">
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; height: 350px;">
    <div style="background: #141414; border-radius: 12px; padding: 16px; overflow: auto;">
      <div style="color: #71717A; font-size: 12px; margin-bottom: 8px;">EDITOR</div>
      <pre style="margin: 0; color: #A1A1AA; font-family: monospace; font-size: 14px;"># Hello World

This is a **markdown** editor.

- Item 1
- Item 2
- Item 3

\`\`\`js
console.log("Hello");
\`\`\`</pre>
    </div>
    <div style="background: #141414; border-radius: 12px; padding: 16px; overflow: auto;">
      <div style="color: #71717A; font-size: 12px; margin-bottom: 8px;">PREVIEW</div>
      <h1 style="margin: 0 0 16px 0; font-size: 24px;">Hello World</h1>
      <p style="color: #A1A1AA;">This is a <strong style="color: #fafafa;">markdown</strong> editor.</p>
      <ul style="color: #A1A1AA;">
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ul>
    </div>
  </div>
</div>`,
    comments: [],
  },
]

export const currentUser: UserProfile = mockUsers[0]
