import { DEFAULT_RESTAURANTS } from './restaurants.js?v=76a08ec61e42';
import { hasPrice, matchesBudget, priceLabel, mapUrl, normalizeRestaurants, priceSourceLabel, priceReferenceUrl } from './restaurant-model.js?v=9f1f501edb88';

const STORAGE_KEY = 'foodturntable_restaurants_v2';
const LEGACY_STORAGE_KEY = 'minimalist_wheel_options';
const $ = (id) => document.getElementById(id);
let restaurants = loadRestaurants();
let budget = null;
let drawing = false;
let winnerName = null;

function loadRestaurants() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    const parsed = JSON.parse(saved ?? legacy ?? 'null');
    if (Array.isArray(parsed)) return normalizeRestaurants(parsed, DEFAULT_RESTAURANTS);
  } catch { /* Invalid or inaccessible storage should not stop dinner selection. */ }
  return DEFAULT_RESTAURANTS.map((r) => ({ ...r }));
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(restaurants));
    return true;
  } catch {
    $('editMessage').textContent = '瀏覽器無法儲存資料；這次修改僅保留到頁面關閉。';
    return false;
  }
}

function candidates() { return restaurants.filter((r) => matchesBudget(r, budget)); }


function render() {
  const eligible = candidates();
  $('listCount').textContent = restaurants.length;
  $('candidateCount').textContent = eligible.length ? `${eligible.length} 家餐廳參加抽選 · 每家機率相同` : '沒有符合預算的餐廳，試試提高預算或補上價格。';
  const unknown = restaurants.filter((r) => !hasPrice(r)).length;
  $('priceNotice').textContent = unknown ? `${unknown} 家價格待確認。其餘可查看價格來源；Maps 連結為店名查詢，請核對分店。` : '已記錄每人參考價格；請查看各店來源與說明，實際消費以店家現場為準。';
  $('drawButton').disabled = drawing || !eligible.length || !$('budgetInput').validity.valid;
  $('restaurantList').replaceChildren();
  for (const restaurant of restaurants) {
    const row = document.createElement('div');
    row.className = `restaurant-row${matchesBudget(restaurant, budget) ? '' : ' excluded'}${restaurant.name === winnerName ? ' selected' : ''}`;
    const info = document.createElement('div'); info.className = 'restaurant-info';
    const name = document.createElement('div'); name.className = 'restaurant-name'; name.textContent = restaurant.name;
    const price = document.createElement('div'); price.className = 'restaurant-price'; price.textContent = priceLabel(restaurant);
    price.title = priceSourceLabel(restaurant);
    info.append(name, price);
    if (hasPrice(restaurant)) {
      const source = document.createElement('div'); source.className = 'restaurant-source';
      source.textContent = priceSourceLabel(restaurant);
      const reference = priceReferenceUrl(restaurant);
      if (reference) {
        const anchor = document.createElement('a'); anchor.href = reference;
        anchor.textContent = '查看來源 ↗'; anchor.target = '_blank'; anchor.rel = 'noopener noreferrer';
        source.append(document.createTextNode(' · '), anchor);
      }
      info.append(source);
      if (restaurant.priceNote) {
        const note = document.createElement('div'); note.className = 'restaurant-note';
        note.textContent = restaurant.priceNote; info.append(note);
      }
    }
    const link = document.createElement('a'); link.className = 'restaurant-map'; link.textContent = '↗';
    link.href = mapUrl(restaurant); link.target = '_blank'; link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `在 Google Maps 查詢${restaurant.name}`);
    row.append(info, link); $('restaurantList').append(row);
  }
  if (!restaurants.length) {
    const empty = document.createElement('p'); empty.className = 'empty-list'; empty.textContent = '名單還是空的，先加入一家喜歡的餐廳吧。'; $('restaurantList').append(empty);
  }
  const previous = $('removeOptionSelect').value;
  $('removeOptionSelect').replaceChildren();
  restaurants.forEach((r) => {
    const option = document.createElement('option'); option.value = r.name; option.textContent = r.name; $('removeOptionSelect').append(option);
  });
  if (restaurants.some((r) => r.name === previous)) $('removeOptionSelect').value = previous;
  syncEditor();
  for (const el of document.querySelectorAll('#manageOptions input, #manageOptions select, #manageOptions button, .budget-chip, #budgetInput')) {
    el.disabled = drawing || (el.closest('#priceForm') && !restaurants.length);
  }
}

function syncEditor() {
  const restaurant = restaurants.find((r) => r.name === $('removeOptionSelect').value);
  $('priceMin').value = restaurant?.priceMin ?? '';
  $('priceMax').value = restaurant?.priceMax ?? '';
  $('priceSource').value = ['google-maps', 'menu', 'review'].includes(restaurant?.priceSource) ? restaurant.priceSource : 'personal';
  $('priceReferenceUrl').value = restaurant?.priceReferenceUrl ?? '';
  $('priceNote').value = restaurant?.priceNote ?? '';
  $('editMap').hidden = !restaurant;
  if (restaurant) $('editMap').href = mapUrl(restaurant);
}

function resetResult() {
  winnerName = null;
  $('resultKicker').textContent = '給今晚一個小驚喜';
  $('resultName').textContent = '拉一下，晚餐就有著落。';
  $('resultPrice').textContent = '從你的口袋名單，抽出今晚的答案。';
  $('resultMap').hidden = true;
  $('resultReference').hidden = true;
  $('drawAnnouncement').textContent = '';
  setReel(['今晚的好運']);
}

function applyBudget(value) {
  if (drawing) return;
  budget = value;
  document.querySelectorAll('.budget-chip').forEach((button) => {
    const selected = (button.dataset.budget === '' ? null : Number(button.dataset.budget)) === budget;
    button.classList.toggle('active', selected); button.setAttribute('aria-pressed', String(selected));
  });
  resetResult(); render();
}

