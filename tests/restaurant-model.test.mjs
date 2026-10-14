import test from 'node:test';
import assert from 'node:assert/strict';
import { hasPrice, matchesBudget, priceLabel, mapUrl, normalizeRestaurants, priceSourceLabel, priceReferenceUrl, restoreRestaurantList } from '../src/js/restaurant-model.js';
import { DEFAULT_RESTAURANTS } from '../src/js/restaurants.js';

test('budget cap uses the whole per-person range, including exact boundary', () => {
  const restaurant = {priceMin: 100, priceMax: 250};
  assert.equal(matchesBudget(restaurant, 249), false);
  assert.equal(matchesBudget(restaurant, 250), true);
  assert.equal(matchesBudget(restaurant, null), true);
  assert.equal(matchesBudget({priceMin: null, priceMax: null}, 250), false);
  assert.equal(matchesBudget({priceMin: null, priceMax: null}, null), true);
});

test('invalid and unknown prices never become zero-price candidates', () => {
  for (const data of [{priceMin: null, priceMax: null}, {priceMin: 100, priceMax: 50}, {priceMin: -1, priceMax: 20}, {priceMin: '100', priceMax: '200'}]) {
    assert.equal(hasPrice(data), false);
    assert.equal(priceLabel(data), '價格待確認');
  }
  assert.equal(priceLabel({priceMin: 200, priceMax: 200}), 'NT$ 200／人');
});

test('legacy migration keeps custom names, user removals, and empty lists', () => {
  const migrated = normalizeRestaurants(['麥當勞', '我的店', '我的店', '', null], DEFAULT_RESTAURANTS);
  assert.deepEqual(migrated.map(r => r.name), ['麥當勞', '我的店']);
  assert.deepEqual(normalizeRestaurants([], DEFAULT_RESTAURANTS), []);
  assert.equal(migrated[1].priceMax, null);
});

test('saved prices survive migration and malformed ranges become unknown', () => {
  const migrated = normalizeRestaurants([{name: '我的店', priceMin: 120, priceMax: 180, priceSource: 'personal'}, {name: '壞資料', priceMin: 300, priceMax: 100}], DEFAULT_RESTAURANTS);
  assert.equal(migrated[0].priceMax, 180);
  assert.equal(migrated[1].priceMax, null);
});

test('Maps links only accept supported HTTPS hosts or safe name searches', () => {
  assert.equal(mapUrl({name: '測試', mapsUrl: 'https://maps.app.goo.gl/example'}), 'https://maps.app.goo.gl/example');
  for (const mapsUrl of ['javascript:alert(1)', 'https://evil.example.com', 'http://www.google.com/maps']) {
    const url = new URL(mapUrl({name: 'A&B', mapsUrl}));
    assert.equal(url.protocol, 'https:');
    assert.equal(url.hostname, 'www.google.com');
    assert.equal(url.searchParams.get('query'), '公館 A&B');
  }
});


test('new shared Maps prices reach existing visitors with previously unknown prices', () => {
  const defaults = [{name: '測試店', priceMin: 200, priceMax: 400, priceSource: 'google-maps', priceCheckedAt: '2026-10-14', mapsUrl: 'https://maps.app.goo.gl/example'}];
  const [restaurant] = normalizeRestaurants([{name: '測試店', priceMin: null, priceMax: null, priceSource: null, priceCheckedAt: null, mapsUrl: null}], defaults);
  assert.equal(restaurant.priceMin, 200);
  assert.equal(restaurant.priceMax, 400);
  assert.equal(restaurant.priceSource, 'google-maps');
  assert.equal(restaurant.mapsUrl, defaults[0].mapsUrl);
  assert.equal(matchesBudget(restaurant, 399), false);
  assert.equal(matchesBudget(restaurant, 400), true);
});

test('personal prices and explicit price clearing survive a shared default update', () => {
  const defaults = [{name: '測試店', priceMin: 200, priceMax: 400, priceSource: 'google-maps'}];
  const [personal] = normalizeRestaurants([{name: '測試店', priceMin: 150, priceMax: 180, priceSource: 'personal'}], defaults);
  assert.equal(personal.priceMax, 180);
  assert.equal(personal.priceSource, 'personal');
  const [cleared] = normalizeRestaurants([{name: '測試店', priceMin: null, priceMax: null, priceEdited: true}], defaults);
  assert.equal(cleared.priceMax, null);
});


