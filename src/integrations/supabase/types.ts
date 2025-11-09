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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analytics: {
        Row: {
          clicks: number | null
          country: string | null
          device: string | null
          id: string
          ip_address: string
          page_views: number | null
          related_searches: number | null
          result_clicks: number | null
          session_id: string
          source: string | null
          time_spent: number | null
          timestamp: string | null
          unique_clicks: number | null
        }
        Insert: {
          clicks?: number | null
          country?: string | null
          device?: string | null
          id?: string
          ip_address: string
          page_views?: number | null
          related_searches?: number | null
          result_clicks?: number | null
          session_id: string
          source?: string | null
          time_spent?: number | null
          timestamp?: string | null
          unique_clicks?: number | null
        }
        Update: {
          clicks?: number | null
          country?: string | null
          device?: string | null
          id?: string
          ip_address?: string
          page_views?: number | null
          related_searches?: number | null
          result_clicks?: number | null
          session_id?: string
          source?: string | null
          time_spent?: number | null
          timestamp?: string | null
          unique_clicks?: number | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          country: string | null
          created_at: string | null
          device: string | null
          event_label: string | null
          event_type: string
          id: string
          ip_address: string | null
          session_id: string
          source: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          device?: string | null
          event_label?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          session_id: string
          source?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          device?: string | null
          event_label?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          session_id?: string
          source?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          serial_number: number
          title: string
          updated_at: string | null
          webresult_page: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          serial_number: number
          title: string
          updated_at?: string | null
          webresult_page: string
        }
        Update: {
          created_at?: string | null
          id?: string
          serial_number?: number
          title?: string
          updated_at?: string | null
          webresult_page?: string
        }
        Relationships: []
      }
      click_events: {
        Row: {
          country: string | null
          device: string | null
          event_type: string
          id: string
          ip_address: string | null
          search_term: string | null
          session_id: string
          target_url: string | null
          timestamp: string | null
        }
        Insert: {
          country?: string | null
          device?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          search_term?: string | null
          session_id: string
          target_url?: string | null
          timestamp?: string | null
        }
        Update: {
          country?: string | null
          device?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          search_term?: string | null
          session_id?: string
          target_url?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      email_captures: {
        Row: {
          captured_at: string
          country: string | null
          device: string | null
          email: string
          id: string
          ip_address: string | null
          redirected_to: string | null
          session_id: string | null
          web_result_id: string | null
        }
        Insert: {
          captured_at?: string
          country?: string | null
          device?: string | null
          email: string
          id?: string
          ip_address?: string | null
          redirected_to?: string | null
          session_id?: string | null
          web_result_id?: string | null
        }
        Update: {
          captured_at?: string
          country?: string | null
          device?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          redirected_to?: string | null
          session_id?: string | null
          web_result_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_captures_web_result_id_fkey"
            columns: ["web_result_id"]
            isOneToOne: false
            referencedRelation: "web_results"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_page: {
        Row: {
          created_at: string | null
          description: string
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      web_results: {
        Row: {
          access_type: string
          allowed_countries: Json | null
          backlink_url: string | null
          created_at: string | null
          description: string
          id: string
          imported_from: string | null
          is_sponsored: boolean | null
          logo_url: string | null
          offer_name: string | null
          original_link: string
          serial_number: number
          title: string
          updated_at: string | null
          webresult_page: string
        }
        Insert: {
          access_type?: string
          allowed_countries?: Json | null
          backlink_url?: string | null
          created_at?: string | null
          description: string
          id?: string
          imported_from?: string | null
          is_sponsored?: boolean | null
          logo_url?: string | null
          offer_name?: string | null
          original_link: string
          serial_number: number
          title: string
          updated_at?: string | null
          webresult_page: string
        }
        Update: {
          access_type?: string
          allowed_countries?: Json | null
          backlink_url?: string | null
          created_at?: string | null
          description?: string
          id?: string
          imported_from?: string | null
          is_sponsored?: boolean | null
          logo_url?: string | null
          offer_name?: string | null
          original_link?: string
          serial_number?: number
          title?: string
          updated_at?: string | null
          webresult_page?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      record_analytics_event: {
        Args: {
          p_country: string
          p_device: string
          p_event_type: string
          p_ip: string
          p_session_id: string
          p_source: string
        }
        Returns: undefined
      }
      track_event: {
        Args: { p_event_type: string; p_session_id: string; p_target: string }
        Returns: undefined
      }
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