function setReel(names) {
  const track = $('slotTrack'); track.style.transform = 'translateY(0)'; track.replaceChildren();
  names.forEach((name) => { const item = document.createElement('div'); item.className = 'slot-item'; item.textContent = name; track.append(item); });
}

async function draw() {
  const eligible = candidates();
  if (drawing || !eligible.length || !$('budgetInput').validity.valid) return;
  drawing = true; winnerName = null;
  // Choose the winner once, independently of animation length or timing.
  const winner = eligible[Math.floor(Math.random() * eligible.length)];
  $('resultCard').classList.add('drawing'); $('resultMap').hidden = true; $('resultReference').hidden = true;
  $('resultKicker').textContent = '好運正在路上'; $('resultName').textContent = '今晚的答案是…';
  $('resultPrice').textContent = '從符合預算的餐廳中抽選';
  $('drawAnnouncement').textContent = '正在抽選餐廳';
  $('drawButton').firstElementChild.textContent = '抽選中…'; render();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced && eligible.length > 1) {
    const names = Array.from({length: 24}, (_, i) => eligible[i % eligible.length].name);
    names.push(winner.name); setReel(names);
    const animation = $('slotTrack').animate([{transform: 'translateY(0)'}, {transform: `translateY(-${(names.length - 1) * 80}px)`}], {duration: 2200, easing: 'cubic-bezier(.12,.65,.15,1)', fill: 'forwards'});
    try { await animation.finished; } catch { /* Always show the chosen result if animation is interrupted. */ }
    animation.cancel();
  }
  setReel([winner.name]); winnerName = winner.name; drawing = false;
  $('resultCard').classList.remove('drawing'); $('resultKicker').textContent = '今晚就吃這家';
  $('resultName').textContent = winner.name;
  $('resultPrice').textContent = `${priceLabel(winner)} · ${hasPrice(winner) ? priceSourceLabel(winner) : '出發前先確認價格'} `;
  if (winner.priceNote) $('resultPrice').textContent += ` · ${winner.priceNote}`;
  const reference = priceReferenceUrl(winner);
  $('resultReference').hidden = !reference;
  if (reference) $('resultReference').href = reference;
  $('resultMap').href = mapUrl(winner); $('resultMap').hidden = false;
  $('drawAnnouncement').textContent = `今晚就吃${winner.name}，${priceLabel(winner)}`;
  $('drawButton').firstElementChild.textContent = '再拉一次'; render();
}

$('drawButton').addEventListener('click', draw);
document.querySelectorAll('.budget-chip').forEach((button) => button.addEventListener('click', () => {
  $('budgetInput').value = ''; applyBudget(button.dataset.budget === '' ? null : Number(button.dataset.budget));
}));
$('budgetInput').addEventListener('input', () => {
  if ($('budgetInput').value === '') applyBudget(null);
  else if ($('budgetInput').validity.valid) applyBudget(Number($('budgetInput').value));
  else {
    $('drawButton').disabled = true;
    $('candidateCount').textContent = '請輸入 1～100,000 的整數預算。';
  }
});
$('addForm').addEventListener('submit', (event) => {
  event.preventDefault(); if (drawing) return;
  const name = $('newOptionInput').value.trim();
  if (!name) return;
  if (restaurants.some((r) => r.name === name)) { $('editMessage').textContent = '這家已經在名單裡了。'; return; }
  restaurants.push({name, priceMin: null, priceMax: null, priceSource: null, priceCheckedAt: null, mapsUrl: null});
  $('newOptionInput').value = ''; resetResult(); render();
  $('removeOptionSelect').value = name; syncEditor();
  if (persist()) $('editMessage').textContent = `已加入${name}，可在下方補上價格。`;
});
$('removeOptionSelect').addEventListener('change', syncEditor);
$('removeButton').addEventListener('click', () => {
  if (drawing) return;
  const name = $('removeOptionSelect').value;
  restaurants = restaurants.filter((r) => r.name !== name);
  resetResult(); render(); if (persist()) $('editMessage').textContent = `已移除${name}。`;
});
$('priceForm').addEventListener('submit', (event) => {
  event.preventDefault(); if (drawing) return;
  const restaurant = restaurants.find((r) => r.name === $('removeOptionSelect').value);
  if (!restaurant) return;
  const min = $('priceMin').value, max = $('priceMax').value;
  if ((min === '') !== (max === '') || (min !== '' && Number(min) > Number(max))) {
    $('editMessage').textContent = '請填寫完整區間，最高金額不能小於最低金額。'; return;
  }
  const referenceInput = $('priceReferenceUrl').value.trim();
  if (min !== '' && referenceInput && !priceReferenceUrl({priceMin: Number(min), priceMax: Number(max), priceReferenceUrl: referenceInput})) {
    $('editMessage').textContent = '來源網址請使用不含帳號密碼的 HTTPS 網址。'; return;
  }
  restaurant.priceReferenceUrl = min === '' ? null : referenceInput || null;
  restaurant.priceNote = min === '' ? null : $('priceNote').value.trim() || null;
  restaurant.priceEdited = true;
  restaurant.priceMin = min === '' ? null : Number(min);
  restaurant.priceMax = max === '' ? null : Number(max);
  restaurant.priceSource = min === '' ? null : $('priceSource').value;
  restaurant.priceCheckedAt = min === '' ? null : new Intl.DateTimeFormat('sv-SE', {timeZone: 'Asia/Taipei'}).format(new Date());
  resetResult(); render(); if (persist()) $('editMessage').textContent = `已儲存${restaurant.name}的價格。`;
});
render();
