import { useEffect, useState } from 'react'
import { togetherSince } from '../togetherSince'

const COUNT_MS = 2200

export default function CounterScene({ content, className, onNext }) {
  const target = togetherSince(content.startDate)
  const [shown, setShown] = useState(0)
  const [clock, setClock] = useState(() => new Date())

  // Count up to the real number of days, easing out at the end.
  useEffect(() => {
    let raf = 0
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / COUNT_MS)
      setShown(Math.round(target.days * (1 - (1 - p) ** 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target.days])

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const pad = (v) => String(v).padStart(2, '0')
  const parts = [
    target.years && `${target.years} năm`,
    target.months && `${target.months} tháng`,
    `${target.rest} ngày`,
  ].filter(Boolean)

  return (
    <div className={`${className} counter-scene`}>
      <p className="eyebrow">{content.counterEyebrow}</p>
      <p className="counter-days" aria-label={`${target.days} ngày`}>
        {shown.toLocaleString('vi-VN')}
      </p>
      <p className="counter-unit">ngày</p>
      <p className="counter-break">{parts.join(' · ')}</p>
      <p className="counter-clock" aria-hidden="true">
        {pad(clock.getHours())}:{pad(clock.getMinutes())}:{pad(clock.getSeconds())}
      </p>
      <p className="lead">{content.counterLead}</p>
      <button type="button" className="btn btn-love counter-next" onClick={onNext}>
        Mở thư
        <span aria-hidden="true">→</span>
      </button>
    </div>
  )
}
