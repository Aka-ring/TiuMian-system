import { useCallback, useEffect, useRef } from 'react'
import { checkTaskStatus } from '../services/api'

export type TaskPollSuccessPayload = {
  taskId: string
  subject: string
  content: string
}

type UseTaskPollingOptions = {
  intervalMs: number
  onSuccess: (payload: TaskPollSuccessPayload) => void
  onError: (message: string) => void
}

/**
 * Webhook 轮询：提交成功后 start(taskId)，成功/失败时自动 clear。
 * 卸载组件时清除 interval，避免泄漏。
 */
export function useTaskPolling({
  intervalMs,
  onSuccess,
  onError,
}: UseTaskPollingOptions) {
  const timerRef = useRef<number | null>(null)
  const lockRef = useRef(false)

  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)
  onSuccessRef.current = onSuccess
  onErrorRef.current = onError

  const clearPollingTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    lockRef.current = false
  }, [])

  const startPolling = useCallback(
    (taskId: string) => {
      clearPollingTimer()
      timerRef.current = window.setInterval(async () => {
        if (lockRef.current) return
        lockRef.current = true
        try {
          const result = await checkTaskStatus(taskId)
          const st = result.status.trim().toLowerCase()

          if (st === 'processing' || st === 'pending' || st === 'running') {
            return
          }

          if (st === 'success' || st === 'completed' || st === 'done') {
            const subject = result.subject ?? '(无主题)'
            const content =
              result.content ?? '后端已返回 success，但未提供邮件正文。'
            onSuccessRef.current({ taskId, subject, content })
            clearPollingTimer()
            return
          }

          if (st === 'error' || st === 'failed') {
            throw new Error(result.content ?? '后端返回失败状态')
          }

          throw new Error(`后端返回异常状态: ${result.status || '(空)'}`)
        } catch (error) {
          const message =
            error instanceof Error ? error.message : '轮询任务状态失败'
          onErrorRef.current(message)
          clearPollingTimer()
        } finally {
          lockRef.current = false
        }
      }, intervalMs)
    },
    [clearPollingTimer, intervalMs],
  )

  useEffect(() => clearPollingTimer, [clearPollingTimer])

  return { startPolling, clearPollingTimer }
}
