
import React, { useState, useEffect, useMemo } from 'react';
import { User, ChargingRecord } from '../types';
import { db } from '../services/firebase';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { PlusCircle, MapPin, Gauge, BatteryCharging, Star, FileText, Trash2, Calendar, ChevronDown, Zap, Clock, CreditCard, MessageSquare, Car, Timer, Share2, Search, FilterX, AlertCircle } from 'lucide-react';
import UserStats from './UserStats';

interface UserDashboardProps {
  user: User;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  const [records, setRecords] = useState<ChargingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const getLocalISOString = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  };

  const [location, setLocation] = useState('');
  const [licensePlate, setLicensePlate] = useState(''); 
  const [duration, setDuration] = useState(''); 
  const [recordDateTime, setRecordDateTime] = useState(getLocalISOString());
  const [mode, setMode] = useState<'kWh' | 'Time'>('kWh');
  const [kwh, setKwh] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [odometer, setOdometer] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter State
  const [filterLocation, setFilterLocation] = useState('');
  const [filterPlate, setFilterPlate] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');

  const frequentLocations = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
      counts[r.location] = (counts[r.location] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(entry => entry[0]);
  }, [records]);

  const uniquePlates = useMemo(() => {
    const plates = new Set<string>();
    records.forEach(r => {
      if (r.licensePlate) plates.add(r.licensePlate.toUpperCase());
    });
    return Array.from(plates).sort();
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

  const costPerKwhValue = React.useMemo(() => {
    const k = parseFloat(kwh);
    const t = parseFloat(totalAmount);
    if (k > 0 && t > 0) return (t / k);
    return 0;
  }, [kwh, totalAmount]);

  useEffect(() => {
    if (!user.uid) return;
    setLoading(true);
    const q = query(collection(db, 'charging_records'), where('uid', '==', user.uid));
    // Fix: Using any for snapshot to resolve type mismatch in Firebase Modular SDK onSnapshot overload
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as ChargingRecord[];
      data.sort((a, b) => b.timestamp - a.timestamp);
      setRecords(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setError("無法載入紀錄");
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user.uid]);

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesLocation = record.location.toLowerCase().includes(filterLocation.toLowerCase());
      const matchesPlate = filterPlate === 'all' || record.licensePlate?.toUpperCase() === filterPlate;
      
      const recordDate = new Date(record.timestamp);
      const recordMonthKey = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
      const matchesMonth = filterMonth === 'all' || recordMonthKey === filterMonth;
      
      return matchesLocation && matchesPlate && matchesMonth;
    });
  }, [records, filterLocation, filterPlate, filterMonth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user.uid || !user.email) {
      alert('登入逾時，請重新登入');
      return;
    }

    if (!location.trim() || !kwh || !totalAmount) {
      alert('請填寫所有必填欄位 (地點、電量、總額)');
      return;
    }

    const parsedKwh = parseFloat(kwh);
    const parsedAmount = parseFloat(totalAmount);
    const parsedOdometer = odometer ? parseFloat(odometer) : 0;
    const parsedDuration = duration ? parseInt(duration) : 0;

    if (isNaN(parsedKwh) || isNaN(parsedAmount)) {
      alert('請輸入有效的數字 (電量與金額)');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const newRecord: Omit<ChargingRecord, 'id'> = {
        uid: user.uid,
        userEmail: user.email,
        timestamp: new Date(recordDateTime).getTime(),
        location: location.trim(),
        licensePlate: licensePlate.trim().toUpperCase(),
        duration: parsedDuration || 0,
        mode,
        kwh: parsedKwh,
        total_amount: parsedAmount,
        cost_per_kwh: costPerKwhValue,
        odometer: isNaN(parsedOdometer) ? 0 : parsedOdometer,
        rating: rating,
        notes: notes.trim(),
      };

      await addDoc(collection(db, 'charging_records'), newRecord);
      
      setLocation('');
      setDuration('');
      setRecordDateTime(getLocalISOString());
      setKwh('');
      setTotalAmount('');
      setOdometer('');
      setRating(5);
      setNotes('');
      alert('新增成功！');
    } catch (err: any) {
      console.error("Firestore Error:", err);
      alert(`新增失敗：${err.message || '請檢查網路連線或權限'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('確定要刪除？')) {
      try {
        await deleteDoc(doc(db, 'charging_records', id));
      } catch (err: any) {
        alert('刪除失敗：' + err.message);
      }
    }
  };

  const handleShare = async (record: ChargingRecord, traveledDistance: number, costPerKm: number) => {
    const slogans = [
      "馭電智行，讓每一公里都充滿潔淨能量！🌱",
      "電車生活，不僅省錢，更是對地球的一份愛護。🌍",
      "告別油站，迎接智能充電新時代！⚡️",
      "今天我又省下了一筆油費，還為環保出了一份力！🔋",
      "充電不再是負擔，而是智慧理財的一環。📊",
      "比起油車，我更喜歡這種安靜又划算的感覺。🤫"
    ];
    const randomSlogan = slogans[Math.floor(Math.random() * slogans.length)];
    const siteUrl = window.location.origin;

    const shareText = `【我的電車充電紀錄 ⚡️】
📍 地點：${record.location}
🔋 充電量：${record.kwh} kWh
💰 總支出：$${record.total_amount}
🚗 行駛距離：${traveledDistance > 0 ? traveledDistance + ' km' : '尚未記錄'}
💎 每公里成本：$${costPerKm > 0 ? costPerKm.toFixed(2) + '/km' : '計算中'}

${randomSlogan}

想跟我一樣聰明紀錄充電開支嗎？快來試用：
🔗 ${siteUrl}

#EVTracker #電車生活 #環保節能 #SmartMobility`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'EV Charging Tracker 分享',
          text: shareText,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('✨ 分享內容已複製！\n快去貼給朋友看看你的省錢成果吧！');
      } catch (err) {
        alert('分享失敗，請手動複製內容。');
      }
    }
  };

  const renderStars = (count: number) => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={11} className={`${i < count ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
      ))}
    </div>
  );

  const statsRecords = [...records].sort((a, b) => a.timestamp - b.timestamp);

  const inputBaseClasses = "flex items-center w-full h-[54px] px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all duration-300 shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-600 font-bold text-[15px] text-left appearance-none leading-none";
  const inputWithIconClasses = `pl-12 ${inputBaseClasses}`;
  const labelClasses = "flex items-center h-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 ml-1 mb-2.5";
  const requiredStar = <span className="text-rose-500 ml-1 text-[12px] font-black">*</span>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 order-1">
        <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] dark:shadow-none border border-slate-200/60 dark:border-slate-800 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
          
          <div className="px-8 pt-10 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                <PlusCircle size={20} />
              </div>
              <div>
                <h2 className="font-black text-xl text-slate-800 dark:text-white leading-none">新增充電</h2>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1 block">New Transaction</span>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="space-y-6">
              <div className="w-full">
                <label className={labelClasses}>充電地點 Location {requiredStar}</label>
                <div className="relative group w-full">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={inputWithIconClasses}
                    placeholder="例如：領展停車場"
                  />
                </div>
                {frequentLocations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {frequentLocations.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setLocation(loc)}
                        className="px-3 py-1.5 text-[10px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-lg border border-slate-200/50 dark:border-slate-700 hover:border-emerald-500/30 hover:text-emerald-600 transition-all"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-full">
                <label className={labelClasses}>時間 Date & Time</label>
                <div className="relative group w-full">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10" size={18} />
                  <input
                    type="datetime-local"
                    required
                    value={recordDateTime}
                    onChange={(e) => setRecordDateTime(e.target.value)}
                    className={`${inputWithIconClasses} w-full [color-scheme:light] dark:[color-scheme:dark]`}
                  />
                </div>
              </div>

              <div className="w-full">
                <label className={labelClasses}>車牌號碼 Plate</label>
                <div className="relative group w-full">
                  <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input
                    type="text"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    className={inputWithIconClasses}
                    placeholder="例如：TE5LA"
                  />
                </div>
                {/* 新增：過往車牌快速選擇 */}
                {uniquePlates.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {uniquePlates.slice(0, 5).map((plate) => (
                      <button
                        key={plate}
                        type="button"
                        onClick={() => setLicensePlate(plate)}
                        className="px-3 py-1.5 text-[10px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-lg border border-slate-200/50 dark:border-slate-700 hover:border-emerald-500/30 hover:text-emerald-600 transition-all uppercase"
                      >
                        {plate}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClasses}>計費模式</label>
                <div className="relative">
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as any)}
                    className={`${inputBaseClasses} appearance-none pr-10`}
                  >
                    <option value="kWh">計量 (kWh)</option>
                    <option value="Time">計時 (Time)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>當前里程</label>
                <div className="relative group">
                  <Gauge className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input
                    type="number"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    className={inputWithIconClasses}
                    placeholder="km"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={labelClasses}>電量 Energy {requiredStar}</label>
                  <div className="relative group">
                      <BatteryCharging className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={kwh}
                        onChange={(e) => setKwh(e.target.value)}
                        className={inputWithIconClasses}
                        placeholder="kWh"
                      />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={labelClasses}>總額 Amount {requiredStar}</label>
                  <div className="relative group">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                        className={inputWithIconClasses}
                        placeholder="HKD"
                      />
                  </div>
                </div>
              </div>

              <div className="w-full">
                <label className={labelClasses}>時長 Duration (mins)</label>
                <div className="relative group w-full">
                    <Timer className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className={inputWithIconClasses}
                      placeholder="分鐘數"
                    />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-inner flex justify-between items-center transition-all">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-600 tracking-[0.15em]">平均單價 Unit Price</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">${costPerKwhValue.toFixed(2)}</span>
                    <span className="text-[11px] font-black text-slate-400">/ kWh</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
                <Zap className="text-emerald-500" size={24} fill="currentColor" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-[24px] font-black text-lg shadow-[0_15px_30px_-5px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                    <span>儲存充電紀錄</span>
                    <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2 order-2 space-y-6">
        {!loading && records.length > 0 && <UserStats records={statsRecords} />}
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 ml-2 mt-4">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-8 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30"></div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">歷史紀錄</h2>
          </div>
          
          {records.length > 0 && (
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
              Total {records.length} Records
            </div>
          )}
        </div>

        {/* 紀錄篩選功能區域 */}
        {records.length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Search size={16} className="text-emerald-500" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">篩選條件 Filter History</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 地點搜尋 */}
              <div className="relative group">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="搜尋地點..."
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              {/* 車牌篩選 */}
              <div className="relative group">
                <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" size={16} />
                <select
                  value={filterPlate}
                  onChange={(e) => setFilterPlate(e.target.value)}
                  className="w-full h-11 pl-10 pr-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none appearance-none transition-all"
                >
                  <option value="all">所有車牌</option>
                  {uniquePlates.map(plate => (
                    <option key={plate} value={plate}>{plate}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* 日期篩選 */}
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

            {(filterLocation || filterPlate !== 'all' || filterMonth !== 'all') && (
              <div className="flex justify-end pt-2 border-t border-slate-50 dark:border-slate-800">
                <button
                  onClick={() => {
                    setFilterLocation('');
                    setFilterPlate('all');
                    setFilterMonth('all');
                  }}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
                >
                  <FilterX size={14} />
                  重設所有篩選
                </button>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-24"><div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full"></div></div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[40px] p-20 text-center border-2 border-slate-100 dark:border-slate-800 border-dashed">
            <BatteryCharging className="mx-auto h-16 w-16 text-slate-200 dark:text-slate-800 mb-6" />
            <p className="text-slate-500 dark:text-slate-400 font-black text-xl">
              {records.length > 0 ? "找不到相符的紀錄" : "開始記錄您的第一次充電"}
            </p>
            {records.length > 0 && (
               <button
                onClick={() => {setFilterLocation(''); setFilterPlate('all'); setFilterMonth('all');}}
                className="mt-4 text-emerald-600 font-bold hover:underline text-sm"
               >
                 清除所有搜尋條件
               </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRecords.map((record, idx) => {
              const fullIndex = records.findIndex(r => r.id === record.id);
              const prevRecord = records[fullIndex + 1];
              let traveledDistance = 0;
              let costPerKm = 0;
              
              if (prevRecord && record.odometer > 0 && prevRecord.odometer > 0 && record.odometer > prevRecord.odometer) {
                traveledDistance = record.odometer - prevRecord.odometer;
                costPerKm = record.total_amount / traveledDistance;
              }

              return (
                <div key={record.id} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200/60 dark:border-slate-800 hover:border-emerald-500/50 transition-all group shadow-sm hover:shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex flex-col">
                           <h3 className="font-black text-2xl text-slate-800 dark:text-white">{record.location}</h3>
                           {record.licensePlate && (
                             <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded mt-1 self-start border border-emerald-100 dark:border-emerald-800 uppercase">
                               🚗 {record.licensePlate}
                             </span>
                           )}
                        </div>
                        <div className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center border border-slate-200/50 dark:border-slate-700">
                          {renderStars(record.rating || 0)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        <Calendar size={13} />
                        {new Date(record.timestamp).toLocaleString('zh-TW', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-4 min-w-[140px]">
                      <div className="text-right">
                        <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 leading-none">${record.total_amount}</div>
                        <div className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mt-2">${(record.cost_per_kwh || 0).toFixed(2)} / KWH</div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleShare(record, traveledDistance, costPerKm)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-black text-xs shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 active:scale-95 transition-all animate-pulse-subtle"
                          title="分享給朋友"
                        >
                          <Share2 size={14} strokeWidth={3} />
                          <span>分享成果</span>
                        </button>
                        
                        <button
                          onClick={() => record.id && handleDelete(record.id)}
                          className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/40 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          title="刪除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
                    <RecordStat label="充電電量" value={record.kwh} unit="kWh" />
                    <RecordStat label="累計里程" value={record.odometer > 0 ? record.odometer : '--'} unit="km" />
                    <RecordStat 
                      label="行駛距離" 
                      value={traveledDistance > 0 ? traveledDistance : '--'} 
                      unit={traveledDistance > 0 ? "km" : ""} 
                    />
                    <RecordStat 
                      label="充電時長" 
                      value={record.duration ? record.duration : '--'} 
                      unit={record.duration ? "mins" : ""}
                    />
                    <RecordStat 
                      label="每公里成本" 
                      value={costPerKm > 0 ? `$${costPerKm.toFixed(2)}` : '--'} 
                      unit={costPerKm > 0 ? "/km" : ""}
                      highlight={costPerKm > 0} 
                    />
                  </div>

                  {record.notes && (
                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                      <FileText className="shrink-0 text-slate-300" size={16} />
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">
                        {record.notes}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3), 0 4px 6px -2px rgba(16, 185, 129, 0.05); }
          50% { box-shadow: 0 15px 25px -5px rgba(16, 185, 129, 0.4), 0 10px 10px -5px rgba(16, 185, 129, 0.1); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

const RecordStat = ({ label, value, unit, highlight = false }: { label: string, value: string | number, unit: string, highlight?: boolean }) => (
  <div className="space-y-2">
    <span className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-0.5">{label}</span>
    <div className={`px-4 py-3.5 rounded-2xl border shadow-inner flex items-baseline gap-1 ${highlight ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800' : 'bg-slate-50/80 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800'}`}>
        <span className={`font-black text-lg leading-none ${highlight ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-200'}`}>
          {value}
        </span>
        {unit && <small className={`text-[10px] font-bold uppercase tracking-tighter ${highlight ? 'text-amber-500/70' : 'text-slate-400'}`}>{unit}</small>}
    </div>
  </div>
);

export default UserDashboard;
