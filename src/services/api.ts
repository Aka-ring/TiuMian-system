import type { FormData } from '../types'

// Hardcode：线上通过浏览器直接访问 Zeabur n8n Webhook（避免环境变量导致基址不一致）
const WEBHOOK_BASE_URL = 'https://akazy.zeabur.app'

/** Webhook 1：提交生成任务接口 */
const SUBMIT_TASK_WEBHOOK_URL = `${WEBHOOK_BASE_URL}/webhook/prof-email-gen`

/** Webhook 2：查询任务状态（先试 test 路径，再试正式路径） */
const CHECK_TASK_STATUS_WEBHOOK_URL = `${WEBHOOK_BASE_URL}/webhook/check-email`

function networkHintForSubmit(): string {
  if (import.meta.env.DEV) {
    return '网络连接失败，请确认本机 n8n 已启动（默认 5678）且 Vite 已将 /webhook 代理到该端口'
  }
  return '网络连接失败或浏览器拦截了跨域请求。请在 n8n/网关为当前网站域名配置 CORS（Access-Control-Allow-Origin），并确认 Webhook 已发布且可访问'
}

function networkHintForPoll(): string {
  if (import.meta.env.DEV) {
    return '网络连接失败，请确认本机 n8n（5678）已启动且 Vite 代理可访问'
  }
  return '无法连接任务查询接口（常见：跨域 CORS 未放行当前站点或查询 Webhook 未发布）。请在 n8n 或反向代理上允许浏览器来源，并确认「查询任务」Webhook 已发布'
}

/** 从 n8n Webhook 常见返回结构里取出扁平的 { status, subject, content } */
function normalizePollPayload(raw: unknown): {
  status: string
  subject?: string
  content?: string
} {
  // n8n 在任务尚未写入结果时可能返回空数组 []，按「仍在处理」继续轮询
  if (Array.isArray(raw) && raw.length === 0) {
    return { status: 'processing' }
  }

  const unwrap = (v: unknown): Record<string, unknown> | null => {
    if (v === null || v === undefined) return null
    if (Array.isArray(v)) {
      return v.length > 0 ? unwrap(v[0]) : null
    }
    if (typeof v === 'object') return v as Record<string, unknown>
    return null
  }

  let obj = unwrap(raw)
  if (!obj) {
    throw new Error(
      `轮询返回无法解析为对象: ${typeof raw === 'string' ? raw.slice(0, 200) : JSON.stringify(raw).slice(0, 300)}`,
    )
  }

  // n8n: { json: { ... } } 或顶层即字段
  if (obj.json && typeof obj.json === 'object') {
    obj = obj.json as Record<string, unknown>
  }
  if (obj.body !== undefined) {
    if (typeof obj.body === 'string') {
      try {
        const parsed = JSON.parse(obj.body) as unknown
        const inner = unwrap(parsed)
        if (inner) obj = inner
      } catch {
        // body 为纯文本时当作邮件正文
        const status = pickFirstString(obj, [
          'status',
          'state',
          'task_status',
        ])
        if (status) {
          const bodyText = typeof obj.body === 'string' ? obj.body : ''
          return {
            status,
            subject: pickFirstString(obj, ['subject', 'title']),
            content: bodyText,
          }
        }
      }
    } else if (typeof obj.body === 'object' && obj.body !== null) {
      obj = obj.body as Record<string, unknown>
    }
  }
  if (obj.data && typeof obj.data === 'object') {
    obj = obj.data as Record<string, unknown>
  }
  if (obj.result && typeof obj.result === 'object') {
    obj = obj.result as Record<string, unknown>
  }

  const status = pickFirstString(obj, [
    'status',
    'state',
    'task_status',
    'taskStatus',
    'Status',
  ])
  const subject = pickFirstString(obj, [
    'subject',
    'email_subject',
    'subject_line',
    'title',
    'Subject',
  ])
  const content = pickFirstString(obj, [
    'content',
    'body',
    'text',
    'message',
    'email_body',
    'html',
    'Body',
  ])

  if (!status) {
    const preview = JSON.stringify(raw).slice(0, 400)
    throw new Error(
      `轮询 JSON 中未找到 status 字段，请检查 n8n 返回字段名。返回预览: ${preview}`,
    )
  }

  return { status, subject, content }
}

function pickFirstString(
  obj: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'string') return v
  }
  return undefined
}

/**
 * 提交套磁任务。
 * @param data 表单输入数据
 * @param taskId 前端生成或后端约定的任务 ID
 */
export async function submitTask(data: FormData, taskId: string): Promise<void> {
  try {
    const response = await fetch(SUBMIT_TASK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task_id: taskId,
        ...data,
      }),
    })

    if (!response.ok) {
      throw new Error(`submitTask 请求失败: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    const message =
      error instanceof TypeError
        ? networkHintForSubmit()
        : error instanceof Error
          ? error.message
          : '未知错误'
    throw new Error(`提交任务异常: ${message}`)
  }
}

/**
 * 查询任务状态。
 * @param taskId 任务 ID
 * @returns 任务状态及可选邮件结果
 */
export async function checkTaskStatus(
  taskId: string,
): Promise<{ status: string; subject?: string; content?: string }> {
  try {
    const q = `task_id=${encodeURIComponent(taskId)}`
    const fallbackPath = CHECK_TASK_STATUS_WEBHOOK_URL.replace(
      '/webhook-test/',
      '/webhook/',
    )
    const candidateUrls = [
      `${CHECK_TASK_STATUS_WEBHOOK_URL}?${q}`,
      `${fallbackPath}?${q}`,
    ]

    let response: Response | null = null
    const errors: string[] = []

    for (const url of candidateUrls) {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })
      if (res.ok) {
        response = res
        break
      }
      errors.push(`${url.split('?')[0]} -> ${res.status}`)
      if (res.status !== 404) {
        throw new Error(
          `checkTaskStatus 请求失败: ${res.status} ${res.statusText}`,
        )
      }
    }

    if (!response) {
      throw new Error(
        `checkTaskStatus 请求失败: 404 Not Found（已尝试 webhook-test 与 webhook 两套路径: ${errors.join(' | ')}）`,
      )
    }

    const raw = (await response.json()) as unknown
    return normalizePollPayload(raw)
  } catch (error) {
    const message =
      error instanceof TypeError
        ? networkHintForPoll()
        : error instanceof Error
          ? error.message
          : '未知错误'
    throw new Error(`查询任务状态异常: ${message}`)
  }
}
