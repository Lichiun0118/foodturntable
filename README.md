# 今晚吃哪家

公館晚餐名單、每人預算篩選與拉霸抽選。純 HTML / CSS / JavaScript，無須安裝應用程式相依套件。

## 開發

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory src
```

## 驗證

```sh
node --test tests/restaurant-model.test.mjs
```

另外以瀏覽器驗證手機與桌機排版、價格編輯、重新載入後的資料儲存、預算篩選與拉霸結果。若使用者設定減少動畫，直接顯示抽選結果。

## 價格資料

`src/js/restaurants.js` 是預設名單來源。原有 23 家價格採用使用者於 2026-10-14 提供的表格，另外 6 家依使用者提供的 Google Maps 截圖新增，目前共 29 家。介面標示「Google Maps（使用者提供）」，該日期為資料記錄日，不代表程式即時查價或獨立核對分店。完整價格表見 [reference-prices.md](docs/reference-prices.md)。原有麥當勞、壽司郎菜單估算已被取代。每筆可記錄：

- `priceMin` / `priceMax`：每人新台幣消費區間；若只有平均金額，兩欄填相同值。
- `priceSource`：`google-maps` 表示 Maps 手動記錄、`menu` 表示官網／菜單參考、`review` 表示食記參考、`personal` 表示自行估算。
- `priceReferenceUrl`：參考價格的原始 HTTPS 網頁；介面提供查看來源連結。
- `priceNote`：參考範圍的計算方式，例如一份主餐、是否含飲料／服務費。參考菜單價不等於 Maps 平均每人消費。
- `priceCheckedAt`：核對日期（YYYY-MM-DD）。
- `mapsUrl`：已核對分店的 HTTPS Google Maps 連結。未填時提供「公館＋店名」搜尋連結，搜尋結果不代表已確認分店。

預算篩選以區間**上限**判斷，價格待確認的餐廳只參加不限預算抽選。每家符合條件的餐廳機率相同。價格僅供參考，以店家現場為準。

使用者可在「編輯餐廳與價格」自行記錄價格與來源，資料儲存在目前瀏覽器的 localStorage；不會更新其他使用者的預設名單。舊版 `minimalist_wheel_options` 名單會在沒有新版資料時讀入，保留原有自訂店名與移除紀錄。

尚未自行編輯價格的舊名單會取得日後更新的預設價格。使用者已填寫的價格會保留；明確清空價格也會記錄為個人選擇，不會被預設金額覆蓋。

## 更新與部署快取

修改 CSS、JavaScript 或預設餐廳資料後，在提交前執行：

```sh
python3 scripts/version-assets.py
```

這會依檔案內容更新 HTML 中 CSS／JavaScript 的版本網址，以及入口模組引用的餐廳資料與篩選模組版本，避免手機讀到「新 HTML＋舊 CSS」或舊價格。程式可重複執行，沒有額外套件需求。網站部署時請一起上傳 `src` 內全部檔案並保留資料夾結構。


新增預設店家時，調高 `CATALOG_VERSION`，並標記該店的 `introducedIn` 版本。儲存格式包含名單與 catalogVersion；舊版陣列視為版本 1。已存名單會補上新版本的新增店家，但不會恢復以前移除的店。使用者移除新店後儲存，後續重新載入也不會加回。
