// Tiny WebAudio music box. Everything is synthesised, so there are no audio
// files to ship or license. Browsers only allow sound after a user gesture,
// which is why the gift pages open behind a "tap to open" gate.

const MASTER_VOLUME = 0.55
const listeners = new Set()
let ctx = null
let master = null
let muted = false

export function unlockAudio() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    ctx = new AudioCtx()
    master = ctx.createGain()
    master.gain.value = muted ? 0 : MASTER_VOLUME
    // A short feedback echo gives the bare oscillators a music-box shimmer.
    const delay = ctx.createDelay()
    delay.delayTime.value = 0.27
    const feedback = ctx.createGain()
    feedback.gain.value = 0.28
    const wet = ctx.createGain()
    wet.gain.value = 0.35
    master.connect(ctx.destination)
    master.connect(delay)
    delay.connect(feedback)
    feedback.connect(delay)
    delay.connect(wet)
    wet.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume()
}

export const isMuted = () => muted

export function setMuted(value) {
  muted = value
  if (ctx) master.gain.setTargetAtTime(muted ? 0 : MASTER_VOLUME, ctx.currentTime, 0.05)
  listeners.forEach((fn) => fn())
}

export function subscribeMuted(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/**
 * Loops an audio file (e.g. an mp3) at `volume` (0..1), following the mute
 * switch. Call it from a user gesture so the browser allows playback.
 * Returns `{ stop, duck(factor) }`; `duck(0.25)` lowers it, `duck(1)` restores.
 */
export function playTrack(url, { volume = 0.6 } = {}) {
  const el = new Audio(url)
  el.loop = true
  el.preload = 'auto'
  let level = 1
  let fade = 0
  const target = () => (muted ? 0 : volume * level)
  const glide = () => {
    // Short fade so ducking and muting never click.
    cancelAnimationFrame(fade)
    const step = () => {
      const goal = target()
      const next = el.volume + (goal - el.volume) * 0.15
      el.volume = Math.abs(goal - next) < 0.005 ? goal : Math.min(1, Math.max(0, next))
      if (el.volume !== goal) fade = requestAnimationFrame(step)
    }
    step()
  }
  el.volume = 0
  el.play().catch(() => {})
  glide()
  const onMute = () => glide()
  listeners.add(onMute)
  return {
    stop() {
      listeners.delete(onMute)
      cancelAnimationFrame(fade)
      el.pause()
      el.src = ''
    },
    duck(factor) {
      level = factor
      glide()
    },
  }
}

const NOTE_INDEX = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 }

function frequency(note) {
  const [, name, octave] = note.match(/^([A-G]#?)(\d)$/)
  const midi = (Number(octave) + 1) * 12 + NOTE_INDEX[name]
  return 440 * 2 ** ((midi - 69) / 12)
}

function pluck(note, when, duration, volume) {
  const f = frequency(note)
  const env = ctx.createGain()
  env.gain.setValueAtTime(0.0001, when)
  env.gain.exponentialRampToValueAtTime(volume, when + 0.008)
  env.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(0.5, duration * 1.6))
  env.connect(master)
  for (const [type, mult, gain] of [
    ['sine', 1, 1],
    ['triangle', 2, 0.18],
    ['sine', 4, 0.06],
  ]) {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.value = f * mult
    g.gain.value = gain
    osc.connect(g)
    g.connect(env)
    osc.start(when)
    osc.stop(when + Math.max(0.6, duration * 1.7))
  }
}

/**
 * Plays `[note, beats]` pairs (note may be null for a rest).
 * Returns a stop function. With `loop`, the phrase repeats until stopped.
 */
export function playMelody(notes, { bpm = 100, volume = 0.22, loop = false, onEnd } = {}) {
  if (!ctx) return () => {}
  const beat = 60 / bpm
  const phraseBeats = notes.reduce((sum, [, beats]) => sum + beats, 0)
  let stopped = false
  let timer = 0

  const schedulePhrase = (start) => {
    let t = start
    for (const [note, beats] of notes) {
      if (note) pluck(note, t, beats * beat, volume)
      t += beats * beat
    }
    const msUntilEnd = (start + phraseBeats * beat - ctx.currentTime) * 1000
    timer = setTimeout(() => {
      if (stopped) return
      if (loop) schedulePhrase(ctx.currentTime + 0.05)
      else onEnd?.()
    }, Math.max(0, msUntilEnd - 60))
  }
  schedulePhrase(ctx.currentTime + 0.08)

  return () => {
    stopped = true
    clearTimeout(timer)
  }
}

// Traditional "Happy Birthday to You" (public domain), in C, 3/4.
export const HAPPY_BIRTHDAY = [
  ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
  ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
  ['G4', 0.75], ['G4', 0.25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 2],
  ['F5', 0.75], ['F5', 0.25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 3],
]

// Original gentle arpeggio loop (F – Am – B♭ – C) used as ambient background.
export const LULLABY = [
  ['F4', 0.5], ['A4', 0.5], ['C5', 0.5], ['F5', 0.5], ['C5', 0.5], ['A4', 0.5],
  ['E4', 0.5], ['A4', 0.5], ['C5', 0.5], ['E5', 0.5], ['C5', 0.5], ['A4', 0.5],
  ['D4', 0.5], ['F4', 0.5], ['A#4', 0.5], ['D5', 0.5], ['A#4', 0.5], ['F4', 0.5],
  ['C4', 0.5], ['E4', 0.5], ['G4', 0.5], ['C5', 0.5], ['E5', 0.5], ['G5', 0.5],
]
