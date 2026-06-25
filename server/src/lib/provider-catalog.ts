/**
 * Provider Catalog
 * 支持的所有 AI 模型提供商配置
 * 用户可以选择使用自己的 API Key (BYOK) 或平台默认的 Key
 */

export interface ProviderConfig {
  id: string
  name: string
  baseUrl: string
  defaultModel: string
  models: string[]
  requiresKey: boolean
  description: string
}

export const PROVIDER_CATALOG: ProviderConfig[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-v4-pro',
    models: ['deepseek-v4-pro', 'deepseek-v4-flash', 'deepseek-chat'],
    requiresKey: true,
    description: 'DeepSeek V4 - 性价比最高，中文支持好',
  },
  {
    id: 'qwen',
    name: '通义千问 (阿里云)',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen-plus',
    models: ['qwen-plus', 'qwen-turbo', 'qwen-max'],
    requiresKey: true,
    description: '通义千问 - 百万免费额度，中文最强',
  },
  {
    id: 'doubao',
    name: '豆包 (字节跳动)',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    defaultModel: 'doubao-pro-32k',
    models: ['doubao-pro-32k', 'doubao-lite-4k'],
    requiresKey: true,
    description: '豆包 - 超便宜，128K 上下文',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
    requiresKey: true,
    description: 'OpenAI - 业界标准，英文最强',
  },
  {
    id: 'moonshot',
    name: 'Kimi (Moonshot)',
    baseUrl: 'https://api.moonshot.cn/v1',
    defaultModel: 'moonshot-v1-128k',
    models: ['moonshot-v1-128k', 'moonshot-v1-8k'],
    requiresKey: true,
    description: 'Kimi - 长上下文，中文优秀',
  },
  {
    id: 'ollama',
    name: 'Ollama (本地)',
    baseUrl: 'http://localhost:11434/v1',
    defaultModel: 'llama3.1',
    models: ['llama3.1', 'qwen2.5', 'deepseek-coder-v2'],
    requiresKey: false,
    description: 'Ollama - 本地运行，完全免费',
  },
]

export const DEFAULT_PROVIDER = 'deepseek'

export function getProviderConfig(providerId: string): ProviderConfig | undefined {
  return PROVIDER_CATALOG.find(p => p.id === providerId)
}

export function getDefaultProvider(): ProviderConfig {
  return PROVIDER_CATALOG.find(p => p.id === DEFAULT_PROVIDER) || PROVIDER_CATALOG[0]
}

/**
 * 从环境变量获取默认平台 API Key
 */
export function getDefaultApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY
}

/**
 * 从环境变量获取默认平台 Base URL
 */
export function getDefaultBaseUrl(): string {
  return process.env.OPENAI_BASE_URL || 'https://api.deepseek.com/v1'
}

/**
 * 从环境变量获取默认平台 Model
 */
export function getDefaultModel(): string {
  return process.env.OPENAI_MODEL || 'deepseek-v4-pro'
}
