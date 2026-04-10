import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { appendPendingFromWorkspace } from '../lib/mailBoardStorage'
import {
  clearWorkspaceSnapshot,
  saveWorkspaceSnapshot,
} from '../lib/workspaceStorage'
import { submitTask } from '../services/api'
import type { EmailResult, FormData } from '../types'
import {
  createTaskId,
  initialFormData,
  POLL_INTERVAL_MS,
} from '../workspace/constants'
import { readWorkspaceBoot, type UiStatus } from '../workspace/boot'
import {
  revalidateAfterFieldChange,
  validateFormForSubmit,
  type FormErrors,
} from '../workspace/formErrors'
import { useTaskPolling } from '../hooks/useTaskPolling'

type QueuedMail = { subject: string; content: string }

function patchSubjectDirection(subject: string, direction: string): string {
  const nextDirection = direction.trim()
  if (!nextDirection) return subject
  if (!subject.includes('矿业工程')) return subject
  return subject.replace(/矿业工程/g, nextDirection)
}

type WorkspaceContextValue = {
  formData: FormData
  formErrors: FormErrors
  hasErrors: boolean
  uiStatus: UiStatus
  errorMessage: string
  emailResult: EmailResult | null
  previewSubject: string
  previewContent: string
  queuedForDashboard: QueuedMail | null
  handleFieldChange: <K extends keyof FormData>(key: K, value: FormData[K]) => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  handlePreviewSubjectChange: (value: string) => void
  handlePreviewContentChange: (value: string) => void
  handleStoreToDashboard: () => void
  handleClearDraft: () => void
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const bootRef = useRef(readWorkspaceBoot())
  const w0 = bootRef.current

  const [uiStatus, setUiStatus] = useState<UiStatus>(w0.uiStatus)
  const [formData, setFormData] = useState<FormData>(w0.formData)
  const [emailResult, setEmailResult] = useState<EmailResult | null>(w0.emailResult)
  const [previewSubject, setPreviewSubject] = useState(w0.previewSubject)
  const [previewContent, setPreviewContent] = useState(w0.previewContent)
  const [errorMessage, setErrorMessage] = useState('')
  const [queuedForDashboard, setQueuedForDashboard] = useState<QueuedMail | null>(
    null,
  )
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const lastSubmittedDirectionRef = useRef(
    w0.formData.applicant_direction?.trim() ?? '',
  )

  const onPollSuccess = useCallback(
    ({ taskId, subject, content }: { taskId: string; subject: string; content: string }) => {
      const patchedSubject = patchSubjectDirection(
        subject,
        lastSubmittedDirectionRef.current,
      )
      setEmailResult({
        task_id: taskId,
        subject: patchedSubject,
        content,
      })
      setPreviewSubject(patchedSubject)
      setPreviewContent(content)
      setUiStatus('success')
    },
    [],
  )

  const onPollError = useCallback((message: string) => {
    setUiStatus('idle')
    setErrorMessage(message)
  }, [])

  const { startPolling, clearPollingTimer } = useTaskPolling({
    intervalMs: POLL_INTERVAL_MS,
    onSuccess: onPollSuccess,
    onError: onPollError,
  })

  useEffect(() => {
    const id = window.setTimeout(() => {
      saveWorkspaceSnapshot({
        v: 1,
        formData,
        emailResult,
        previewSubject,
        previewContent,
      })
    }, 320)
    return () => window.clearTimeout(id)
  }, [formData, emailResult, previewSubject, previewContent])

  const handleFieldChange = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setFormData((prev) => {
        const next = { ...prev, [key]: value }
        setFormErrors((fe) => revalidateAfterFieldChange(next, key, fe))
        return next
      })
    },
    [],
  )

  const handlePreviewSubjectChange = useCallback((value: string) => {
    setPreviewSubject(value)
    setEmailResult((prev) => (prev ? { ...prev, subject: value } : null))
  }, [])

  const handlePreviewContentChange = useCallback((value: string) => {
    setPreviewContent(value)
    setEmailResult((prev) => (prev ? { ...prev, content: value } : null))
  }, [])

  const handleStoreToDashboard = useCallback(() => {
    if (!emailResult) return
    const subject = previewSubject.trim() || '(无主题)'
    const content =
      previewContent.trim() ||
      '后端已返回 success，但未提供邮件正文。'
    appendPendingFromWorkspace(subject, content)
    setQueuedForDashboard({ subject, content })
  }, [emailResult, previewSubject, previewContent])

  const handleClearDraft = useCallback(() => {
    if (uiStatus === 'processing') return
    if (
      !window.confirm(
        '确定清空工作台草稿与邮件预览？本地的草稿存盘将被删除，此操作不可撤销。',
      )
    ) {
      return
    }
    clearPollingTimer()
    clearWorkspaceSnapshot()
    setFormData({ ...initialFormData })
    setFormErrors({})
    setEmailResult(null)
    setPreviewSubject('')
    setPreviewContent('')
    setUiStatus('idle')
    setErrorMessage('')
    setQueuedForDashboard(null)
  }, [uiStatus, clearPollingTimer])

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const aggregatedErrors = validateFormForSubmit(formData)
      if (Object.keys(aggregatedErrors).length > 0) {
        setFormErrors(aggregatedErrors)
        setErrorMessage('请先完善必填信息，再提交生成任务。')
        return
      }

      clearPollingTimer()
      setUiStatus('processing')
      setErrorMessage('')
      setEmailResult(null)
      setPreviewSubject('')
      setPreviewContent('')

      const taskId = createTaskId()
      lastSubmittedDirectionRef.current = formData.applicant_direction.trim()

      try {
        await submitTask(formData, taskId)
      } catch (error) {
        const message = error instanceof Error ? error.message : '提交任务失败'
        setUiStatus('idle')
        setErrorMessage(message)
        return
      }

      startPolling(taskId)
    },
    [formData, clearPollingTimer, startPolling],
  )

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      formData,
      formErrors,
      hasErrors: Object.keys(formErrors).length > 0,
      uiStatus,
      errorMessage,
      emailResult,
      previewSubject,
      previewContent,
      queuedForDashboard,
      handleFieldChange,
      handleSubmit,
      handlePreviewSubjectChange,
      handlePreviewContentChange,
      handleStoreToDashboard,
      handleClearDraft,
    }),
    [
      formData,
      formErrors,
      uiStatus,
      errorMessage,
      emailResult,
      previewSubject,
      previewContent,
      queuedForDashboard,
      handleFieldChange,
      handleSubmit,
      handlePreviewSubjectChange,
      handlePreviewContentChange,
      handleStoreToDashboard,
      handleClearDraft,
    ],
  )

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  )
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) {
    throw new Error('useWorkspace 须在 WorkspaceProvider 内使用')
  }
  return ctx
}
