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
          company_name: string | null
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
          company_name?: string | null
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
          company_name?: string | null
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
          {
            foreignKeyName: "AOI_company_name_fkey"
            columns: ["company_name"]
            isOneToOne: false
            referencedRelation: "COMPANY_NAME"
            referencedColumns: ["id"]
          },
        ]
      }
      COMPANY: {
        Row: {
          aoi: string | null
          company_name: string | null
          company_number: string | null
          company_type: Database["public"]["Enums"]["CompanyType"] | null
          contract_address: string | null
          created_at: string
          deployment_date: string | null
          display_name: string | null
          email: string | null
          founder_id: string | null
          governance_agreement: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          jurisdiction: Database["public"]["Enums"]["Jurisdiction"] | null
        }
        Insert: {
          aoi?: string | null
          company_name?: string | null
          company_number?: string | null
          company_type?: Database["public"]["Enums"]["CompanyType"] | null
          contract_address?: string | null
          created_at?: string
          deployment_date?: string | null
          display_name?: string | null
          email?: string | null
          founder_id?: string | null
          governance_agreement?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          jurisdiction?: Database["public"]["Enums"]["Jurisdiction"] | null
        }
        Update: {
          aoi?: string | null
          company_name?: string | null
          company_number?: string | null
          company_type?: Database["public"]["Enums"]["CompanyType"] | null
          contract_address?: string | null
          created_at?: string
          deployment_date?: string | null
          display_name?: string | null
          email?: string | null
          founder_id?: string | null
          governance_agreement?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          jurisdiction?: Database["public"]["Enums"]["Jurisdiction"] | null
        }
        Relationships: [
          {
            foreignKeyName: "COMPANY_aoi_fkey"
            columns: ["aoi"]
            isOneToOne: false
            referencedRelation: "AOI"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "COMPANY_company_name_fkey"
            columns: ["company_name"]
            isOneToOne: false
            referencedRelation: "COMPANY_NAME"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "COMPANY_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "USER"
            referencedColumns: ["evm_address"]
          },
          {
            foreignKeyName: "COMPANY_governance_agreement_fkey"
            columns: ["governance_agreement"]
            isOneToOne: false
            referencedRelation: "GOVERNANCE_AGREEMENT"
            referencedColumns: ["id"]
          },
        ]
      }
      COMPANY_NAME: {
        Row: {
          created_at: string
          "en-us": string | null
          id: string
          "ja-jp": string | null
        }
        Insert: {
          created_at?: string
          "en-us"?: string | null
          id?: string
          "ja-jp"?: string | null
        }
        Update: {
          created_at?: string
          "en-us"?: string | null
          id?: string
          "ja-jp"?: string | null
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
          company_id: string | null
          created_at: string
          dao_id: string | null
          end_date: string | null
          estuary_link: string | null
          fixed_price: number | null
          id: string
          is_public: boolean | null
          max_price: number | null
          min_price: number | null
          org_logo: string | null
          payment_link: string | null
          payment_methods: string[] | null
          sale_name: string | null
          start_date: string | null
          token_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          dao_id?: string | null
          end_date?: string | null
          estuary_link?: string | null
          fixed_price?: number | null
          id?: string
          is_public?: boolean | null
          max_price?: number | null
          min_price?: number | null
          org_logo?: string | null
          payment_link?: string | null
          payment_methods?: string[] | null
          sale_name?: string | null
          start_date?: string | null
          token_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          dao_id?: string | null
          end_date?: string | null
          estuary_link?: string | null
          fixed_price?: number | null
          id?: string
          is_public?: boolean | null
          max_price?: number | null
          min_price?: number | null
          org_logo?: string | null
          payment_link?: string | null
          payment_methods?: string[] | null
          sale_name?: string | null
          start_date?: string | null
          token_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ESTUARY_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "COMPANY"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ESTUARY_dao_id_fkey"
            columns: ["dao_id"]
            isOneToOne: false
            referencedRelation: "DAO"
            referencedColumns: ["address"]
          },
          {
            foreignKeyName: "ESTUARY_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "TOKEN"
            referencedColumns: ["id"]
          },
        ]
      }
      GOVERNANCE_AGREEMENT: {
        Row: {
          commucation_tool: string | null
          company_id: string | null
          company_name: string | null
          created_at: string
          enforcement_date: string | null
          id: string
          recommendation_rate: number | null
        }
        Insert: {
          commucation_tool?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          enforcement_date?: string | null
          id?: string
          recommendation_rate?: number | null
        }
        Update: {
          commucation_tool?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          enforcement_date?: string | null
          id?: string
          recommendation_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "GOVERNANCE_AGREEMENT_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "COMPANY"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "GOVERNANCE_AGREEMENT_company_name_fkey"
            columns: ["company_name"]
            isOneToOne: false
            referencedRelation: "COMPANY_NAME"
            referencedColumns: ["id"]
          },
        ]
      }
      MEMBER: {
        Row: {
          company_id: string | null
          created_at: string
          dao_id: string | null
          date_of_employment: string | null
          id: string
          invested_amount: number | null
          is_admin: boolean | null
          is_executive: boolean | null
          is_initial_member: boolean | null
          is_minted: boolean
          is_representative: boolean | null
          token_id: string | null
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          dao_id?: string | null
          date_of_employment?: string | null
          id?: string
          invested_amount?: number | null
          is_admin?: boolean | null
          is_executive?: boolean | null
          is_initial_member?: boolean | null
          is_minted?: boolean
          is_representative?: boolean | null
          token_id?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          dao_id?: string | null
          date_of_employment?: string | null
          id?: string
          invested_amount?: number | null
          is_admin?: boolean | null
          is_executive?: boolean | null
          is_initial_member?: boolean | null
          is_minted?: boolean
          is_representative?: boolean | null
          token_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "MEMBER_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "COMPANY"
            referencedColumns: ["id"]
          },
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
          payment_status: Database["public"]["Enums"]["PaymentStatus"] | null
          price: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          estuary_id?: string | null
          id?: string
          payment_status?: Database["public"]["Enums"]["PaymentStatus"] | null
          price?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          estuary_id?: string | null
          id?: string
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
      PROPOSAL: {
        Row: {
          created_at: string
          creator: string | null
          description: string | null
          end_date: string | null
          executor: string | null
          id: string
          proposer: string | null
          quorum: number | null
          start_date: string | null
          threshold: number | null
          title: string | null
        }
        Insert: {
          created_at?: string
          creator?: string | null
          description?: string | null
          end_date?: string | null
          executor?: string | null
          id?: string
          proposer?: string | null
          quorum?: number | null
          start_date?: string | null
          threshold?: number | null
          title?: string | null
        }
        Update: {
          created_at?: string
          creator?: string | null
          description?: string | null
          end_date?: string | null
          executor?: string | null
          id?: string
          proposer?: string | null
          quorum?: number | null
          start_date?: string | null
          threshold?: number | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "PROPOSAL_creator_fkey"
            columns: ["creator"]
            isOneToOne: false
            referencedRelation: "MEMBER"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "PROPOSAL_executor_fkey"
            columns: ["executor"]
            isOneToOne: false
            referencedRelation: "MEMBER"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "PROPOSAL_proposer_fkey"
            columns: ["proposer"]
            isOneToOne: false
            referencedRelation: "MEMBER"
            referencedColumns: ["id"]
          },
        ]
      }
      RESERVED_VOTING: {
        Row: {
          created_at: string
          evm_address: string
          vote_contract_address: string
        }
        Insert: {
          created_at?: string
          evm_address?: string
          vote_contract_address?: string
        }
        Update: {
          created_at?: string
          evm_address?: string
          vote_contract_address?: string
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
      TOKEN: {
        Row: {
          company_id: string | null
          contract_address: string | null
          created_at: string
          dao_id: string | null
          description: string | null
          fixed_price: number | null
          id: string
          image: string | null
          is_executable: boolean | null
          is_recommender: boolean | null
          max_price: number | null
          min_price: number | null
          name: string | null
          product_id: string | null
          symbol: string | null
          token_metadata: string | null
        }
        Insert: {
          company_id?: string | null
          contract_address?: string | null
          created_at?: string
          dao_id?: string | null
          description?: string | null
          fixed_price?: number | null
          id?: string
          image?: string | null
          is_executable?: boolean | null
          is_recommender?: boolean | null
          max_price?: number | null
          min_price?: number | null
          name?: string | null
          product_id?: string | null
          symbol?: string | null
          token_metadata?: string | null
        }
        Update: {
          company_id?: string | null
          contract_address?: string | null
          created_at?: string
          dao_id?: string | null
          description?: string | null
          fixed_price?: number | null
          id?: string
          image?: string | null
          is_executable?: boolean | null
          is_recommender?: boolean | null
          max_price?: number | null
          min_price?: number | null
          name?: string | null
          product_id?: string | null
          symbol?: string | null
          token_metadata?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "TOKEN_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "COMPANY"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "TOKEN_dao_id_fkey"
            columns: ["dao_id"]
            isOneToOne: false
            referencedRelation: "DAO"
            referencedColumns: ["address"]
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
          status: Database["public"]["Enums"]["UserStatus"] | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          evm_address?: string
          furigana?: string | null
          kyc_status?: Database["public"]["Enums"]["KycStatus"]
          name?: string | null
          status?: Database["public"]["Enums"]["UserStatus"] | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          evm_address?: string
          furigana?: string | null
          kyc_status?: Database["public"]["Enums"]["KycStatus"]
          name?: string | null
          status?: Database["public"]["Enums"]["UserStatus"] | null
        }
        Relationships: []
      }
      VOTING_LEVEL: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          is_emergency: boolean | null
          level: number | null
          name: string | null
          quorum: number | null
          voting_threshold: number | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          is_emergency?: boolean | null
          level?: number | null
          name?: string | null
          quorum?: number | null
          voting_threshold?: number | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          is_emergency?: boolean | null
          level?: number | null
          name?: string | null
          quorum?: number | null
          voting_threshold?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "VOTING_LEVEL_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "COMPANY"
            referencedColumns: ["id"]
          },
        ]
      }
      VOTING_PARTCIPANT: {
        Row: {
          created_at: string
          id: string
          participant: string | null
          voting_level: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          participant?: string | null
          voting_level?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          participant?: string | null
          voting_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "VOTING_PARTCIPANT_participant_fkey"
            columns: ["participant"]
            isOneToOne: false
            referencedRelation: "TOKEN"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "VOTING_PARTCIPANT_voting_level_fkey"
            columns: ["voting_level"]
            isOneToOne: false
            referencedRelation: "VOTING_LEVEL"
            referencedColumns: ["id"]
          },
        ]
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
      LangCode: "ja-JP" | "en-US"
      PaymentStatus: "done" | "pending" | "yet" | "error"
      TaskStatus: "todo" | "completed" | "inProgress"
      UserStatus: "preSignUp" | "signedUp"
      VoteType: "agree" | "disagree" | "abstain"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      AgreementType: ["termsAndConditions", "termSheets"],
      CompanyType: ["llc"],
      Currency: ["yen", "usd"],
      Jurisdiction: ["jp"],
      KycStatus: ["done", "reviewing", "yet", "error"],
      LangCode: ["ja-JP", "en-US"],
      PaymentStatus: ["done", "pending", "yet", "error"],
      TaskStatus: ["todo", "completed", "inProgress"],
      UserStatus: ["preSignUp", "signedUp"],
      VoteType: ["agree", "disagree", "abstain"],
    },
  },
} as const
