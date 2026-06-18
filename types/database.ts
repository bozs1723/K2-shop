/**
 * K2 Factory OS — Database types
 *
 * Type ของตารางใน Supabase/PostgreSQL (ดู database/migrations/0001_schema.sql)
 * เขียนให้เข้ากับ generic ของ @supabase/supabase-js:
 *   createClient<Database>(...)
 *
 * เมื่อเชื่อมต่อ Supabase จริงแล้ว สามารถ regenerate ได้ด้วย:
 *   supabase gen types typescript --project-id <id> > types/database.ts
 */

// ---- Enums ----------------------------------------------------------------
export type UserRole = 'admin' | 'sales' | 'production' | 'shipping' | 'viewer';
export type ProductCategory = 'qr_sign' | 'acrylic_keychain' | 'dtg_shirt' | 'sticker';
export type PricingRuleType = 'size' | 'material' | 'quantity_tier' | 'option' | 'setup';
export type PriceModifier = 'flat' | 'per_unit' | 'multiplier';
export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected';
export type PaymentType = 'deposit' | 'balance' | 'full';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';
export type ProductionStatus = 'queued' | 'in_production' | 'qc' | 'packing' | 'shipped';
export type ShipmentStatus = 'preparing' | 'shipped' | 'in_transit' | 'delivered' | 'returned';

// ---- Helper สำหรับนิยามตาราง ----------------------------------------------
type Timestamps = { created_at: string; updated_at: string };

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          role: UserRole;
          avatar_url: string | null;
          is_active: boolean;
        } & Timestamps;
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          is_active?: boolean;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      customers: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          line_id: string | null;
          email: string | null;
          company: string | null;
          address: string | null;
          tax_id: string | null;
          notes: string | null;
          created_by: string | null;
        } & Timestamps;
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          line_id?: string | null;
          email?: string | null;
          company?: string | null;
          address?: string | null;
          tax_id?: string | null;
          notes?: string | null;
          created_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['customers']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          category: ProductCategory;
          description: string | null;
          base_price: number;
          unit: string;
          production_days: number;
          min_quantity: number;
          image_url: string | null;
          is_active: boolean;
          sort_order: number;
        } & Timestamps;
        Insert: {
          id?: string;
          slug: string;
          name: string;
          category: ProductCategory;
          description?: string | null;
          base_price?: number;
          unit?: string;
          production_days?: number;
          min_quantity?: number;
          image_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      pricing_rules: {
        Row: {
          id: string;
          product_id: string;
          rule_type: PricingRuleType;
          key: string;
          label: string;
          modifier: PriceModifier;
          value: number;
          min_qty: number | null;
          max_qty: number | null;
          extra_days: number;
          is_default: boolean;
          sort_order: number;
        } & Timestamps;
        Insert: {
          id?: string;
          product_id: string;
          rule_type: PricingRuleType;
          key: string;
          label: string;
          modifier?: PriceModifier;
          value?: number;
          min_qty?: number | null;
          max_qty?: number | null;
          extra_days?: number;
          is_default?: boolean;
          sort_order?: number;
        };
        Update: Partial<Database['public']['Tables']['pricing_rules']['Insert']>;
      };
      quotes: {
        Row: {
          id: string;
          quote_number: string | null;
          customer_id: string;
          status: QuoteStatus;
          currency: string;
          subtotal: number;
          discount: number;
          tax: number;
          total: number;
          deposit_percent: number;
          deposit_amount: number;
          valid_until: string | null;
          notes: string | null;
          created_by: string | null;
          sent_at: string | null;
          approved_at: string | null;
          rejected_at: string | null;
        } & Timestamps;
        Insert: {
          id?: string;
          quote_number?: string | null;
          customer_id: string;
          status?: QuoteStatus;
          currency?: string;
          subtotal?: number;
          discount?: number;
          tax?: number;
          total?: number;
          deposit_percent?: number;
          deposit_amount?: number;
          valid_until?: string | null;
          notes?: string | null;
          created_by?: string | null;
          sent_at?: string | null;
          approved_at?: string | null;
          rejected_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['quotes']['Insert']>;
      };
      quote_items: {
        Row: {
          id: string;
          quote_id: string;
          product_id: string | null;
          description: string;
          size: string | null;
          material: string | null;
          options: Record<string, unknown>;
          quantity: number;
          unit_price: number;
          amount: number;
          file_url: string | null;
          production_days: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          quote_id: string;
          product_id?: string | null;
          description: string;
          size?: string | null;
          material?: string | null;
          options?: Record<string, unknown>;
          quantity?: number;
          unit_price?: number;
          amount?: number;
          file_url?: string | null;
          production_days?: number;
          sort_order?: number;
        };
        Update: Partial<Database['public']['Tables']['quote_items']['Insert']>;
      };
      payments: {
        Row: {
          id: string;
          quote_id: string;
          type: PaymentType;
          status: PaymentStatus;
          amount: number;
          paid_at: string | null;
          method: string | null;
          reference: string | null;
          slip_url: string | null;
          note: string | null;
          recorded_by: string | null;
        } & Timestamps;
        Insert: {
          id?: string;
          quote_id: string;
          type?: PaymentType;
          status?: PaymentStatus;
          amount?: number;
          paid_at?: string | null;
          method?: string | null;
          reference?: string | null;
          slip_url?: string | null;
          note?: string | null;
          recorded_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
      production_jobs: {
        Row: {
          id: string;
          job_number: string | null;
          quote_id: string | null;
          customer_id: string | null;
          status: ProductionStatus;
          priority: number;
          due_date: string | null;
          assigned_to: string | null;
          started_at: string | null;
          completed_at: string | null;
          notes: string | null;
        } & Timestamps;
        Insert: {
          id?: string;
          job_number?: string | null;
          quote_id?: string | null;
          customer_id?: string | null;
          status?: ProductionStatus;
          priority?: number;
          due_date?: string | null;
          assigned_to?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database['public']['Tables']['production_jobs']['Insert']>;
      };
      production_logs: {
        Row: {
          id: string;
          job_id: string;
          status_from: ProductionStatus | null;
          status_to: ProductionStatus;
          note: string | null;
          logged_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          status_from?: ProductionStatus | null;
          status_to: ProductionStatus;
          note?: string | null;
          logged_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['production_logs']['Insert']>;
      };
      shipments: {
        Row: {
          id: string;
          job_id: string;
          tracking_number: string | null;
          carrier: string | null;
          status: ShipmentStatus;
          shipped_at: string | null;
          delivered_at: string | null;
          recipient_name: string | null;
          recipient_phone: string | null;
          recipient_address: string | null;
          cost: number;
          note: string | null;
        } & Timestamps;
        Insert: {
          id?: string;
          job_id: string;
          tracking_number?: string | null;
          carrier?: string | null;
          status?: ShipmentStatus;
          shipped_at?: string | null;
          delivered_at?: string | null;
          recipient_name?: string | null;
          recipient_phone?: string | null;
          recipient_address?: string | null;
          cost?: number;
          note?: string | null;
        };
        Update: Partial<Database['public']['Tables']['shipments']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      product_category: ProductCategory;
      pricing_rule_type: PricingRuleType;
      price_modifier: PriceModifier;
      quote_status: QuoteStatus;
      payment_type: PaymentType;
      payment_status: PaymentStatus;
      production_status: ProductionStatus;
      shipment_status: ShipmentStatus;
    };
  };
}
