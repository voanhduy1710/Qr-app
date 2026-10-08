import { useCallback, useEffect, useRef, useState } from 'react'

const LEAVE_MS = 600

/** Tracks the current scene and plays the shared leave animation before switching. */
export function useSceneMachine(initial) {
  const [scene, setScene] = useState(initial)
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
