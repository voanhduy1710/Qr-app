import { useCallback, useEffect, useRef, useState } from 'react'
import Confetti from '../../shared/components/Confetti'
import FlipBook from '../../shared/components/FlipBook'
import FloatingHearts from '../../shared/components/FloatingHearts'
import MatrixRain from '../../shared/components/MatrixRain'
import MuteButton from '../../shared/components/MuteButton'
import ParticleText, { HEART } from '../../shared/components/ParticleText'
import SceneGate from '../../shared/components/SceneGate'
import Starfield from '../../shared/components/Starfield'
import { useSceneMachine } from '../../shared/hooks/useSceneMachine'
import { LULLABY, playMelody } from '../../shared/lib/audio'
import { defaults } from './content'
import { useGiftContent } from '../../shared/hooks/useGiftContent'
import CounterScene from './scenes/CounterScene'
import './anniversary.css'

const LOVE_RGB = '255, 92, 130'

export default function AnniversaryPage() {
  const { scene, go, sceneClass } = useSceneMachine('gate')
  const { content, ready } = useGiftContent('anniversary', defaults)
  const [finaleReady, setFinaleReady] = useState(false)
  const confetti = useRef(null)
  const stopMusic = useRef(null)

  useEffect(() => {
    document.title = content.pageTitle
  }, [content.pageTitle])

  useEffect(() => () => stopMusic.current?.(), [])

  const startMusic = useCallback(() => {
    stopMusic.current?.()
    stopMusic.current = playMelody(LULLABY, { bpm: 66, volume: 0.13, loop: true })
  }, [])

  const total = content.letterPages.length + 2
  const pages = [
    <div key="cover" className="letter-cover">
      <p className="eyebrow love-eyebrow">{content.letterEyebrow}</p>
      <h2 className="page-title">{content.letterTitle}</h2>
      <svg className="letter-seal" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M16 29 3.6 16.6a7.4 7.4 0 0 1 10.5-10.5L16 8l1.9-1.9a7.4 7.4 0 0 1 10.5 10.5Z" />
      </svg>
    </div>,
    ...content.letterPages.map((text, i) => (
      <div key={i}>
        <p className="page-text">{text}</p>
        <span className="page-num">
          {i + 2} / {total}
        </span>
      </div>
    )),
    <div key="end" className="letter-end">
      <p className="page-sign">— {content.from}</p>
      <button
        type="button"
        className="btn btn-love"
        onClick={() => {
          setFinaleReady(false)
          go('finale')
        }}
      >
        Một điều cuối cùng
        <span aria-hidden="true">♥</span>
      </button>
    </div>,
  ]

  const night = scene === 'counter' || scene === 'letter' || scene === 'finale'

  return (
    <div className="stage love">
      <div className={`love-bg${night ? ' is-on' : ''}`} />
      <Starfield density={0.8} tint="255, 220, 230" />
      {night && <FloatingHearts count={16} color="#ff5c82" />}

      {scene === 'gate' && ready && (
        <SceneGate
          className={sceneClass}
          title={content.gateTitle}
          onOpen={() => {
            startMusic()
            go('intro')
          }}
        />
      )}

      {scene === 'intro' && (
        <div className={sceneClass} style={{ padding: 0 }}>
          <MatrixRain chars="ILOVEYOU" color="225, 29, 72" />
          <div className="intro-vignette" />
          <ParticleText words={content.introWords} color={LOVE_RGB} holdMs={1700} onDone={() => go('counter')} />
          <button type="button" className="skip-btn" onClick={() => go('counter')}>
            Bỏ qua ›
          </button>
        </div>
      )}

      {scene === 'counter' && <CounterScene className={sceneClass} content={content} onNext={() => go('letter')} />}

      {scene === 'letter' && (
        <div className={`${sceneClass} love-letter`}>
          <FlipBook pages={pages} />
        </div>
      )}

      {scene === 'finale' && (
        <div className={`${sceneClass} finale-scene`} style={{ padding: 0 }}>
          <ParticleText
            words={[HEART]}
            color={LOVE_RGB}
            holdMs={900}
            scale={0.9}
            onDone={() => {
              setFinaleReady(true)
              confetti.current?.burst(window.innerWidth / 2, window.innerHeight * 0.45, 120)
            }}
          />
          <div className={`finale-copy${finaleReady ? ' is-ready' : ''}`}>
            <p className="script-title finale-text">{content.finale}</p>
            <p className="page-sign finale-sign">— {content.from}</p>
            <button type="button" className="btn" onClick={() => go('intro')}>
              Xem lại từ đầu
            </button>
          </div>
        </div>
      )}

      {scene !== 'gate' && <MuteButton />}
      <Confetti ref={confetti} />
    </div>
  )
}
