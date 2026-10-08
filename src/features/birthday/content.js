// Default text for the birthday page. The admin page (/home) can override any
// field; overrides live in Supabase (`gift_content`) and are merged over these.
// `{name}` and `{from}` inside any text are replaced with the two names.
export const defaults = {
  name: 'Mẹ Hấu',
  from: 'Bố Hấu',
  pageTitle: 'Chúc mừng sinh nhật {name} 🎂',
  gateTitle: 'Gửi kẻ hốn chíp',
  // Empty = the built-in music box lullaby.
  musicUrl: '',
  musicVolume: 60,
  introWords: ['3', '2', '1', 'HAPPY', 'BIRTHDAY', 'TO YOU', 'MẸ HẤU ♥'],
  cakeTitle: 'Có một món quà nhỏ dành cho {name}…',
  cakeLead: 'Nhưng trước khi mở, thổi nến trước nhé',
  cakeHbLine1: 'Chúc mừng sinh nhật',
  cakeHbLine2: '{name}',
  cakeBlowLead: 'Hãy thổi cái nến này đi để còn nhận quà !!!',
  cakeOpenHint: 'Chạm vào chiếc bánh để mở quà',
  photoTitle: '{name}',
  photoSub: 'của {from} ♥',
  photoNextHint: 'Chạm vào giữa trái tim để tiếp tục',
  wishTitle: 'Bây giờ… chọn một điều ước cho ngày sinh nhật của {name}.',
  // Each wish opens a postcard with its message.
  wishes: [
    {
      title: 'Hạnh phúc hơn',
      text: 'Bớt tham lam một chút thôi là Mẹ Hấu sẽ làm được mọi việc, vì mình đâu cần ôm hết cả thế giới. Bớt cái tôi đi một tẹo để lòng nhẹ tênh, chuyện gì cũng dễ cho qua. Bớt mắng mỏ rồi lại ôm hôn ông bô và con — mắng ít, hôn nhiều, hạnh phúc gấp đôi :|',
    },
    {
      title: 'Khỏe mạnh hơn',
      text: 'Tắm sớm trước 21:00 tối và ngủ sớm !!!! Không lướt điện thoại tới nửa đêm rồi sáng ra lại kêu mệt nữa nha. Ngủ đủ giấc thì da đẹp, đầu óc tỉnh táo, còn sức chơi với hai bố con cả ngày.',
    },
    {
      title: 'Bình yên hơn',
      text: 'Bớt mắng chồng là cuộc đời luôn vui. Mỗi lần định mắng, Mẹ Hấu hít một hơi thật sâu, đếm đến mười rồi nhìn khuôn mặt đáng yêu của chồng. Nhà yên thì lòng cũng yên, và chồng hứa sẽ ngoan hơn (một chút).',
    },
    {
      title: 'Thật nhiều niềm vui',
      text: 'Để 2 bố con liếm má thoải mái cuộc đời :3 Không né, không lau, không cằn nhằn "ướt hết mặt rồi". Mỗi cái liếm má là một niềm vui nhỏ, cộng lại cả năm là cả một kho niềm vui luôn đó.',
    },
  ],
  letterCover: ['Lá thư nhỏ', 'Gửi {name}', 'Hị Hị'],
  letterPages: [
    'Bố mình chúc mừng sinh nhật Mẹ Hấu nah ~~~\nSam Sam nhìn giề, đi làm tiếp mau, bà Cherry hóng vừa thui',
    'Năm vừa rồi thực sự không hề dễ dàng gì, bố mình rất là trân trọng những điều Mẹ Hấu giúp ta.\nNhững cái khó khăn đau đớn mình cùng trải với nhau chỉ có thể nói bằng lời: Cám ơn kẻ mắt toét hay quên điện thoại',
    'Bố Hấu chỉ mong Mẹ Hấu ăn ngon, ngủ đủ, bớt lo một chút, và nhớ rằng luôn có người ở đây mỗi khi Mẹ Hấu cần.',
  ],
  closing: 'Tuổi mới thật nhiều điều ko mắng ta nah ~~~',
  // Revealed when the last page is tapped, like a forgotten P.S.
  postscript: 'À và ước mì đó đi',
  skyTitle: 'Biến điều ước thành sao băng',
  skyWish: 'Chúc mọi điều ước của Mẹ Hấu thành hiện thực nah ~~~',
  skyHint: 'Chạm vào ngôi sao để gửi điều ước của {name} lên trời đêm.',
  skyDone: 'Điều ước đã bay lên trời rồi. Mong năm nay mọi điều dịu dàng nhất sẽ tìm đến {name}.',
}

