
import React, { useMemo, useState } from 'react';
import { ChargingRecord } from '../types';
import { BarChart3, TrendingUp, Zap, Map, Coins } from 'lucide-react';

interface UserStatsProps {
  records: ChargingRecord[];
}

interface MonthlyData {
  key: string;
  label: string;
  kwh: number;
  cost: number;
  count: number;
  distance: number;
}

const UserStats: React.FC<UserStatsProps> = ({ records }) => {
  const [activeTab, setActiveTab] = useState<'energy' | 'distance'>('energy');

  const stats = useMemo<MonthlyData[]>(() => {
    if (records.length === 0) return [];

    const sortedAll = [...records].sort((a, b) => a.timestamp - b.timestamp);
    const recordsWithDistance: (ChargingRecord & { tripDistance: number })[] = [];
    let lastOdometer = 0;

    for (const record of sortedAll) {
      let tripDistance = 0;
      if (record.odometer > 0) {
        if (lastOdometer > 0 && record.odometer > lastOdometer) {
          tripDistance = record.odometer - lastOdometer;
        }
        lastOdometer = record.odometer;
      }
      recordsWithDistance.push({ ...record, tripDistance });
    }

    const grouped = recordsWithDistance.reduce((acc, record) => {
      const date = new Date(record.timestamp);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!acc[key]) {
        acc[key] = {
          key,
          label: `${date.getMonth() + 1}月`,
          kwh: 0,
          cost: 0,
          count: 0,
          distance: 0,
        };
      }

      acc[key].kwh += record.kwh;
      acc[key].cost += record.total_amount;
      acc[key].count += 1;
      acc[key].distance += record.tripDistance;

      return acc;
    }, {} as Record<string, MonthlyData>);

    return (Object.values(grouped) as MonthlyData[])
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6);
  }, [records]);

  if (stats.length === 0) return null;

  const maxKwh = Math.max(...stats.map(s => s.kwh), 1);
  const maxCount = Math.max(...stats.map(s => s.count), 1);
  const maxDistance = Math.max(...stats.map(s => s.distance), 1);
  const latestMonth = stats[stats.length - 1];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-200 dark:border-slate-800 p-8 transition-all">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 dark:bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
            <BarChart3 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white leading-tight">數據趨勢</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Statistical Insights</p>
          </div>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl w-full sm:w-auto border border-slate-200/50 dark:border-slate-800 shadow-inner">
          <button
            onClick={() => setActiveTab('energy')}
            className={`flex-1 sm:px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'energy'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md scale-[1.02]'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
          >
            Energy
          </button>
          <button
            onClick={() => setActiveTab('distance')}
            className={`flex-1 sm:px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'distance'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md scale-[1.02]'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
          >
            Distance
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        <div className="flex items-end justify-between h-full gap-5 px-2">
          {stats.map((item) => {
            // Calculate heights and positions outside JSX
            const barHeightPct = Math.max(
              (activeTab === 'energy' ? item.kwh / maxKwh : item.distance / maxDistance) * 100,
              5
            );

            const badgeBottomPos = Math.max((item.count / maxCount) * 85, 5);

            return (
              <div key={item.key} className="relative flex-1 flex flex-col items-center group h-full justify-end">
                {/* Tooltip on Hover */}
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1 bg-slate-900 text-white text-[11px] font-black rounded-xl px-3 py-2 pointer-events-none whitespace-nowrap z-30 shadow-2xl">
                  {activeTab === 'energy' ? `${item.kwh.toFixed(1)} kWh` : `${item.distance.toLocaleString()} km`}
                </div>

                <div className="relative w-full max-w-[60px] h-full flex items-end">
                  {/* The "Track" */}
                  <div className="absolute inset-0 bg-slate-100 dark:bg-slate-950 rounded-2xl mx-1 shadow-inner border border-slate-200/30 dark:border-slate-800/50" />

                  {/* The Bar */}
                  <div
                    className={`w-full mx-1 rounded-t-2xl transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:brightness-110 group-hover:scale-x-105 border-x border-t border-emerald-600/10 dark:border-white/5 relative z-10 ${activeTab === 'energy'
                        ? 'bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-400 shadow-[0_4px_15px_rgba(16,185,129,0.2)]'
                        : 'bg-gradient-to-t from-emerald-600 via-emerald-500 to-teal-400 shadow-[0_4px_15px_rgba(20,184,166,0.2)]'
                      }`}
                    style={{ height: `${barHeightPct}%` }}
                  >
                    {/* Gloss Reflection */}
                    <div className="absolute inset-x-0 top-0 h-4 bg-white/20 rounded-t-2xl blur-[1px]" />
                  </div>

                  {/* Count Marker */}
                  {activeTab === 'energy' && (
                    <div
                      className="absolute w-8 h-8 bg-white dark:bg-slate-800 border-[3px] border-amber-400 dark:border-amber-500 rounded-full flex items-center justify-center text-[10px] font-black text-amber-600 dark:text-amber-400 shadow-lg left-1/2 -translate-x-1/2 transition-all duration-1000 z-20 group-hover:scale-125"
                      style={{ bottom: `calc(${badgeBottomPos}% - 16px)` }}
                    >
                      {item.count}
                    </div>
                  )}
                </div>

                <div className="mt-6 text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em]">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-8 gap-x-2 border-t border-slate-100 dark:border-slate-800/50 pt-10">
        <SummaryItem icon={<Zap size={16} fill="currentColor" />} label="本月度數" value={`${latestMonth.kwh.toFixed(1)}`} unit="kWh" color="emerald" />
        <SummaryItem icon={<TrendingUp size={16} />} label="充電次數" value={`${latestMonth.count}`} unit="次" color="amber" />
        <SummaryItem icon={<Map size={16} />} label="本月里程" value={`${latestMonth.distance.toLocaleString()}`} unit="km" color="blue" />
        <SummaryItem icon={<BarChart3 size={16} />} label="平均電價" value={`${latestMonth.kwh > 0 ? (latestMonth.cost / latestMonth.kwh).toFixed(2) : '0.00'}`} unit="/度" color="emerald" />
        <SummaryItem
          icon={<Coins size={16} />}
          label="每公里成本"
          value={`${latestMonth.distance > 0 ? (latestMonth.cost / latestMonth.distance).toFixed(2) : '0.00'}`}
          unit="/km"
          color="rose"
        />
        <SummaryItem
          icon={<Zap size={16} />}
          label="平均電耗"
          value={`${latestMonth.distance > 0 && latestMonth.kwh > 0 ? (latestMonth.distance / latestMonth.kwh).toFixed(2) : '0.00'}`}
          unit="km/kWh"
          color="blue"
        />
      </div>
    </div>
  );
};

const SummaryItem = ({ icon, label, value, unit, color }: { icon: React.ReactNode, label: string, value: string, unit: string, color: string }) => {
  const colors: Record<string, string> = {
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100/50 dark:border-emerald-800/50",
    amber: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 border-amber-100/50 dark:border-amber-800/50",
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 border-blue-100/50 dark:border-blue-800/50",
    rose: "text-rose-600 bg-rose-50 dark:bg-rose-900/30 border-rose-100/50 dark:border-rose-800/50",
  };

  return (
    <div className="flex items-center gap-3 group">
      <div className={`p-3 rounded-2xl border transition-transform group-hover:scale-110 flex-shrink-0 ${colors[color] || colors.emerald}`}>
        {icon}
      </div>
      <div className="min-w-0 flex flex-col justify-center">
        <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-[0.15em] mb-0.5 whitespace-nowrap">{label}</div>
        <div className="flex items-baseline gap-0.5">
          <span className="text-xl font-black text-slate-800 dark:text-white tracking-tight leading-none">
            {value}
          </span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
