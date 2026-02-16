export interface ChargingRecord {
  id?: string;
  uid: string;
  userEmail: string;
  timestamp: number; // Stored as timestamp
  location: string;
  mode: 'kWh' | 'Time';
  kwh: number;
  total_amount: number;
  cost_per_kwh: number;
  odometer: number;
  rating?: number; // 1-5 stars
  notes?: string; // User notes/remarks
}

export interface User {
  uid: string;
  email: string | null;
  photoURL: string | null;
}

// 重要：此 Email 必須與 Firebase Security Rules 中的 Email 一致
// 否則該帳號將無法讀取所有人的資料，管理員面板將會顯示空白或權限錯誤
export const ADMIN_EMAIL = 'km520daisy@gmail.com';