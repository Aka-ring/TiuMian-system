import type { MailCardModel } from '../types'

const KEY = 'uii:v1:mail'

type MailBoardPersistV1 = {
  v: 1
  pending: MailCardModel[]
  sent: MailCardModel[]
  lastIngestSig: string
}

function createMailId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `mail_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function emptyBoard(): MailBoardPersistV1 {
  return { v: 1, pending: [], sent: [], lastIngestSig: '' }
}

export function loadMailBoard(): MailBoardPersistV1 {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyBoard()
    const j = JSON.parse(raw) as Partial<MailBoardPersistV1>
    if (j.v !== 1 || !Array.isArray(j.pending) || !Array.isArray(j.sent)) {
      return emptyBoard()
    }
    const pending = j.pending.filter(isMailCard)
    const sent = j.sent.filter(isMailCard)
    const lastIngestSig =
      typeof j.lastIngestSig === 'string' ? j.lastIngestSig : ''
    return { v: 1, pending, sent, lastIngestSig }
  } catch {
    return emptyBoard()
  }
}

function isMailCard(x: unknown): x is MailCardModel {
  if (x === null || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.createdAt === 'number' &&
    typeof o.subject === 'string' &&
    typeof o.content === 'string'
  )
}

export function saveMailBoard(state: Omit<MailBoardPersistV1, 'v'>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: 1, ...state }))
  } catch {
    /* ignore */
  }
}

export function clearMailBoardStorage(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

/**
 * 从工作台「存入看板」时调用：无需挂载 MailDashboard 也会写入待发送列表。
 */
export function appendPendingFromWorkspace(subject: string, content: string): void {
  const board = loadMailBoard()
  const sub = subject?.trim() ?? ''
  const body = content?.trim() ?? ''
  if (!sub && !body) return

  const sig = `${sub}\u0000${body}`
  if (sig === board.lastIngestSig) return

  const card: MailCardModel = {
    id: createMailId(),
    createdAt: Date.now(),
    subject: sub || '(无主题)',
    content: body || '(无正文)',
  }

  saveMailBoard({
    pending: [card, ...board.pending],
    sent: board.sent,
    lastIngestSig: sig,
  })
}
