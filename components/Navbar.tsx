
import React, { useState, useEffect } from 'react';
import { User, ADMIN_EMAIL } from '../types';
import { loginWithGoogle, logout } from '../services/firebase';
import { LogOut, ShieldCheck, Moon, Sun, Type, Coffee, Share, X, Smartphone, Menu, Sparkles, Settings } from 'lucide-react';
import CommunityFeed from './CommunityFeed';

interface NavbarProps {
  user: User | null;
  isAdminMode: boolean;
  toggleAdminMode: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  isLargeText: boolean;
  toggleLargeText: () => void;
  onSettingsClick?: () => void;
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const ThreadsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.46 9.42c-.08-.04-.16-.08-.25-.12C15.06 6.53 13.57 5.11 11.23 5.11 8.5 5.11 6.57 7.15 6.57 10.19c0 3.04 1.93 5.08 4.66 5.08 1.6 0 2.9-.81 3.59-2.3.05-.1.17-.14.27-.09l.76.41c.09.05.13.17.08.26-.9 1.63-2.65 2.74-4.7 2.74-3.37 0-5.83-2.63-5.83-6.1s2.46-6.1 5.83-6.1c3.06 0 4.81 1.86 4.98 4.96.06.01.12.02.18.03.1.02.16.11.14.21l-.15.74c-.02.09-.11.16-.21.14-.04-.01-.09-.02-.13-.03v.28c0 1.98-1.2 2.99-2.7 2.99-1.06 0-1.92-.66-1.92-1.89v-1.14c0-1.23.86-1.89 1.92-1.89.77 0 1.38.33 1.69.83.1.04.2.09.3.14v-.28c-.08-.04-.16-.08-.24-.12V9.42zm-1.98 3.34c.94 0 1.55-.63 1.55-2.1v-.39c-.33-.41-.87-.66-1.55-.66-.45 0-.76.28-.76 1s.31 1 1.76 1v1.15z" />
  </svg>
);

const DefaultLogo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="shadow-lg shadow-emerald-500/20 rounded-xl transition-transform group-hover:scale-105 duration-300">
    <defs>
      <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#059669" />
        <stop offset="1" stopColor="#10B981" />
      </linearGradient>
    </defs>
    <rect width="40" height="40" rx="12" fill="url(#logoGradient)" />
    <rect x="11" y="12" width="18" height="20" rx="2" stroke="white" strokeWidth="2.5" />
    <path d="M16 12V9C16 8.44772 16.4477 8 17 8H23C23.5523 8 24 8.44772 24 9V12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M22 17L16 23H20L18 29L24 23H20L22 17Z" fill="white" />
  </svg>
);

