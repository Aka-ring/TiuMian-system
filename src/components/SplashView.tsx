import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plane, Sparkles } from 'lucide-react'

type SplashViewProps = {
  /** 起飞动效结束后，进入工作台的回调 */
  onEnterWorkspace: () => void
}

export default function SplashView({ onEnterWorkspace }: SplashViewProps) {
  const [isTakingOff, setIsTakingOff] = useState(false)
  const [subtitleVisible, setSubtitleVisible] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setSubtitleVisible(true), 480)
    return () => window.clearTimeout(timer)
  }, [])

  const handleTakeOff = () => {
    if (isTakingOff) return
    setIsTakingOff(true)
    window.setTimeout(() => {
      onEnterWorkspace()
    }, 800)
  }

  const containerVariants = {
    initial: { opacity: 1, scale: 1 },
    takingOff: {
      opacity: 0,
      scale: 1.04,
      transition: { duration: 0.8 },
    },
  }

  const planeVariants = {
    idle: { x: 0, y: 0, rotate: 0, opacity: 1 },
    takingOff: {
      x: 200,
      y: -120,
      rotate: 24,
      opacity: 0,
      transition: { duration: 0.72 },
    },
  }

  return (
    <AnimatePresence>
      <motion.div
        className="relative z-10 flex min-h-screen flex-col overflow-hidden px-4 py-10 sm:px-6 md:py-14"
        variants={containerVariants}
        initial="initial"
        animate={isTakingOff ? 'takingOff' : 'initial'}
        exit="takingOff"
      >
          <header className="mx-auto flex w-full max-w-[1400px] items-end justify-between gap-6 border-b border-slate-200/70 pb-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-800/80">
                保研套磁
              </p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900 md:text-xl">
                启航台
              </p>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium text-slate-400">Research outreach</p>
              <p className="text-[11px] text-slate-400">minimal · focused</p>
            </div>
          </header>

          <div className="flex flex-1 items-center justify-center py-8 md:py-12">
            <motion.div
              className="relative w-full max-w-[min(40rem,100%)] overflow-hidden rounded-2xl bg-white/95 p-8 shadow-lg shadow-slate-200/45 ring-1 ring-slate-100 md:p-11"
              initial={{ y: 28, opacity: 0, scale: 0.985 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.58, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400/90 via-sky-500/70 to-indigo-500/50"
              />

              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold tracking-wide text-white shadow-sm ring-1 ring-slate-800/60">
                  <Sparkles className="h-3.5 w-3.5 text-sky-300" />
                  仪式感入口
                </span>
                <span className="text-xs font-medium text-slate-400">Step 01 · 启程</span>
              </div>

              <div className="space-y-5">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-[2.35rem] md:leading-tight">
                  保研智能套磁系统
                </h1>
                <p className="max-w-lg text-sm leading-relaxed text-slate-600 md:text-base">
                  从导师信息与个人材料出发，生成可读、可改、可发出的套磁邮件；与同名的
                  <span className="whitespace-nowrap">「工作台」</span>
                  、
                  <span className="whitespace-nowrap">「邮件看板」</span>
                  一脉相承的视觉语言，专注每一次投递。
                </p>
                <motion.p
                  className="max-w-lg border-l-2 border-sky-200/90 pl-4 text-sm font-medium leading-relaxed text-slate-700 md:text-base"
                  initial={{ opacity: 0, y: 8 }}
                  animate={
                    subtitleVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }
                  }
                  transition={{ duration: 0.55 }}
                >
                  准备就绪后，点击启程进入工作台。愿你的努力，被对的人看见。
                </motion.p>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <motion.button
                  type="button"
                  disabled={isTakingOff}
                  onClick={handleTakeOff}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-slate-900/15 ring-1 ring-slate-800/50 transition-all hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
                  whileTap={!isTakingOff ? { scale: 0.98 } : {}}
                >
                  <span>启程 · 进入工作台</span>
                  <motion.span
                    variants={planeVariants}
                    animate={isTakingOff ? 'takingOff' : 'idle'}
                    className="relative inline-flex"
                  >
                    <Plane className="h-4 w-4" aria-hidden />
                  </motion.span>
                </motion.button>

                <span className="text-xs text-slate-400 sm:ml-1">
                  动效结束将自动跳转
                </span>
              </div>
            </motion.div>
          </div>
      </motion.div>
    </AnimatePresence>
  )
}
