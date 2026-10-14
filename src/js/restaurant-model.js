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
    const saved = typeof record === 'object' && record !== null ? record : {};
    const restaurant = { ...base, ...saved, name };
    // Older saved lists contain null prices even when the visitor has never
    // edited them. Let those entries receive newly verified shared defaults.
    // A valid personal price or an explicit clear must remain a local override.
    if (!hasPrice(saved) && saved.priceEdited !== true) {
      for (const key of ['priceMin', 'priceMax', 'priceSource', 'priceCheckedAt', 'priceReferenceUrl', 'priceNote']) {
        restaurant[key] = base[key] ?? null;
      }
    }
    if (hasPrice(saved) || saved.priceEdited === true) {
      // An old personal override must not inherit a source URL/description
      // that describes a different shared price.
      restaurant.priceReferenceUrl = saved.priceReferenceUrl ?? null;
      restaurant.priceNote = saved.priceNote ?? null;
    }
    if (!saved.mapsUrl) restaurant.mapsUrl = base.mapsUrl ?? null;
    if (!hasPrice(restaurant)) {
      restaurant.priceMin = null;
      restaurant.priceMax = null;
      restaurant.priceSource = null;
      restaurant.priceCheckedAt = null;
      restaurant.priceReferenceUrl = null;
      restaurant.priceNote = null;
    }
    return [restaurant];
  });
}


export function priceSourceLabel(restaurant) {
  if (!hasPrice(restaurant)) return '價格待確認';
  const labels = {
    'google-maps': 'Google Maps（手動記錄）',
    menu: '官網／菜單參考',
    review: '食記參考',
    personal: '自行估算',
  };
  const label = labels[restaurant.priceSource] || '自行估算';
  return restaurant.priceCheckedAt ? `${label} · ${restaurant.priceCheckedAt}` : label;
}

export function priceReferenceUrl(restaurant) {
  if (!hasPrice(restaurant) || !restaurant.priceReferenceUrl) return null;
  try {
    const url = new URL(restaurant.priceReferenceUrl);
    if (url.protocol === 'https:' && !url.username && !url.password) return url.href;
  } catch { /* Missing/invalid references do not become clickable links. */ }
  return null;
}
