import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppSkyBackdrop from './components/AppSkyBackdrop'
import ParticleBackground from './components/ParticleBackground'
import { MotionPreference } from './components/MotionPreference'
import { WorkspaceProvider } from './context/WorkspaceContext'
import { MailDashboardPage } from './pages/MailDashboardPage'
import { SplashRoute } from './pages/SplashRoute'
import { WorkspacePage } from './pages/WorkspacePage'

function App() {
  const { pathname } = useLocation()
  const showFooter = pathname !== '/'

  return (
    <WorkspaceProvider>
      <MotionPreference />
      <div className="relative min-h-screen">
        <AppSkyBackdrop />
        <div className="app-particles-layer pointer-events-none fixed inset-0 z-0">
          <ParticleBackground mode="rain" intensity="subtle" />
        </div>
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<SplashRoute />} />
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/mail" element={<MailDashboardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          {showFooter ? (
            <footer className="relative z-10 border-t border-slate-200/50 bg-white/25 py-5 backdrop-blur-[2px]">
              <p className="ui-container text-center text-[12px] leading-relaxed text-slate-500">
                草稿与邮件看板数据保存在本机浏览器；清除站点数据或更换设备后需重新填写。
              </p>
            </footer>
          ) : null}
        </div>
      </div>
    </WorkspaceProvider>
  )
}

export default App
