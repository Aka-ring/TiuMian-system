import { useNavigate } from 'react-router-dom'
import SplashView from '../components/SplashView'

export function SplashRoute() {
  const navigate = useNavigate()
  return <SplashView onEnterWorkspace={() => navigate('/workspace')} />
}
