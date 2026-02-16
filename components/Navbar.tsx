import React, { useState } from 'react';
import { User, ADMIN_EMAIL } from '../types';
import { loginWithGoogle, logout } from '../services/firebase';
import { LogOut, ShieldCheck, Moon, Sun, Type, Coffee } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  isAdminMode: boolean;
  toggleAdminMode: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  isLargeText: boolean;
  toggleLargeText: () => void;
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// Fallback Logo (Battery + Lightning)
const DefaultLogo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="shadow-lg shadow-emerald-500/20 rounded-xl transition-transform group-hover:scale-105 duration-300">
    <defs>
      <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#059669" />
        <stop offset="1" stopColor="#10B981" />
      </linearGradient>
    </defs>
    <rect width="40" height="40" rx="12" fill="url(#logoGradient)" />
    {/* Battery Body */}
    <rect x="11" y="12" width="18" height="20" rx="2" stroke="white" strokeWidth="2.5" />
    {/* Battery Cap */}
    <path d="M16 12V9C16 8.44772 16.4477 8 17 8H23C23.5523 8 24 8.44772 24 9V12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    {/* Lightning Bolt */}
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
  toggleLargeText 
}) => {
  const isAdmin = user?.email === ADMIN_EMAIL;
  const [imgError, setImgError] = useState(false);

  return (
    <nav className="glass sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-6">
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

            {/* Buy Me A Coffee Button */}
            <a 
              href="https://buymeacoffee.com/evchargingtracker.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFDD00] text-slate-900 rounded-lg hover:bg-[#FFEA00] transition-all shadow-sm hover:shadow-md active:scale-95 group/coffee"
              title="請我喝杯咖啡"
            >
              <Coffee size={15} className="stroke-[2.5] text-slate-900 group-hover/coffee:rotate-12 transition-transform" />
              <span className="hidden lg:inline text-[11px] font-black tracking-wide">Buy me a coffee</span>
            </a>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* Font Size Toggle */}
            <button
              onClick={toggleLargeText}
              className={`p-2.5 rounded-xl transition-all ${
                isLargeText 
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isLargeText ? "切換至標準字體" : "切換至大字體"}
            >
              <Type size={18} />
            </button>

            {/* Dark Mode Toggle */}
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
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all ${
                      isAdminMode 
                        ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:ring-rose-800' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <ShieldCheck size={16} />
                    <span className="hidden md:inline">{isAdminMode ? '返回儀表板' : '管理員面板'}</span>
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
  );
};

export default Navbar;