import React from 'react';
import { Calculator, Save, TrendingUp, ShieldCheck, Zap, BarChart3, Settings, Share2, MessageSquare, Sparkles } from 'lucide-react';

const IntroGuide: React.FC = () => {
  return (
    <div className="space-y-16 py-8 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">
          掌控您的電車生活
        </h1>
        <div className="max-w-3xl mx-auto space-y-4 text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            <p>
              電動車在香港普及速度極快，但配套資訊依然碎片化。EV Charging Tracker 致力於為本地車主提供最直觀、最精準的充電紀錄與數據監測服務。
            </p>
            <p>
              作為一個獨立開發專案，我希望透過科技優化香港的綠色出行體驗。如果您認同這個工具的價值，歡迎透過 <a href="https://buymeacoffee.com/evchargingtracker.com" target="_blank" rel="noopener noreferrer" className="font-bold text-amber-500 inline-flex items-center hover:underline hover:text-amber-600 transition-colors">Buy Me a Coffee</a> 給予支持。您的慷慨贊助將確保系統穩定運行。
            </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<Calculator className="w-8 h-8 text-blue-500" />}
          title="快速試算"
          description="無需登入即可使用。輸入充電度數與單價，立即計算預估費用，支援公用與家用充電場景。"
        />
        <FeatureCard 
          icon={<Save className="w-8 h-8 text-emerald-500" />}
          title="雲端同步"
          description="使用 Google 帳號一鍵登入，自動同步您的所有充電紀錄。包含地點、時間、里程與評分。"
        />
        <FeatureCard 
          icon={<TrendingUp className="w-8 h-8 text-amber-500" />}
          title="數據洞察"
          description="自動生成視覺化圖表，分析每月充電度數、行駛里程與平均電價 ($/kWh)，掌握長期成本。"
        />
      </div>

      {/* How to use */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-100 dark:border-slate-800">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-10 flex items-center gap-3">
          <Zap className="text-emerald-500 fill-emerald-500" />
          功能導覽與使用指南
        </h2>
        <div className="space-y-10">
          <Step 
            number="1" 
            title="進行試算 (非必要)" 
            desc="在頁面頂部的「快速試算」區塊輸入度數與費率，快速查看預估金額。此功能無需登入即可使用。" 
          />
          <Step 
            number="2" 
            title="登入帳號" 
            desc="點擊右上角的「Google 登入」按鈕。我們使用 Google 安全驗證，資料加密儲存於雲端，安全無虞。" 
          />
          <Step 
            number="3" 
            title="詳細紀錄" 
            desc="登入後，填寫充電地點、時間、模式 (計時/計量)、度數與總金額。您可以紀錄當前里程數以計算行駛距離，並對體驗進行評分。" 
          />
          <Step 
            number="4" 
            title="數據儀表板" 
            desc="系統會自動將您的紀錄轉化為圖表。您可以切換查看「電力消耗」與「行駛里程」趨勢，並檢視詳細的歷史列表與平均單價分析。" 
          />
          <Step 
            number="5" 
            title="個人化設定" 
            desc="自由切換「深色/淺色模式」或「大字體模式」。若喜歡此工具，也歡迎點擊頂部的 Threads 追蹤我們的最新動態！" 
          />
          <Step 
            number="6" 
            title="社群分享成果" 
            isNew
            desc="點擊歷史紀錄旁的「分享成果」按鈕。系統將自動生成包含地點、度數、每公里成本的精美文字與正能量金句，讓您輕鬆分享至 Threads 或 WhatsApp 展現電車省錢成果。" 
          />
        </div>

        {/* 最近新增：體驗金句預覽 */}
        <div className="mt-12 p-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
           <div className="flex items-center gap-2 mb-4">
             <Sparkles size={16} className="text-amber-500" />
             <span className="text-xs font-black uppercase tracking-widest text-slate-400">最近新增：社群分享金句預覽</span>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm italic text-sm text-slate-600 dark:text-slate-400">
                「今天我又省下了一筆油費，還為環保出了一份力！🔋」
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm italic text-sm text-slate-600 dark:text-slate-400">
                「馭電智行，讓每一公里都充滿潔淨能量！🌱」
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 transition-all group">
    <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-3">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm font-medium">{description}</p>
  </div>
);

const Step = ({ number, title, desc, isNew = false }: { number: string, title: string, desc: string, isNew?: boolean }) => (
  <div className="flex gap-6 group">
    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-center text-xl shadow-sm border border-emerald-100 dark:border-emerald-800 group-hover:scale-110 transition-transform duration-300">
      {number}
    </div>
    <div className="flex-grow">
      <div className="flex items-center gap-3 mb-2">
        <h4 className="text-lg font-black text-slate-800 dark:text-white">{title}</h4>
        {isNew && (
          <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full animate-pulse">
            New
          </span>
        )}
      </div>
      <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{desc}</p>
    </div>
  </div>
);

export default IntroGuide;