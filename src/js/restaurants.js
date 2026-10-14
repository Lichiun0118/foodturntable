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
];

// Source: user-provided Google Maps screenshot, identified by the user as
// 大盛豬排 on 2026-10-14 (Asia/Taipei): 平均每人 $200–400, 69 人回報.
// This is a reported per-person range, not a single average of NT$300.
// The link is a name search, not a verified branch-specific place URL.
const VERIFIED_PRICES = {
  '大盛': {
    priceMin: 200,
    priceMax: 400,
    priceSource: 'google-maps',
    priceCheckedAt: '2026-10-14',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=%E5%85%AC%E9%A4%A8%20%E5%A4%A7%E7%9B%9B%E8%B1%AC%E6%8E%92',
  },
};

// Other prices remain unknown until confirmed against the intended branch.
export const DEFAULT_RESTAURANTS = DEFAULT_OPTIONS.map((name) => ({
  name,
  priceMin: null,
  priceMax: null,
  priceSource: null,
  priceCheckedAt: null,
  mapsUrl: null,
  ...VERIFIED_PRICES[name],
}));
