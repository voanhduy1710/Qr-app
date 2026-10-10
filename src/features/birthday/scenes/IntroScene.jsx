import MatrixRain from '../../../shared/components/MatrixRain'
import ParticleText from '../../../shared/components/ParticleText'

// Countdown numbers keep the quick fixed pace; words rest 1s once formed so they can be read.
const restFor = (word) => (/^\d+$/.test(word.trim()) ? null : 1000)

export default function IntroScene({ words, className, onDone, onSkip = onDone }) {
  return (
    <div className={className} style={{ padding: 0 }}>
      <MatrixRain chars="HAPPYBIRTHDAY" />
      <div className="intro-vignette" />
      <ParticleText words={words} restMs={restFor} onDone={onDone} />
      <button type="button" className="skip-btn" onClick={onSkip}>
        Bỏ qua ›
      </button>
    </div>
  )
}
