// Generated from the live Supabase schema (project fesycrujoyffvvvdlzuq).
// Regenerate after migrations:
//   supabase gen types typescript --project-id <ref> > lib/database.types.ts
// (or via the Supabase MCP generate_typescript_types tool)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          id: number;
          new_data: Json | null;
          old_data: Json | null;
          org_id: string;
          row_id: string;
          table_name: string;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          id?: never;
          new_data?: Json | null;
          old_data?: Json | null;
          org_id: string;
          row_id: string;
          table_name: string;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          id?: never;
          new_data?: Json | null;
          old_data?: Json | null;
          org_id?: string;
          row_id?: string;
          table_name?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          contact: string | null;
          created_at: string;
          created_on: string;
          deleted_at: string | null;
          email: string | null;
          id: string;
          name: string;
          notes: string | null;
          org_id: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          contact?: string | null;
          created_at?: string;
          created_on?: string;
          deleted_at?: string | null;
          email?: string | null;
          id?: string;
          name: string;
          notes?: string | null;
          org_id: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          contact?: string | null;
          created_at?: string;
          created_on?: string;
          deleted_at?: string | null;
          email?: string | null;
          id?: string;
          name?: string;
          notes?: string | null;
          org_id?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      fixed_expenses: {
        Row: {
          amount: number;
          category: Database["public"]["Enums"]["overhead_category"];
          created_at: string;
          created_on: string;
          deleted_at: string | null;
          id: string;
          last_gen: string | null;
          name: string;
          org_id: string;
          updated_at: string;
        };
        Insert: {
          amount: number;
          category: Database["public"]["Enums"]["overhead_category"];
          created_at?: string;
          created_on?: string;
          deleted_at?: string | null;
          id?: string;
          last_gen?: string | null;
          name: string;
          org_id: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          category?: Database["public"]["Enums"]["overhead_category"];
          created_at?: string;
          created_on?: string;
          deleted_at?: string | null;
          id?: string;
          last_gen?: string | null;
          name?: string;
          org_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invitations: {
        Row: {
          accepted_at: string | null;
          created_at: string;
          email: string;
          expires_at: string;
          id: string;
          invited_by: string | null;
          org_id: string;
          role: Database["public"]["Enums"]["org_role"];
          token: string;
        };
        Insert: {
          accepted_at?: string | null;
          created_at?: string;
          email: string;
          expires_at: string;
          id?: string;
          invited_by?: string | null;
          org_id: string;
          role?: Database["public"]["Enums"]["org_role"];
          token: string;
        };
        Update: {
          accepted_at?: string | null;
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string | null;
          org_id?: string;
          role?: Database["public"]["Enums"]["org_role"];
          token?: string;
        };
        Relationships: [];
      };
      invoice_items: {
        Row: {
          amount: number;
          description: string;
          id: string;
          invoice_id: string;
          org_id: string;
          position: number;
        };
        Insert: {
          amount: number;
          description: string;
          id?: string;
          invoice_id: string;
          org_id: string;
          position?: number;
        };
        Update: {
          amount?: number;
          description?: string;
          id?: string;
          invoice_id?: string;
          org_id?: string;
          position?: number;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          client_id: string;
          created_at: string;
          created_on: string;
          deleted_at: string | null;
          due_date: string;
          id: string;
          issue_date: string;
          number: string;
          org_id: string;
          paid_amount: number;
          project_id: string | null;
          status: Database["public"]["Enums"]["invoice_status"];
          updated_at: string;
        };
        Insert: {
          client_id: string;
          created_at?: string;
          created_on?: string;
          deleted_at?: string | null;
          due_date: string;
          id?: string;
          issue_date: string;
          number: string;
          org_id: string;
          paid_amount?: number;
          project_id?: string | null;
          status?: Database["public"]["Enums"]["invoice_status"];
          updated_at?: string;
        };
        Update: {
          client_id?: string;
          created_at?: string;
          created_on?: string;
          deleted_at?: string | null;
          due_date?: string;
          id?: string;
          issue_date?: string;
          number?: string;
          org_id?: string;
          paid_amount?: number;
          project_id?: string | null;
          status?: Database["public"]["Enums"]["invoice_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          client_id: string;
          created_at: string;
          created_on: string;
          deleted_at: string | null;
          id: string;
          lost_reason: Database["public"]["Enums"]["lost_reason"] | null;
          name: string;
          org_id: string;
          stage: Database["public"]["Enums"]["lead_stage"];
          updated_at: string;
          value: number;
        };
        Insert: {
          client_id: string;
          created_at?: string;
          created_on?: string;
          deleted_at?: string | null;
          id?: string;
          lost_reason?: Database["public"]["Enums"]["lost_reason"] | null;
          name: string;
          org_id: string;
          stage?: Database["public"]["Enums"]["lead_stage"];
          updated_at?: string;
          value: number;
        };
        Update: {
          client_id?: string;
          created_at?: string;
          created_on?: string;
          deleted_at?: string | null;
          id?: string;
          lost_reason?: Database["public"]["Enums"]["lost_reason"] | null;
          name?: string;
          org_id?: string;
          stage?: Database["public"]["Enums"]["lead_stage"];
          updated_at?: string;
          value?: number;
        };
        Relationships: [];
      };
      memberships: {
        Row: {
          created_at: string;
          id: string;
          org_id: string;
          role: Database["public"]["Enums"]["org_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          org_id: string;
          role?: Database["public"]["Enums"]["org_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          org_id?: string;
          role?: Database["public"]["Enums"]["org_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      organizations: {
        Row: { created_at: string; id: string; locale: string; name: string; theme: string };
        Insert: { created_at?: string; id?: string; locale?: string; name: string; theme?: string };
        Update: { created_at?: string; id?: string; locale?: string; name?: string; theme?: string };
        Relationships: [];
      };
      profiles: {
        Row: { created_at: string; full_name: string | null; id: string };
        Insert: { created_at?: string; full_name?: string | null; id: string };
        Update: { created_at?: string; full_name?: string | null; id?: string };
        Relationships: [];
      };
      projects: {
        Row: {
          client_id: string;
          created_at: string;
          created_on: string;
          deleted_at: string | null;
          end_date: string;
          id: string;
          monthly: number | null;
          name: string;
          org_id: string;
          start_date: string;
          status: Database["public"]["Enums"]["project_status"];
          type: Database["public"]["Enums"]["contract_type"];
          updated_at: string;
          value: number;
        };
        Insert: {
          client_id: string;
          created_at?: string;
          created_on?: string;
          deleted_at?: string | null;
          end_date: string;
          id?: string;
          monthly?: number | null;
          name: string;
          org_id: string;
          start_date: string;
          status?: Database["public"]["Enums"]["project_status"];
          type?: Database["public"]["Enums"]["contract_type"];
          updated_at?: string;
          value: number;
        };
        Update: {
          client_id?: string;
          created_at?: string;
          created_on?: string;
          deleted_at?: string | null;
          end_date?: string;
          id?: string;
          monthly?: number | null;
          name?: string;
          org_id?: string;
          start_date?: string;
          status?: Database["public"]["Enums"]["project_status"];
          type?: Database["public"]["Enums"]["contract_type"];
          updated_at?: string;
          value?: number;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          amount: number;
          created_at: string;
          deleted_at: string | null;
          description: string | null;
          id: string;
          invoice_id: string | null;
          org_id: string;
          overhead_category: Database["public"]["Enums"]["overhead_category"] | null;
          project_id: string | null;
          retainer_ym: string | null;
          tx_date: string;
          type: Database["public"]["Enums"]["tx_type"];
        };
        Insert: {
          amount: number;
          created_at?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          invoice_id?: string | null;
          org_id: string;
          overhead_category?: Database["public"]["Enums"]["overhead_category"] | null;
          project_id?: string | null;
          retainer_ym?: string | null;
          tx_date: string;
          type: Database["public"]["Enums"]["tx_type"];
        };
        Update: {
          amount?: number;
          created_at?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          invoice_id?: string | null;
          org_id?: string;
          overhead_category?: Database["public"]["Enums"]["overhead_category"] | null;
          project_id?: string | null;
          retainer_ym?: string | null;
          tx_date?: string;
          type?: Database["public"]["Enums"]["tx_type"];
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      accept_invitation: { Args: { invite_token: string }; Returns: string };
      auth_org_ids: { Args: Record<string, never>; Returns: string[] };
      auth_role_in: {
        Args: { target_org: string };
        Returns: Database["public"]["Enums"]["org_role"];
      };
      create_org_and_owner: { Args: { org_name: string }; Returns: string };
    };
    Enums: {
      contract_type: "oneoff" | "retainer";
      invoice_status: "draft" | "sent" | "paid" | "overdue";
      lead_stage: "contact" | "proposal" | "negotiation" | "won" | "lost";
      lost_reason: "price" | "timing" | "competitor" | "noresponse" | "other";
      org_role: "manager" | "staff";
      overhead_category: "salaries" | "rent" | "internet" | "operations";
      project_status: "active" | "hold" | "completed" | "cancelled";
      tx_type: "revenue" | "cost" | "overhead";
    };
    CompositeTypes: { [_ in never]: never };
  };
};
