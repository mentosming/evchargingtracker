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
   - 封裝 Firebase 的初始化設定與 Firestore 資料庫連線。
   - 提供 `loginWithGoogle` 及 `logout` 等認證方法，並有完整的各類錯誤攔截及提示。

3. **資料介面 (`types.ts`)**
   - `ChargingRecord`: 紀錄充電明細 (地點、時間、模式、度數、總額、單價、里程差等)。
   - `VariableExpense`: 紀錄養車的變動開銷 (時租、隧道費、美容、保養、定額罰款等)。
   - `FixedExpenses`: 紀錄使用者的約定款項 (每月車貸、停車費、自訂扣款日、年度保險與牌費)。
   - `User`, `ADMIN_EMAIL` 等權限與帳號定義。

4. **核心畫面組件 (`components/`)**
   - **`Navbar.tsx`**: 導覽列，含 Logo、各項全域設定切換、使用者登入/登出，並新增了「約定款項設定」快捷入口。
   - **`IntroGuide.tsx`**: 介紹最新功能的圖文並茂引導頁。
   - **`UserDashboard.tsx`**: 最核心的用戶操作區。
     - **雙向表單輸入**：支援「充電紀錄」與「變動開支」兩種輸入模式 (Tab切換)。
     - **歷史清單**：支援地點、車牌、月份篩選及移除；動態切換查看充電與開支紀錄。
   - **`UserStats.tsx`**: 用戶個人綜合數據總覽。
     - 包含全新的**本月開銷結構 (圓餅圖)**，整合當月的充電、各類雜費及按月分攤的年度固定費用，以直觀直向版面鋪陳。
     - 具備年度開銷到期警示功能 (距離 <30 天黃燈警告，已到期紅燈警告)。
   - **`SettingsPanel.tsx`**: 約定款項設定面板，專門讓使用者編修固定的月費或年費。
   - **`AdminPanel.tsx`** 與 **`CommunityFeed.tsx`**: 管理員專屬增長面板及社群精選牆。
   - **`PublicCalculator.tsx`**: 開放給所有人使用的快速試算工具。

---

## 💡 當前已實現亮點功能 (Key Features Implemented - V2.1)
- **全面多元的帳本系統**：不再侷限於充電追蹤，正式進化為「電動車生活帳本」，包含時租、罰單、貸款、保險等全方位管理。
- **直觀的圓餅圖與開銷儀表板**：自動抓取當月數據及分攤年費，產生清晰的彩色圓餅圖，讓月度總養車成本一目了然。
- **支援 PWA (Progressive Web App)**：提供讓使用者「加入主畫面」成為 App 的提示彈窗。
- **自動成本與電耗計算 (KPIs)**：輸入電量 (kWh) 與總額，自動計算出「每度電單價」、「每公里成本 ($/km)」以及「平均電耗 (km/kWh)」。
- **極致的手機輸入體驗 (Mobile UX)**：針對所有數字欄位套用 `inputMode="decimal"` 確保原生數字小鍵盤自動彈出；版面針對手機進行了深度優化設計。
- **數據匯出 (CSV Export)**：允許使用者一鍵將歷史紀錄匯出為相容於 Excel 的 CSV 檔案。

---

## 📌 未來開發方向與待辦事項 (To-Do & Next Steps)
*(您可以隨時告訴我需要處理哪一項，或加入您自己的想法)*

- [ ] **優化離線支援 (Offline Support)**：加強 Service Worker 設定，讓使用者在停車場地下室等無網路環境也能無縫建立紀錄。
- [ ] **多車輛管理系統**：目前車牌號碼是手動輸入 (或由曾經輸入過的帶出)，未來可實作獨立的車庫 (Garage) 設定。
- [ ] **更多試算器功能**：例如充到特定趴數 (SOC) 預估需要多久、花費多少等進階計算 (`PublicCalculator.tsx` 的擴充)。
- [ ] **資料庫架構升級**：規劃從 Firebase NoSQL 轉換至 Supabase SQL，以因應未來更複雜的關聯性數據查詢與報表分析。

---

## 🧑‍💻 每次換電腦開發時的指南 (Cross-Computer Dev Guide)
1. 從 Git 拉取最新進度 (`git pull`)。
2. 確認 Node.js 環境後執行 `npm install`。
3. 執行 `npm run dev` 啟動本地開發伺服器。
4. **如果需要我幫忙**，請把我叫出來並說：「幫我看一下 PROJECT_KNOWLEDGE.md，這是我目前的專案狀態，我現在想要做 [您的需求]」。我便能無縫接軌您的進度！
