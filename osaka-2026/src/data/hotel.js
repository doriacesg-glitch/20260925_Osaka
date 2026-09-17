// 逸之彩酒店(日本橋)資料 — 給獨立「飯店資訊」頁面用
// 官方名:溫泉大阪逸之彩酒店日本橋 / Hot Spring Osaka Hinode Hotel Nipponbashi

export const hotel = {
  id: 'hinode-nipponbashi',
  nameZh: '溫泉大阪逸之彩酒店 日本橋',
  nameJa: '天然温泉 なにわの湯 大阪逸之彩酒店 日本橋',
  nameEn: 'Hot Spring Osaka Hinode Hotel Nipponbashi',
  brand: '道頓堀酒店集團',
  checkIn: '15:00',
  checkOut: '10:00',

  // 聯絡資訊
  address: '〒556-0002 大阪市浪速區惠美須西 1-3-13',
  addressEn: '1-3-13 Ebisunishi, Naniwa-ku, Osaka 556-0002 Japan',
  phone: '+81-6-4394-8500',       // 主要總機(暫填,Doria 依訂房確認)
  phoneDisplay: '06-4394-8500',
  email: 'reservation@dotonbori-hotel.jp',
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('温泉大阪逸之彩酒店 日本橋'),

  // 照片(先放 placeholder 路徑,Round 2/3 可放 public/hotel/*.jpg)
  photos: [
    { src: '/hotel/exterior.jpg', caption: '外觀:惠美須町 5 號出口正對面' },
    { src: '/hotel/lobby.jpg',    caption: '大廳 24h 免費飲料機' },
    { src: '/hotel/onsen.jpg',    caption: '天然溫泉大浴場' },
    { src: '/hotel/room.jpg',     caption: '雙床房示意' },
  ],

  // 位置與交通(從 PDF 備註 + 搜尋結果)
  location: {
    area: '惠美須町 / 新世界',
    nearestStation: '大阪 Metro 堺筋線「惠美須町」站(K18)',
    walkFromStation: '5 號出口過馬路約 50 公尺,對面是全家便利商店',
    accessNotes: [
      '3 號出口:有電梯,適合拉行李',
      '5 號出口:步行不到 1 分鐘但是樓梯,只推薦輕裝',
      '從關西機場:南海線到「天下茶屋」→ 換堺筋線到「惠美須町」',
    ],
    landmarks: '走路可到通天閣、新世界、電電街;地鐵一站到日本橋(黑門市場)',
  },

  // 每日福利(從 PDF 備註蒐集)
  dailyPerks: [
    { time: '每日',        icon: '💧', title: '瓶裝水',    desc: '每人每日一瓶,房間裡放好' },
    { time: '24 小時',     icon: '🥤', title: '免費飲料機', desc: '大廳 24 小時無限暢飲' },
    { time: '15:00–17:00', icon: '🍦', title: '免費冰淇淋', desc: 'Check-in 時段的甜點小驚喜' },
    { time: '15:00–22:00', icon: '🍺', title: '生啤/Highball', desc: '無限暢飲,含 50 種以上酒類與飲品' },
    { time: '每晚',        icon: '🍜', title: '免費宵夜拉麵', desc: '每日更替口味,深夜回來剛剛好' },
    { time: '入住期間',    icon: '♨️', title: '天然溫泉大浴場', desc: '深層水溫泉,一天走完可以好好泡' },
  ],

  // 情境化描述(給 Doria 一個溫暖起頭)
  vibe: `
    這不是一間「只是睡覺的地方」的商務旅館。
    它挑了一個很誠實的位置 —— 不在心齋橋、不在梅田,而在有點復古又有點台味的
    惠美須町。走出門口是通天閣的紅色鐵塔,一轉角是新世界串炸的油煙。
    Doria 白天可以走遍大阪的任何角落,晚上帶著發燙的腳回到這裡,
    先泡一場天然溫泉,再到大廳喝杯生啤配拉麵 —— 一天就這樣妥妥地收尾。
  `.trim(),

  // 加分小事(適合放在「你會愛上這裡的十件小事」區塊)
  loveables: [
    '深夜回房前,大廳的免費拉麵讓你不用出門找宵夜',
    '溫泉大浴場泡完再回房,一秒睡著',
    '對面就是全家,忘了買什麼隨時衝下去',
    '走路到通天閣只要 8 分鐘,一天可以來回好幾趟',
    '房裡的免費瓶裝水省下便利商店排隊時間',
  ],

  // 需要注意的地方(誠實面)
  caveats: [
    '旺季房間隔音一般,對聲音敏感建議帶耳塞',
    '溫泉大浴場尖峰時段(20:00–22:00)人多有點吵',
    '5 號出口最近但是樓梯,拖行李的日子走 3 號出口',
  ],

}
