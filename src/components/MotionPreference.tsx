import { useEffect } from 'react'

/**
 * 同步系统「减少动态效果」偏好到 <html data-motion>，供 CSS 与后续组件使用。
 */
export function MotionPreference() {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => {
      document.documentElement.dataset.motion = mq.matches ? 'reduce' : 'normal'
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])
  return null
}
