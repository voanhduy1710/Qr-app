import { OCCASIONS } from '../../config/occasions'
import * as anniversary from '../anniversary/content'
import * as birthday from '../birthday/content'

const CONTENT = { birthday, anniversary }

// Sections the Preview tool can jump to; `query` is added to the gift page's URL.
const SCENES = {
  birthday: [
    { id: 'gate', label: 'Tap to open', query: { scene: 'gate' } },
    { id: 'intro', label: 'Countdown', query: { scene: 'intro' } },
    { id: 'cake', label: 'Cake', query: { scene: 'cake' } },
    { id: 'photos', label: 'Photo heart', query: { scene: 'photos' } },
    { id: 'wish', label: 'Wishes', query: { scene: 'wish' } },
    { id: 'balloons', label: 'Balloon pop', query: { scene: 'balloons' } },
    { id: 'letter', label: 'Letter', query: { scene: 'letter' } },
    { id: 'scratch', label: 'Scratch vouchers', query: { scene: 'scratch' } },
    { id: 'sky', label: 'Night sky', query: { scene: 'sky' } },
    { id: 'sky-sleep', label: 'Night sky: go to sleep', query: { scene: 'sky', ending: 'sleep' } },
    { id: 'sky-fireworks', label: 'Night sky: fireworks', query: { scene: 'sky', ending: 'fireworks' } },
  ],
  anniversary: [
    { id: 'gate', label: 'Tap to open', query: { scene: 'gate' } },
    { id: 'intro', label: 'Intro', query: { scene: 'intro' } },
    { id: 'counter', label: 'Together counter', query: { scene: 'counter' } },
    { id: 'letter', label: 'Letter', query: { scene: 'letter' } },
    { id: 'finale', label: 'Finale', query: { scene: 'finale' } },
  ],
}

// Which management tools each gift page has. Only the birthday page shows photos.
const PHOTOS = new Set(['birthday'])

/** Everything the dashboard knows about each gift page. */
export const GIFTS = OCCASIONS.map((o) => ({
  ...o,
  // The dashboard is in English; `label` stays the Vietnamese name.
  name: o.hint,
  defaults: CONTENT[o.id].defaults,
  schema: CONTENT[o.id].schema,
  hasPhotos: PHOTOS.has(o.id),
  scenes: SCENES[o.id] ?? [],
}))

export const TOOLS = [
  { id: 'content', label: 'Content', icon: 'text' },
  { id: 'photos', label: 'Photos', icon: 'image', when: (g) => g.hasPhotos },
  { id: 'preview', label: 'Preview', icon: 'phone', when: (g) => g.scenes.length > 0 },
  { id: 'qr', label: 'QR code', icon: 'qr' },
]

export const toolsFor = (gift) => TOOLS.filter((t) => !t.when || t.when(gift))
