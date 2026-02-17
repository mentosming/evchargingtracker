import React, { useState, useEffect, useMemo } from 'react';
import { User, ChargingRecord } from '../types';
import { db } from '../services/firebase';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { PlusCircle, MapPin, Gauge, BatteryCharging, Star, FileText, Trash2, Calendar, ChevronDown, Zap, Clock, CreditCard, MessageSquare, TrendingUp } from 'lucide-react';
import UserStats from './UserStats';

interface UserDashboardProps {
  user: User;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  const [records, setRecords] = useState<ChargingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const getLocalISOString = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  };

  const [location, setLocation] = useState('');
  const [recordDateTime, setRecordDateTime] = useState(getLocalISOString());
  const [mode, setMode] = useState<'kWh' | 'Time'>('kWh');
  const [kwh, setKwh] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [odometer, setOdometer] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const costPerKwh = React.useMemo(() => {
    const k = parseFloat(kwh);
    const t = parseFloat(totalAmount);
    if (k > 0 && t > 0) return (t / k).toFixed(2);
    return '0.00';
  }, [kwh, totalAmount]);

  useEffect(() => {
    if (!user.uid) return;
    setLoading(true);
    const q = query(collection(db, 'charging_records'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChargingRecord[];
      // Sort by timestamp descending (Newest first)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Strict validation: Location, kWh, and Total Amount must be present
    if (!user.email || !location.trim() || !kwh || !totalAmount) {
      alert('請填寫所有必填欄位 (地點、電量、總額)');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const newRecord: Omit<ChargingRecord, 'id'> = {
        uid: user.uid,
        userEmail: user.email,
        timestamp: new Date(recordDateTime).getTime(),
        location: location.trim(),
        mode,
        kwh: parseFloat(kwh),
        total_amount: parseFloat(totalAmount),
        cost_per_kwh: parseFloat(costPerKwh),
        odometer: odometer ? parseFloat(odometer) : 0,
        rating: rating,
        notes: notes.trim(),
      };
      await addDoc(collection(db, 'charging_records'), newRecord);
      setLocation('');
      setRecordDateTime(getLocalISOString());
      setKwh('');
      setTotalAmount('');
      setOdometer('');
      setRating(5);
      setNotes('');
    } catch (error) {
      alert('新增失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('確定要刪除？')) {
      await deleteDoc(doc(db, 'charging_records', id));
    }
  };

  const renderStars = (count: number) => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={11} className={`${i < count ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
      ))}
    </div>
  );

  // Clone for stats (chronological order)
  const statsRecords = [...records].sort((a, b) => a.timestamp - b.timestamp);

  const inputBaseClasses = "flex items-center w-full h-[54px] px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all duration-300 shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-600 font-bold text-[15px] text-left appearance-none leading-none";
  const inputWithIconClasses = `pl-12 ${inputBaseClasses}`;
  const labelClasses = "flex items-center h-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 ml-1 mb-2.5";
  const requiredStar = <span className="text-rose-500 ml-1 text-[12px] font-black">*</span>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Redesigned Form Section */}
      <div className="lg:col-span-1 order-1">
        <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] dark:shadow-none border border-slate-200/60 dark:border-slate-800 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
          
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
            
            {/* 區塊 1: 基本資訊 */}
            <div className="space-y-4">
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
                    className={`${inputWithIconClasses} w-full [color-scheme:light] dark:[color-scheme:dark] [&::-webkit-date-and-time-value]:text-left [&::-webkit-date-and-time-value]:flex [&::-webkit-date-and-time-value]:items-center [&::-webkit-date-and-time-value]:h-full [&::-webkit-date-and-time-value]:py-0`}
                  />
                </div>
              </div>
            </div>

            {/* 區塊 2: 計費與里程 */}
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

            {/* 區塊 3: 電力數據 */}
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

            {/* 區塊 4: 使用體驗與評分 */}
            <div className="space-y-5 pt-2">
              <div className="space-y-2.5">
                <label className={labelClasses}>充電體驗 Experience</label>
                <div className="flex items-center justify-between px-5 h-[54px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-inner transition-all">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Rating</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-transform active:scale-90"
                      >
                        <Star 
                          size={22} 
                          className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-800'} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClasses}>備註內容 Remarks</label>
                <div className="relative group">
                  <MessageSquare className="absolute left-4 top-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="輸入補充資訊..."
                    className={`${inputWithIconClasses} h-auto py-3.5 items-start resize-none`}
                  />
                </div>
              </div>
            </div>

            {/* Live Indicator */}
            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-inner flex justify-between items-center transition-all">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-600 tracking-[0.15em]">平均單價 Unit Price</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">${costPerKwh}</span>
                    <span className="text-[11px] font-black text-slate-400">/ kWh</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center border border-emerald-100 dark:border-emerald-800 shadow-sm">
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

      {/* List Section */}
      <div className="lg:col-span-2 order-2 space-y-10">
        {!loading && records.length > 0 && <UserStats records={statsRecords} />}
        
        <div className="flex items-center gap-4 ml-2">
          <div className="w-1.5 h-8 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30"></div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">歷史紀錄</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full"></div></div>
        ) : records.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[40px] p-20 text-center border-2 border-slate-100 dark:border-slate-800 border-dashed">
            <BatteryCharging className="mx-auto h-16 w-16 text-slate-200 dark:text-slate-800 mb-6" />
            <p className="text-slate-500 dark:text-slate-400 font-black text-xl">開始記錄您的第一次充電</p>
          </div>
        ) : (
          <div className="space-y-6">
            {records.map((record, index) => {
              // Logic to calculate distance and cost/km
              const prevRecord = records[index + 1];
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
                        <h3 className="font-black text-2xl text-slate-800 dark:text-white">{record.location}</h3>
                        <div className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center border border-slate-200/50 dark:border-slate-700">
                          {renderStars(record.rating || 0)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        <Calendar size={13} />
                        {new Date(record.timestamp).toLocaleString('zh-TW', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 leading-none">${record.total_amount}</div>
                        <div className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mt-2">${record.cost_per_kwh} / KWH</div>
                      </div>
                      <button
                        onClick={() => record.id && handleDelete(record.id)}
                        className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/40 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    <RecordStat label="充電電量" value={record.kwh} unit="kWh" />
                    <RecordStat label="累計里程" value={record.odometer > 0 ? record.odometer : '--'} unit="km" />
                    <RecordStat 
                      label="行駛距離" 
                      value={traveledDistance > 0 ? traveledDistance : '--'} 
                      unit={traveledDistance > 0 ? "km" : ""} 
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