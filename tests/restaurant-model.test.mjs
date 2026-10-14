import test from 'node:test';
import assert from 'node:assert/strict';
import { hasPrice, matchesBudget, priceLabel, mapUrl, normalizeRestaurants } from '../src/js/restaurant-model.js';
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


test('大盛 uses the user-supplied Maps range; other unverified restaurants stay unknown', () => {
  const restaurant = DEFAULT_RESTAURANTS.find(r => r.name === '大盛');
  assert.equal(restaurant.priceMin, 200);
  assert.equal(restaurant.priceMax, 400);
  assert.equal(restaurant.priceSource, 'google-maps');
  assert.equal(matchesBudget(restaurant, 250), false);
  assert.equal(matchesBudget(restaurant, 400), true);
  assert.equal(DEFAULT_RESTAURANTS.filter(hasPrice).length, 1);
});
