import { AnimatePresence, motion } from 'framer-motion'

export function WorkspaceWelcomeOverlay({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[120]"
          initial={{ x: '-52vw', y: '16vh', opacity: 0, scale: 0.9 }}
          animate={{ x: '22vw', y: '18vh', opacity: 1, scale: 1 }}
          exit={{ x: '22vw', y: '18vh', opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
          transition={{ duration: 1.9, ease: [0.22, 0.8, 0.2, 1] }}
        >
          <div className="relative select-none text-[100px] font-black tracking-[0.08em] text-slate-800 drop-shadow-[0_2px_10px_rgba(15,23,42,0.2)] md:text-[180px]">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 text-sky-300/25 blur-[2px]"
            >
              欢迎
            </span>
            <span className="relative">欢迎</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