const Navbar: React.FC<NavbarProps> = ({
  user,
  isAdminMode,
  toggleAdminMode,
  isDarkMode,
  toggleTheme,
  isLargeText,
  toggleLargeText,
  onSettingsClick
}) => {
  const isAdmin = user?.email === ADMIN_EMAIL;
  const [imgError, setImgError] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCommunityFeed, setShowCommunityFeed] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowShareModal(false);
  };

  const handleShareClick = () => {
    if (deferredPrompt) {
      handleInstallClick();
    } else {
      setShowShareModal(true);
    }
  };

  return (
    <>
      <nav className="glass sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-center md:justify-between py-3 md:py-0 md:h-16 gap-3 md:gap-0">

            <div className="flex items-center justify-between md:justify-start md:gap-6 w-full md:w-auto">
              <div className="flex-shrink-0 flex items-center gap-3 group cursor-default">
                <div className="relative">
                  {!imgError ? (
                    <div className="bg-white p-0.5 rounded-xl shadow-lg shadow-emerald-500/10 border border-slate-100 dark:border-slate-800 transition-transform group-hover:scale-105 duration-300 overflow-hidden">
                      <img
                        src="/logo.png"
                        alt="EV Tracker Logo"
                        className="h-9 w-9 object-contain"
                        onError={() => setImgError(true)}
                      />
                    </div>
                  ) : (
                    <DefaultLogo />
                  )}
                </div>

                <div className="flex flex-col leading-none select-none">
                  <span className="font-black text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
                    EV Charging Tracker
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mt-0.5 group-hover:text-emerald-500/80 transition-colors">
                    馭電智行
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://www.threads.net/@evchargingtracker?igshid=NTc4MTIwNjQ2YQ=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-all shadow-sm hover:shadow-md active:scale-95 group/threads"
                  title="追蹤我們的 Threads"
                >
                  <ThreadsIcon />
                  <span className="hidden sm:inline text-[11px] font-black tracking-wide">Threads</span>
                </a>

                <a
                  href="https://buymeacoffee.com/evchargingtracker.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFDD00] text-slate-900 rounded-lg hover:bg-[#FFEA00] transition-all shadow-sm hover:shadow-md active:scale-95 group/coffee"
                  title="請我喝杯咖啡"
                >
                  <Coffee size={15} className="stroke-[2.5] text-slate-900 group-hover/coffee:rotate-12 transition-transform" />
                  <span className="hidden sm:inline text-[11px] font-black tracking-wide">Buy me a coffee</span>
                </a>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 md:gap-4 w-full md:w-auto border-t md:border-t-0 border-slate-100 dark:border-slate-800/50 pt-3 md:pt-0">

              {/* 社群精選體驗按鈕 (所有人可見) */}
              <button
                onClick={() => setShowCommunityFeed(true)}
                className="relative p-2.5 rounded-xl text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all group"
                title="社群精選體驗 (Admin Picks)"
              >
                <Sparkles size={18} />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              </button>

              <button
                onClick={handleShareClick}
                className="p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all"
                title="加入主畫面捷徑 (Add to Home Screen)"
              >
                <Share size={18} />
              </button>

              <button
                onClick={toggleLargeText}
                className={`p-2.5 rounded-xl transition-all ${isLargeText
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                title={isLargeText ? "切換至標準字體" : "切換至大字體"}
              >
                <Type size={18} />
              </button>

              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                title={isDarkMode ? "切換至亮色模式" : "切換至深色模式"}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {user ? (
                <div className="flex items-center gap-2 md:gap-3">
                  {isAdmin && (
                    <button
                      onClick={toggleAdminMode}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all ${isAdminMode
                        ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:ring-rose-800'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                      <ShieldCheck size={16} />
                      <span className="hidden md:inline">{isAdminMode ? '返回儀表板' : '管理員面板'}</span>
                    </button>
                  )}

                  {!isAdminMode && onSettingsClick && (
                    <button
                      onClick={onSettingsClick}
                      className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                      title="約定款項設定"
                    >
                      <Settings size={18} />
                    </button>
                  )}

                  <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 ml-2">
                    <div className="relative group">
                      {user.photoURL ? (
                        <img
                          className="h-9 w-9 rounded-xl border-2 border-white dark:border-slate-800 shadow-sm object-cover"
                          src={user.photoURL}
                          alt="User avatar"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-black">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                    title="登出"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={loginWithGoogle}
                  className="flex items-center gap-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-white px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm border border-slate-200 dark:border-slate-700 text-sm font-bold"
                >
                  <GoogleIcon />
                  <span>Google 登入</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Community Feed Modal */}
      {showCommunityFeed && (
        <CommunityFeed onClose={() => setShowCommunityFeed(false)} />
      )}

      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowShareModal(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white">加入主畫面捷徑</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">像 App 一樣使用 EV Charging Tracker</p>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 mb-3">
                    <Smartphone size={20} className="text-slate-800 dark:text-white" />
                    <span className="font-bold text-slate-700 dark:text-slate-200">iOS (Safari)</span>
                  </div>
                  <ol className="list-decimal list-outside ml-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <li>
                      點擊瀏覽器底部的 <span className="inline-flex items-center justify-center w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded mx-1"><Share size={12} /></span> <strong>分享</strong> 按鈕
                    </li>
                    <li>
                      向下滑動並選擇 <strong>「加入主畫面」</strong> (Add to Home Screen)
                    </li>
                  </ol>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-5 h-5 bg-emerald-500 rounded flex items-center justify-center text-white text-[10px] font-bold">A</div>
                    <span className="font-bold text-slate-700 dark:text-slate-200">Android (Chrome)</span>
                  </div>
                  <ol className="list-decimal list-outside ml-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <li>
                      點擊瀏覽器右上角的 <span className="inline-flex items-center justify-center w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded mx-1"><Menu size={12} /></span> <strong>選單</strong> 按鈕
                    </li>
                    <li>
                      選擇 <strong>「安裝應用程式」</strong> 或 <strong>「加入主畫面」</strong>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                onClick={() => setShowShareModal(false)}
                className="text-emerald-600 dark:text-emerald-400 font-bold text-sm hover:underline"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
