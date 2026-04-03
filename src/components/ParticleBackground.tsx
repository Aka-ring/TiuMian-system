import { useEffect, useMemo, useRef } from 'react'

type Mode = 'snow' | 'rain' | 'snow_rain'

export type ParticleIntensity = 'full' | 'subtle'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  a: number
}

export default function ParticleBackground({
  mode,
  intensity = 'full',
}: {
  mode?: Mode
  intensity?: ParticleIntensity
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafIdRef = useRef<number | null>(null)
  const lastTRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])

  const actualMode = mode ?? 'snow_rain'

  const particleConfig = useMemo(() => {
    const subtle = intensity === 'subtle'
    const scale = subtle ? 0.26 : 1

    if (actualMode === 'snow') {
      return {
        count: Math.max(24, Math.floor(120 * scale)),
        kind: 'snow' as const,
        subtle,
      }
    }
    if (actualMode === 'rain') {
      return {
        count: Math.max(12, Math.floor(90 * scale)),
        kind: 'rain' as const,
        subtle,
      }
    }
    return {
      count: Math.max(40, Math.floor(200 * scale)),
      kind: 'snow_rain' as const,
      subtle,
    }
  }, [actualMode, intensity])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))

    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const resetParticles = () => {
      const w = window.innerWidth
      const h = window.innerHeight

      const makeSnow = (n: number) =>
        Array.from({ length: n }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: -0.2 + Math.random() * 0.4,
          vy: 0.6 + Math.random() * 1.2,
          r: 0.7 + Math.random() * 2.2,
          a: 0.12 + Math.random() * 0.35,
        }))

      const makeRain = (n: number) =>
        Array.from({ length: n }, () => {
          const baseSpeed = 4 + Math.random() * 4 // 轻微加快，让流星划过更利落
          return {
            x: Math.random() * w,
            y: Math.random() * h,
            // 向右下：vx 始终为正；速度与 vy 相关
            vx: baseSpeed * (0.25 + Math.random() * 0.3),
            vy: baseSpeed * (0.9 + Math.random() * 0.6),
            r: 1.5 + Math.random() * 3.0,
            a: 0.4 + Math.random() * 0.4,
          }
        })

      if (particleConfig.kind === 'snow') {
        particlesRef.current = makeSnow(particleConfig.count)
      } else if (particleConfig.kind === 'rain') {
        particlesRef.current = makeRain(particleConfig.count)
      } else {
        // 混合模式：按比例生成
        particlesRef.current = [
          ...makeSnow(Math.floor(particleConfig.count * 0.55)),
          ...makeRain(Math.floor(particleConfig.count * 0.45)),
        ]
      }
    }

    const drawSnow = (p: Particle) => {
      ctx.beginPath()
      ctx.fillStyle = `rgba(148, 163, 184, ${p.a})` // slate-400-ish
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fill()
    }

    const drawRain = (p: Particle) => {
      // 粗一些的流星，拖影更短。
      // subtle：与浅色天蓝底配套 — 深蓝灰流星、弱光晕（启航台 / 工作台 / 看板）。
      // full：高对比亮靛流星（若单独用于其他页）。
      const len = p.r * (particleConfig.subtle ? 1.35 : 3)
      let alpha: number
      let strokeRgb: string
      let shadowColor: string
      let shadowBlur: number

      if (particleConfig.subtle) {
        // 细线、短尾；略降不透明度以免细线发糊
        alpha = Math.min(0.72, p.a * 0.52 + 0.18)
        strokeRgb = `23, 37, 84` // blue-950
        shadowColor = 'rgba(15, 23, 42, 0.12)'
        shadowBlur = 1.2
      } else {
        alpha = Math.min(0.95, p.a + 0.4)
        strokeRgb = `79, 70, 229` // indigo-600
        shadowColor = 'rgba(255,255,255,0.65)'
        shadowBlur = 6
      }

      ctx.strokeStyle = `rgba(${strokeRgb}, ${alpha})`
      ctx.shadowColor = shadowColor
      ctx.shadowBlur = shadowBlur
      ctx.lineWidth = Math.max(
        particleConfig.subtle ? 0.65 : 1.25,
        p.r * (particleConfig.subtle ? 0.1 : 0.26),
      )
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(
        p.x + p.vx * (particleConfig.subtle ? 1.05 : 2),
        p.y + len,
      )
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    const tick = (t: number) => {
      const dt = Math.min(40, t - (lastTRef.current || t)) / 16.67
      lastTRef.current = t

      const w = window.innerWidth
      const h = window.innerHeight

      // subtle：必须 clearRect，不能用半透明白铺满画布——否则会与「画布自身」混合，
      // 无法透出下方 DOM 渐变，整屏会被漂成一片奶白。
      // full：保留暗色雾化拖尾。
      if (particleConfig.subtle) {
        ctx.clearRect(0, 0, w, h)
      } else {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.08)'
        ctx.fillRect(0, 0, w, h)
      }

      ctx.globalCompositeOperation = 'source-over'

      for (const p of particlesRef.current) {
        // 雪和雨在本组件中共用粒子结构：用 vy 来分辨
        if (actualMode === 'rain' || (actualMode === 'snow_rain' && p.vy > 3.5)) {
          p.x += p.vx * dt
          p.y += p.vy * dt
          if (p.y > h + 40) {
            p.y = -40
            p.x = Math.random() * w
          }
          drawRain(p)
        } else {
          p.x += p.vx * dt
          p.y += p.vy * dt
          if (p.y > h + 40) {
            p.y = -40
            p.x = Math.random() * w
          }
          drawSnow(p)
        }
      }

      ctx.globalCompositeOperation = 'source-over'
      rafIdRef.current = window.requestAnimationFrame(tick)
    }

    resize()
    resetParticles()

    const onResize = () => {
      resize()
      resetParticles()
    }
    window.addEventListener('resize', onResize)

    rafIdRef.current = window.requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', onResize)
      if (rafIdRef.current) window.cancelAnimationFrame(rafIdRef.current)
    }
  }, [particleConfig, actualMode])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1]"
    />
  )
}

