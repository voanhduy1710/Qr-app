import { useCallback, useEffect, useRef, useState } from 'react'
import Fireworks from '../../shared/components/Fireworks'
import FloatingHearts from '../../shared/components/FloatingHearts'
import MuteButton from '../../shared/components/MuteButton'
import SceneGate from '../../shared/components/SceneGate'
import Starfield from '../../shared/components/Starfield'
import { useSceneMachine } from '../../shared/hooks/useSceneMachine'
import { HAPPY_BIRTHDAY, LULLABY, playMelody } from '../../shared/lib/audio'
import { defaults } from './content'
import { useGiftContent } from '../../shared/hooks/useGiftContent'
import { listPhotos } from '../../shared/lib/photos'
import CakeScene from './scenes/CakeScene'
import IntroScene from './scenes/IntroScene'
import LetterScene from './scenes/LetterScene'
import PhotoHeartScene from './scenes/PhotoHeartScene'
import SkyScene from './scenes/SkyScene'
import WishScene from './scenes/WishScene'
import './birthday.css'

const WARM_SCENES = ['cake', 'photos', 'wish', 'letter', 'sky']

export default function BirthdayPage() {
  const { scene, go, sceneClass } = useSceneMachine('gate')
  const { content, ready } = useGiftContent('birthday', defaults)
  const [photos, setPhotos] = useState([])
  const [wishSent, setWishSent] = useState(false)

  // Fetch early and warm the browser cache so photos are ready by the photo scene.
  useEffect(() => {
    let alive = true
    listPhotos('birthday')
      .then((list) => {
        if (!alive) return
        setPhotos(list)
        list.forEach((p) => {
          new Image().src = p.url
        })
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])
  const fireworks = useRef(null)
  const stopMusic = useRef(null)

  const playAmbient = useCallback(() => {
    stopMusic.current?.()
    stopMusic.current = playMelody(LULLABY, { bpm: 72, volume: 0.1, loop: true })
  }, [])

  useEffect(() => {
    document.title = content.pageTitle
  }, [content.pageTitle])

  useEffect(() => () => stopMusic.current?.(), [])

  const onBlown = useCallback(() => {
    stopMusic.current?.()
    stopMusic.current = playMelody(HAPPY_BIRTHDAY, { bpm: 118, volume: 0.24, onEnd: playAmbient })
  }, [playAmbient])

  const warm = WARM_SCENES.includes(scene)

  return (
    <div className="stage bday">
      <div className={`bday-bg${warm ? ' is-on' : ''}`} />
      <Starfield density={warm ? 1 : 0.6} shine={scene === 'sky' && wishSent} />
      {warm && <FloatingHearts variant="petal" color="#ffd9e2" count={12} />}

      {scene === 'gate' && ready && (
        <SceneGate
          className={sceneClass}
          title={content.gateTitle}
          onOpen={() => {
            playAmbient()
            go('intro')
          }}
        />
      )}
      {scene === 'intro' && <IntroScene className={sceneClass} words={content.introWords} onDone={() => go('cake')} />}
      {scene === 'cake' && (
        <CakeScene
          className={sceneClass}
          content={content}
          fireworksRef={fireworks}
          onBlown={onBlown}
          onNext={() => go(photos.length ? 'photos' : 'wish')}
        />
      )}
      {scene === 'photos' && (
        <PhotoHeartScene className={sceneClass} photos={photos} content={content} onNext={() => go('wish')} />
      )}
      {scene === 'wish' && (
        <WishScene
          className={sceneClass}
          content={content}
          onPick={() => go('letter')}
        />
      )}
      {scene === 'letter' && <LetterScene className={sceneClass} content={content} onFinish={() => go('sky')} />}
      {scene === 'sky' && (
        <SkyScene
          className={sceneClass}
          content={content}
          onSend={() => {
            setWishSent(true)
            playMelody([['C5', 0.25], ['E5', 0.25], ['G5', 0.25], ['C6', 1]], { bpm: 140, volume: 0.2 })
          }}
          onReplay={() => {
            setWishSent(false)
            go('intro')
          }}
        />
      )}

      {scene !== 'gate' && <MuteButton />}
      <Fireworks ref={fireworks} />
    </div>
  )
}
