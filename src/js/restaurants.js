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

// Google Maps prices have not been verified for these branches. Never infer a
// price from a restaurant name. Add confirmed per-person ranges and source
// links here when branch-specific information becomes available.
export const DEFAULT_RESTAURANTS = DEFAULT_OPTIONS.map((name) => ({
  name,
  priceMin: null,
  priceMax: null,
  priceSource: null,
  priceCheckedAt: null,
  mapsUrl: null,
}));
