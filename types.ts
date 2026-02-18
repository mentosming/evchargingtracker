
export interface ChargingRecord {
  id?: string;
  uid: string;
  userEmail: string;
  timestamp: number;
  location: string;
  licensePlate?: string;
  duration?: number;
  mode: 'kWh' | 'Time';
  kwh: number;
  total_amount: number;
  cost_per_kwh: number;
  odometer: number;
  rating?: number;
  notes?: string;
  isFeatured?: boolean; // 新增：是否由管理員發佈至精選社群
}

export interface User {
  uid: string;
  email: string | null;
  photoURL: string | null;
}

export const ADMIN_EMAIL = 'km520daisy@gmail.com';
