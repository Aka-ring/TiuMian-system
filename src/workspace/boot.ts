import {
  loadWorkspaceSnapshot,
  type WorkspacePersistV1,
} from '../lib/workspaceStorage'
import type { EmailResult, FormData, TaskStatus } from '../types'
import { initialFormData } from './constants'

export type UiStatus = Extract<TaskStatus, 'idle' | 'processing' | 'success'>

export type WorkspaceBoot = {
  formData: FormData
  emailResult: EmailResult | null
  previewSubject: string
  previewContent: string
  uiStatus: UiStatus
}

export function readWorkspaceBoot(): WorkspaceBoot {
  const s: WorkspacePersistV1 | null = loadWorkspaceSnapshot(initialFormData)
  if (!s) {
    return {
      formData: initialFormData,
      emailResult: null,
      previewSubject: '',
      previewContent: '',
      uiStatus: 'idle',
    }
  }
  return {
    formData: s.formData,
    emailResult: s.emailResult,
    previewSubject: s.previewSubject,
    previewContent: s.previewContent,
    uiStatus: s.emailResult ? 'success' : 'idle',
  }
}
