/**
 * K2 Factory OS — Domain types
 * Re-export row types ที่ใช้บ่อย เพื่อให้ import สะดวกขึ้น
 */
import type { Database } from './database';

type Tables = Database['public']['Tables'];

export type User = Tables['users']['Row'];
export type Customer = Tables['customers']['Row'];
export type Product = Tables['products']['Row'];
export type PricingRule = Tables['pricing_rules']['Row'];
export type Quote = Tables['quotes']['Row'];
export type QuoteItem = Tables['quote_items']['Row'];
export type Payment = Tables['payments']['Row'];
export type ProductionJob = Tables['production_jobs']['Row'];
export type ProductionLog = Tables['production_logs']['Row'];
export type Shipment = Tables['shipments']['Row'];

export type {
  UserRole,
  ProductCategory,
  PricingRuleType,
  PriceModifier,
  QuoteStatus,
  PaymentType,
  PaymentStatus,
  ProductionStatus,
  ShipmentStatus,
  Database,
} from './database';

// ---- Type ผสม ที่ใช้ในหน้าจอ ---------------------------------------------
export type QuoteWithRelations = Quote & {
  customer?: Customer;
  items?: QuoteItem[];
  payments?: Payment[];
};

export type ProductionJobWithRelations = ProductionJob & {
  customer?: Customer;
  quote?: Quote;
  logs?: ProductionLog[];
  shipment?: Shipment | null;
};

export type ProductWithRules = Product & {
  pricing_rules?: PricingRule[];
};
