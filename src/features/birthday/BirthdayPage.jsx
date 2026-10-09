import { useCallback, useEffect, useRef, useState } from 'react'
import Fireworks from '../../shared/components/Fireworks'
import FloatingHearts from '../../shared/components/FloatingHearts'
import MuteButton from '../../shared/components/MuteButton'
import SceneGate from '../../shared/components/SceneGate'
import Starfield from '../../shared/components/Starfield'
import { useSceneMachine } from '../../shared/hooks/useSceneMachine'
import { HAPPY_BIRTHDAY, LULLABY, playMelody, playTrack } from '../../shared/lib/audio'
import { defaults } from './content'
import { useGiftContent } from '../../shared/hooks/useGiftContent'
import { listPhotos } from '../../shared/lib/photos'
import BalloonScene from './scenes/BalloonScene'
import CakeScene from './scenes/CakeScene'
import IntroScene from './scenes/IntroScene'
import LetterScene from './scenes/LetterScene'
import PhotoHeartScene from './scenes/PhotoHeartScene'
import ScratchScene from './scenes/ScratchScene'
import SkyScene from './scenes/SkyScene'
import WishScene from './scenes/WishScene'
import './birthday.css'

// Every scene in order; `?scene=` can start on any of them.
const SCENES = ['gate', 'intro', 'cake', 'photos', 'wish', 'balloons', 'letter', 'scratch', 'sky']
const WARM_SCENES = ['cake', 'photos', 'wish', 'balloons', 'letter', 'scratch', 'sky']

export default function BirthdayPage() {
  const { scene, go, sceneClass } = useSceneMachine('gate', SCENES)
  // `?ending=sleep|fireworks` opens the night sky straight on that ending (admin preview).
  const [previewEnding] = useState(() => new URLSearchParams(window.location.search).get('ending'))
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
  const track = useRef(null) // the admin's own looping music, when set

  const stopAll = useCallback(() => {
    stopMusic.current?.()
    stopMusic.current = null
    track.current?.stop()
    track.current = null
  }, [])

  // Music has two parts: the Happy Birthday jingle from the moment the gift is
  // opened, then the admin's own song (or the lullaby) from the letter onward.
  const playJingle = useCallback(() => {
    stopAll()
    // A short rest between repeats so the loop breathes.
    stopMusic.current = playMelody([...HAPPY_BIRTHDAY, [null, 3]], { bpm: 118, volume: 0.2, loop: true })
  }, [stopAll])

  const playLetterMusic = useCallback(() => {
    stopAll()
    if (content.musicUrl) track.current = playTrack(content.musicUrl, { volume: content.musicVolume / 100 })
    else stopMusic.current = playMelody(LULLABY, { bpm: 72, volume: 0.1, loop: true })
  }, [stopAll, content.musicUrl, content.musicVolume])

  useEffect(() => {
    document.title = content.pageTitle
  }, [content.pageTitle])

  useEffect(() => stopAll, [stopAll])

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
            playJingle()
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
          onPick={() => go('balloons')}
        />
      )}
      {scene === 'balloons' && (
        <BalloonScene
          className={sceneClass}
          content={content}
          onDone={() => {
            // Started from the tap itself, so the browser lets the mp3 play.
            playLetterMusic()
            go('letter')
          }}
        />
      )}
      {scene === 'letter' && <LetterScene className={sceneClass} content={content} onFinish={() => go('scratch')} />}
      {scene === 'scratch' && <ScratchScene className={sceneClass} content={content} onDone={() => go('sky')} />}
      {scene === 'sky' && (
        <SkyScene
          className={sceneClass}
          content={content}
          previewEnding={previewEnding}
          onSend={() => {
            setWishSent(true)
            playMelody([['C5', 0.25], ['E5', 0.25], ['G5', 0.25], ['C6', 1]], { bpm: 140, volume: 0.2 })
          }}
          onReplay={() => {
            setWishSent(false)
            playJingle()
            go('intro')
          }}
        />
      )}

      {scene !== 'gate' && <MuteButton />}
      <Fireworks ref={fireworks} />
    </div>
  )
}
