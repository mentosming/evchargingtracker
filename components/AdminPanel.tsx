import React, { useEffect, useState } from 'react';
import { ChargingRecord } from '../types';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Users, Database, Star, MessageSquare } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [records, setRecords] = useState<ChargingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Admin Query: Fetch ALL records
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

  // Statistics
  const stats = React.useMemo(() => {
    const totalKwh = records.reduce((acc, curr) => acc + (curr.kwh || 0), 0);
    const totalRevenue = records.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
    const uniqueUsers = new Set(records.map(r => r.userEmail)).size;
    return { totalKwh, totalRevenue, uniqueUsers };
  }, [records]);

  // Unique Users List
  const userList = React.useMemo(() => {
    const users = new Map<string, { count: number, lastActive: number }>();
    records.forEach(r => {
      if (!users.has(r.userEmail)) {
        users.set(r.userEmail, { count: 0, lastActive: 0 });
      }
      const u = users.get(r.userEmail)!;
      u.count += 1;
      u.lastActive = Math.max(u.lastActive, r.timestamp);
    });
    return Array.from(users.entries()).map(([email, data]) => ({ email, ...data }));
  }, [records]);

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading system data...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black text-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ShieldCheckIcon /> 管理員監控面板
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-gray-400 text-sm mb-1">總充電度數</div>
            <div className="text-3xl font-bold text-green-400">{stats.totalKwh.toFixed(2)} <span className="text-base font-normal text-white">kWh</span></div>
          </div>
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-gray-400 text-sm mb-1">總交易金額</div>
            <div className="text-3xl font-bold text-yellow-400">${stats.totalRevenue.toLocaleString()}</div>
          </div>
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-gray-400 text-sm mb-1">活躍使用者</div>
            <div className="text-3xl font-bold text-blue-400">{stats.uniqueUsers} <span className="text-base font-normal text-white">人</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User List */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 flex items-center gap-2">
            <Users size={18} className="text-gray-500 dark:text-gray-400" />
            <h3 className="font-bold text-gray-700 dark:text-gray-200">使用者總覽</h3>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {userList.map((u, idx) => (
              <div key={idx} className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="font-medium text-gray-800 dark:text-gray-200 break-all">{u.email}</div>
                <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>紀錄: {u.count} 筆</span>
                  <span>最近: {new Date(u.lastActive).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Data Table */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Database size={18} className="text-gray-500 dark:text-gray-400" />
              <h3 className="font-bold text-gray-700 dark:text-gray-200">全域數據視圖</h3>
            </div>
            <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-gray-600 dark:text-gray-300">Total: {records.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 border-b dark:border-gray-600">
                <tr>
                  <th className="px-4 py-3">日期</th>
                  <th className="px-4 py-3">使用者</th>
                  <th className="px-4 py-3">地點</th>
                  <th className="px-4 py-3 text-center">體驗</th>
                  <th className="px-4 py-3 text-right">金額</th>
                  <th className="px-4 py-3">備註</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(r.timestamp).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 break-all max-w-[150px] truncate" title={r.userEmail}>
                      {r.userEmail}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-[120px] truncate">{r.location}</td>
                    <td className="px-4 py-3 text-center text-yellow-500">
                      {r.rating ? (
                        <div className="flex items-center justify-center gap-1">
                           <span className="font-bold">{r.rating}</span>
                           <Star size={12} fill="currentColor" />
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-gray-900 dark:text-white">${r.total_amount}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-[150px] truncate" title={r.notes}>
                      {r.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShieldCheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
)

export default AdminPanel;