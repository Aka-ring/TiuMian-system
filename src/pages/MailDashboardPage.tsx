import { Link } from 'react-router-dom'
import MailDashboard from '../components/MailDashboard'
import { useWorkspace } from '../context/WorkspaceContext'
import { navFocusClass } from '../workspace/constants'

export function MailDashboardPage() {
  const { queuedForDashboard, formData } = useWorkspace()

  return (
    <div className="ui-page">
      <div className="ui-container mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/70 pb-5">
        <div className="flex flex-wrap items-end gap-4 sm:gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-800/80">
              保研套磁
            </p>
            <h1 className="mt-1 text-lg font-semibold tracking-tight text-slate-900 md:text-xl">
              邮件看板
            </h1>
          </div>
          <Link
            to="/"
            className={`mb-0.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200/70 transition-colors hover:bg-white/90 ${navFocusClass}`}
          >
            首页
          </Link>
        </div>
        <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          <Link
            to="/workspace"
            className={`rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/15 transition-all hover:bg-slate-800 ${navFocusClass}`}
          >
            工作台
          </Link>
        </nav>
      </div>
      <div className="ui-container">
        <MailDashboard
          generatedEmail={queuedForDashboard}
          prof_email={formData.prof_email}
        />
      </div>
    </div>
  )
}
