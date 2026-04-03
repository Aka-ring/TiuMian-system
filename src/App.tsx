import { Navigate, Route, Routes } from 'react-router-dom'
import AppSkyBackdrop from './components/AppSkyBackdrop'
import ParticleBackground from './components/ParticleBackground'
import { WorkspaceProvider } from './context/WorkspaceContext'
import { MailDashboardPage } from './pages/MailDashboardPage'
import { SplashRoute } from './pages/SplashRoute'
import { WorkspacePage } from './pages/WorkspacePage'

function App() {
  return (
    <WorkspaceProvider>
      <div className="relative min-h-screen">
        <AppSkyBackdrop />
        <ParticleBackground mode="rain" intensity="subtle" />
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<SplashRoute />} />
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/mail" element={<MailDashboardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <footer className="relative z-10 border-t border-slate-200/50 bg-white/25 px-4 py-5 backdrop-blur-[2px]">
            <p className="mx-auto max-w-[1400px] text-center text-[12px] leading-relaxed text-slate-500">
              草稿与邮件看板数据保存在本机浏览器；清除站点数据或更换设备后需重新填写。
            </p>
          </footer>
        </div>
      </div>
    </WorkspaceProvider>
  )
}

export default App
