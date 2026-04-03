import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'

const WORKSPACE_WELCOME_ONCE_KEY = 'uii:v1:workspace:welcome-once'
type WelcomeFxMode = 'auto' | 'force' | 'skip'

/**
 * 工作台首次入场情绪动效：
 * - 首次进入：两侧撒花 + 欢迎文案显示
 * - 后续进入：跳过动效，避免频繁打断
 */
export function useWorkspaceWelcomeFx(mode: WelcomeFxMode = 'auto') {
  const [showWelcome, setShowWelcome] = useState(true)

  useEffect(() => {
    if (mode === 'skip') {
      setShowWelcome(false)
      return
    }

    if (mode !== 'force') {
      try {
        const hasPlayed = localStorage.getItem(WORKSPACE_WELCOME_ONCE_KEY) === '1'
        if (hasPlayed) {
          setShowWelcome(false)
          return
        }
        localStorage.setItem(WORKSPACE_WELCOME_ONCE_KEY, '1')
      } catch {
        // 存储不可用时降级为每次播放，不影响主流程
      }
    } else {
      // 强制播放也写入一次标记，保持首次策略与路由行为一致。
      try {
        localStorage.setItem(WORKSPACE_WELCOME_ONCE_KEY, '1')
      } catch {
        /* ignore */
      }
    }

    const palette = ['#f43f5e', '#f59e0b', '#22c55e', '#0ea5e9', '#8b5cf6', '#ec4899']
    const common = {
      particleCount: 110,
      spread: 62,
      startVelocity: 48,
      ticks: 210,
      scalar: 1.1,
      zIndex: 1000,
      colors: palette,
    }

    confetti({ ...common, angle: 60, origin: { x: 0, y: 0.7 } })
    confetti({ ...common, angle: 120, origin: { x: 1, y: 0.7 } })

    // 与纸屑可见时长对齐：欢迎与撒花同起同落
    const welcomeTimer = window.setTimeout(() => setShowWelcome(false), 2200)

    return () => {
      window.clearTimeout(welcomeTimer)
    }
  }, [mode])

  return { showWelcome }
}
