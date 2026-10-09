import { useState } from 'react'
import FlipBook from '../../../shared/components/FlipBook'

export default function LetterScene({ content, className, onFinish }) {
  // The last page first ends with the closing; tapping it adds the "forgot something" P.S.
  const [ps, setPs] = useState(false)
  const total = content.letterPages.length + 2
  const [eyebrow, title, ...coverRest] = content.letterCover
  const pages = [
    <div key="cover" className="letter-cover">
      <p className="eyebrow letter-eyebrow">{eyebrow}</p>
      <h2 className="page-title">{title}</h2>
      {coverRest.map((line) => (
        <p key={line} className="letter-cover-note">
          {line}
        </p>
      ))}
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
    <div key="end" className={`letter-end${ps ? ' has-ps' : ''}`} onClick={() => setPs(true)}>
      <p className="page-text">{content.closing}</p>
      <p className="page-sign">— {content.from}</p>
      {ps ? (
        <div className="letter-ps">
          <p className="page-text">{content.postscript}</p>
          <p className="page-sign">— {content.from}</p>
          <button type="button" className="btn btn-primary letter-next" onClick={onFinish}>
            {content.letterNext}
          </button>
        </div>
      ) : (
        <p className="hint letter-ps-hint">Chạm vào trang…</p>
      )}
    </div>,
  ]

  return (
    <div className={`${className} letter-scene`}>
      <FlipBook pages={pages} />
    </div>
  )
}
