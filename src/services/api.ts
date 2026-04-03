import type { FormData } from '../types'

const WEBHOOK_BASE_URL = 'https://akazy.zeabur.app'

/** Webhook 1：提交生成任务接口（云端） */
const SUBMIT_TASK_WEBHOOK_URL = `${WEBHOOK_BASE_URL}/webhook/prof-email-gen`

/** Webhook 2：查询任务状态接口（云端） */
const CHECK_TASK_STATUS_WEBHOOK_URL = `${WEBHOOK_BASE_URL}/webhook-test/check-email`

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
        ? '网络连接失败，请确认前端开发服务与 n8n(5678)均已启动'
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
        ? '网络连接失败，请确认 n8n 服务(5678端口)已启动且可访问'
        : error instanceof Error
          ? error.message
          : '未知错误'
    throw new Error(`查询任务状态异常: ${message}`)
  }
}
