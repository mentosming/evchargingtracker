# EV Charging Tracker 專案知識庫與開發進度 (Knowledge Base & Progress)

這份文件用於記錄專案的架構、功能現況及未來的開發方向，讓您在**任何電腦上開發時**，都能透過這份文件或我的記憶快速恢復工作狀態。請確保將此檔案（`PROJECT_KNOWLEDGE.md`）提交至 Git 版本控制，以便隨時同步最新進度。

---

## 🚀 專案概述 (Project Overview)
**EV Charging Tracker** (馭電智行) 是一個專為香港電動車主設計的充電紀錄與數據追蹤 Web App (PWA)。
- **核心技術棧**：React 18, TypeScript, Vite, Tailwind CSS, Lucide React (圖示)。
- **後端與資料庫**：Firebase Authentication (Google 登入), Firebase Firestore (NoSQL 資料庫)。
- **代碼規範**：以函數式組件 (Functional Components) 及 Hooks (`useState`, `useEffect`, `useMemo`) 為主。

---

## 📂 專案架構與核心模組 (Architecture & Core Modules)

1. **入口與主框架 (`App.tsx`, `index.tsx`)**
   - 負責監聽 Firebase 登入狀態 (`onAuthStateChange`)。
   - 處理全域設定：亮色/深色模式 (`isDarkMode`)、大字體模式 (`isLargeText`)、管理員模式切換 (`isAdminMode`)。
   - 根據登入狀態和權限動態渲染不同畫面 (`IntroGuide`, `UserDashboard`, `AdminPanel`)。

2. **使用者服務 (`services/firebase.ts`)**
   - 封裝 Firebase 的初始化設定。
   - 提供 `loginWithGoogle` 及 `logout` 等認證方法，並有完整的各類錯誤攔截及提示 (如跨域錯誤 `auth/network-request-failed`、未授權網域等)。

3. **資料介面 (`types.ts`)**
   - `ChargingRecord`: 定義一筆充電紀錄包含的欄位 (地點、電量、金額、里程數、評分、備註、是否被標籤為精選 `isFeatured` 等)。
   - `User`: 保留用戶基本資訊 (uid, email, 圖片)。
   - `ADMIN_EMAIL`: 寫死設定為 `km520daisy@gmail.com`，作為系統進入管理員模式的唯一憑證。

4. **核心畫面組件 (`components/`)**
   - **`Navbar.tsx`**: 導覽列，含 Logo、各項全域設定切換 (分享、截圖/安裝 PWA、字體、主題)、使用者登入/登出，以及 Threads 與 贊助按鈕。並可開啟社群精選體驗 (`CommunityFeed.tsx`)。
   - **`IntroGuide.tsx`**: 未登入時呈現的功能導覽與落地頁。
   - **`UserDashboard.tsx`**: 最核心的用戶操作區。
     - **新增紀錄**：防呆機制、計算花費並寫入 Firestore。
     - **歷史清單**：支援地點、車牌、月份篩選及移除。計算前後紀錄之里程差，並支援將省錢成果分享 (Navigator Share API 或 複製文字)。
   - **`UserStats.tsx`**: 用戶個人數據總覽，自製的純 CSS 長條圖，統計用電與里程趨勢。
   - **`AdminPanel.tsx`**: 管理員專屬面板。
     - 查閱所有用戶的紀錄，支援 12 項完整維度顯示 (日期時間、地點、模式、電量、總額、里程、時長等)。
     - 內建自製 SVG 折線圖，視覺化呈現半年內的**用戶增長趨勢 (累積與新增)**。
     - 分析全站總度數、總金額、活躍用戶數等。
     - 可對優質的充電紀錄點擊「實測推薦」愛心，標記為 `isFeatured`。
   - **`CommunityFeed.tsx`**: 面向大眾的社群充電實測動態牆，讀取所有 `isFeatured === true` 的紀錄並以匿名方式展現，供新用戶參考。
   - **`PublicCalculator.tsx`**: (在 `App.tsx` 底部被引入) 開放給所有人使用的快速試算工具。

---

## 💡 當前已實現亮點功能 (Key Features Implemented)
- **支援 PWA (Progressive Web App)**：提供讓使用者「加入主畫面」成為 App 的提示彈窗。
- **自動成本與電耗計算 (KPIs)**：輸入電量 (kWh) 與總額，自動計算出「本月每度電單價」、「每公里成本 ($/km)」以及「平均電耗 (km/kWh)」。
- **極致的手機輸入體驗 (Mobile UX)**：針對所有數字欄位套用 `inputMode="decimal"` 確保原生數字小鍵盤自動彈出；並內建香港熱門充電站 (Tesla, Shell Recharge 等) 的快捷標籤，支援單擊自動填入地點。
- **彈性過濾篩選**：結合 `useMemo` 自動帶出常用地點、曾用車牌、歷史月份供下拉過濾。
- **數據匯出 (CSV Export)**：允許使用者一鍵將歷史紀錄匯出為相容於 Excel 的 CSV 檔案。
- **管理員生態系統**：不僅限於單機自用，更加入社群精選 (`isFeatured`) 概念，並具備強大的後台管理面版(分析活躍用戶、圖表化增長趨勢、12欄位詳細清單)增強用戶黏著度。

---

## 📌 未來開發方向與待辦事項 (To-Do & Next Steps)
*(您可以隨時告訴我需要處理哪一項，或加入您自己的想法)*

- [ ] **優化離線支援 (Offline Support)**：加強 Service Worker 設定，讓使用者在停車場地下室等無網路環境也能無縫建立紀錄。
- [ ] **多車輛管理系統**：目前車牌號碼是手動輸入 (或由曾經輸入過的帶出)，未來可實作獨立的車庫 (Garage) 設定。
- [ ] **更多試算器功能**：例如充到特定趴數 (SOC) 預估需要多久、花費多少等進階計算 (`PublicCalculator.tsx` 的擴充)。

---

## 🧑‍💻 每次換電腦開發時的指南 (Cross-Computer Dev Guide)
1. 從 Git 拉取最新進度 (`git pull`)。
2. 確認 Node.js 環境後執行 `npm install`。
3. 執行 `npm run dev` 啟動本地開發伺服器。
4. **如果需要我幫忙**，請把我叫出來並說：「幫我看一下 PROJECT_KNOWLEDGE.md，這是我目前的專案狀態，我現在想要做 [您的需求]」。我便能無縫接軌您的進度！