// What the admin editor shows, grouped by scene in the order the recipient sees them.
export const schema = [
  {
    id: 'people',
    title: 'Recipient & sender',
    hint: 'Type {name} or {from} in any field to insert these two names.',
    fields: [
      { key: 'name', label: 'Recipient name', type: 'text' },
      { key: 'from', label: 'Sender name', type: 'text' },
      { key: 'pageTitle', label: 'Browser tab title', type: 'text' },
    ],
  },
  {
    id: 'music',
    title: 'Music',
    hint: 'Loops from the moment the gift is opened. Leave empty for the built-in music box.',
    fields: [
      {
        key: 'musicUrl',
        label: 'Music file (mp3)',
        type: 'audio',
        hint: 'Upload an mp3 (up to 10 MB), or type a path like /music/song.mp3 or paste a full https:// link.',
      },
      { key: 'musicVolume', label: 'Volume', type: 'volume' },
    ],
  },
  {
    id: 'opening',
    title: 'Opening',
    fields: [
      { key: 'gateTitle', label: 'Tap-to-open screen text', type: 'text' },
      { key: 'introWords', label: 'Particle words (one line per screen)', type: 'list', hint: 'End a line with ♥ to draw a heart.' },
    ],
  },
  {
    id: 'cake',
    title: 'Cake',
    fields: [
      { key: 'cakeTitle', label: 'Title before blowing the candle', type: 'text' },
      { key: 'cakeLead', label: 'Subtitle before blowing the candle', type: 'text' },
      { key: 'cakeHbLine1', label: 'Greeting — line 1', type: 'text' },
      { key: 'cakeHbLine2', label: 'Greeting — line 2', type: 'text' },
      { key: 'cakeBlowLead', label: 'Subtitle after blowing the candle', type: 'text' },
      { key: 'cakeOpenHint', label: 'Tap-the-cake hint', type: 'text' },
    ],
  },
  {
    id: 'photos',
    title: 'Photo heart',
    fields: [
      { key: 'photoTitle', label: 'Text in the middle of the heart', type: 'text' },
      { key: 'photoSub', label: 'Small line underneath', type: 'text' },
      { key: 'photoNextHint', label: 'Tap-to-continue hint', type: 'text' },
    ],
  },
  {
    id: 'wishes',
    title: 'Wishes',
    fields: [
      { key: 'wishTitle', label: 'Title', type: 'text' },
      { key: 'wishes', label: 'Wish cards (title + postcard message)', type: 'cards' },
    ],
  },
  {
    id: 'letter',
    title: 'Letter',
    fields: [
      { key: 'letterCover', label: 'Cover (small line, title, notes…)', type: 'list' },
      { key: 'letterPages', label: 'Letter pages', type: 'pages' },
      { key: 'closing', label: 'Last page', type: 'textarea' },
      { key: 'postscript', label: 'P.S. (appears when the last page is tapped)', type: 'textarea' },
    ],
  },
  {
    id: 'sky',
    title: 'Night sky',
    fields: [
      { key: 'skyTitle', label: 'Title', type: 'text' },
      { key: 'skyWish', label: 'Wish message', type: 'textarea' },
      { key: 'skyHint', label: 'Tap-the-star hint', type: 'text' },
      { key: 'skyDone', label: 'After sending', type: 'textarea' },
    ],
  },
]