test('大盛 uses the user-supplied Maps range', () => {
  const restaurant = DEFAULT_RESTAURANTS.find(r => r.name === '大盛');
  assert.equal(restaurant.priceMin, 200);
  assert.equal(restaurant.priceMax, 400);
  assert.equal(restaurant.priceSource, 'google-maps');
  assert.equal(matchesBudget(restaurant, 250), false);
  assert.equal(matchesBudget(restaurant, 400), true);
  assert.equal(DEFAULT_RESTAURANTS.find(r => r.name === '小高').priceMax, 145);
});


test('menu and review prices retain their provenance instead of becoming Maps prices', () => {
  const menu = {name: '測試店', priceMin: 120, priceMax: 180, priceSource: 'menu', priceReferenceUrl: 'https://example.com/menu', priceNote: '主餐，飲料另計', priceCheckedAt: '2026-10-14'};
  const [migrated] = normalizeRestaurants([{name: '測試店', priceMin: null, priceMax: null}], [menu]);
  assert.equal(migrated.priceReferenceUrl, menu.priceReferenceUrl);
  assert.equal(migrated.priceNote, menu.priceNote);
  assert.match(priceSourceLabel(migrated), /^官網／菜單參考/);
  assert.match(priceSourceLabel({...menu, priceSource: 'review'}), /^食記參考/);
  const [personal] = normalizeRestaurants([{name: '測試店', priceMin: 100, priceMax: 100, priceSource: 'personal'}], [menu]);
  assert.equal(personal.priceReferenceUrl, null);
  assert.equal(personal.priceNote, null);
});

test('reference links reject executable URLs and embedded credentials', () => {
  const known = {priceMin: 100, priceMax: 200};
  for (const url of ['javascript:alert(1)', 'http://example.com', 'https://user:password@example.com', 'not a url']) {
    assert.equal(priceReferenceUrl({...known, priceReferenceUrl: url}), null);
  }
  assert.equal(priceReferenceUrl({...known, priceReferenceUrl: 'https://example.com/menu'}), 'https://example.com/menu');
  assert.equal(priceReferenceUrl({priceMin: null, priceMax: null, priceReferenceUrl: 'https://example.com/menu'}), null);
});


test('former menu defaults update to shared Maps prices but explicit personal edits remain', () => {
  const records = [
    {name: '麥當勞', priceMin: 100, priceMax: 138, priceSource: 'menu', priceNote: 'old menu estimate'},
    {name: '壽司郎', priceMin: 240, priceMax: 480, priceSource: 'menu'},
  ];
  const updated = normalizeRestaurants(records, DEFAULT_RESTAURANTS);
  assert.equal(updated[0].priceMax, 250);
  assert.equal(updated[1].priceMax, 600);
  assert(updated.every(r => r.priceSource === 'google-maps' && r.priceNote === null));
  const personal = normalizeRestaurants(records.map(r => ({...r, priceEdited: true})), DEFAULT_RESTAURANTS);
  assert.equal(personal[0].priceMax, 138);
  assert.equal(personal[1].priceMax, 480);
});

test('marked shared defaults refresh on future updates without reverting explicit clears', () => {
  const current = DEFAULT_RESTAURANTS.find(r => r.name === '小高');
  const [updated] = normalizeRestaurants([{...current, priceMax: 120}], DEFAULT_RESTAURANTS);
  assert.equal(updated.priceMax, 145);
  const [cleared] = normalizeRestaurants([{...current, priceMin: null, priceMax: null, priceEdited: true}], DEFAULT_RESTAURANTS);
  assert.equal(cleared.priceMax, null);
});


test('catalog upgrade adds only new defaults and preserves deletions, edits, and custom names', () => {
  const defaults = [
    {name: '舊店', priceMin: 100, priceMax: 200, introducedIn: 1},
    {name: '新店', priceMin: 200, priceMax: 400, introducedIn: 2},
    {name: '另一新店', priceMin: 1, priceMax: 200, introducedIn: 2},
  ];
  const records = [{name: '新店', priceMin: 90, priceMax: 100, priceSource: 'personal', priceEdited: true}, '自訂店'];
  const restored = restoreRestaurantList(records, defaults, 1);
  assert.deepEqual(restored.map(r => r.name), ['新店', '自訂店', '另一新店']);
  assert.equal(restored[0].priceMax, 100);
  assert.equal(restored[2].priceMin, 1);
  assert.equal(restoreRestaurantList(restored, defaults, 1).length, 3);
});

test('removed new restaurant stays removed once the current catalog version is saved', () => {
  const defaults = [{name: '新店', priceMin: 1, priceMax: 200, introducedIn: 2}];
  assert.deepEqual(restoreRestaurantList([], defaults, 2), []);
  assert.equal(restoreRestaurantList([], defaults, 1).length, 1);
});
