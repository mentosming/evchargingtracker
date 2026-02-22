import React, { useState, useEffect } from 'react';
import { User, FixedExpenses } from '../types';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Settings, Car, Calendar, CreditCard, Save } from 'lucide-react';

interface SettingsPanelProps {
    user: User;
    onBack: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ user, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [monthlyLoan, setMonthlyLoan] = useState('');
    const [monthlyLoanPayDay, setMonthlyLoanPayDay] = useState('');
    const [monthlyParking, setMonthlyParking] = useState('');
    const [monthlyParkingPayDay, setMonthlyParkingPayDay] = useState('');
    const [insuranceExpiry, setInsuranceExpiry] = useState('');
    const [insuranceAnnual, setInsuranceAnnual] = useState('');
    const [licenseExpiry, setLicenseExpiry] = useState('');
    const [licenseAnnual, setLicenseAnnual] = useState('');

    const formatDateLabel = (timestamp?: number) => {
        if (!timestamp) return '';
        const d = new Date(timestamp);
        const tzOffset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
    };

    useEffect(() => {
        const fetchSettings = async () => {
            if (!user.uid) return;
            try {
                const snap = await getDoc(doc(db, 'user_settings', user.uid));
                if (snap.exists()) {
                    const data = snap.data() as FixedExpenses;
                    setMonthlyLoan(data.monthlyLoan ? data.monthlyLoan.toString() : '');
                    setMonthlyLoanPayDay(data.monthlyLoanPayDay ? data.monthlyLoanPayDay.toString() : '');
                    setMonthlyParking(data.monthlyParking ? data.monthlyParking.toString() : '');
                    setMonthlyParkingPayDay(data.monthlyParkingPayDay ? data.monthlyParkingPayDay.toString() : '');
                    setInsuranceExpiry(formatDateLabel(data.insuranceExpiry || undefined));
                    setInsuranceAnnual(data.insuranceAnnualCost ? data.insuranceAnnualCost.toString() : '');
                    setLicenseExpiry(formatDateLabel(data.licenseExpiry || undefined));
                    setLicenseAnnual(data.licenseAnnualCost ? data.licenseAnnualCost.toString() : '');
                }
            } catch (err) {
                console.error("Error fetching settings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [user.uid]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user.uid) return;

        setIsSaving(true);
        try {
            const fixedData: FixedExpenses = {
                uid: user.uid,
                userEmail: user.email || '',
                monthlyLoan: parseFloat(monthlyLoan) || 0,
                monthlyLoanPayDay: parseInt(monthlyLoanPayDay) || undefined,
                monthlyParking: parseFloat(monthlyParking) || 0,
                monthlyParkingPayDay: parseInt(monthlyParkingPayDay) || undefined,
                insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry).getTime() : null,
                insuranceAnnualCost: parseFloat(insuranceAnnual) || 0,
                licenseExpiry: licenseExpiry ? new Date(licenseExpiry).getTime() : null,
                licenseAnnualCost: parseFloat(licenseAnnual) || 0,
                lastUpdated: Date.now(),
            };

            await setDoc(doc(db, 'user_settings', user.uid), fixedData, { merge: true });
            alert('設定已儲存！');
            onBack();
        } catch (err: any) {
            console.error(err);
            alert('儲存失敗：' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-24">
                <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    const inputBaseClasses = "flex items-center w-full h-[54px] px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all duration-300 shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-600 font-bold text-[15px] pl-12";
    const labelClasses = "flex items-center h-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 ml-1 mb-2.5";

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between ml-2">
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-8 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30"></div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                        <Settings className="text-emerald-500" size={28} />
                        約定款項設定
                    </h2>
                </div>
                <button
                    onClick={onBack}
                    className="text-sm font-bold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
                >
                    返回儀表板
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200/60 dark:border-slate-800 relative z-10 w-full">
                <form onSubmit={handleSave} className="space-y-8">

                    <div className="space-y-6">
                        <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">月費 Monthly Costs</h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 border border-slate-100 dark:border-slate-800/50 p-6 rounded-3xl bg-slate-50/50 dark:bg-slate-950/20">
                                <div className="sm:col-span-2 space-y-2">
                                    <label className={labelClasses}>每月車貸 Monthly Loan</label>
                                    <div className="relative group">
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            pattern="[0-9]*\.?[0-9]*"
                                            value={monthlyLoan}
                                            onChange={(e) => setMonthlyLoan(e.target.value)}
                                            className={inputBaseClasses}
                                            placeholder="HKD"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClasses}>每月扣款日 Pay Day</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        <input
                                            type="number"
                                            min="1"
                                            max="31"
                                            value={monthlyLoanPayDay}
                                            onChange={(e) => setMonthlyLoanPayDay(e.target.value)}
                                            className={inputBaseClasses}
                                            placeholder="Ex: 15"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 border border-slate-100 dark:border-slate-800/50 p-6 rounded-3xl bg-slate-50/50 dark:bg-slate-950/20">
                                <div className="sm:col-span-2 space-y-2">
                                    <label className={labelClasses}>每月月租車位 Monthly Parking</label>
                                    <div className="relative group">
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            pattern="[0-9]*\.?[0-9]*"
                                            value={monthlyParking}
                                            onChange={(e) => setMonthlyParking(e.target.value)}
                                            className={inputBaseClasses}
                                            placeholder="HKD"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClasses}>每月繳費日 Pay Day</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        <input
                                            type="number"
                                            min="1"
                                            max="31"
                                            value={monthlyParkingPayDay}
                                            onChange={(e) => setMonthlyParkingPayDay(e.target.value)}
                                            className={inputBaseClasses}
                                            placeholder="Ex: 5"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">年費與到期日 Annual Fees</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="w-full space-y-2">
                                <label className={labelClasses}>保險到期日 Insurance Expiry</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    <input
                                        type="date"
                                        value={insuranceExpiry}
                                        onChange={(e) => setInsuranceExpiry(e.target.value)}
                                        className={inputBaseClasses}
                                    />
                                </div>
                            </div>
                            <div className="w-full space-y-2">
                                <label className={labelClasses}>年繳保費 Annual Insurance</label>
                                <div className="relative group">
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        pattern="[0-9]*\.?[0-9]*"
                                        value={insuranceAnnual}
                                        onChange={(e) => setInsuranceAnnual(e.target.value)}
                                        className={inputBaseClasses}
                                        placeholder="HKD"
                                    />
                                </div>
                            </div>

                            <div className="w-full space-y-2">
                                <label className={labelClasses}>牌費到期日 License Expiry</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    <input
                                        type="date"
                                        value={licenseExpiry}
                                        onChange={(e) => setLicenseExpiry(e.target.value)}
                                        className={inputBaseClasses}
                                    />
                                </div>
                            </div>
                            <div className="w-full space-y-2">
                                <label className={labelClasses}>年繳牌費 Annual License</label>
                                <div className="relative group">
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        pattern="[0-9]*\.?[0-9]*"
                                        value={licenseAnnual}
                                        onChange={(e) => setLicenseAnnual(e.target.value)}
                                        className={inputBaseClasses}
                                        placeholder="HKD"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-[24px] font-black text-lg shadow-[0_15px_30px_-5px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2"
                    >
                        {isSaving ? (
                            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>儲存設定</span>
                                <Save size={20} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SettingsPanel;
