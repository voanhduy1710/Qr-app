// Registry of gift experiences. Adding an occasion = a feature folder plus an
// entry here; the picker, QR page and router all read from this list.
export const OCCASIONS = [
  { id: 'birthday', label: 'Sinh nhật', hint: 'Birthday', path: '/birthday' },
  { id: 'anniversary', label: 'Kỷ niệm', hint: 'Anniversary', path: '/anniversary' },
]

export const findOccasion = (id) => OCCASIONS.find((o) => o.id === id)
