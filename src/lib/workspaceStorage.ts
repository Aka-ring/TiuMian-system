import type { EmailResult, FormData } from '../types'

const KEY = 'uii:v1:workspace'

export type WorkspacePersistV1 = {
  v: 1
  formData: FormData
  emailResult: EmailResult | null
  previewSubject: string
  previewContent: string
}

/**
 * 从 localStorage 恢复工作台草稿；解析失败或版本不对时返回 null。
 */
export function loadWorkspaceSnapshot(
  formFallback: FormData,
): WorkspacePersistV1 | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const j = JSON.parse(raw) as Partial<WorkspacePersistV1> & { v?: number }
    if (j.v !== 1 || !j.formData || typeof j.formData !== 'object') return null

    const formData = { ...formFallback, ...j.formData } as FormData
    if (formData.match_type !== 'url' && formData.match_type !== 'abstract') {
      formData.match_type = formFallback.match_type
    }

    let emailResult: EmailResult | null = null
    if (
      j.emailResult &&
      typeof j.emailResult === 'object' &&
      typeof (j.emailResult as EmailResult).task_id === 'string'
    ) {
      emailResult = j.emailResult as EmailResult
    }

    const previewSubject =
      typeof j.previewSubject === 'string' ? j.previewSubject : ''
    const previewContent =
      typeof j.previewContent === 'string' ? j.previewContent : ''

    return {
      v: 1,
      formData,
      emailResult,
      previewSubject,
      previewContent,
    }
  } catch {
    return null
  }
}

export function saveWorkspaceSnapshot(snapshot: WorkspacePersistV1): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(snapshot))
  } catch {
    // 配额满或隐私模式：静默失败，不阻断使用
  }
}

export function clearWorkspaceSnapshot(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
