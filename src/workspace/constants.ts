import type { FormData } from '../types'

export const POLL_INTERVAL_MS = 2000

/** 顶栏链接 / 次要按钮键盘焦点（与主色一致） */
export const navFocusClass =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white'

export const initialFormData: FormData = {
  prof_name: '',
  prof_email: '',
  institution: '',
  applicant_direction: '',
  resume_text: '',
  match_type: 'url',
  url: '',
  zhaiyao: '',
  extra_input: '',
}

export function createTaskId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}
