import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import {
  ArrowRight,
  ClipboardCopy,
  Inbox,
  MailCheck,
  SendHorizontal,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  buildGmailComposeUrl,
  buildMailtoHref,
  buildQQMailComposeUrl,
  copyTextToClipboard,
  formatFullEmailForCopy,
} from '../lib/mailComposeLinks'
import { clearMailBoardStorage, loadMailBoard, saveMailBoard } from '../lib/mailBoardStorage'
import type { MailCardModel } from '../types'

export type GeneratedEmailInput = {
  subject: string
  content: string
}

type MailDashboardProps = {
  /** 最新生成的邮件；传入时自动加入待发送列表 */
  generatedEmail: GeneratedEmailInput | null
  /** 导师邮箱，用于 mailto 收件人 */
  prof_email: string
}

function createMailId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `mail_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

type MailSection = 'pending' | 'sent'

type DetailModalState = {
  item: MailCardModel
  section: MailSection
}

const emptyFocusLinkClass =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white'

type MailProvider = '163' | 'qq' | 'google'

/** 网页写信入口：文案用产品常用称谓；三色浅底区分渠道，风格与看板一致 */
const MAIL_COMPOSE_CHANNELS: {
  provider: MailProvider
  label: string
  activeClass: string
  disabledClass: string
}[] = [
  {
    provider: '163',
    label: '网易邮箱',
    activeClass:
      'bg-sky-50 text-sky-900 ring-1 ring-sky-200/85 shadow-sm hover:bg-sky-100/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
    disabledClass:
      'cursor-not-allowed bg-sky-50/50 text-sky-300 ring-1 ring-sky-100/70',
  },
  {
    provider: 'qq',
    label: 'QQ 邮箱',
    activeClass:
      'bg-violet-50 text-violet-900 ring-1 ring-violet-200/80 shadow-sm hover:bg-violet-100/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/45',
    disabledClass:
      'cursor-not-allowed bg-violet-50/50 text-violet-300 ring-1 ring-violet-100/70',
  },
  {
    provider: 'google',
    label: 'Gmail',
    activeClass:
      'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/85 shadow-sm hover:bg-emerald-100/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/45',
    disabledClass:
      'cursor-not-allowed bg-emerald-50/50 text-emerald-300 ring-1 ring-emerald-100/70',
  },
]

export default function MailDashboard({ generatedEmail, prof_email }: MailDashboardProps) {
  const boardBoot = useRef(loadMailBoard())
  const [pendingMails, setPendingMails] = useState<MailCardModel[]>(
    () => boardBoot.current.pending,
  )
  const [sentMails, setSentMails] = useState<MailCardModel[]>(() => boardBoot.current.sent)
  const [exitingId, setExitingId] = useState<string | null>(null)
  const [detailModal, setDetailModal] = useState<DetailModalState | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const lastIngestSig = useRef<string>(boardBoot.current.lastIngestSig)

  useEffect(() => {
    saveMailBoard({
      pending: pendingMails,
      sent: sentMails,
      lastIngestSig: lastIngestSig.current,
    })
  }, [pendingMails, sentMails])

  const openDetailModal = (item: MailCardModel, section: MailSection) => {
    setDetailModal({ item, section })
  }

  const closeDetailModal = () => {
    setDetailModal(null)
  }

  const handleCardDoubleClick = (
    item: MailCardModel,
    section: MailSection,
    event: MouseEvent<HTMLElement>,
  ) => {
    if ((event.target as HTMLElement).closest('button')) {
      return
    }
    openDetailModal(item, section)
  }

  useEffect(() => {
    if (!detailModal) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDetailModal()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [detailModal])

  useEffect(() => {
    if (!generatedEmail) return
    const subject = generatedEmail.subject?.trim() ?? ''
    const content = generatedEmail.content?.trim() ?? ''
    if (!subject && !content) return

    const sig = `${subject}\u0000${content}`
    if (sig === lastIngestSig.current) return
    lastIngestSig.current = sig

    const card: MailCardModel = {
      id: createMailId(),
      createdAt: Date.now(),
      subject: subject || '(无主题)',
      content: content || '(无正文)',
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- 将 props 快照并入本地看板列表
    setPendingMails((prev) => [card, ...prev])
  }, [generatedEmail])

  const openCompose = (provider: MailProvider, subject: string, content: string) => {
    const to = prof_email.trim()
    if (!to) return
    if (provider === 'google') {
      window.open(buildGmailComposeUrl(to, subject, content), '_blank', 'noopener,noreferrer')
      return
    }
    if (provider === 'qq') {
      window.open(buildQQMailComposeUrl(to, subject, content), '_blank', 'noopener,noreferrer')
      return
    }
    window.open(buildMailtoHref(to, subject, content), '_self', 'noopener,noreferrer')
  }

  const copyFullEmail = async (item: MailCardModel) => {
    const text = formatFullEmailForCopy(prof_email, item.subject, item.content)
    const ok = await copyTextToClipboard(text)
    if (ok) {
      setCopiedId(item.id)
      window.setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const moveToSent = (item: MailCardModel) => {
    setDetailModal((prev) => (prev?.item.id === item.id ? null : prev))
    setExitingId(item.id)
    window.setTimeout(() => {
      setPendingMails((prev) => prev.filter((m) => m.id !== item.id))
      setSentMails((prev) => [{ ...item, createdAt: Date.now() }, ...prev])
      setExitingId(null)
    }, 280)
  }

  const removeMail = (item: MailCardModel, section: MailSection) => {
    const hint = section === 'pending' ? '待发送' : '已发送'
    if (!window.confirm(`确定删除该封${hint}邮件？此操作不可撤销。`)) return
    if (section === 'pending') {
      setPendingMails((prev) => prev.filter((m) => m.id !== item.id))
    } else {
      setSentMails((prev) => prev.filter((m) => m.id !== item.id))
    }
    setDetailModal((prev) => (prev?.item.id === item.id ? null : prev))
    setCopiedId((prev) => (prev === item.id ? null : prev))
  }

  const handleClearBoard = () => {
    if (pendingMails.length === 0 && sentMails.length === 0) return
    if (
      !window.confirm(
        '确定清空待发送与已发送的全部记录？本地已保存的看板数据将被删除，此操作不可撤销。',
      )
    ) {
      return
    }
    clearMailBoardStorage()
    lastIngestSig.current = ''
    setPendingMails([])
    setSentMails([])
    setDetailModal(null)
    setExitingId(null)
  }

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleString('zh-CN', {
      hour12: false,
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })

  const boardIsEmpty = pendingMails.length === 0 && sentMails.length === 0

  return (
    <div className="font-sans">
      <div className="sticky top-0 z-30 mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200/50 bg-sky-50/82 px-4 py-3 shadow-md shadow-slate-300/20 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between md:px-5 md:py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100/95 px-3 py-1.5 text-xs font-semibold text-sky-950 ring-1 ring-sky-200/80">
            <SendHorizontal className="h-3.5 w-3.5 text-sky-700" />
            待发送 · {pendingMails.length}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50/95 px-3 py-1.5 text-xs font-semibold text-emerald-950 ring-1 ring-emerald-200/80">
            <MailCheck className="h-3.5 w-3.5 text-emerald-700" />
            已发送 · {sentMails.length}
          </span>
        </div>
        <button
          type="button"
          disabled={boardIsEmpty}
          onClick={handleClearBoard}
          className={`shrink-0 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-500 transition-colors hover:bg-white/80 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 sm:text-right ${emptyFocusLinkClass}`}
        >
          清空看板数据
        </button>
      </div>
      <div className="space-y-10">
        <section
          className="rounded-2xl bg-white/70 p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-100 transition-colors"
          aria-labelledby="pending-heading"
        >
          <div className="mb-6 flex flex-col gap-1 border-b border-slate-100 pb-5">
            <h2
              id="pending-heading"
              className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900"
            >
              <SendHorizontal className="h-4 w-4 animate-[float_3s_ease-in-out_infinite] text-sky-600" />
              待发送
            </h2>
            <p className="text-sm text-slate-500">选择邮箱客户端发送，或标记为已发送便于跟进</p>
          </div>

          {pendingMails.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200/80 bg-white/75 px-6 py-14 text-center">
              <Inbox
                className="mb-4 h-11 w-11 text-slate-300"
                strokeWidth={1.25}
                aria-hidden
              />
              <p className="text-sm font-medium text-slate-700">暂无待处理邮件</p>
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-slate-500">
                在工作台生成套磁邮件后，点击「存入邮件看板」即可在此发送与跟进。
              </p>
              <Link
                to="/workspace"
                className={`mt-6 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 ${emptyFocusLinkClass}`}
              >
                前往工作台
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {pendingMails.map((item, index) => (
                <article
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  title="双击在屏幕中央查看全文"
                  onDoubleClick={(e) => handleCardDoubleClick(item, 'pending', e)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openDetailModal(item, 'pending')
                    }
                  }}
                  className={`group relative flex cursor-pointer flex-col rounded-2xl bg-white p-5 shadow-md ring-1 ring-slate-200/70 shadow-slate-200/70 transition-all duration-300 ease-out select-none focus:outline-none focus:ring-2 focus:ring-sky-500/50 hover:-translate-y-1 hover:shadow-lg animate-[cardIn_0.42s_ease-out_both] ${
                    exitingId === item.id
                      ? 'scale-95 opacity-40 shadow-sm shadow-slate-200/80'
                      : 'scale-100 opacity-100'
                  }`}
                  style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
                >
                  <span className="pointer-events-none absolute -top-2 left-4 rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100">
                    双击查看全文
                  </span>
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 font-semibold text-slate-900">{item.subject}</h3>
                    <time
                      className="shrink-0 text-xs text-slate-400"
                      dateTime={new Date(item.createdAt).toISOString()}
                    >
                      {formatTime(item.createdAt)}
                    </time>
                  </div>
                  <p className="mb-5 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
                    {item.content}
                  </p>

                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {MAIL_COMPOSE_CHANNELS.map(({ provider, label, activeClass }) => (
                      <button
                        key={provider}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          openCompose(provider, item.subject, item.content)
                        }}
                        disabled={!prof_email.trim()}
                        className={`rounded-xl px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-55 ${activeClass}`}
                      >
                        {label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        void copyFullEmail(item)
                      }}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <ClipboardCopy className="h-3.5 w-3.5" aria-hidden />
                      {copiedId === item.id ? '已复制' : '复制全文'}
                    </button>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => moveToSent(item)}
                      className="group/cta relative overflow-hidden rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                    >
                      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_0%,rgba(148,163,184,0.22)_45%,transparent_100%)] transition-transform duration-500 group-hover/cta:translate-x-full" />
                      <span className="relative z-10">已发送，跟进中</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeMail(item, 'pending')
                      }}
                      className="inline-flex items-center justify-center gap-1 rounded-xl border border-rose-200/90 bg-rose-50/60 py-2.5 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100/80"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      删除
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section
          className="rounded-2xl bg-white/70 p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-100 transition-colors"
          aria-labelledby="sent-heading"
        >
          <div className="mb-6 flex flex-col gap-1 border-b border-slate-100 pb-5">
            <h2
              id="sent-heading"
              className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900"
            >
              <MailCheck className="h-4 w-4 animate-[float_3s_ease-in-out_infinite] text-emerald-600" />
              已发送
            </h2>
            <p className="text-sm text-slate-500">历史记录，仅查阅</p>
          </div>

          {sentMails.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200/80 bg-white/75 px-6 py-12 text-center">
              <MailCheck
                className="mb-3 h-10 w-10 text-emerald-200"
                strokeWidth={1.25}
                aria-hidden
              />
              <p className="text-sm font-medium text-slate-700">暂无已发送记录</p>
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-slate-500">
                在待发送区通过「已发送，跟进中」归档后，将在此留存查阅。
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {sentMails.map((item, index) => (
                <article
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  title="双击在屏幕中央查看全文"
                  onDoubleClick={(e) => handleCardDoubleClick(item, 'sent', e)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openDetailModal(item, 'sent')
                    }
                  }}
                  className="group relative flex cursor-pointer flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60 shadow-slate-200/80 transition-all duration-300 ease-out select-none focus:outline-none focus:ring-2 focus:ring-sky-500/50 hover:-translate-y-1 hover:shadow-md animate-[cardIn_0.42s_ease-out_both]"
                  style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
                >
                  <span className="pointer-events-none absolute -top-2 left-4 rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100">
                    双击查看记录
                  </span>
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 font-semibold text-slate-900">{item.subject}</h3>
                    <time
                      className="shrink-0 text-xs text-slate-400"
                      dateTime={new Date(item.createdAt).toISOString()}
                    >
                      {formatTime(item.createdAt)}
                    </time>
                  </div>
                  <p className="mb-5 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
                    {item.content}
                  </p>

                  <div className="mt-auto">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeMail(item, 'sent')
                      }}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-200/90 bg-rose-50/60 px-3 py-2.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100/80"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      删除
                    </button>
                  </div>
                  <p className="mt-3 text-center text-xs font-medium text-slate-400">已读</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {detailModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="presentation"
        >
          <button
            type="button"
            aria-label="关闭预览"
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px] transition-opacity"
            onClick={closeDetailModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mail-detail-title"
            className="relative z-10 flex max-h-[min(88vh,900px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-300/70 ring-1 ring-slate-200/80 transition-shadow duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {detailModal.section === 'pending' ? '待发送' : '已发送'}
                </p>
                <h2
                  id="mail-detail-title"
                  className="mt-1 inline-flex items-center gap-2 break-words text-lg font-semibold leading-snug text-slate-900"
                >
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  {detailModal.item.subject}
                </h2>
                <time
                  className="mt-2 block text-xs text-slate-400"
                  dateTime={new Date(detailModal.item.createdAt).toISOString()}
                >
                  {formatTime(detailModal.item.createdAt)}
                </time>
              </div>
              <button
                type="button"
                onClick={closeDetailModal}
                className="shrink-0 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="关闭"
              >
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-slate-700">
                {detailModal.item.content}
              </pre>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-6 py-4">
              {detailModal.section === 'pending' && (
                <>
                {MAIL_COMPOSE_CHANNELS.map(({ provider, label, activeClass }) => (
                  <button
                    key={provider}
                    type="button"
                    onClick={() =>
                      openCompose(provider, detailModal.item.subject, detailModal.item.content)
                    }
                    disabled={!prof_email.trim()}
                    className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-55 ${activeClass}`}
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => void copyFullEmail(detailModal.item)}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <ClipboardCopy className="h-3.5 w-3.5" aria-hidden />
                  {copiedId === detailModal.item.id ? '已复制' : '复制全文'}
                </button>
                </>
              )}
              <button
                type="button"
                onClick={() => removeMail(detailModal.item, detailModal.section)}
                className="ml-auto inline-flex items-center gap-1 rounded-xl border border-rose-200/90 bg-rose-50/60 px-4 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100/80"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                删除邮件
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
