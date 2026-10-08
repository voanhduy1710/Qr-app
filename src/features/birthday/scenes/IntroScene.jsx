import MatrixRain from '../../../shared/components/MatrixRain'
import ParticleText from '../../../shared/components/ParticleText'

export default function IntroScene({ words, className, onDone }) {
  return (
    <div className={className} style={{ padding: 0 }}>
      <MatrixRain chars="HAPPYBIRTHDAY" />
      <div className="intro-vignette" />
      <ParticleText words={words} onDone={onDone} />
      <button type="button" className="skip-btn" onClick={onDone}>
        Bỏ qua ›
      </button>
    </div>
  )
}
