// src/types/index.ts

// --- Existing Customer Types ---
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
  /** Indicates if the customer currently has any active rentals */
  has_active_rentals?: boolean;
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

// --- Existing Equipment Types ---
export interface Equipment {
  equipment_id: number;
  equipment_name: string;
  description: string | null;
  category_id: number | null;
  model: string | null;
  make: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  rental_rate: number | null; // This is the default daily rate
  status: string | null;
  last_maintenance_date: string | null;
  next_calibration_date: string | null;
  location: string | null;
  /** Number of maintenance records associated with this equipment */
  maintenance_record_count?: number;
}

export interface EquipmentFormData {
  equipment_name: string;
  description?: string | null;
  category_id?: number | string | null;
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

// --- Existing Payment Plan Types ---
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

// --- Existing Maintenance Record Types ---
export interface MaintenanceRecord {
  maintenance_id: number;
  equipment_id: number;
  maintenance_date: string;
  maintenance_type: string | null;
  technician: string | null;
  cost: number | null;
  notes: string | null;
  equipment_name?: string;
}

export interface MaintenanceRecordFormData {
  equipment_id: string | number;
  maintenance_date: string;
  maintenance_type?: string | null;
  technician?: string | null;
  cost?: string | null;
  notes?: string | null;
}

// --- New Rental Item Types ---
export interface RentalItem {
  rental_detail_id: number; // From rental_details table
  rental_id: number;
  equipment_id: number;
  equipment_name?: string; // For display
  unit_rental_rate: number; // Rate per day for this specific item in this rental
  // Potentially other fields like discount, subtotal per item
}

export interface RentalItemFormData {
  // Using a unique temp ID for form state before saving to DB
  temp_id: string; // e.g., crypto.randomUUID()
  equipment_id: string; // Selected equipment ID (from form select)
  equipment_name?: string; // For display in the form
  unit_rental_rate: string; // Input as string, specific rate for this rental item
  // Default rate from equipment master can be pre-filled
  default_equipment_rate?: number | null;
}

// --- Updated Rental Transaction Types ---
export interface RentalTransaction {
  rental_id: number;
  customer_id: string;
  shipping_address: string | null;
  shipping_area: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_pincode: string | null;
  billing_address: string | null;
  billing_area: string | null;
  billing_city: string | null;
  billing_state: string | null;
  billing_pincode: string | null;
  mobile_number: string | null;
  email: string | null;
  rental_date: string;
  expected_return_date: string | null;
  actual_return_date: string | null;
  total_amount: number | null; // This will be calculated
  deposit: number | null;
  payment_term: string | null;
  payment_term_name?: string; // For display
  status: string | null;
  notes?: string | null;
  customer_name?: string;
  rental_items?: RentalItem[]; // Array of rented equipment items
}

export interface RentalTransactionFormData {
  customer_id: string;
  shipping_address?: string | null;
  shipping_area?: string | null;
  shipping_city?: string | null;
  shipping_state?: string | null;
  shipping_pincode?: string | null;
  billing_address?: string | null;
  billing_area?: string | null;
  billing_city?: string | null;
  billing_state?: string | null;
  billing_pincode?: string | null;
  mobile_number?: string | null;
  email?: string | null;
  rental_date: string;
  expected_return_date?: string | null;
  // total_amount is calculated, not directly input
  deposit?: string | null;
  payment_term?: string | null; // Selected payment plan name
  status?: string | null;
  notes?: string | null;
  rental_items: RentalItemFormData[]; // Array of items being rented
}

// --- Common API & UI Types ---
export interface ApiResponse {
  data: any[] | any;
  success: boolean;
  message?: string;
  totalRecords?: number;
}

export interface PaginationParams {
  records: number;
  skip: number;
  filters?: Record<string, string | number | boolean | null>;
}

export interface TabData {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

// --- Pincode API Types ---
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
