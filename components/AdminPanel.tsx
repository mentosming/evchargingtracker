import React, { useEffect, useState, useMemo } from 'react';
import { ChargingRecord } from '../types';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Users, Database, Star, Search, FilterX, MapPin, Calendar, Mail, ChevronDown, BarChart3, TrendingUp, Zap } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [records, setRecords] = useState<ChargingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEmail, setFilterEmail] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');

  useEffect(() => {
    // Admin Query: Fetch ALL records system-wide
    const q = query(
      collection(db, 'charging_records'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChargingRecord[];
      setRecords(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Global Statistics (System Wide)
  const globalStats = useMemo(() => {
    const totalKwh = records.reduce((acc, curr) => acc + (curr.kwh || 0), 0);
    const totalRevenue = records.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
    const uniqueUsers = new Set(records.map(r => r.userEmail)).size;
    return { totalKwh, totalRevenue, uniqueUsers };
  }, [records]);

  // Derived Filter Options
  const uniqueUserEmails = useMemo(() => {
    const emails = new Set(records.map(r => r.userEmail));
    return Array.from(emails).sort();
  }, [records]);

  const uniqueMonths = useMemo(() => {
    const months = new Map<string, string>();
    records.forEach(r => {
      const date = new Date(r.timestamp);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
      months.set(key, label);
    });
    return Array.from(months.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [records]);

  // Filtering Logic
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const searchStr = searchQuery.toLowerCase();
      const matchesSearch = r.location.toLowerCase().includes(searchStr) || 
                            r.userEmail.toLowerCase().includes(searchStr);
      const matchesEmail = filterEmail === 'all' || r.userEmail === filterEmail;
      
      const recordDate = new Date(r.timestamp);
      const recordMonthKey = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
      const matchesMonth = filterMonth === 'all' || recordMonthKey === filterMonth;

      return matchesSearch && matchesEmail && matchesMonth;
    });
  }, [records, searchQuery, filterEmail, filterMonth]);

  // User List with counts
  const userList = useMemo(() => {
    const users = new Map<string, { count: number, lastActive: number }>();
    records.forEach(r => {
      if (!users.has(r.userEmail)) {
        users.set(r.userEmail, { count: 0, lastActive: 0 });
      }
      const u = users.get(r.userEmail)!;
      u.count += 1;
      u.lastActive = Math.max(u.lastActive, r.timestamp);
    });
    return Array.from(users.entries()).map(([email, data]) => ({ email, ...data }))
      .sort((a, b) => b.lastActive - a.lastActive);
  }, [records]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      <p className="text-slate-400 font-black uppercase tracking-widest text-xs">載入系統數據中...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 系統概覽卡片 */}
      <div className="bg-slate-900 rounded-[32px] p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Database size={120} className="text-emerald-500" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <ShieldCheckIcon />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">管理員監控面板</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mt-0.5">System Administration</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AdminStatCard label="總充電度數" value={globalStats.totalKwh.toFixed(1)} unit="kWh" icon={<Zap className="text-emerald-400" size={18} />} />
            <AdminStatCard label="總交易金額" value={`$${globalStats.totalRevenue.toLocaleString()}`} unit="HKD" icon={<BarChart3 className="text-amber-400" size={18} />} />
            <AdminStatCard label="活躍使用者" value={globalStats.uniqueUsers} unit="Users" icon={<Users className="text-blue-400" size={18} />} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 左側：使用者清單 (可點擊篩選) */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-fit lg:sticky lg:top-24">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-emerald-500" />
              <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">使用者總覽</h3>
            </div>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {userList.map((u, idx) => (
              <button 
                key={idx} 
                onClick={() => setFilterEmail(u.email)}
                className={`w-full text-left p-4 border-b border-slate-50 dark:border-slate-800 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/10 group ${filterEmail === u.email ? 'bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-inset ring-emerald-500/30' : ''}`}
              >
                <div className="font-bold text-xs text-slate-700 dark:text-slate-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{u.email}</div>
                <div className="flex justify-between mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span className="flex items-center gap-1"><Database size={10}/> {u.count} 筆</span>
                  <span>{new Date(u.lastActive).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 右側：數據過濾與表格 */}
        <div className="lg:col-span-3 space-y-6">
          {/* 篩選工具列 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Search size={16} className="text-emerald-500" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">全域數據過濾 Global Filters</span>
              </div>
              { (searchQuery || filterEmail !== 'all' || filterMonth !== 'all') && (
                <button 
                  onClick={() => {setSearchQuery(''); setFilterEmail('all'); setFilterMonth('all');}}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
                >
                  <FilterX size={14} /> 重置
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="搜尋地點或 Email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" size={16} />
                <select
                  value={filterEmail}
                  onChange={(e) => setFilterEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none appearance-none transition-all"
                >
                  <option value="all">所有使用者</option>
                  {uniqueUserEmails.map(email => (
                    <option key={email} value={email}>{email}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative group">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" size={16} />
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="w-full h-11 pl-10 pr-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none appearance-none transition-all"
                >
                  <option value="all">所有月份</option>
                  {uniqueMonths.map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 表格主體 */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Database size={18} className="text-emerald-500" />
                <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">全域紀錄清單</h3>
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/20">
                Filtered: {filteredRecords.length} / {records.length}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-950/80 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4">日期時間</th>
                    <th className="px-6 py-4">使用者 Email</th>
                    <th className="px-6 py-4">地點 / 車牌</th>
                    <th className="px-6 py-4 text-center">滿意度</th>
                    <th className="px-6 py-4 text-right">交易金額</th>
                    <th className="px-6 py-4">備註</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center opacity-30">
                          <Search size={48} className="mb-4" />
                          <p className="font-black uppercase tracking-widest text-sm">找不到符合條件的數據</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            {new Date(r.timestamp).toLocaleString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer truncate max-w-[160px]" onClick={() => setFilterEmail(r.userEmail)}>
                            {r.userEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-800 dark:text-white truncate max-w-[120px]">{r.location}</span>
                            {r.licensePlate && (
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">🚗 {r.licensePlate}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {r.rating ? (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-md border border-amber-100 dark:border-amber-900/50">
                               <span className="text-[10px] font-black">{r.rating}</span>
                               <Star size={10} fill="currentColor" />
                            </div>
                          ) : <span className="text-slate-300 dark:text-slate-700">-</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-sm font-black text-slate-900 dark:text-white">${r.total_amount}</div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">${r.cost_per_kwh}/kWh</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium italic truncate max-w-[140px]" title={r.notes}>
                            {r.notes || '-'}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminStatCard = ({ label, value, unit, icon }: { label: string, value: string | number, unit: string, icon: React.ReactNode }) => (
  <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 flex items-start justify-between group hover:bg-white/10 transition-all">
    <div className="space-y-1">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-black text-white tracking-tight">{value}</div>
        <div className="text-[10px] font-black text-emerald-500 uppercase">{unit}</div>
      </div>
    </div>
    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
      {icon}
    </div>
  </div>
);

const ShieldCheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
)

export default AdminPanel;