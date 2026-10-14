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

`src/js/restaurants.js` 是預設名單來源。目前「大盛」採用使用者提供並確認為「大盛豬排」的 Google Maps 截圖：平均每人 NT$200–400（69 人回報，記錄日期 2026-10-14）。Maps 連結仍為店名搜尋，不代表已核對特定分店網址。其他店價格尚未核對，以 `null` 標示，不能用推測值當作 Google Maps 資料。每筆可記錄：

- `priceMin` / `priceMax`：每人新台幣消費區間；若只有平均金額，兩欄填相同值。
- `priceSource`：`google-maps` 表示已由人工核對 Maps，`personal` 表示自行估算。
- `priceCheckedAt`：核對日期（YYYY-MM-DD）。
- `mapsUrl`：已核對分店的 HTTPS Google Maps 連結。未填時提供「公館＋店名」搜尋連結，搜尋結果不代表已確認分店。

預算篩選以區間**上限**判斷，價格待確認的餐廳只參加不限預算抽選。每家符合條件的餐廳機率相同。價格僅供參考，以店家現場為準。

使用者可在「編輯餐廳與價格」自行記錄價格與來源，資料儲存在目前瀏覽器的 localStorage；不會更新其他使用者的預設名單。舊版 `minimalist_wheel_options` 名單會在沒有新版資料時讀入，保留原有自訂店名與移除紀錄。

尚未自行編輯價格的舊名單會取得日後更新的預設價格。使用者已填寫的價格會保留；明確清空價格也會記錄為個人選擇，不會被預設金額覆蓋。
