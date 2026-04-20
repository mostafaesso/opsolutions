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
      benchmarks: {
        Row: {
          average_conversion_rate: number
          data_points: number
          id: string
          industry: string
          last_updated_at: string
          metric_type: string
          percentile_25: number | null
          percentile_75: number | null
          region: string | null
        }
        Insert: {
          average_conversion_rate?: number
          data_points?: number
          id?: string
          industry: string
          last_updated_at?: string
          metric_type: string
          percentile_25?: number | null
          percentile_75?: number | null
          region?: string | null
        }
        Update: {
          average_conversion_rate?: number
          data_points?: number
          id?: string
          industry?: string
          last_updated_at?: string
          metric_type?: string
          percentile_25?: number | null
          percentile_75?: number | null
          region?: string | null
        }
        Relationships: []
      }
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
        Relationships: []
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
      company_training_overrides: {
        Row: {
          company_slug: string
          created_at: string
          custom_notes: string | null
          custom_video_url: string | null
          id: string
          is_hidden: boolean
          module_id: string
          updated_at: string
        }
        Insert: {
          company_slug: string
          created_at?: string
          custom_notes?: string | null
          custom_video_url?: string | null
          id?: string
          is_hidden?: boolean
          module_id: string
          updated_at?: string
        }
        Update: {
          company_slug?: string
          created_at?: string
          custom_notes?: string | null
          custom_video_url?: string | null
          id?: string
          is_hidden?: boolean
          module_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_details: {
        Row: {
          company_slug: string
          created_at: string
          employee_count: number | null
          hubspot_account_id: string | null
          hubspot_token: string | null
          id: string
          industry: string | null
          locations: string[]
          main_contact_email: string | null
          main_contact_name: string | null
          main_contact_phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          company_slug: string
          created_at?: string
          employee_count?: number | null
          hubspot_account_id?: string | null
          hubspot_token?: string | null
          id?: string
          industry?: string | null
          locations?: string[]
          main_contact_email?: string | null
          main_contact_name?: string | null
          main_contact_phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          company_slug?: string
          created_at?: string
          employee_count?: number | null
          hubspot_account_id?: string | null
          hubspot_token?: string | null
          id?: string
          industry?: string | null
          locations?: string[]
          main_contact_email?: string | null
          main_contact_name?: string | null
          main_contact_phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      improvements: {
        Row: {
          after_image_url: string | null
          after_metrics: string | null
          before_image_url: string | null
          before_metrics: string | null
          category: string
          company_slug: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          impact_summary: string | null
          implemented_date: string
          title: string
          updated_at: string
        }
        Insert: {
          after_image_url?: string | null
          after_metrics?: string | null
          before_image_url?: string | null
          before_metrics?: string | null
          category?: string
          company_slug: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          impact_summary?: string | null
          implemented_date?: string
          title: string
          updated_at?: string
        }
        Update: {
          after_image_url?: string | null
          after_metrics?: string | null
          before_image_url?: string | null
          before_metrics?: string | null
          category?: string
          company_slug?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          impact_summary?: string | null
          implemented_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pipeline_conversions: {
        Row: {
          company_slug: string
          conversion_date: string
          conversion_rate: number
          created_at: string
          from_count: number
          from_stage: string
          id: string
          to_count: number
          to_stage: string
        }
        Insert: {
          company_slug: string
          conversion_date: string
          conversion_rate?: number
          created_at?: string
          from_count?: number
          from_stage: string
          id?: string
          to_count?: number
          to_stage: string
        }
        Update: {
          company_slug?: string
          conversion_date?: string
          conversion_rate?: number
          created_at?: string
          from_count?: number
          from_stage?: string
          id?: string
          to_count?: number
          to_stage?: string
        }
        Relationships: []
      }
      pipeline_metrics: {
        Row: {
          company_slug: string
          created_at: string
          id: string
          leads_assigned: number
          leads_conversion_rate: number
          leads_count: number
          leads_offline_source: number
          leads_online_source: number
          leads_unassigned: number
          metric_date: string
          mql_contact_status: string
          mql_conversion_rate: number
          mql_count: number
          opportunity_count: number
          opportunity_value: number
          opportunity_win_rate: number
          sql_conversion_rate: number
          sql_count: number
          subscribers_conversion_rate: number
          subscribers_count: number
          subscribers_impressions: number
          subscribers_posts: number
          updated_at: string
          views_conversion_rate: number
          views_count: number
          views_sessions: number
        }
        Insert: {
          company_slug: string
          created_at?: string
          id?: string
          leads_assigned?: number
          leads_conversion_rate?: number
          leads_count?: number
          leads_offline_source?: number
          leads_online_source?: number
          leads_unassigned?: number
          metric_date: string
          mql_contact_status?: string
          mql_conversion_rate?: number
          mql_count?: number
          opportunity_count?: number
          opportunity_value?: number
          opportunity_win_rate?: number
          sql_conversion_rate?: number
          sql_count?: number
          subscribers_conversion_rate?: number
          subscribers_count?: number
          subscribers_impressions?: number
          subscribers_posts?: number
          updated_at?: string
          views_conversion_rate?: number
          views_count?: number
          views_sessions?: number
        }
        Update: {
          company_slug?: string
          created_at?: string
          id?: string
          leads_assigned?: number
          leads_conversion_rate?: number
          leads_count?: number
          leads_offline_source?: number
          leads_online_source?: number
          leads_unassigned?: number
          metric_date?: string
          mql_contact_status?: string
          mql_conversion_rate?: number
          mql_count?: number
          opportunity_count?: number
          opportunity_value?: number
          opportunity_win_rate?: number
          sql_conversion_rate?: number
          sql_count?: number
          subscribers_conversion_rate?: number
          subscribers_count?: number
          subscribers_impressions?: number
          subscribers_posts?: number
          updated_at?: string
          views_conversion_rate?: number
          views_count?: number
          views_sessions?: number
        }
        Relationships: []
      }
      team_members: {
        Row: {
          company_slug: string
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
          email?: string
          full_name?: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          role?: string
          status?: string
        }
        Relationships: []
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
        Relationships: []
      }
      internal_users: {
        Row: {
          id: string
          email: string
          name: string
          role: Database["public"]["Enums"]["platform_role"]
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: Database["public"]["Enums"]["platform_role"]
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: Database["public"]["Enums"]["platform_role"]
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      internal_company_access: {
        Row: {
          id: string
          internal_user_id: string
          company_id: string
          created_at: string
        }
        Insert: {
          id?: string
          internal_user_id: string
          company_id: string
          created_at?: string
        }
        Update: {
          id?: string
          internal_user_id?: string
          company_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_company_access_internal_user_id_fkey"
            columns: ["internal_user_id"]
            isOneToOne: false
            referencedRelation: "internal_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_company_access_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      module_permissions: {
        Row: {
          id: string
          company_id: string
          module_id: string
          role: Database["public"]["Enums"]["platform_role"]
          can_view: boolean
          can_comment: boolean
          can_edit: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          module_id: string
          role: Database["public"]["Enums"]["platform_role"]
          can_view?: boolean
          can_comment?: boolean
          can_edit?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          module_id?: string
          role?: Database["public"]["Enums"]["platform_role"]
          can_view?: boolean
          can_comment?: boolean
          can_edit?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_permissions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      video_modules: {
        Row: {
          id: string
          title: string
          description: string | null
          video_url: string
          duration: number | null
          thumbnail_url: string | null
          order_index: number
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          video_url: string
          duration?: number | null
          thumbnail_url?: string | null
          order_index?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          video_url?: string
          duration?: number | null
          thumbnail_url?: string | null
          order_index?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      video_completions: {
        Row: {
          id: string
          user_id: string
          video_id: string
          completed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_id: string
          completed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          video_id?: string
          completed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "training_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_completions_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "video_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      module_comments: {
        Row: {
          id: string
          module_id: string
          module_type: string
          company_id: string
          author_name: string
          author_email: string
          content: string
          parent_id: string | null
          is_pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          module_id: string
          module_type: string
          company_id: string
          author_name: string
          author_email: string
          content: string
          parent_id?: string | null
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          module_type?: string
          company_id?: string
          author_name?: string
          author_email?: string
          content?: string
          parent_id?: string | null
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_comments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "module_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      gtm_flow_steps: {
        Row: {
          id: string
          title: string
          description: string | null
          order_index: number
          hubspot_integration_note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          order_index?: number
          hubspot_integration_note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          order_index?: number
          hubspot_integration_note?: string | null
          created_at?: string
        }
        Relationships: []
      }
      gtm_tier_tools: {
        Row: {
          id: string
          step_id: string
          tier: string
          tool_name: string
          tool_url: string | null
          monthly_cost: number
          notes: string | null
          order_index: number
        }
        Insert: {
          id?: string
          step_id: string
          tier: string
          tool_name: string
          tool_url?: string | null
          monthly_cost?: number
          notes?: string | null
          order_index?: number
        }
        Update: {
          id?: string
          step_id?: string
          tier?: string
          tool_name?: string
          tool_url?: string | null
          monthly_cost?: number
          notes?: string | null
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "gtm_tier_tools_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "gtm_flow_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      company_gtm_access: {
        Row: {
          id: string
          company_id: string
          tiers_visible: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          tiers_visible?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          tiers_visible?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_gtm_access_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_routing: {
        Row: {
          id: string
          company_id: string
          route_to: string[]
          additional_emails: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          route_to?: string[]
          additional_emails?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          route_to?: string[]
          additional_emails?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_routing_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
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
      platform_role: "super_admin" | "internal_admin" | "company_admin" | "manager" | "employee"
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
    Enums: {
      platform_role: ["super_admin", "internal_admin", "company_admin", "manager", "employee"] as const,
    },
  },
} as const
