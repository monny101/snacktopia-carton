
// Add custom type definitions for tables not yet in the generated types
// This file complements the auto-generated types.ts file

export interface AuditLog {
  id: string;
  action_type: string;
  table_name: string;
  record_id: string;
  old_values: any;
  new_values: any;
  user_id: string;
  created_at: string;
  ip_address?: string;
  user_email?: string;
}

export interface InventoryAlert {
  id: string;
  product_id: string;
  threshold: number;
  alert_message: string | null;
  is_active: boolean | null;
  created_at: string | null;
  created_by: string | null;
  product_name?: string;
  current_quantity?: number;
}
