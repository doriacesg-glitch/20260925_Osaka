// 大阪 2026 行程 seed 資料
//
// 兩層 schema:
//   places — 每個地點的完整資訊(不重複,飯店出現 6 次也只有 1 筆)
//   stops  — 時間軸上的每一格(可以重複同一 place)
//
// stops 的 day 可以是 1..6 或 'backup'。order 決定同一天內的排序。
// Gemini 的拖曳 UI 只需要改 stops(用 useItineraryMutations)。

// ---------- helpers ----------

const gmap = (q) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`

// ---------- places ----------

export const places = {
  // === 交通 ===
  'mrt-qizhang': {
    name: '捷運七張站',
    kind: 'transport',
    googleMapsUrl: gmap('捷運七張站 新北市新店'),
    description: '出發起點 — 從家門口出發搭捷運到桃園機場的中繼點。',
  },
  'tpe-t1': {
    name: '桃園機場第一航廈',
    kind: 'transport',
    googleMapsUrl: gmap('桃園機場第一航廈'),
    description: '國際線出境。廉航與 JAL/星宇多在 T1。',
  },
  'kix-t1-south': {
    name: '關西機場 第 1 航站樓(南)',
    kind: 'transport',
    googleMapsUrl: gmap('関西国際空港 第1ターミナル南'),
    description: '到大阪的第一站。入境後可搭南海電鐵到「天下茶屋」→ 堺筋線到「惠美須町」直達飯店。',
  },
  'kix-departure': {
    name: '關西國際機場',
    kind: 'transport',
    googleMapsUrl: gmap('関西国際空港'),
    description: '回家的最後一站。從飯店約 55 分鐘 — 早點出發不要卡。',
  },

  // === 飯店 ===
  'hotel-hinode': {
    name: '逸之彩酒店(日本橋)',
    kind: 'hotel',
    googleMapsUrl: gmap('温泉大阪逸之彩酒店 日本橋'),
    description:
      '溫泉大阪逸之彩酒店日本橋 — 惠美須町站步行 1 分鐘。詳細福利請看「飯店資訊」頁。',
    // 完整資料在 src/data/hotel.js
  },

  // === Day 2 ===
  'namba-yasaka': {
    name: '難波八阪神社',
    kind: 'photo',
    googleMapsUrl: gmap('難波八阪神社'),
    description: '小型神社,在獅子頭造型的建築中設有儀式表演舞台。',
    richDescription: `
      難波八阪神社最有名的就是那座 12 公尺高、11 公尺寬的巨大獅子頭「獅子殿」——
      整張獅子臉就是舞台,嘴巴是表演空間、眼睛是燈、鼻子是喇叭。1974 年由建築家
      前田末夫設計,新年時獅子嘴裡會表演神樂,夏日祭會有獅子舞。
      信仰上「獅子吞噬惡靈、招來勝運」,是大阪 Minami 一帶意外不擁擠的能量景點,
      拍照非常上鏡。走進去 5–10 分鐘就能繞完,適合順路。
    `.trim(),
    hoursNote: '境內全天開放(社務所 09:00–17:00)',
    highlights: ['巨大獅子頭建築超上鏡', '免費入場,順路可以拍到滿意的照片'],
    caveats: ['基本上就是拍照 spot,別期待有太多動線'],
    source: 'https://osaka-info.jp/spot/namba-yasaka-shrine/',
  },
  'tennoji-zoo': {
    name: '大阪市天王寺動物園',
    kind: 'photo',
    googleMapsUrl: gmap('大阪市天王寺動物園'),
    description: '天王寺公園中的熱門去處,有 200 多種動物生活在不同的棲地中,包括大草原及雨林等環境。',
  },
  'ajinoya': {
    name: '味乃家 御好燒(難波本店)',
    kind: 'food',
    googleMapsUrl: gmap('味乃家 御好燒 難波本店'),
    description: '氣氛閒適的餐廳,供應傳統大阪燒,也就是在桌上煎烤的美味日式煎餅。',
    richDescription: `
      1960 年代開業、超過 60 年的米其林指南推薦老店,難波站徒步 3 分鐘。
      經典必點是「味乃家綜合燒(ミックス)」— 一次吃到蝦、花枝、豬肉、章魚,
      層次濃厚。番茄起司燒和花枝豬肉炒麵也是常客推薦。Trip.com 評分 4.6/5。
      唯一缺點:排隊要 30–60 分鐘,建議提前訂位或買 FastPass。
      店內師傅會現場煎給你看,火焰、鏟子、醬料一氣呵成,是儀式感很強的一餐。
    `.trim(),
    highlights: ['米其林推薦', '味乃家綜合燒', '桌邊現煎的儀式感'],
    caveats: ['熱門時段排 1 小時是常態,能訂位就訂'],
    source: 'https://www.bring-you.info/zh-tw/ajinoya-okonomiyaki',
  },
  'takotako-king': {
    name: 'Takotako King(America 村店)',
    kind: 'food',
    googleMapsUrl: gmap('たこたこ王 アメリカ村店'),
    description: '美國村的熱鬧章魚燒居酒屋,17:00 才開,晚上氣氛最好。',
    richDescription: `
      藏在美國村巷子裡的章魚燒居酒屋,開到凌晨 3 點,搖滾樂配章魚燒的組合很反差萌。
      招牌是「四種口味章魚燒拼盤」1,000 日圓 — 從經典醬油美乃滋到創意口味都有,
      章魚塊給得大方。TripAdvisor 上店員英文不錯、氣氛熱鬧的評論很多。
      跟一般日間排隊的章魚燒名店不同,這裡是宵夜屬性,配啤酒最棒。
    `.trim(),
    hoursNote: '17:00–03:00',
    highlights: ['四種口味拼盤 ¥1,000', '晚上宵夜配啤酒', '店員友善,說得通英文'],
    caveats: ['白天沒開,規劃時要注意'],
    source: 'https://tabelog.com/en/osaka/A2701/A270202/27007965/',
  },
  'shinsaibashi': {
    name: '心齋橋',
    kind: 'shopping',
    googleMapsUrl: gmap('心齋橋筋商店街'),
    description: '心齋橋筋商店街 — 大阪最熱鬧的頂棚步行街,藥妝、服飾、伴手禮一次逛完。',
  },
  'glico-sign': {
    name: 'Glico Sign Dotonbori',
    kind: 'photo',
    googleMapsUrl: gmap('道頓堀 グリコサイン'),
    description: '設置於 1935 年的著名巨型看板,上有固力果 (Glico) 糖果公司的廣告。',
  },
  'dotonbori': {
    name: '道頓堀',
    kind: 'photo',
    googleMapsUrl: gmap('道頓堀'),
    description: '熱鬧的娛樂區,以高掛的照明廣告牌、餐廳和影院聞名。',
  },
  'zen-shinsaibashi': {
    name: '黑毛和牛燒肉/涮涮鍋/壽喜燒 善 心齋橋店',
    kind: 'food',
    googleMapsUrl: gmap('善 心齋橋 黒毛和牛'),
    description: '鹿兒島產 A4 級以上黑毛和牛,一次滿足燒肉/涮涮鍋/壽喜燒三種吃法。',
    richDescription: `
      「善」難波心齋橋店堅持點餐後才現切黑毛和牛,同一家店可以同時點燒肉、
      涮涮鍋、壽喜燒三種吃法。中文菜單、觀光客友善。
      招牌是 A4 等級鹿兒島黑毛和牛壽喜燒吃到飽 ¥4,180(2024 資料,實際請以現場為準),
      在大阪同等級和牛店裡算相當親民。
      地址:大阪市中央區難波 3-4-13 味わいばしビル 4F,難波站徒步約 5 分鐘。
    `.trim(),
    highlights: ['A4 黑毛和牛', '燒肉/涮涮鍋/壽喜燒三選一', '有中文菜單'],
    caveats: ['價格可能有變動,現場確認為主'],
    source: 'https://www.kkday.com/zh-hk/blog/113010/osaka-sukiyaki-2',
  },

  // === Day 3 ===
  'kids-book-forest': {
    name: 'こども本の森 中之島(童書之森)',
    kind: 'photo',
    googleMapsUrl: gmap('こども本の森 中之島'),
    description: '安藤忠雄設計並捐贈給大阪市的兒童圖書館 — 三層挑高的清水混凝土建築,牆面全部是書。',
    richDescription: `
      2020 年開館,建築師安藤忠雄大病痊癒後為孩子設計並自費捐贈的作品。
      內部是三層挑高的白色清水混凝土空間,四面牆從地面到天花板全部塞滿書架,
      約 18,609 冊藏書。設計理念是「書的迷宮,和書相遇的地方」。
      這裡不是借閱圖書館,書不能帶走 — 你可以在館內或走出去到中之島公園的
      草地上讀。攝影非常好看,但要注意:
      需要事先在官網預約時段(免費),沒預約進不去。
    `.trim(),
    hoursNote: '09:30–17:00,週一休館,需線上預約',
    highlights: ['安藤忠雄建築', '三層書牆挑高空間', '免費(但需預約)'],
    caveats: ['一定要事前預約!沒預約當天無法入場', '書不能借出'],
    source: 'https://kodomohonnomori.osaka/about/',
  },
  'science-museum': {
    name: '大阪市立科學館',
    kind: 'photo',
    googleMapsUrl: gmap('大阪市立科学館'),
    description: '以太空和能源為主題的博物館,設有互動式展覽、天文館和咖啡館。',
  },
  'nakanoshima-museum': {
    name: '大阪中之島美術館',
    kind: 'photo',
    googleMapsUrl: gmap('大阪中之島美術館'),
    description:
      '2022 年開館的黑色方塊建築,由遠藤克彥設計。館藏以近現代美術為主,常設 + 特展並行。',
  },
  'moeyo-mensuke': {
    name: '燃えよ麺助 Moeyo Mensuke',
    kind: 'food',
    googleMapsUrl: gmap('燃えよ麺助'),
    description: '空間小巧的樸實麵店,以鋪有烤鴨肉片的拉麵聞名。',
    richDescription: `
      福島站步行 1 分鐘、藏在巷子裡的白色小店,2016 年開業以來一直是大阪拉麵
      「絕對必訪」名單常客。招牌「紀州鴨そば」使用和歌山太田養雞場的紀州鴨,
      清澈醬油湯頭 + 現片鴨胸片,精緻程度像懷石而不像拉麵。
      店只有 10 個座位,不接受預約,排隊 30–90 分鐘是常態。
      日本拉麵評論家與外國美食部落格一致高分,是拉麵愛好者朝聖清單前段班。
    `.trim(),
    highlights: ['紀州鴨鴨胸片拉麵', 'Tabelog Ramen 100 選'],
    caveats: ['排隊 30-90 分鐘', '不接受預約,座位少'],
    source: 'https://tabelog.com/en/osaka/A2701/A270108/27091454/',
  },
  'disney-store-hep5': {
    name: 'Disney Store(Umeda HEP FIVE 店)',
    kind: 'shopping',
    googleMapsUrl: gmap('Disney Store HEP FIVE'),
    description: '迪士尼連鎖零售店,販售官方角色玩具、服飾、收藏品等。位於梅田 HEP FIVE 商場內。',
  },
  'nintendo-osaka': {
    name: 'Nintendo OSAKA',
    kind: 'shopping',
    googleMapsUrl: gmap('Nintendo OSAKA'),
    description:
      'DAIMARU 大丸梅田店 13 樓的官方任天堂旗艦店,獨家周邊 + 打卡點 +（有時候）大排長龍。',
    richDescription: `
      2022 年開幕的官方任天堂旗艦店,是 Nintendo TOKYO / KYOTO / OSAKA 三兄弟裡最新的一家。
      店內以瑪利歐、薩爾達、動森為主的限定商品最多,是任天堂粉絲的必朝聖地。
      入店有時候會發整理券(高峰期),平日中午通常可以直接進。
      位置:大丸梅田店 13F,梅田站/大阪站直通,交通超方便。
    `.trim(),
    highlights: ['大阪限定商品', '打卡場景多', '交通方便'],
    caveats: ['尖峰期可能需要整理券'],
  },
  'lucua-osaka': {
    name: 'LUCUA Osaka',
    kind: 'shopping',
    googleMapsUrl: gmap('LUCUA Osaka'),
    description: '緊鄰交通樞紐的零售商場,設有 10 層樓的商店和餐廳。JR 大阪站直通。',
  },
  'rikimaru-umeda': {
    name: '燒肉力丸(梅田店)',
    kind: 'food',
    googleMapsUrl: gmap('燒肉力丸 梅田'),
    description: '大阪連鎖和牛燒肉吃到飽,120 分鐘 100 多品項,C/P 值超高。',
    richDescription: `
      在梅田周邊有多家分店(東通店、初天神店等)的和牛燒肉吃到飽名店。
      120 分鐘和牛套餐約 ¥5,808,可以吃到牛舌、和牛五花、甚至桌邊噴槍炙燒的
      「和牛壽司」— 店員在桌邊用噴槍炙燒,油脂融化帶焦香。
      海鮮(蝦、扇貝、魷魚)也不小氣。菜單支援中文/英文/韓文四種語言,
      桌面平板點餐 UI 也有多語。是外國旅客友善度極高的燒肉吃到飽。
    `.trim(),
    highlights: ['和牛吃到飽 ~¥5,808', '桌邊炙燒和牛壽司', '中文平板點餐'],
    caveats: ['熱門時段一定要訂位'],
    source: 'https://osaka.letsgojp.com/archives/654610/',
  },
  'grenier-umeda': {
    name: 'grenier 梅田店',
    kind: 'food',
    googleMapsUrl: gmap('grenier 梅田店 阪急'),
    description: '梅田排隊甜點名店,招牌是現烤焦糖布蕾千層酥。',
    richDescription: `
      grenier 法文是「閣樓」,店的靈感來自巴黎公寓頂樓,店面藏在阪急百貨 1F
      Hankyu Sun 廣場外側、對面就是 HEP FIVE。梅田站徒步 3 分鐘。
      招牌千層酥每片 ¥1,000,上面炙燒過的焦糖布蕾一層一層卡滋卡滋。
      原味之外還有草莓、綠葡萄等季節限定口味,還有 grenier 冰淇淋。
      店空間小,現場等座位不容易,建議外帶到附近公園吃。
    `.trim(),
    hoursNote: '10:00–20:00',
    highlights: ['炙燒焦糖布蕾千層酥 ¥1,000', '季節限定口味'],
    caveats: ['店面小,以外帶為主'],
    source: 'https://umeda-grenier.com/',
  },
  'dojimahama-tower': {
    name: 'Osaka Dojimahama Tower(WowUs 展望台)',
    kind: 'photo',
    googleMapsUrl: gmap('大阪堂島浜タワー WowUs'),
    description: '2024 年開幕的免費夜景展望台,16 樓看中之島夕陽與夜景。',
    richDescription: `
      2024 年 4 月完工的大阪堂島濱塔,16 樓有免費展望台「WowUs」— 免費、
      免預約、開放到 21:00。從淀屋橋站步行 4 分鐘、京阪大江橋站 2 分鐘。
      向西看是中之島與夕陽在建築群縫隙間落下的畫面,傍晚 17:30–18:30 是
      最上鏡的時間。作為梅田/中之島區域的免費夜景點,對觀光客而言 CP 值超高。
    `.trim(),
    hoursNote: '08:00–21:00,免費入場',
    highlights: ['16F 免費夜景展望台', '夕陽最上鏡:傍晚 17:30–18:30'],
    caveats: ['觀景區不大,人多時稍擠'],
    source: 'https://office.mec.co.jp/en/pickup/project_dojimahamatower',
  },

  // === Day 4 ===
  'history-museum': {
    name: '大阪歷史博物館',
    kind: 'photo',
    googleMapsUrl: gmap('大阪歴史博物館'),
    description: '這座當代風格博物館設有詳細介紹大阪從古至今歷史的展覽。位於大阪城旁。',
  },
  'gettou-izakaya': {
    name: '月盗 居酒屋(谷町四丁目)',
    kind: 'food',
    googleMapsUrl: gmap('居酒屋 月盗 谷町四丁目'),
    description: '稀有的河內鴨與創意料理,搭配多樣的手工琴酒 — 下班後最適合的大人復古酒吧。',
    richDescription: `
      谷町四丁目站徒步 6 分鐘的創作居酒屋,以稀有品牌「河內鴨」為主題,
      搭配自然酒和多款手工琴酒。氣氛偏成熟、復古 bar 感,不是熱鬧的居酒屋,
      適合安靜地喝一杯配料理。招牌是招牌高湯玉子燒和牛時雨煮定食(午餐時段)、
      河內鴨串燒與創意料理(晚餐)。
      營業時間 11:30–14:30 / 18:00–23:00(週日休)。
    `.trim(),
    hoursNote: '週一~週六 11:30–14:30, 18:00–23:00;週日休',
    highlights: ['稀有河內鴨料理', '手工琴酒選擇多', '復古 bar 氛圍'],
    caveats: ['週日公休', '午晚各只做一輪,晚餐建議訂位'],
    source: 'https://tabelog.com/en/osaka/A2701/A270104/27144373/',
  },
  'kaiyodo-figure-museum': {
    name: 'Kaiyodo Figure Museum Miraiza Osaka-Jo',
    kind: 'photo',
    googleMapsUrl: gmap('海洋堂フィギュアミュージアム ミライザ大阪城'),
    description: '大阪城公園「Miraiza」建築內的模型博物館,3,000 件海洋堂 40 年作品展。',
    richDescription: `
      位於大阪城天守閣正前方的 Miraiza Osaka-Jo(舊陸軍第四師團司令部改建)內。
      展出海洋堂 40 年來的 3,000 多件作品,依主題分成 10 個展區:特攝、動漫角色、
      生物模型、文化藝術、場景 diorama 等。門票成人 ¥1,000、7-16 歲 ¥500。
      入場會拿到「紀念入場幣」可以在館內扭蛋(超過 100 種)換禮物或胸章。
      商店可以買到海洋堂最新公仔和大阪限定周邊,大阪城行程的絕配。
    `.trim(),
    hoursNote: '約 11:00–19:00(依季節)',
    highlights: ['3,000 件模型', '紀念入場幣扭蛋', '搭大阪城一起逛'],
    caveats: ['模型迷才會覺得值,一般路人可能覺得普通'],
    source: 'https://osaka-info.jp/en/spot/kaiyodo-miraiza/',
  },
  'osaka-castle': {
    name: '大阪城',
    kind: 'photo',
    googleMapsUrl: gmap('大阪城'),
    description: '這座受人景仰的城堡可追溯至 1597 年,重建以後,以展品種類繁多的花園和博物館為特色。',
  },
  'yaekatsu-kushikatsu': {
    name: '串炸 八重勝(新世界)',
    kind: 'food',
    googleMapsUrl: gmap('八重勝 串カツ 新世界'),
    description: '新世界排隊第一名的串炸老店,Tabelog 3.51,半世紀人氣。',
    richDescription: `
      新世界「動物園前」站 5 號出口徒步 3 分鐘,無時無刻大排長龍,
      2019 年已經開對面第二間店以分流。不接受預約,建議避開飯點提前到。
      靠紅色招牌那邊排隊,店員會從最前叫人,可能被帶進紅色本店或白色新店
      — 兩邊菜單和水準一樣。有中文菜單,必點:牛肉串、燉牛筋、炸海老、
      炸蚵仔。翻桌率高,吃完可以立刻走。
      規則:串炸的醬只能沾一次(這是關西串炸文化)!已咬過的串不要再放回醬缸。
    `.trim(),
    highlights: ['半世紀老店', '必點:牛肉、燉牛筋、蚵仔', '中文菜單'],
    caveats: ['排隊 30-60 分', '醬不能雙沾', '不接受預約'],
    source: 'https://www.bigfang.tw/blog/post/28635089',
  },
  'daruma-shinsekai': {
    name: '達摩串炸 新世界總本店',
    kind: 'food',
    googleMapsUrl: gmap('元祖串かつ だるま 新世界総本店'),
    description: '這間餐廳主要供應炸物串,包括各種醃漬鮪魚 — 也是大阪串炸的元祖。',
    richDescription: `
      1929 年(昭和 4 年)創業的串炸元祖 — 大阪整個「串カツ」文化就是從這家發跡的。
      新世界光是這一區就有 4 間分店,總本店是最小最原始那間,面對通天閣往右
      拐進小巷、二樓有生氣老闆瞪人的那間才是正宗發祥地。
      每串 ¥120–¥240,便宜好入手。麵衣裹得厚,酥脆帶油香。
      規則跟八重勝一樣:醬只能沾一次(這是「元祖」立下的規矩)。
      隔壁八重勝、達摩兩邊粉絲各有立場,建議都試,比較「元祖 vs 排隊王」差別。
    `.trim(),
    highlights: ['1929 創業元祖', '¥120-240/串', '生氣老闆招牌'],
    caveats: ['醬只能沾一次', '總本店超小,可能要排隊'],
    source: 'https://bobbytravel.tw/kushikatsu-daruma/',
  },
  'janjan-yokocho': {
    name: 'JAN JAN 橫丁(南陽通商店街)',
    kind: 'photo',
    googleMapsUrl: gmap('ジャンジャン横丁 南陽通商店街'),
    description: '新世界南邊、通往通天閣的 180 公尺復古拱廊街,聚集串炸、烤肉、麵店、將棋圍棋俱樂部。',
    richDescription: `
      1921 年誕生的老拱廊街,名字「ジャンジャン(叮叮)」來自當年拉客的三味線聲。
      寬只有 2.5 公尺、長 180 公尺,兩側塞滿了串炸店、烤肉店、烏龍麵店、
      立飲屋、圍棋將棋俱樂部,是新世界少數還保有昭和庶民感的地方。
      「動物園前」站步行幾分鐘,從南邊往通天閣走一路吃過去是經典路線。
      八重勝、天狗、達摩幾家串炸名店都在或旁邊。
    `.trim(),
    highlights: ['昭和感濃厚的復古拱廊', '串炸/烤肉/麵店密集'],
    caveats: ['觀光化了,但比熱鬧路段有味道'],
    source: 'https://janjanyokocho.com/',
  },
  'shinsekai-market': {
    name: '新世界市場',
    kind: 'photo',
    googleMapsUrl: gmap('新世界市場'),
    description: '氣氛輕鬆的傳統遮棚商店街,林立著小吃、服飾和紀念品攤位。',
  },
  'tsutenkaku': {
    name: '通天閣',
    kind: 'photo',
    googleMapsUrl: gmap('通天閣'),
    description: '這座地標以霓虹燈聞名,有著開放大眾參觀的觀景台。',
  },

  // === Day 5 ===
  'usj': {
    name: '日本環球影城 USJ',
    kind: 'entertainment',
    googleMapsUrl: gmap('日本環球影城'),
    description: '關西最大主題樂園。你們預計 06:33 到、19:00 離開 — 整整 12.5 小時。',
    richDescription: `
      關西必訪的主題樂園,分區包括超級任天堂世界(Nintendo World)、
      哈利波特魔法世界、小小兵樂園、鬼滅之刃期間限定(如有)。
      建議前一晚買好 Express Pass 快速通關,不然熱門設施排 2-3 小時是常態。
      任天堂世界需要抽整理券(免費)或用 Express 才能進入。
      14:00 花車遊行是你們特別 note 的行程。
      建議帶行動電源、輕便鞋、備用襪(下雨天船類設施會濕),
      園內餐廳可以刷卡但很多手推車攤位只收現金/交通卡。
    `.trim(),
    hoursNote: '通常 08:00–21:00(依季節與活動),請以官網為準',
    highlights: ['任天堂世界', '哈利波特魔法世界', '14:00 花車遊行'],
    caveats: ['熱門設施排 2-3h', '任天堂世界要抽整理券', '記得提前買 Express Pass'],
  },

  // ===================== BACKUP 備選區 =====================

  // -- 燒肉力丸各分店(同連鎖,以本店介紹為底,只補位置) --
  'rikimaru-umeda-doyama': {
    name: '燒肉力丸 梅田堂山店(特製烤和牛)',
    kind: 'food',
    googleMapsUrl: gmap('燒肉力丸 梅田堂山店'),
    description: '燒肉力丸梅田分店之一 — 特製和牛招牌,交通比初天神店更靠梅田中心。',
  },
  'rikimaru-namba-minato': {
    name: '燒肉力丸 難波湊町店 Yakiniku Rikimaru',
    kind: 'food',
    googleMapsUrl: gmap('燒肉力丸 難波湊町店'),
    description: '燒肉力丸難波湊町分店 — 難波站西南邊,回飯店(惠美須町)更順。',
  },
  'rikimaru-shinsaibashi': {
    name: '燒肉力丸 心齋橋店',
    kind: 'food',
    googleMapsUrl: gmap('燒肉力丸 心齋橋店'),
    description: '燒肉力丸心齋橋分店 — 逛街完直接吃,方便。',
  },
  'rikimaru-dotonbori': {
    name: '燒肉力丸 難波道頓堀店',
    kind: 'food',
    googleMapsUrl: gmap('燒肉力丸 難波道頓堀店'),
    description: '燒肉力丸道頓堀分店 — 就在道頓堀主街上,超有觀光感。',
  },
  'rikimaru-sennichimae': {
    name: '燒肉力丸 千日前店',
    kind: 'food',
    googleMapsUrl: gmap('燒肉力丸 千日前店'),
    description: '燒肉力丸千日前分店 — 深夜營業到很晚,適合當宵夜替補。',
  },
  'rikimaru-nankai-namba': {
    name: '燒肉力丸 南海難波店',
    kind: 'food',
    googleMapsUrl: gmap('燒肉力丸 南海難波店'),
    description: '燒肉力丸南海難波店 — 難波車站正上方一帶,離飯店近。',
  },

  // -- 拉麵 & 麵店 --
  'menya-seiryu': {
    name: '麺や 清流(Menya Seiryu)',
    kind: 'food',
    googleMapsUrl: gmap('麺や 清流 東大阪'),
    description: '東大阪長瀨站附近的拉麵名店 — 2024 Tabelog Ramen 大阪百名店。',
    richDescription: `
      東大阪市小若江 1-4-3,近鐵長瀨站附近。是 2024 年 Tabelog 大阪拉麵百名店
      入選店之一,價位落在 ¥1,500 左右。營業時間依星期變動(週日 11:00-15:00、
      週一 11:00-20:00、週二 11:00-17:00、週三 11:00-20:00、週四 11:00-17:00,
      週六與國定假日休 — 時間常變動,去之前務必看官方 SNS 或 Google Maps)。
      位置不在市中心,是「特意去朝聖」型的拉麵店。
    `.trim(),
    hoursNote: '依星期變動(週六與國定假日休),請以現場為準',
    highlights: ['2024 Tabelog Ramen 大阪百名店', '¥1,500 左右'],
    caveats: ['營業日/時間變動大,務必事前確認', '離市中心較遠(東大阪)'],
    source: 'https://autoreserve.com/ja/restaurants/tuDLb8e79dVUzhJuyXWZ',
  },
  'totomen-en': {
    name: 'Totomen En(布施 / 拉麵)',
    kind: 'food',
    googleMapsUrl: gmap('Totomen En Fuse ramen'),
    description: '布施站附近的海鮮系拉麵店,以鯛魚白湯拉麵為招牌。',
    richDescription: `
      Tabelog 上是禁菸店,主打「海鮮白湯」— 鯛魚的鮮味濃縮成清爽的白色湯頭,
      有旅客形容「奢華但精緻」。也有季節限定和早餐選項。位置在布施(東大阪),
      不在市中心,搜尋資訊偏少 — 屬於「特意去朝聖」型的店。
    `.trim(),
    unverified: true,
    unverifiedNote: '網路資料非常少,以上描述來自 Tabelog 概略介紹,實際口味風格請以現場為準。',
    source: 'https://tabelog.com/en/osaka/A2707/A270703/27121916/',
  },
  'nishimura-noodle': {
    name: '超多加水純手打ち麺 仁しむら(にしむら)',
    kind: 'food',
    googleMapsUrl: gmap('超多加水純手打ち麺 仁しむら'),
    description: '布施站步行 10 分鐘的手打麵店,加水率高達 50%,是「像烏龍麵一樣光滑」的拉麵。',
    richDescription: `
      東大阪布施站徒步 10 分鐘。招牌是「超多加水純手打ち麺」— 加水率
      高達烏龍麵等級(約 50%),麵條滑順不像一般拉麵那樣有嚼勁,而是「溜溜滑滑」
      的獨特口感。招牌口味味噌拉麵、鹽拉麵各有粉絲,豬骨湯迷評鹽拉麵層次好。
      Tabelog 3.95 分、38 則評論,午晚均價都在 ¥1,000 以下,C/P 值高。
      營業:11:00–14:30 / 18:00–21:00(賣完就關)。
    `.trim(),
    hoursNote: '11:00–14:30, 18:00–21:00(售完為止)',
    highlights: ['50% 加水率獨特口感', '均價 <¥1,000', 'Tabelog 3.95'],
    caveats: ['賣完就關,想吃早點去', '在布施離市中心較遠'],
    source: 'https://sotokoto-online.jp/food/13460',
  },
  'kirimen-umeda': {
    name: '中華そば 桐麺 梅田店(LINKS UMEDA)',
    kind: 'food',
    googleMapsUrl: gmap('中華そば 桐麺 梅田店 LINKS UMEDA'),
    description: '2025 年 12 月新開的桐麺梅田分店 — 100% 北海道小麥 12 分鐘燙麵,「麵是主角」的中華そば。',
    richDescription: `
      桐麺 2014 年在大阪創立,主打「麵條就是主角」的哲學。梅田分店 2025 年
      12 月 1 日新開幕,位於 LINKS UMEDA B1F(大阪站附近)。招牌「桐玉(冷)」
      用自家開發的「Super Kirimen 粉」— 100% 北海道小麥 + 精緻研磨的客製配方,
      麵條煮 12 分鐘,搭配蛋和特製醬料。均價 ¥1,000–¥1,999。
    `.trim(),
    highlights: ['麵條為主角', '2025 年新開梅田店', '桐玉冷麺 ¥1,000'],
    caveats: ['新店尚無大量長期評價'],
    source: 'https://tabelog.com/en/osaka/A2701/A270101/27153410/',
  },
  'kasumi-awaza': {
    name: 'らーめん 香澄 阿波座本店',
    kind: 'food',
    googleMapsUrl: gmap('らーめん香澄 阿波座本店'),
    description: '大阪煮干拉麵頂級名店 — 醬油 + 煮干濃縮湯頭 + Q 彈粗麵。',
    richDescription: `
      阿波座站 1 號出口步行 5 分鐘。「特製煮干ラーメン」是招牌 — 醬油醬汁與
      煮干(小魚乾)高湯的鮮味濃縮,搭配 Q 彈粗麵,份量十足。
      也有「特製煮干混麵」的乾拌版本。是大阪煮干拉麵中頂級的人氣店,
      多年 Tabelog 百名店常客。
      營業:11:00–15:00 / 18:00–22:00(週日休)。
    `.trim(),
    hoursNote: '11:00–15:00, 18:00–22:00;週日休',
    highlights: ['煮干湯頭濃縮鮮味', 'Tabelog 百名店', '有乾拌版'],
    caveats: ['週日休', '不是烏龍麵店(名字有「香澄」容易誤解)'],
    source: 'https://tabelog.com/en/osaka/A2701/A270105/27065090/',
  },
  'ikareta-fishtons': {
    name: 'Ikareta Noodle Fishtons(いかれたヌードル フィッシュトンズ)',
    kind: 'food',
    googleMapsUrl: gmap('Ikareta Noodle Fishtons'),
    description: '西大橋/西心齋橋附近的沾麵名店 — 濃厚豚骨魚介湯 + 全麥手打粗麵。',
    richDescription: `
      新町(西大橋/西心齋橋)8 席吧台小店,2025 Tabelog Ramen 100 選。
      招牌是「濃厚豚骨魚介つけ麺(沾麵)」— 湯要熬 5 天,配上店主木下師傅
      在店裡後房手打的全麥方切粗麵。麵份量分小(150g)和大(300g)。
      點餐用販賣機出票、坐下等出餐,自助感強。麵條有咬勁、湯頭鹹厚
      — 沾麵愛好者的朝聖點。
    `.trim(),
    highlights: ['熬 5 天的豚骨魚介湯', '2025 Tabelog Ramen 100', '手打全麥粗麵'],
    caveats: ['只有 8 席,排隊常態', '沾麵重口味,不適合喜歡清淡的'],
    source: 'https://tabelog.com/en/osaka/A2701/A270201/27101904/',
  },
  'kadoya-shokudo': {
    name: 'カドヤ食堂 総本店(西長堀)',
    kind: 'food',
    googleMapsUrl: gmap('カドヤ食堂 総本店 西長堀'),
    description: '2001 年開業、大阪拉麵一提到就會被提起的名店,清透醬油湯層次極深。',
    richDescription: `
      西長堀站附近,2001 年開業。老闆立橋先生對食材極為講究:名古屋交趾雞、
      鹿兒島黑豬、北海道昆布,配上國產稀有小麥「harugataka」自家製麵。
      招牌「中華そば」是清透醬油系,一入口就是動物系高湯的層次感,
      日本全國都有名的等級。菜單還有沾麵、鹽拉麵、混合麵,可加配料或飯類。
      平日也常常在排隊,是「來大阪必訪拉麵」名單常客。
    `.trim(),
    highlights: ['名古屋交趾雞湯頭', '國產稀有小麥自家製麵', '大阪拉麵殿堂級'],
    caveats: ['平日也要排隊', '離主要觀光區稍遠'],
    source: 'https://retty.me/area/PRE27/ARE94/SUB9404/100000020105/',
  },
  'akagi-ramen': {
    name: 'ラーメン家 あかぎ Akagi Ramen',
    kind: 'food',
    googleMapsUrl: gmap('ラーメン家 あかぎ'),
    description: '東淀川區的雞白湯拉麵冠軍店,連續 3 年 Tabelog Ramen 100 選,獎項一堆。',
    richDescription: `
      東淀川區瑞光的雞白湯(鶏白湯)專門店。得獎經歷驚人:
      SRY2023 雞白湯部門獎、2023 終極拉麵獎雞白湯類大賞、
      2023/2024/2025 連續 3 年 Tabelog Ramen OSAKA 百名店、Ramen EXPO 2025 冠軍。
      雞白湯是把雞骨熬到出乳白色湯的做法,濃郁滑順、鮮味爆炸。
      營業:午 11:30–15:00, 晚 18:00–22:00(每月第二個週一晚上休)。
    `.trim(),
    hoursNote: '11:30–15:00, 18:00–22:00;每月第二個週一晚上休',
    highlights: ['連 3 年 Tabelog 100', '雞白湯冠軍店', '獎項一整排'],
    caveats: ['東淀川離觀光區有距離', '每月第二個週一晚上不開'],
    source: 'https://retty.me/area/PRE27/ARE86/SUB8604/100001563704/',
  },
  'mugi-mensuke-umeda': {
    name: '麦と麺助 新梅田中津店',
    kind: 'food',
    googleMapsUrl: gmap('麦と麺助 新梅田中津店'),
    description: 'Moeyo Mensuke 的姊妹店 — 中津站步行 3 分鐘,乾淨明亮的高質感拉麵店。',
    richDescription: `
      「燃えよ麺助」(Moeyo Mensuke)的姊妹店,主廚同一位,風格類似但更精緻高級。
      中津站 1 號出口徒步 3 分鐘。TripAdvisor 4.1 分、Tabelog Ramen 100 選 2025。
      店內乾淨、時尚、完全禁菸,是拉麵店裡少見的「high-end」氛圍。
      雞湯與雞肉配料的品質受好評,午餐均價 ¥2,000 左右(比一般拉麵略高)。
      營業:11:00–15:30,週二休。排隊常態。
    `.trim(),
    hoursNote: '11:00–15:30;週二休',
    highlights: ['Moeyo Mensuke 姊妹店', '高質感禁菸空間', 'Tabelog 100'],
    caveats: ['週二公休', '排隊常態', '均價 ¥2,000 比一般拉麵貴'],
    source: 'https://tabelog.com/en/osaka/A2701/A270101/27104891/',
  },

  // -- 大阪燒 --
  'fukutaro-honten': {
    name: '福太郎 大阪燒(本店)',
    kind: 'food',
    googleMapsUrl: gmap('福太郎 大阪燒 本店 千日前'),
    description: '難波日本橋米其林推薦、Tabelog 3.75 的排隊大阪燒 — 招牌是青蔥燒。',
    richDescription: `
      難波千日前商店街的大阪燒名店,米其林推薦、Tabelog 3.75(在難波/日本橋/道頓堀
      大阪燒排名第一)。招牌三品:大阪燒、蔥燒、炒麵,其中在麵糊裡加大量切碎青蔥的
      「青蔥大阪燒」最特別。價格 ¥780 起,搭配牡蠣/章魚/花枝/蝦/豬肉不等。
      店內昏黃燈光 + 復古氛圍,坐在台前看師傅現煎超有臨場感。
      本店旁還開了新館和二館,如果本店客滿可以問問。
    `.trim(),
    highlights: ['米其林推薦', 'Tabelog 3.75', '青蔥大阪燒特別'],
    caveats: ['排隊 30 分起跳', '店內空間不大'],
    source: 'https://nigi33.tw/osaka-18/',
  },
  'chibo-sennichimae': {
    name: '千房 千日前本店',
    kind: 'food',
    googleMapsUrl: gmap('千房 千日前本店'),
    description: '1973 年千日前創立、大阪燒 50 年老字號的總本店 — 醬汁秀是名場面。',
    richDescription: `
      1973 年於千日前創立的大阪燒名店,現在全球超過 50 間分店,
      千日前本店是所有分店的原點。難波站徒步 5 分鐘。
      千房大阪燒和其他家有點不同:餅皮更厚實、醬汁自家特製,價位稍高
      但食材、擺盤、以及「師傅在鐵板前上醬汁的秀」都值得。
      店內有座位區和吧台區,吧台看得到現煎過程。
    `.trim(),
    highlights: ['50 年老字號總本店', '醬汁秀', '有中文菜單'],
    caveats: ['價位比其他大阪燒略高', '假日排隊'],
    source: 'https://siouteng0822.pixnet.net/blog/post/167066842',
  },

  // -- 甜點 / 和菓子 --
  'gyokuseiya': {
    name: '玉製家(ぎょくせいや)',
    kind: 'food',
    googleMapsUrl: gmap('玉製家 日本橋'),
    description: '日本橋站附近的「おはぎ」(粢飯糰)排隊名店 — Tabelog 百名店 4 年連續。',
    richDescription: `
      「玉製家」是日本橋站附近的和菓子專門店,招牌是「おはぎ」(用糯米捏成、
      外層裹紅豆餡/黃豆粉的和菓子,類似麻糬但更軟一點)。菜單很簡單:
      粗紅豆餡(つぶあん)、細紅豆餡(こしあん)、黃豆粉(きなこ)三種。
      連續 4 年 Tabelog 百名店。
      營業:14:00 開賣、賣完就關;週三、四、日公休 — 想吃要抓時間。
    `.trim(),
    hoursNote: '14:00 開始賣直到售完;週三、四、日公休',
    highlights: ['Tabelog 百名店 4 連霸', 'おはぎ 三種口味'],
    caveats: ['開的時間短(14:00 起)', '週三/四/日公休', '常常排隊'],
    source: 'https://tabelog.com/en/osaka/A2701/A270202/27001576/',
  },

  // -- 其他 --
  'isami-kamaboko': {
    name: 'いさみ蒲鉾店(惠美須町)',
    kind: 'food',
    googleMapsUrl: gmap('いさみ蒲鉾店 恵美須町'),
    description: '惠美須町站 5 號出口 0 分鐘 — 百年歷史的炸魚漿老店,飯店樓下的便利小吃。',
    richDescription: `
      100 年歷史的炸魚漿(關西叫「蒲鉾」)老店,距離你們的飯店超近 —
      惠美須町站 5 號出口 0 分鐘、走出來就是。位於浪速區惠美須西 1-2-6。
      招牌:炸花枝(イカ天)、炸薑(生姜天),油品質很好、不膩口。
      營業:週一到週六 11:00–18:00,週日休。是外帶為主的小店。
      新世界 / 通天閣行程結束後回飯店路上順手買一份,超好的收尾。
    `.trim(),
    hoursNote: '11:00–18:00;週日休',
    highlights: ['飯店樓下,超方便', '百年老店', '外帶配啤酒完美'],
    caveats: ['週日休', '外帶為主,沒座位'],
    source: 'https://kdice2025.hatenablog.com/entry/2025/07/23/061607',
  },
  'namba-city': {
    name: '難波 CITY 本館',
    kind: 'shopping',
    googleMapsUrl: gmap('難波 CITY 本館'),
    description: '南海難波站直通、290 家店 B2-2F 的大型商場,UNIQLO、無印、ABC Mart 都在。',
    richDescription: `
      南海難波站直通的大型購物商場,1978 年開幕,經多次翻新,290 家店
      橫跨 B2-2F。UNIQLO、無印良品、ABC Mart 這類主力大牌都齊。館內
      餐廳選擇多(大阪燒/章魚燒/抹茶甜點),有嬰兒室、免稅櫃檯、多語旅遊諮詢。
      跟隔壁的難波 PARKS(公園商場)可以一起逛,是南海線抵達或回程時
      最方便的殺時間點。
    `.trim(),
    highlights: ['南海難波站直通', '290 家店', '免稅櫃檯'],
    caveats: ['大眾品牌為主,不特別找也逛得到差不多的'],
    source: 'https://osaka-info.jp/tw/spot/namba-city/',
  },
  'kaiyukan': {
    name: '海遊館',
    kind: 'photo',
    googleMapsUrl: gmap('海遊館 Osaka Aquarium'),
    description: '世界最大級水族館,鯨鯊、企鵝、水獺、水豚都在。動線是「從 8F 往下螺旋走」。',
    richDescription: `
      大阪 Metro 中央線「大阪港」站 1 號出口步行 5 分鐘。世界最大級水族館之一。
      動線設計非常聰明:進場後搭電梯直上 8 樓的「日本森林」區,然後沿著
      螺旋緩坡「由上往下」慢慢逛 — 感覺像從海面慢慢潛入海底。
      核心是超巨大的「太平洋」水槽,鯨鯊在裡面優游,螺旋動線讓你不同高度
      不同角度反覆和牠相遇。也有魟魚觸摸池、水母銀河(宇宙主題)等區域。
      建議停留 3–4 小時,親子/情侶/單獨都適合。
    `.trim(),
    hoursNote: '通常 10:00–20:00(依季節)',
    highlights: ['鯨鯊+螺旋動線', '水母銀河', '交通便利'],
    caveats: ['假日人多', '拍照建議手機而不是相機(玻璃反光)'],
    source: 'https://ajunfun.tw/kaiyukan/',
  },
  'toyo-ceramics-museum': {
    name: '大阪市立東洋陶磁美術館',
    kind: 'photo',
    googleMapsUrl: gmap('大阪市立東洋陶磁美術館 中之島'),
    description: '中之島公園內、東洋陶瓷世界頂級收藏 — 2 件國寶 + 13 件重要文化財。',
    richDescription: `
      1982 年開館、位於中之島公園內。收藏約 5,700 件東洋陶瓷(以「安宅收藏」為核心,
      加上李秉昌博士捐贈的韓國/中國陶磁),其中 2 件國寶、13 件重要文化財,
      是世界級的東洋陶瓷收藏之一。
      2024 年 4 月剛完成翻新,增建了時尚的玻璃入口大廳,也裝了 360 度全方向
      展示櫃 — 你可以繞著一件陶瓷從各角度細看,這在博物館算少見的體驗。
      有電梯、嬰兒床等友善設施。
    `.trim(),
    hoursNote: '通常 09:30–17:00,週一休',
    highlights: ['2 件國寶 13 件重要文化財', '360 度展示櫃', '2024 剛翻新'],
    caveats: ['專業陶瓷迷才會逛得深,一般路人 1 小時內'],
    source: 'https://osaka-info.jp/spot/museum-oriental-ceramics-osaka/',
  },
  'orange-street-horie': {
    name: 'Orange Street(南堀江 立花通)',
    kind: 'shopping',
    googleMapsUrl: gmap('Orange Street 南堀江 立花通'),
    description: '心齋橋走 10 分鐘、離人潮遠一點的潮流小巷 — 潮牌、選物、咖啡、家飾雜貨 800 公尺。',
    richDescription: `
      距離心齋橋/難波步行 10 分鐘,或大阪 Metro 四橋線「四橋」站 3 分鐘。
      以「立花通」為中心的 800 公尺潮流街區,兩側都是有品味的咖啡館、
      潮牌旗艦店、復古選物、進口家具、室內雜貨。跟心齋橋的百貨大眾感相反,
      Orange Street 是設計師/文青取向、氛圍悠閒、好拍照。
      堀江公園對面的「萬福寺茶庭」是一週只開三天的和式咖啡館,寺院內的木質空間
      可以喝抹茶配蕎麥聖代,很適合。
    `.trim(),
    highlights: ['潮流 + 選物 + 咖啡', '避開心齋橋人潮', '800 公尺一直走都有東西'],
    caveats: ['很多店中午才開', '走遠一點路才會到'],
    source: 'https://matcha-jp.com/tw/6320',
  },

}

// ---------- default stops (行程時間軸) ----------
// day: 1..6 為正式旅遊天,'backup' 為備選區
// duration 單位為分鐘,可能為 0(表示只是「經過」)

export const defaultStops = [
  // ============ Day 1: 09/25 週五 (出發) ============
  { id: 's-1-1', placeId: 'mrt-qizhang',   day: 1, order: 1, arriveAt: '11:00', duration: 0 },
  { id: 's-1-2', placeId: 'tpe-t1',        day: 1, order: 2, arriveAt: '12:19', duration: 201 },
  { id: 's-1-3', placeId: 'kix-t1-south',  day: 1, order: 3, arriveAt: '19:30', duration: 60 },
  { id: 's-1-4', placeId: 'hotel-hinode',  day: 1, order: 4, arriveAt: '21:12', duration: 60 },

  // ============ Day 2: 09/26 週六 ============
  { id: 's-2-1',  placeId: 'hotel-hinode',    day: 2, order: 1,  arriveAt: '08:00', duration: 30, note: '出發前吃早餐/整裝' },
  { id: 's-2-2',  placeId: 'namba-yasaka',    day: 2, order: 2,  arriveAt: '08:43', duration: 30 },
  { id: 's-2-3',  placeId: 'tennoji-zoo',     day: 2, order: 3,  arriveAt: '09:28', duration: 150 },
  { id: 's-2-4',  placeId: 'ajinoya',         day: 2, order: 4,  arriveAt: '12:17', duration: 60 },
  { id: 's-2-5',  placeId: 'takotako-king',   day: 2, order: 5,  arriveAt: '13:26', duration: 30 },
  { id: 's-2-6',  placeId: 'shinsaibashi',    day: 2, order: 6,  arriveAt: '14:08', duration: 120 },
  { id: 's-2-7',  placeId: 'glico-sign',      day: 2, order: 7,  arriveAt: '16:23', duration: 10 },
  { id: 's-2-8',  placeId: 'dotonbori',       day: 2, order: 8,  arriveAt: '16:34', duration: 60 },
  { id: 's-2-9',  placeId: 'zen-shinsaibashi',day: 2, order: 9,  arriveAt: '17:36', duration: 90 },
  { id: 's-2-10', placeId: 'hotel-hinode',    day: 2, order: 10, arriveAt: '19:23', duration: 60 },

  // ============ Day 3: 09/27 週日 ============
  { id: 's-3-1',  placeId: 'hotel-hinode',       day: 3, order: 1,  arriveAt: '08:00', duration: 30 },
  { id: 's-3-2',  placeId: 'kids-book-forest',   day: 3, order: 2,  arriveAt: '08:58', duration: 10, note: '別忘了預約!' },
  { id: 's-3-3',  placeId: 'science-museum',     day: 3, order: 3,  arriveAt: '09:29', duration: 90 },
  { id: 's-3-4',  placeId: 'nakanoshima-museum', day: 3, order: 4,  arriveAt: '11:02', duration: 90 },
  { id: 's-3-5',  placeId: 'moeyo-mensuke',      day: 3, order: 5,  arriveAt: '12:45', duration: 60 },
  { id: 's-3-6',  placeId: 'disney-store-hep5',  day: 3, order: 6,  arriveAt: '14:08', duration: 30 },
  { id: 's-3-7',  placeId: 'nintendo-osaka',     day: 3, order: 7,  arriveAt: '14:46', duration: 30 },
  { id: 's-3-8',  placeId: 'lucua-osaka',        day: 3, order: 8,  arriveAt: '15:20', duration: 120 },
  { id: 's-3-9',  placeId: 'rikimaru-umeda',     day: 3, order: 9,  arriveAt: '17:31', duration: 90 },
  { id: 's-3-10', placeId: 'grenier-umeda',      day: 3, order: 10, arriveAt: '19:06', duration: 30 },
  { id: 's-3-11', placeId: 'dojimahama-tower',   day: 3, order: 11, arriveAt: '19:50', duration: 60 },
  { id: 's-3-12', placeId: 'hotel-hinode',      day: 3, order: 12, arriveAt: '21:15', duration: 60 },

  // ============ Day 4: 09/28 週一 ============
  { id: 's-4-1',  placeId: 'hotel-hinode',           day: 4, order: 1,  arriveAt: '08:00', duration: 60 },
  { id: 's-4-2',  placeId: 'history-museum',         day: 4, order: 2,  arriveAt: '09:18', duration: 150 },
  { id: 's-4-3',  placeId: 'gettou-izakaya',         day: 4, order: 3,  arriveAt: '11:59', duration: 60 },
  { id: 's-4-4',  placeId: 'kaiyodo-figure-museum',  day: 4, order: 4,  arriveAt: '13:22', duration: 90 },
  { id: 's-4-5',  placeId: 'osaka-castle',           day: 4, order: 5,  arriveAt: '14:57', duration: 90 },
  { id: 's-4-6',  placeId: 'yaekatsu-kushikatsu',    day: 4, order: 6,  arriveAt: '16:54', duration: 45 },
  { id: 's-4-7',  placeId: 'daruma-shinsekai',       day: 4, order: 7,  arriveAt: '17:43', duration: 45 },
  { id: 's-4-8',  placeId: 'janjan-yokocho',         day: 4, order: 8,  arriveAt: '18:33', duration: 30 },
  { id: 's-4-9',  placeId: 'shinsekai-market',       day: 4, order: 9,  arriveAt: '19:12', duration: 30 },
  { id: 's-4-10', placeId: 'tsutenkaku',             day: 4, order: 10, arriveAt: '19:45', duration: 60 },
  { id: 's-4-11', placeId: 'hotel-hinode',           day: 4, order: 11, arriveAt: '20:50', duration: 60 },

  // ============ Day 5: 09/29 週二 (USJ 整日) ============
  { id: 's-5-1', placeId: 'hotel-hinode',  day: 5, order: 1, arriveAt: '06:00', duration: 0,   note: '超早出發!' },
  { id: 's-5-2', placeId: 'usj',           day: 5, order: 2, arriveAt: '06:33', duration: 750, note: '14:00 花車遊行' },
  { id: 's-5-3', placeId: 'hotel-hinode',  day: 5, order: 3, arriveAt: '19:30', duration: 60 },

  // ============ Day 6: 09/30 週三 (回國) ============
  { id: 's-6-1', placeId: 'hotel-hinode',    day: 6, order: 1, arriveAt: '08:00', duration: 60 },
  { id: 's-6-2', placeId: 'kix-departure',   day: 6, order: 2, arriveAt: '09:55', duration: 60 },

  // ============ Backup 備選區 ============
  { id: 's-b-1',  placeId: 'menya-seiryu',           day: 'backup', order: 1 },
  { id: 's-b-2',  placeId: 'totomen-en',             day: 'backup', order: 2 },
  { id: 's-b-3',  placeId: 'nishimura-noodle',       day: 'backup', order: 3 },
  { id: 's-b-4',  placeId: 'toyo-ceramics-museum',   day: 'backup', order: 4 },
  { id: 's-b-6',  placeId: 'rikimaru-umeda-doyama',  day: 'backup', order: 6 },
  { id: 's-b-7',  placeId: 'kirimen-umeda',          day: 'backup', order: 7 },
  { id: 's-b-8',  placeId: 'kasumi-awaza',           day: 'backup', order: 8 },
  { id: 's-b-9',  placeId: 'ikareta-fishtons',       day: 'backup', order: 9 },
  { id: 's-b-10', placeId: 'orange-street-horie',    day: 'backup', order: 10 },
  { id: 's-b-11', placeId: 'rikimaru-namba-minato',  day: 'backup', order: 11 },
  { id: 's-b-12', placeId: 'rikimaru-shinsaibashi',  day: 'backup', order: 12 },
  { id: 's-b-13', placeId: 'rikimaru-dotonbori',     day: 'backup', order: 13 },
  { id: 's-b-14', placeId: 'rikimaru-sennichimae',   day: 'backup', order: 14 },
  { id: 's-b-15', placeId: 'gyokuseiya',             day: 'backup', order: 15 },
  { id: 's-b-16', placeId: 'fukutaro-honten',        day: 'backup', order: 16 },
  { id: 's-b-17', placeId: 'chibo-sennichimae',      day: 'backup', order: 17 },
  { id: 's-b-18', placeId: 'rikimaru-nankai-namba',  day: 'backup', order: 18 },
  { id: 's-b-19', placeId: 'namba-city',             day: 'backup', order: 19 },
  { id: 's-b-20', placeId: 'isami-kamaboko',         day: 'backup', order: 20 },
  { id: 's-b-21', placeId: 'kaiyukan',               day: 'backup', order: 21 },
  { id: 's-b-22', placeId: 'kadoya-shokudo',         day: 'backup', order: 22 },
  { id: 's-b-23', placeId: 'akagi-ramen',            day: 'backup', order: 23 },
  { id: 's-b-24', placeId: 'mugi-mensuke-umeda',     day: 'backup', order: 24 },
]

// ---------- helpers for UI ----------

export function stopsByDay(stops, day) {
  return stops
    .filter((s) => s.day === day)
    .sort((a, b) => a.order - b.order)
}

export function getPlace(placeId) {
  return places[placeId]
}
