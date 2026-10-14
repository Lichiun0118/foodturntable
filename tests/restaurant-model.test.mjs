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
