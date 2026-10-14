export const CATALOG_VERSION = 2;

export const DEFAULT_OPTIONS = [
  "小高",
  "壽司郎",
  "麥當勞",
  "墨洋",
  "鍋in",
  "大盛",
  "雪腐",
  "柳狀元",
  "義樂麵屋",
  "辛殿",
  "烤必勝",
  "五九",
  "小飯館",
  "大埔鐵板燒",
  "沙嗲士多",
  "雞soup",
  "阿薄郎",
  "塊雞師",
  "白帝城",
  "道樂",
  "三米三",
  "池先生",
  "台大牛莊",
  "泰好吃船麵",
  "隱家拉麵",
  "龍記炒燴",
  "喫尤鐵板燒",
  "韓天閣",
  "鐵三中螺螄粉",
];

// Source: the user's price table, supplied on 2026-10-14 (Asia/Taipei).
// Additional ranges come from the six user-provided Maps screenshots.
// The user states every range references Google Maps; these are transcribed
// reference ranges, not independently checked branch prices or live updates.
const PRICE_RANGES = {
  '小高': [135, 145],
  '壽司郎': [400, 600],
  '麥當勞': [100, 250],
  '墨洋': [200, 400],
  '鍋in': [200, 400],
  '大盛': [200, 400],
  '雪腐': [100, 300],
  '柳狀元': [200, 400],
  '義樂麵屋': [200, 400],
  '辛殿': [800, 1000],
  '烤必勝': [800, 1000],
  '五九': [100, 200],
  '小飯館': [200, 400],
  '大埔鐵板燒': [200, 400],
  '沙嗲士多': [100, 200],
  '雞soup': [200, 400],
  '阿薄郎': [200, 400],
  '塊雞師': [200, 400],
  '白帝城': [100, 400],
  '道樂': [200, 400],
  '三米三': [200, 400],
  '池先生': [200, 400],
  '台大牛莊': [100, 200],
  '泰好吃船麵': [1, 200],
  '隱家拉麵': [200, 400],
  '龍記炒燴': [1, 200],
  '喫尤鐵板燒': [200, 400],
  '韓天閣': [200, 400],
  '鐵三中螺螄粉': [200, 400],
};

// Added from the six Google Maps screenshots supplied by the user. Keep the
// short display names while searching the full names/branches in Maps.
const NEW_MAP_QUERIES = {
  '泰好吃船麵': '公館 泰好吃泰國船麵',
  '隱家拉麵': '隱家拉麵 公館店',
  '龍記炒燴': '公館 水源市場 龍記炒燴',
  '喫尤鐵板燒': '喫尤平價鐵板燒 公館店',
  '韓天閣': '公館 韓天閣',
  '鐵三中螺螄粉': '鐵三中螺螄粉 台北公館店',
};

export const DEFAULT_RESTAURANTS = DEFAULT_OPTIONS.map((name) => ({
  name,
  introducedIn: NEW_MAP_QUERIES[name] ? 2 : 1,
  priceMin: PRICE_RANGES[name][0],
  priceMax: PRICE_RANGES[name][1],
  priceSource: 'google-maps',
  priceCheckedAt: '2026-10-14',
  priceEdited: false,
  mapsUrl: name === '大盛'
    ? 'https://www.google.com/maps/search/?api=1&query=%E5%85%AC%E9%A4%A8%20%E5%A4%A7%E7%9B%9B%E8%B1%AC%E6%8E%92'
    : NEW_MAP_QUERIES[name]
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(NEW_MAP_QUERIES[name])}`
      : null,
  priceReferenceUrl: null,
  priceNote: null,
}));
