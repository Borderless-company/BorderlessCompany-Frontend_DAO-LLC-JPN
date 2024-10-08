export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      DAO: {
        Row: {
          address: string
          company_id: string | null
          company_name: string | null
          created_at: string
          dao_name: string | null
          establishment_date: string | null
        }
        Insert: {
          address: string
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          dao_name?: string | null
          establishment_date?: string | null
        }
        Update: {
          address?: string
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          dao_name?: string | null
          establishment_date?: string | null
        }
        Relationships: []
      }
      ESTUARY: {
        Row: {
          created_at: string
          end_date: string | null
          estuary_link: string | null
          id: string
          is_public: boolean | null
          org_logo: string | null
          org_name: string | null
          payment_methods: string[] | null
          start_date: string | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          estuary_link?: string | null
          id?: string
          is_public?: boolean | null
          org_logo?: string | null
          org_name?: string | null
          payment_methods?: string[] | null
          start_date?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          estuary_link?: string | null
          id?: string
          is_public?: boolean | null
          org_logo?: string | null
          org_name?: string | null
          payment_methods?: string[] | null
          start_date?: string | null
        }
        Relationships: []
      }
      ESTUARY_TOKENS: {
        Row: {
          created_at: string
          estuary_id: string | null
          id: string
          token_id: string | null
        }
        Insert: {
          created_at?: string
          estuary_id?: string | null
          id?: string
          token_id?: string | null
        }
        Update: {
          created_at?: string
          estuary_id?: string | null
          id?: string
          token_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ESTUARY_TOKENS_estuary_id_fkey"
            columns: ["estuary_id"]
            isOneToOne: false
            referencedRelation: "ESTUARY"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ESTUARY_TOKENS_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "TOKEN"
            referencedColumns: ["id"]
          },
        ]
      }
      MEMBER: {
        Row: {
          created_at: string
          dao_id: string | null
          date_of_employment: string | null
          id: string
          is_admin: boolean | null
          is_executive: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          dao_id?: string | null
          date_of_employment?: string | null
          id?: string
          is_admin?: boolean | null
          is_executive?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          dao_id?: string | null
          date_of_employment?: string | null
          id?: string
          is_admin?: boolean | null
          is_executive?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "MEMBER_dao_id_fkey"
            columns: ["dao_id"]
            isOneToOne: false
            referencedRelation: "DAO"
            referencedColumns: ["address"]
          },
          {
            foreignKeyName: "MEMBER_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "USER"
            referencedColumns: ["evm_address"]
          },
        ]
      }
      PAYMENT: {
        Row: {
          created_at: string
          estuary_id: string | null
          id: string
          payment_link: string | null
          payment_status: Database["public"]["Enums"]["PaymentStatus"] | null
          price: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          estuary_id?: string | null
          id?: string
          payment_link?: string | null
          payment_status?: Database["public"]["Enums"]["PaymentStatus"] | null
          price?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          estuary_id?: string | null
          id?: string
          payment_link?: string | null
          payment_status?: Database["public"]["Enums"]["PaymentStatus"] | null
          price?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "PAYMENT_estuary_id_fkey"
            columns: ["estuary_id"]
            isOneToOne: false
            referencedRelation: "ESTUARY"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "PAYMENT_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "USER"
            referencedColumns: ["evm_address"]
          },
        ]
      }
      TOKEN: {
        Row: {
          created_at: string
          dao_id: string | null
          estuary_id: string | null
          fixed_price: number | null
          id: string
          image: string | null
          is_executable: boolean | null
          max_price: number | null
          min_price: number | null
          name: string | null
          product_id: string | null
          symbol: string | null
        }
        Insert: {
          created_at?: string
          dao_id?: string | null
          estuary_id?: string | null
          fixed_price?: number | null
          id?: string
          image?: string | null
          is_executable?: boolean | null
          max_price?: number | null
          min_price?: number | null
          name?: string | null
          product_id?: string | null
          symbol?: string | null
        }
        Update: {
          created_at?: string
          dao_id?: string | null
          estuary_id?: string | null
          fixed_price?: number | null
          id?: string
          image?: string | null
          is_executable?: boolean | null
          max_price?: number | null
          min_price?: number | null
          name?: string | null
          product_id?: string | null
          symbol?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "TOKEN_dao_id_fkey"
            columns: ["dao_id"]
            isOneToOne: false
            referencedRelation: "DAO"
            referencedColumns: ["address"]
          },
          {
            foreignKeyName: "TOKEN_estuary_id_fkey"
            columns: ["estuary_id"]
            isOneToOne: false
            referencedRelation: "ESTUARY"
            referencedColumns: ["id"]
          },
        ]
      }
      USER: {
        Row: {
          address: string | null
          created_at: string
          evm_address: string
          furigana: string | null
          kyc_status: Database["public"]["Enums"]["KycStatus"]
          name: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          evm_address?: string
          furigana?: string | null
          kyc_status?: Database["public"]["Enums"]["KycStatus"]
          name?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          evm_address?: string
          furigana?: string | null
          kyc_status?: Database["public"]["Enums"]["KycStatus"]
          name?: string | null
        }
        Relationships: []
      }
      USER_TOKEN: {
        Row: {
          created_at: string
          id: string
          token_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          token_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          token_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "USER_TOKEN_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "TOKEN"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "USER_TOKEN_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "USER"
            referencedColumns: ["evm_address"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      KycStatus: "done" | "reviewing" | "yet" | "error"
      PaymentStatus: "done" | "pending" | "yet" | "error"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
