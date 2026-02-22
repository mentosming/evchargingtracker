
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

export interface VariableExpense {
  id?: string;
  uid: string;
  userEmail: string;
  timestamp: number;
  category: 'Parking' | 'Toll' | 'Maintenance' | 'Detailing' | 'Fine' | 'Other';
  amount: number;
  notes?: string;
}

export interface FixedExpenses {
  id?: string;
  uid: string;
  userEmail: string;
  monthlyLoan: number;
  monthlyLoanPayDay?: number;
  monthlyParking: number;
  monthlyParkingPayDay?: number;
  insuranceExpiry: number | null; // Timestamp
  insuranceAnnualCost: number;
  licenseExpiry: number | null; // Timestamp
  licenseAnnualCost: number;
  lastUpdated: number;
}

