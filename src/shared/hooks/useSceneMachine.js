import { useCallback, useEffect, useRef, useState } from 'react'

const LEAVE_MS = 600

/**
 * Tracks the current scene and plays the shared leave animation before switching.
 * `?scene=<id>` in the URL starts on that scene instead, when it is one of
 * `scenes` (the admin preview uses this to jump straight to a section).
 */
export function useSceneMachine(initial, scenes = []) {
  const [scene, setScene] = useState(() => {
    const asked = new URLSearchParams(window.location.search).get('scene')
    return scenes.includes(asked) ? asked : initial
  })
  const [leaving, setLeaving] = useState(false)
  const timer = useRef(0)

  const go = useCallback((next) => {
    clearTimeout(timer.current)
    setLeaving(true)
    timer.current = setTimeout(() => {
      setScene(next)
      setLeaving(false)
    }, LEAVE_MS)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  return { scene, leaving, go, sceneClass: leaving ? 'scene is-leaving' : 'scene' }
}
