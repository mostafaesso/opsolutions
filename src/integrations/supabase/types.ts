export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          created_at: string
          custom_domain: string | null
          id: string
          is_active: boolean
          logo_url: string
          manager_emails: string[] | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          custom_domain?: string | null
          id?: string
          is_active?: boolean
          logo_url: string
          manager_emails?: string[] | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          custom_domain?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string
          manager_emails?: string[] | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      company_admins: {
        Row: {
          company_slug: string
          created_at: string
          email: string
          id: string
        }
        Insert: {
          company_slug: string
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          company_slug?: string
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_admins_company_slug_fkey"
            columns: ["company_slug"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["slug"]
          },
        ]
      }
      company_media: {
        Row: {
          caption: string | null
          company_slug: string
          created_at: string
          id: string
          step_key: string
          url: string
        }
        Insert: {
          caption?: string | null
          company_slug: string
          created_at?: string
          id?: string
          step_key: string
          url: string
        }
        Update: {
          caption?: string | null
          company_slug?: string
          created_at?: string
          id?: string
          step_key?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_media_company_slug_fkey"
            columns: ["company_slug"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["slug"]
          },
        ]
      }
      enhancements: {
        Row: {
          after_url: string
          before_url: string
          category: string | null
          company_slug: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          after_url: string
          before_url: string
          category?: string | null
          company_slug: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          after_url?: string
          before_url?: string
          category?: string | null
          company_slug?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "enhancements_company_slug_fkey"
            columns: ["company_slug"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["slug"]
          },
        ]
      }
      hubspot_credentials: {
        Row: {
          company_slug: string
          created_at: string
          id: string
          private_app_token: string
          updated_at: string
        }
        Insert: {
          company_slug: string
          created_at?: string
          id?: string
          private_app_token: string
          updated_at?: string
        }
        Update: {
          company_slug?: string
          created_at?: string
          id?: string
          private_app_token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hubspot_credentials_company_slug_fkey"
            columns: ["company_slug"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["slug"]
          },
        ]
      }
      team_members: {
        Row: {
          company_slug: string
          created_at: string
          email: string
          full_name: string
          id: string
          invited_at: string
          invited_by: string | null
          role: string
          status: string
        }
        Insert: {
          company_slug: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          role?: string
          status?: string
        }
        Update: {
          company_slug?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          role?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_company_slug_fkey"
            columns: ["company_slug"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["slug"]
          },
        ]
      }
      training_completions: {
        Row: {
          card_id: string
          completed_at: string
          id: string
          quiz_score: number | null
          user_id: string
        }
        Insert: {
          card_id: string
          completed_at?: string
          id?: string
          quiz_score?: number | null
          user_id: string
        }
        Update: {
          card_id?: string
          completed_at?: string
          id?: string
          quiz_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "training_users"
            referencedColumns: ["id"]
          },
        ]
      }
      training_users: {
        Row: {
          company_slug: string
          created_at: string
          email: string
          full_name: string
          id: string
          last_active_at: string | null
        }
        Insert: {
          company_slug: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          last_active_at?: string | null
        }
        Update: {
          company_slug?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          last_active_at?: string | null
        }
        Relationships: []
      }
      update_comments: {
        Row: {
          author_email: string
          author_name: string
          content: string
          created_at: string
          id: string
          update_id: string
        }
        Insert: {
          author_email: string
          author_name: string
          content: string
          created_at?: string
          id?: string
          update_id: string
        }
        Update: {
          author_email?: string
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          update_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "update_comments_update_id_fkey"
            columns: ["update_id"]
            isOneToOne: false
            referencedRelation: "updates"
            referencedColumns: ["id"]
          },
        ]
      }
      updates: {
        Row: {
          company_slug: string
          content: string
          created_at: string
          created_by: string
          id: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          company_slug: string
          content: string
          created_at?: string
          created_by: string
          id?: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          company_slug?: string
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "updates_company_slug_fkey"
            columns: ["company_slug"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["slug"]
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
