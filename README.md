# EV Charging Tracker (馭電智行) 🚗💨

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10.8-FFCA28?logo=firebase)](https://firebase.google.com/)

**EV Charging Tracker (馭電智行)** 是一個專為香港電動車主設計的全面充電紀錄與養車開銷追蹤 Web App。透過直觀的介面與強大的數據分析，幫助您精確掌握愛車的每一分支出。

---

## ✨ 核心功能 (Key Features)

- **📈 充電與養車帳本**：輕鬆紀錄充電度數、金額、地點，以及保養、隧道費、美容、罰單等各種雜費。
- **📊 智能開銷儀表板**：自動產生本月開銷圓餅圖，整合固定費用（車貸、停車費、保險）與變動開支，養車成本一目了然。
- **📱 優質行動體驗**：
  - **PWA 支援**：可直接安裝至手機主畫面，享受類似 Native App 的體驗。
  - **極速輸入**：針對數字欄位優化鍵盤彈出，並提供常用地點與車牌記憶。
- **⚙️ 自動化計算 (KPIs)**：自動算出每度電單價 ($/kWh)、每公里成本 ($/km) 及平均電耗 (km/kWh)。
- **📥 數據導出**：支援一鍵匯出 CSV 檔案，方便進行二次數據分析。
- **💰 Google AdSense 整合**：已完成網站驗證與廣告腳本部署。

---

## 🛠️ 技術棧 (Tech Stack)

- **前端**：React 18 + TypeScript + Vite
- **樣式**：Tailwind CSS (支援深色/亮色模式、大字體模式)
- **後端**：Firebase Authentication + Firestore 資料庫
- **圖示**：Lucide React

---

## 🚀 快速開始 (Quick Start)

### 本地開發環境 (Local Development)

**前置條件：** 需安裝 Node.js

1.  **複製儲存庫：**
    ```bash
    git clone https://github.com/mentosming/evchargingtracker.git
    cd evchargingtracker
    ```
2.  **安裝依賴：**
    ```bash
    npm install
    ```
3.  **環境設定：**
    在 `.env.local` 中設定您的 Firebase 或其他相關 API 客戶端資訊。
4.  **啟動開發伺服器：**
    ```bash
    npm run dev
    ```

### 部署資訊 (Deployment)

- **網域**：[evchargingtracker.com](https://www.evchargingtracker.com)
- **託管**：GitHub Pages / Zeabur / Hostinger
- **AdSense**：已通過網站驗證。

---

## 📅 開發進度 (Roadmap)

- [x] 全面養車帳本系統 (V2.1)
- [x] 自動成本與電耗計算
- [x] Google AdSense 整合
- [ ] 強化離線支援 (Offline Support)
- [ ] 多車輛管理系統 (Garage Profile)
- [ ] Supabase SQL 資料庫遷移規劃

---

## 📄 授權 (License)

本專案採用私有授權，僅供個人與開發參考。

---

*Made with ❤️ for EV Drivers in Hong Kong.*
