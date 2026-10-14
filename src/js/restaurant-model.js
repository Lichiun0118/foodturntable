export function hasPrice(restaurant) {
  return Number.isFinite(restaurant.priceMin) && Number.isFinite(restaurant.priceMax)
    && restaurant.priceMin >= 0 && restaurant.priceMax >= restaurant.priceMin;
}

export function matchesBudget(restaurant, budget) {
  return budget === null || (hasPrice(restaurant) && restaurant.priceMax <= budget);
}

export function priceLabel(restaurant) {
  if (!hasPrice(restaurant)) return '價格待確認';
  const min = restaurant.priceMin.toLocaleString('zh-TW');
  const max = restaurant.priceMax.toLocaleString('zh-TW');
  return `NT$ ${min === max ? min : `${min}–${max}`}／人`;
}

export function mapUrl(restaurant) {
  if (typeof restaurant.mapsUrl === 'string') {
    try {
      const url = new URL(restaurant.mapsUrl);
      if (url.protocol === 'https:' && ['www.google.com', 'maps.google.com', 'maps.app.goo.gl'].includes(url.hostname)) return url.href;
    } catch { /* Fall back to a search link for unverified branches. */ }
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`公館 ${restaurant.name}`)}`;
}

// Keep legacy names/removals in the same order, but enrich known names with
// verified defaults when available. Discard malformed storage records safely.
export function normalizeRestaurants(records, defaults) {
  const names = new Set();
  return records.flatMap((record) => {
    const name = typeof record === 'string' ? record.trim() : record?.name?.trim?.();
    if (!name || names.has(name)) return [];
    names.add(name);
    const base = defaults.find((r) => r.name === name) || {
      name, priceMin: null, priceMax: null, priceSource: null, priceCheckedAt: null, mapsUrl: null,
    };
    const restaurant = { ...base, ...(typeof record === 'object' ? record : {}), name };
    if (!hasPrice(restaurant)) {
      restaurant.priceMin = null;
      restaurant.priceMax = null;
      restaurant.priceSource = null;
      restaurant.priceCheckedAt = null;
    }
    return [restaurant];
  });
}
