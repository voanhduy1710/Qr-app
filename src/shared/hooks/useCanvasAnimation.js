import { useEffect } from 'react'

/**
 * Drives a full-size canvas: keeps its backing store matched to CSS size and
 * device pixel ratio, and runs `scene.frame(dt, t)` every animation frame.
 * `createScene(ctx)` returns `{ frame, resize?, destroy? }`.
 */
export function useCanvasAnimation(ref, createScene, deps) {
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    const scene = createScene(ctx)

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const { width, height } = canvas.getBoundingClientRect()
      if (!width || !height) return
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      scene.resize?.(width, height)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    let raf = 0
    let last = performance.now()
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      scene.frame(dt, now / 1000)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      scene.destroy?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
