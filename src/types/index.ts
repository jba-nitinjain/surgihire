export interface Customer {
  customer_id: string;
  full_name: string;
  mobile_number_1: string | null;
  mobile_number_2: string | null;
  mobile_number_3: string | null;
  email: string | null;
  shipping_address: string | null;
  shipping_area: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_pincode: string | null;
  registration_date: string;
}

export interface CustomerFormData {
  full_name: string;
  mobile_number_1?: string | null;
  mobile_number_2?: string | null;
  mobile_number_3?: string | null;
  email?: string | null;
  shipping_address?: string | null;
  shipping_area?: string | null;
  shipping_city?: string | null;
  shipping_state?: string | null;
  shipping_pincode?: string | null;
}


export interface Equipment {
  equipment_id: number;
  equipment_name: string;
  description: string | null;
  category_id: number | null;
  model: string | null;
  make: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  rental_rate: number | null;
  status: string | null;
  last_maintenance_date: string | null;
  next_calibration_date: string | null;
  location: string | null;
}

export interface EquipmentFormData {
  equipment_name: string;
  description?: string | null;
  category_id?: number | null;
  model?: string | null;
  make?: string | null;
  serial_number?: string | null;
  purchase_date?: string | null;
  rental_rate?: string | null;
  status?: string | null;
  last_maintenance_date?: string | null;
  next_calibration_date?: string | null;
  location?: string | null;
  quantity?: string | null;
}

export interface EquipmentCategory {
  category_id: number;
  category_name: string;
  description: string | null;
}

export interface EquipmentCategoryFormData {
  category_name: string;
  description?: string | null;
}

export interface PaymentPlan {
  plan_id: number;
  plan_name: string;
  description: string | null;
  frequency_in_days: number | null;
}

export interface PaymentPlanFormData {
  plan_name: string;
  description?: string | null;
  frequency_in_days?: string | null;
}

// --- New Maintenance Record Types ---
export interface MaintenanceRecord {
  maintenance_id: number;
  equipment_id: number; // Foreign key to Equipment
  maintenance_date: string; // YYYY-MM-DD
  maintenance_type: string | null; // e.g., "Routine Check", "Repair", "Calibration"
  technician: string | null;
  cost: number | null;
  notes: string | null;
  // Consider adding equipment_name if API can provide it for display purposes
  equipment_name?: string; // Optional, for display in lists
}

export interface MaintenanceRecordFormData {
  equipment_id: string | number; // Input as string from select, convert to number
  maintenance_date: string; // YYYY-MM-DD
  maintenance_type?: string | null;
  technician?: string | null;
  cost?: string | null; // Input as string, convert to number
  notes?: string | null;
}
// --- End New Maintenance Record Types ---


export interface RentalTransaction {
  rental_id: number;
  customer_id: number;
  rental_date: string;
  expected_return_date: string | null;
  actual_return_date: string | null;
  total_amount: number | null;
  deposit: number | null;
  payment_term: string | null;
  status: string | null;
}

export interface PaymentSchedule {
  payment_schedule_id: number;
  rental_id: number;
  due_date: string;
  amount_due: number;
  amount_paid: number;
  payment_status: string;
  installment_number: number;
  payment_mode: string | null;
}

export interface ApiResponse {
  data: any[] | any;
  success: boolean;
  message?: string;
  totalRecords?: number;
}

export interface PaginationParams {
  records: number;
  skip: number;
  filters?: Record<string, string | number | null>;
}


export interface TabData {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface PostOffice {
  Name: string;
  Description: string | null;
  BranchType: string;
  DeliveryStatus: string;
  Circle: string;
  District: string;
  Division: string;
  Region: string;
  Block: string;
  State: string;
  Country: string;
  Pincode: string;
}

export interface PincodeApiResponseEntry {
  Message: string;
  Status: 'Success' | 'Error' | '404';
  PostOffice: PostOffice[] | null;
}

export type PincodeApiResponse = PincodeApiResponseEntry[];
