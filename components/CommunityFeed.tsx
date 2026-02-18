
import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { ChargingRecord } from '../types';
import { X, MapPin, Calendar, Zap, Sparkles, Quote, Info, ShieldCheck, AlertTriangle, MessageSquareQuote } from 'lucide-react';

interface CommunityFeedProps {
  onClose: () => void;
}

const CommunityFeed: React.FC<CommunityFeedProps> = ({ onClose }) => {
  const [recentRecords, setRecentRecords] = useState<ChargingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<'none' | 'permission' | 'index'>('none');

  useEffect(() => {
    try {
      const q = query(
        collection(db, 'charging_records'),
        where('isFeatured', '==', true),
        orderBy('timestamp', 'desc'),
        limit(20)
      );

      // Fix: Explicitly cast snapshot and doc to any to resolve Firebase Modular SDK type ambiguity
      const unsubscribe = onSnapshot(q, (snapshot: any) => {
        const data = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data()
        })) as ChargingRecord[];
        setRecentRecords(data);
        setLoading(false);
        setErrorStatus('none');
      }, (err: any) => {
        console.error("Firestore Query Error:", err);
        if (err.code === 'permission-denied') {
          setErrorStatus('permission');
        } else if (err.code === 'failed-precondition') {
          setErrorStatus('index');
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Subscription Error:", err);
      setLoading(false);
    }
  }, []);

  const maskEmail = (email: string) => {
    if (!email) return "車友用戶";
    const parts = email.split('@');
    if (parts.length < 2) return "匿名車友";
    const [user] = parts;
    if (user.length <= 2) return user + "***";
    return `${user[0]}***${user[user.length - 1]}`;
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="relative bg-white dark:bg-slate-950 rounded-[32px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] w-full max-w-lg border border-white/20 dark:border-slate-800/50 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header - More Natural Language */}
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                <Zap size={24} fill="white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none">車友充電實測精選</h3>
                <div className="flex items-center gap-2 mt-2">
                   <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                     真實車友紀錄 • 數據參考
                   </span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 bg-slate-100 dark:bg-slate-900 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all hover:rotate-90 active:scale-90"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-50/50 dark:bg-transparent">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-5">
              <div className="relative">
                <div className="h-12 w-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-500 animate-pulse" size={16} />
              </div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">正在翻閱實測報告...</span>
            </div>
          ) : errorStatus === 'permission' ? (
            <div className="text-center py-20 px-10 space-y-6">
                <div className="mx-auto w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-3xl flex items-center justify-center text-rose-500">
                   <Info size={32} />
                </div>
                <div className="space-y-2">
                  <p className="font-black text-slate-800 dark:text-white text-lg">伺服器同步中</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    請稍候，我們正在更新最新的充電數據權限，請在一分鐘後再次嘗試。
                  </p>
                </div>
            </div>
          ) : recentRecords.length === 0 ? (
            <div className="text-center py-24 space-y-6">
              <div className="mx-auto w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-[32px] flex items-center justify-center text-slate-300 dark:text-slate-800">
                <Quote size={40} />
              </div>
              <div className="space-y-2">
                 <p className="font-black text-slate-400 uppercase tracking-widest text-sm">期待首筆實測</p>
                 <p className="text-xs text-slate-400 px-12 leading-relaxed">管理員尚未分享推薦的紀錄，請隨時留意更新！</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {recentRecords.map((record) => (
                <div 
                  key={record.id} 
                  className="bg-white dark:bg-slate-900 rounded-[28px] p-6 border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none hover:border-amber-500/30 transition-all group flex flex-col gap-5"
                >
                  {/* Top: User Info & Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-300 font-black text-sm">
                        {record.userEmail?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-white text-xs">
                          {maskEmail(record.userEmail)}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-medium">
                          <Calendar size={10} />
                          {new Date(record.timestamp).toLocaleDateString('zh-TW')}
                        </span>
                      </div>
                    </div>
                    <div className="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-100/50 dark:border-amber-800/50">
                      實測推薦
                    </div>
                  </div>

                  {/* Middle: Location & Content */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[13px] font-bold text-slate-600 dark:text-slate-300">
                      <MapPin size={14} className="text-rose-500 shrink-0" />
                      {record.location}
                    </div>

                    {record.notes && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border-l-4 border-amber-500/50 text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                        「{record.notes}」
                      </div>
                    )}
                  </div>

                  {/* Bottom: Stats Pills */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50 dark:border-slate-800/50">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-[11px] font-black border border-emerald-100/50 dark:border-emerald-800/30">
                      <Zap size={12} fill="currentColor" />
                      {record.kwh} kWh
                    </div>
                    <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[11px] font-black border border-slate-200/50 dark:border-slate-700">
                      HKD {record.total_amount}
                    </div>
                    <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 rounded-xl text-[11px] font-black border border-amber-100/50 dark:border-amber-800/30">
                      ${record.cost_per_kwh.toFixed(2)} / kWh
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300 dark:text-slate-600">
            真實充電數據 • 助你聰明用電
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommunityFeed;
