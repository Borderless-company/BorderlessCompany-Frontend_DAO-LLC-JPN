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
      AGREEMENT: {
        Row: {
          agreed_at: string
          id: string
          privacy_policy: string | null
          terms_of_use: string | null
          type: Database["public"]["Enums"]["AgreementType"] | null
          user_id: string | null
        }
        Insert: {
          agreed_at?: string
          id?: string
          privacy_policy?: string | null
          terms_of_use?: string | null
          type?: Database["public"]["Enums"]["AgreementType"] | null
          user_id?: string | null
        }
        Update: {
          agreed_at?: string
          id?: string
          privacy_policy?: string | null
          terms_of_use?: string | null
          type?: Database["public"]["Enums"]["AgreementType"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "AGREEMENT_privacy_policy_fkey"
            columns: ["privacy_policy"]
            isOneToOne: false
            referencedRelation: "PRIVACY_POLICY"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "AGREEMENT_terms_of_use_fkey"
            columns: ["terms_of_use"]
            isOneToOne: false
            referencedRelation: "TERMS_OF_USE"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "AGREEMENT_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "USER"
            referencedColumns: ["evm_address"]
          },
        ]
      }
      AOI: {
        Row: {
          branch_location: string[] | null
          business_end_date: string | null
          business_purpose: string | null
          business_start_date: string | null
          capital: number | null
          company_id: string | null
          created_at: string
          currency: Database["public"]["Enums"]["Currency"] | null
          establishment_date: string | null
          id: string
          location: string | null
        }
        Insert: {
          branch_location?: string[] | null
          business_end_date?: string | null
          business_purpose?: string | null
          business_start_date?: string | null
          capital?: number | null
          company_id?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["Currency"] | null
          establishment_date?: string | null
          id?: string
          location?: string | null
        }
        Update: {
          branch_location?: string[] | null
          business_end_date?: string | null
          business_purpose?: string | null
          business_start_date?: string | null
          capital?: number | null
          company_id?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["Currency"] | null
          establishment_date?: string | null
          id?: string
          location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "AOI_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "COMPANY"
            referencedColumns: ["id"]
          },
        ]
      }
      COMPANY: {
        Row: {
          company_number: string | null
          company_type: Database["public"]["Enums"]["CompanyType"] | null
          created_at: string
          deployment_date: string | null
          display_name: string | null
          email: string | null
          founder_id: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          jurisdiction: Database["public"]["Enums"]["Jurisdiction"] | null
          sc_address: string | null
        }
        Insert: {
          company_number?: string | null
          company_type?: Database["public"]["Enums"]["CompanyType"] | null
          created_at?: string
          deployment_date?: string | null
          display_name?: string | null
          email?: string | null
          founder_id?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          jurisdiction?: Database["public"]["Enums"]["Jurisdiction"] | null
          sc_address?: string | null
        }
        Update: {
          company_number?: string | null
          company_type?: Database["public"]["Enums"]["CompanyType"] | null
          created_at?: string
          deployment_date?: string | null
          display_name?: string | null
          email?: string | null
          founder_id?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          jurisdiction?: Database["public"]["Enums"]["Jurisdiction"] | null
          sc_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "COMPANY_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "USER"
            referencedColumns: ["evm_address"]
          },
        ]
      }
      COMPANY_NAME: {
        Row: {
          country: string | null
          created_at: string
          id: string
          name: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          id: string
          name?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      DAO: {
        Row: {
          address: string
          company_id: string | null
          company_name: string | null
          created_at: string
          dao_icon: string | null
          dao_name: string | null
          established_by: string | null
          establishment_date: string | null
        }
        Insert: {
          address: string
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          dao_icon?: string | null
          dao_name?: string | null
          established_by?: string | null
          establishment_date?: string | null
        }
        Update: {
          address?: string
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          dao_icon?: string | null
          dao_name?: string | null
          established_by?: string | null
          establishment_date?: string | null
        }
        Relationships: []
      }
      ESTUARY: {
        Row: {
          created_at: string
          dao_id: string | null
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
          dao_id?: string | null
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
          dao_id?: string | null
          end_date?: string | null
          estuary_link?: string | null
          id?: string
          is_public?: boolean | null
          org_logo?: string | null
          org_name?: string | null
          payment_methods?: string[] | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ESTUARY_dao_id_fkey"
            columns: ["dao_id"]
            isOneToOne: false
            referencedRelation: "DAO"
            referencedColumns: ["address"]
          },
        ]
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
          invested_amount: number | null
          is_admin: boolean | null
          is_executive: boolean | null
          is_minted: boolean
          token_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          dao_id?: string | null
          date_of_employment?: string | null
          id?: string
          invested_amount?: number | null
          is_admin?: boolean | null
          is_executive?: boolean | null
          is_minted?: boolean
          token_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          dao_id?: string | null
          date_of_employment?: string | null
          id?: string
          invested_amount?: number | null
          is_admin?: boolean | null
          is_executive?: boolean | null
          is_minted?: boolean
          token_id?: string | null
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
            foreignKeyName: "MEMBER_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "TOKEN"
            referencedColumns: ["id"]
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
      NONCE: {
        Row: {
          created_at: string
          evmAddress: string | null
          id: number
          nonce: number | null
        }
        Insert: {
          created_at?: string
          evmAddress?: string | null
          id?: number
          nonce?: number | null
        }
        Update: {
          created_at?: string
          evmAddress?: string | null
          id?: number
          nonce?: number | null
        }
        Relationships: []
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
      PRIVACY_POLICY: {
        Row: {
          created_at: string
          id: string
          uri: string
          version: string
        }
        Insert: {
          created_at?: string
          id?: string
          uri: string
          version: string
        }
        Update: {
          created_at?: string
          id?: string
          uri?: string
          version?: string
        }
        Relationships: []
      }
      TASK: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      TASK_STATUS: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          status: Database["public"]["Enums"]["TaskStatus"] | null
          task_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["TaskStatus"] | null
          task_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["TaskStatus"] | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "TASK_STATUS_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "COMPANY"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "TASK_STATUS_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "TASK"
            referencedColumns: ["id"]
          },
        ]
      }
      TERMS_OF_USE: {
        Row: {
          created_at: string
          id: string
          uri: string
          version: string
        }
        Insert: {
          created_at?: string
          id?: string
          uri: string
          version: string
        }
        Update: {
          created_at?: string
          id?: string
          uri?: string
          version?: string
        }
        Relationships: []
      }
      TEST: {
        Row: {
          age: number | null
          created_at: string
          id: number
          name: string | null
        }
        Insert: {
          age?: number | null
          created_at?: string
          id?: number
          name?: string | null
        }
        Update: {
          age?: number | null
          created_at?: string
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      TOKEN: {
        Row: {
          contract_address: string | null
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
          contract_address?: string | null
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
          contract_address?: string | null
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
          email: string | null
          evm_address: string
          furigana: string | null
          kyc_status: Database["public"]["Enums"]["KycStatus"]
          name: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          evm_address?: string
          furigana?: string | null
          kyc_status?: Database["public"]["Enums"]["KycStatus"]
          name?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          evm_address?: string
          furigana?: string | null
          kyc_status?: Database["public"]["Enums"]["KycStatus"]
          name?: string | null
        }
        Relationships: []
      }
      WHITELIST: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      AgreementType: "termsAndConditions" | "termSheets"
      CompanyType: "llc"
      Currency: "yen" | "usd"
      Jurisdiction: "jp"
      KycStatus: "done" | "reviewing" | "yet" | "error"
      PaymentStatus: "done" | "pending" | "yet" | "error"
      TaskStatus: "todo" | "completed" | "inProgress"
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

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
