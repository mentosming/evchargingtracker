import React, { useState, useMemo } from 'react';
import { Zap, DollarSign } from 'lucide-react';

const PublicCalculator: React.FC = () => {
  const [kwh, setKwh] = useState<string>('');
  const [rate, setRate] = useState<string>('');

  const total = useMemo(() => {
    const k = parseFloat(kwh);
    const r = parseFloat(rate);
    if (!isNaN(k) && !isNaN(r)) {
      return (k * r).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return '0.00';
  }, [kwh, rate]);

  const inputBaseClasses = "w-full h-[48px] px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all duration-300 shadow-sm placeholder:text-slate-300 dark:placeholder:text-slate-700 font-medium";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-800 p-8 transition-all">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-100/50 dark:bg-amber-900/30 rounded-xl text-amber-500">
          <Zap size={20} fill="currentColor" />
        </div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">快速試算 (公用)</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">充電度數 (kWh)</label>
          <input
            type="number"
            value={kwh}
            onChange={(e) => setKwh(e.target.value)}
            placeholder="例如: 50"
            className={inputBaseClasses}
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">充電單價 ($/kWh)</label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="例如: 8.5"
            className={inputBaseClasses}
          />
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/50 flex justify-between items-center h-[48px] shadow-inner">
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-500">預估總金額</span>
          <div className="flex items-center text-emerald-700 dark:text-emerald-400 font-black text-xl">
            <DollarSign size={18} className="mr-0.5" />
            <span>{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicCalculator;