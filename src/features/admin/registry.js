import { OCCASIONS } from '../../config/occasions'
import * as anniversary from '../anniversary/content'
import * as birthday from '../birthday/content'

const CONTENT = { birthday, anniversary }

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
}))

export const TOOLS = [
  { id: 'content', label: 'Content', icon: 'text' },
  { id: 'photos', label: 'Photos', icon: 'image', when: (g) => g.hasPhotos },
  { id: 'qr', label: 'QR code', icon: 'qr' },
]

export const toolsFor = (gift) => TOOLS.filter((t) => !t.when || t.when(gift))
