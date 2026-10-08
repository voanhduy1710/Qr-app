// Default text for the anniversary page; overridable from /home like the birthday page.
// `{name}` and `{from}` inside any text are replaced with the two names.
export const defaults = {
  name: 'Em',
  from: 'Anh',
  pageTitle: 'Gửi {name} 💗',
  gateTitle: 'Gửi {name}',
  // First day together (YYYY-MM-DD). The counter is computed live from this.
  startDate: '2024-02-14',
  introWords: ['I', '♥', 'YOU'],
  counterEyebrow: 'Chúng mình đã bên nhau',
  counterLead: '…và từng giây vẫn đang tiếp tục.',
  letterEyebrow: 'Thư tình',
  letterTitle: 'Gửi {name}',
  letterPages: [
    'Cảm ơn em vì đã chọn ở lại, qua cả những ngày nắng đẹp lẫn những hôm trời giông.',
    'Anh thích cách mình cười vì những chuyện nhỏ xíu, và cả cách em lặng im nắm tay anh mỗi khi anh mệt.',
    'Mình cứ đi chậm thôi, miễn là đi cùng nhau. Còn rất nhiều ngày kỷ niệm đang chờ phía trước.',
  ],
  finale: 'Yêu em hôm nay, ngày mai và cả những ngày sau nữa.',
}

export const schema = [
  {
    id: 'people',
    title: 'The two of you',
    hint: 'Type {name} or {from} in any field to insert these two names.',
    fields: [
      { key: 'name', label: 'Recipient name', type: 'text' },
      { key: 'from', label: 'Sender name', type: 'text' },
      { key: 'startDate', label: 'Date you got together', type: 'date' },
      { key: 'pageTitle', label: 'Browser tab title', type: 'text' },
    ],
  },
  {
    id: 'opening',
    title: 'Opening',
    fields: [
      { key: 'gateTitle', label: 'Tap-to-open screen text', type: 'text' },
      { key: 'introWords', label: 'Particle words (one line per screen)', type: 'list' },
    ],
  },
  {
    id: 'counter',
    title: 'Day counter',
    fields: [
      { key: 'counterEyebrow', label: 'Line above', type: 'text' },
      { key: 'counterLead', label: 'Line below', type: 'text' },
    ],
  },
  {
    id: 'letter',
    title: 'Letter',
    fields: [
      { key: 'letterEyebrow', label: 'Small line on the cover', type: 'text' },
      { key: 'letterTitle', label: 'Cover title', type: 'text' },
      { key: 'letterPages', label: 'Letter pages', type: 'pages' },
    ],
  },
  {
    id: 'finale',
    title: 'Finale',
    fields: [{ key: 'finale', label: 'Final message', type: 'textarea' }],
  },
]
