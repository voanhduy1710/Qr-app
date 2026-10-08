const DAY_MS = 24 * 60 * 60 * 1000

/** Whole days plus a years/months/days breakdown between `start` and `now`. */
export function togetherSince(startIso, now = new Date()) {
  const [y, m, d] = startIso.split('-').map(Number)
  const start = new Date(y, m - 1, d)
  const days = Math.max(0, Math.floor((now - start) / DAY_MS))

  let years = now.getFullYear() - start.getFullYear()
  let months = now.getMonth() - start.getMonth()
  let rest = now.getDate() - start.getDate()
  if (rest < 0) {
    months -= 1
    rest += new Date(now.getFullYear(), now.getMonth(), 0).getDate()
  }
  if (months < 0) {
    years -= 1
    months += 12
  }
  if (years < 0) return { days: 0, years: 0, months: 0, rest: 0 }
  return { days, years, months, rest }
}
