import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWorkspace } from '../context/WorkspaceContext'
import { navFocusClass } from '../workspace/constants'
import type { UiStatus } from '../workspace/boot'

function WorkspaceStatusBadge({ status }: { status: UiStatus }) {
  const cfg =
    status === 'processing'
      ? {
          label: '生成中',
          className: 'bg-sky-100 text-sky-900 ring-sky-200/90',
        }
      : status === 'success'
        ? {
            label: '可编辑',
            className: 'bg-emerald-50 text-emerald-900 ring-emerald-200/90',
          }
        : {
            label: '待提交',
            className: 'bg-slate-100 text-slate-700 ring-slate-200/90',
          }
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${cfg.className}`}
    >
      {cfg.label}
    </span>
  )
}

export function WorkspacePage() {
  const {
    formData,
    handleFieldChange,
    handleSubmit,
    uiStatus,
    errorMessage,
    formErrors,
    hasErrors,
    previewSubject,
    previewContent,
    handlePreviewSubjectChange,
    handlePreviewContentChange,
    emailResult,
    handleStoreToDashboard,
    handleClearDraft,
  } = useWorkspace()

  const fieldClass =
    'w-full rounded-xl border-0 bg-white px-4 py-3 text-slate-900 shadow-sm ring-1 ring-slate-200/90 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none'

  return (
    <main className="relative z-10 min-h-screen p-6 md:p-10">
      <div className="mx-auto mb-6 flex w-full max-w-[1400px] flex-wrap items-end justify-between gap-4 border-b border-slate-200/70 pb-5">
        <div className="flex flex-wrap items-end gap-4 sm:gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-800/80">
              保研套磁
            </p>
            <h1 className="mt-1 text-lg font-semibold tracking-tight text-slate-900 md:text-xl">
              工作台
            </h1>
          </div>
          <Link
            to="/"
            className={`mb-0.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200/70 transition-colors hover:bg-white/90 ${navFocusClass}`}
          >
            返回首页
          </Link>
        </div>
        <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          <button
            type="button"
            disabled={uiStatus === 'processing'}
            onClick={handleClearDraft}
            className={`rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-white/70 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 ${navFocusClass}`}
          >
            清空草稿
          </button>
          <Link
            to="/mail"
            className={`rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/15 transition-all hover:bg-slate-800 ${navFocusClass}`}
          >
            邮件看板
          </Link>
        </nav>
      </div>

      <div className="mx-auto grid w-full max-w-[1400px] gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white/95 p-6 shadow-lg shadow-slate-200/50 ring-1 ring-slate-100 md:p-8">
          <header className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-5">
            <div className="min-w-0 space-y-1">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
                填写套磁信息
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-slate-500">
                补充导师与材料并提交后，系统在右侧生成邮件，你可继续润色再存入看板。
              </p>
            </div>
            <WorkspaceStatusBadge status={uiStatus} />
          </header>
          {errorMessage && (
            <div
              className="mb-5 flex gap-3 rounded-xl border border-rose-100/90 bg-rose-50/90 px-4 py-3 text-sm text-rose-900 ring-1 ring-rose-100/80"
              role="alert"
            >
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-500"
                aria-hidden
              />
              <p>{errorMessage}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                导师与院校
              </p>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">导师姓名</label>
                  <input
                    type="text"
                    value={formData.prof_name}
                    onChange={(event) => handleFieldChange('prof_name', event.target.value)}
                    required
                    className={fieldClass}
                  />
                  {formErrors.prof_name && (
                    <p className="text-xs text-rose-500">{formErrors.prof_name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">导师邮箱</label>
                  <input
                    type="email"
                    value={formData.prof_email}
                    onChange={(event) => handleFieldChange('prof_email', event.target.value)}
                    required
                    className={fieldClass}
                  />
                  {formErrors.prof_email && (
                    <p className="text-xs text-rose-500">{formErrors.prof_email}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">学校 / 机构</label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(event) => handleFieldChange('institution', event.target.value)}
                  required
                  className={fieldClass}
                />
                {formErrors.institution && (
                  <p className="text-xs text-rose-500">{formErrors.institution}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                匹配材料
              </p>
              <div className="space-y-4 rounded-2xl bg-slate-50/90 p-4 ring-1 ring-slate-100 md:p-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">匹配模式</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleFieldChange('match_type', 'url')}
                      className={`rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                        formData.match_type === 'url'
                          ? 'bg-slate-900 text-white shadow-sm hover:bg-slate-800'
                          : 'bg-white text-slate-700 shadow-sm ring-1 ring-slate-200/90 hover:bg-slate-100/80'
                      }`}
                    >
                      URL 模式
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('match_type', 'abstract')}
                      className={`rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                        formData.match_type === 'abstract'
                          ? 'bg-slate-900 text-white shadow-sm hover:bg-slate-800'
                          : 'bg-white text-slate-700 shadow-sm ring-1 ring-slate-200/90 hover:bg-slate-100/80'
                      }`}
                    >
                      摘要模式
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {formData.match_type === 'url' ? (
                    <>
                      <label className="text-sm font-medium text-slate-700">链接 URL</label>
                      <input
                        type="url"
                        value={formData.url}
                        onChange={(event) => handleFieldChange('url', event.target.value)}
                        placeholder="导师主页、实验室或论文页面链接"
                        required={formData.match_type === 'url'}
                        className={fieldClass}
                      />
                      {formErrors.url && (
                        <p className="text-xs text-rose-500">{formErrors.url}</p>
                      )}
                    </>
                  ) : (
                    <>
                      <label className="text-sm font-medium text-slate-700">摘要 (Abstract)</label>
                      <textarea
                        rows={5}
                        value={formData.zhaiyao}
                        onChange={(event) => handleFieldChange('zhaiyao', event.target.value)}
                        placeholder="粘贴论文摘要或导师方向简介，便于匹配生成语气"
                        required={formData.match_type === 'abstract'}
                        className={fieldClass}
                      />
                      {formErrors.zhaiyao && (
                        <p className="text-xs text-rose-500">{formErrors.zhaiyao}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                简历与补充说明
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">简历文本</label>
                  <textarea
                    rows={8}
                    value={formData.resume_text}
                    onChange={(event) => handleFieldChange('resume_text', event.target.value)}
                    required
                    placeholder="教育背景、项目与论文、技能与获奖等，尽量结构化粘贴"
                    className={`${fieldClass} min-h-[220px]`}
                  />
                  {formErrors.resume_text && (
                    <p className="text-xs text-rose-500">{formErrors.resume_text}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">补充输入（选填）</label>
                  <textarea
                    rows={4}
                    value={formData.extra_input}
                    onChange={(event) => handleFieldChange('extra_input', event.target.value)}
                    placeholder="个人侧重、表达偏好、需避开的表述等"
                    className={fieldClass}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={uiStatus === 'processing' || hasErrors}
              className={`w-full rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-slate-900/10 transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 ${navFocusClass}`}
            >
              {uiStatus === 'processing' ? '处理中…' : '提交并生成邮件'}
            </button>
          </form>
        </section>

        <section className="rounded-2xl bg-slate-900/90 p-6 text-slate-200 shadow-xl shadow-slate-900/30 ring-1 ring-slate-700/75 md:p-8">
          <header className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-600/40 pb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-400/90">
                输出
              </p>
              <h2 className="mt-1 text-base font-semibold tracking-tight text-slate-50">
                邮件预览
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                与左侧表单并列，生成完成后可直接改主题与正文
              </p>
            </div>
            {emailResult ? (
              <span className="rounded-full border border-emerald-500/35 bg-emerald-950/55 px-3 py-1 text-[11px] font-semibold text-emerald-200/95">
                可编辑
              </span>
            ) : (
              <span className="rounded-full border border-slate-600/60 bg-slate-800/50 px-3 py-1 text-[11px] font-medium text-slate-400">
                尚未生成
              </span>
            )}
          </header>

          {uiStatus === 'processing' && (
            <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-700/55">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-sky-400 via-sky-200 to-sky-500" />
            </div>
          )}

          <div className="flex h-[700px] flex-col gap-4 overflow-hidden rounded-xl border border-slate-600/40 bg-slate-800/42 p-5 font-mono text-sm shadow-inner shadow-slate-950/35 brightness-[1.03]">
            <p className="shrink-0 text-xs text-slate-500">{`// ${uiStatus === 'processing' ? 'generating' : uiStatus === 'success' ? 'ready' : 'idle'}`}</p>

            {uiStatus === 'processing' && !emailResult ? (
              <>
                <div className="min-h-0 shrink-0 space-y-2">
                  <div className="h-3 w-16 rounded bg-slate-800/80" />
                  <div className="h-9 w-full animate-pulse rounded-lg bg-slate-800/70" />
                </div>
                <div className="min-h-0 flex-1 space-y-2">
                  <div className="h-3 w-12 rounded bg-slate-800/80" />
                  <div className="h-full min-h-[320px] w-full animate-pulse rounded-lg bg-slate-800/70" />
                  <p className="mt-2 text-xs text-slate-500">
                    正在为你生成套磁邮件，请稍候……
                  </p>
                </div>
              </>
            ) : !emailResult ? (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-slate-600/45 bg-slate-900/25 px-6 py-14 text-center">
                <Sparkles
                  className="h-11 w-11 text-sky-400/45"
                  aria-hidden
                />
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-slate-300">
                    等待生成邮件
                  </p>
                  <p className="max-w-xs text-xs leading-relaxed text-slate-500">
                    在左侧填写信息并点击「提交并生成邮件」，完成后可在此预览与修改。
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="min-h-0 shrink-0 space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    主题
                  </label>
                  <input
                    type="text"
                    value={previewSubject}
                    onChange={(e) => handlePreviewSubjectChange(e.target.value)}
                    placeholder={emailResult ? '邮件主题' : '[等待生成]'}
                    readOnly={!emailResult}
                    className="w-full rounded-lg border-0 bg-slate-900/48 px-3 py-2.5 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500/80 focus:outline-none read-only:cursor-not-allowed read-only:opacity-70"
                  />
                </div>

                <div className="min-h-0 flex-1 space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    正文
                  </label>
                  <textarea
                    value={previewContent}
                    onChange={(e) => handlePreviewContentChange(e.target.value)}
                    placeholder={
                      emailResult
                        ? '邮件正文（可直接修改）'
                        : '尊敬的导师您好，\n\n提交生成后，正文将显示在此处。\n'
                    }
                    readOnly={!emailResult}
                    className="h-full min-h-[320px] w-full resize-y rounded-lg border-0 bg-slate-900/48 px-3 py-2.5 leading-relaxed text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500/80 focus:outline-none read-only:cursor-not-allowed read-only:opacity-70"
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-4">
            {emailResult ? (
              <motion.button
                type="button"
                onClick={handleStoreToDashboard}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                className="flex w-full touch-manipulation select-none items-center justify-center rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-slate-950 shadow-sm ring-1 ring-white/85 transition-colors duration-150 ease-out hover:bg-slate-100 hover:ring-white active:bg-slate-200 active:shadow-inner active:ring-slate-300/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                修改完成，存入邮件看板
              </motion.button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-dashed border-slate-600/50 bg-slate-800/50 px-5 py-3.5 text-sm font-semibold text-slate-500"
              >
                生成后可存入邮件看板
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
