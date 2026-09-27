# Bloom & Drip

手沖咖啡沖煮紀錄：粉水比計算、分段計時、杯測評分與沖煮日誌。Nuxt 4 + Tailwind v4 + Firebase（Auth / Firestore）。

## Firebase 設定

1. 在 [Firebase Console](https://console.firebase.google.com/) 建立專案，新增一個 **Web 應用程式**。
2. **Authentication → Sign-in method**：啟用「電子郵件/密碼」與「Google」。
3. **Firestore Database**：建立資料庫。
4. 複製 `.env.example` 為 `.env`，填入 Web 應用程式的設定值。
5. 部署安全規則（或直接把 `firestore.rules` 內容貼到 Console 的「規則」分頁）：

   ```bash
   npx firebase-tools login
   npx firebase-tools deploy --only firestore:rules --project <your-project-id>
   ```

### 資料結構

```
users/{uid}                    使用者資料（email、displayName、createdAt、lastLoginAt）
users/{uid}/brewLogs/{logId}   沖煮紀錄（照片以壓縮後的 data URL 內嵌）
users/{uid}/presets/{beanId}   各咖啡豆的預設沖煮配方
```

安全規則只允許使用者讀寫自己的 `users/{uid}` 底下資料。

## 開發

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npx nuxi typecheck
```
