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
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_reminders: {
        Row: {
          created_at: string
          id: string
          last_reminder_sent: string
          reminder_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_reminder_sent?: string
          reminder_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_reminder_sent?: string
          reminder_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender?: string
          session_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      consent_logs: {
        Row: {
          analytics: boolean
          banner_version: string
          consent_method: string
          created_at: string
          functional: boolean
          id: string
          ip_address: string | null
          language: string
          marketing: boolean
          session_id: string
          strictly_necessary: boolean
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          analytics?: boolean
          banner_version?: string
          consent_method: string
          created_at?: string
          functional?: boolean
          id?: string
          ip_address?: string | null
          language: string
          marketing?: boolean
          session_id: string
          strictly_necessary?: boolean
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          analytics?: boolean
          banner_version?: string
          consent_method?: string
          created_at?: string
          functional?: boolean
          id?: string
          ip_address?: string | null
          language?: string
          marketing?: boolean
          session_id?: string
          strictly_necessary?: boolean
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean
          amount_off_eur: number | null
          amount_off_pln: number | null
          code: string
          created_at: string
          description_en: string | null
          description_pl: string | null
          id: string
          max_redemptions: number | null
          per_user_limit: number | null
          percent_off: number | null
          redemptions_count: number
          updated_at: string
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          active?: boolean
          amount_off_eur?: number | null
          amount_off_pln?: number | null
          code: string
          created_at?: string
          description_en?: string | null
          description_pl?: string | null
          id?: string
          max_redemptions?: number | null
          per_user_limit?: number | null
          percent_off?: number | null
          redemptions_count?: number
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          active?: boolean
          amount_off_eur?: number | null
          amount_off_pln?: number | null
          code?: string
          created_at?: string
          description_en?: string | null
          description_pl?: string | null
          id?: string
          max_redemptions?: number | null
          per_user_limit?: number | null
          percent_off?: number | null
          redemptions_count?: number
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: []
      }
      furgonetka_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string
          id: string
          refresh_token: string
          updated_at: string | null
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at: string
          id?: string
          refresh_token: string
          updated_at?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          refresh_token?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      loyalty_points: {
        Row: {
          created_at: string
          id: string
          lifetime_points: number | null
          points: number | null
          tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lifetime_points?: number | null
          points?: number | null
          tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lifetime_points?: number | null
          points?: number | null
          tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean | null
          name: string | null
          preferences: Json | null
          subscribed_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          preferences?: Json | null
          subscribed_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          preferences?: Json | null
          subscribed_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price_eur: number
          price_pln: number
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price_eur: number
          price_pln: number
          product_id: string
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price_eur?: number
          price_pln?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_seen: boolean | null
          carrier: string | null
          carrier_name: string | null
          coupon_code: string | null
          created_at: string
          deleted_at: string | null
          discount_eur: number | null
          discount_pln: number | null
          estimated_delivery_date: string | null
          exclude_from_stats: boolean | null
          furgonetka_package_id: string | null
          id: string
          order_number: number | null
          service_id: number | null
          shipping_address: Json | null
          shipping_cost_eur: number | null
          shipping_cost_pln: number | null
          shipping_label_url: string | null
          shipping_status: string | null
          status: string
          total_eur: number
          total_pln: number
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_seen?: boolean | null
          carrier?: string | null
          carrier_name?: string | null
          coupon_code?: string | null
          created_at?: string
          deleted_at?: string | null
          discount_eur?: number | null
          discount_pln?: number | null
          estimated_delivery_date?: string | null
          exclude_from_stats?: boolean | null
          furgonetka_package_id?: string | null
          id?: string
          order_number?: number | null
          service_id?: number | null
          shipping_address?: Json | null
          shipping_cost_eur?: number | null
          shipping_cost_pln?: number | null
          shipping_label_url?: string | null
          shipping_status?: string | null
          status?: string
          total_eur: number
          total_pln: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_seen?: boolean | null
          carrier?: string | null
          carrier_name?: string | null
          coupon_code?: string | null
          created_at?: string
          deleted_at?: string | null
          discount_eur?: number | null
          discount_pln?: number | null
          estimated_delivery_date?: string | null
          exclude_from_stats?: boolean | null
          furgonetka_package_id?: string | null
          id?: string
          order_number?: number | null
          service_id?: number | null
          shipping_address?: Json | null
          shipping_cost_eur?: number | null
          shipping_cost_pln?: number | null
          shipping_label_url?: string | null
          shipping_status?: string | null
          status?: string
          total_eur?: number
          total_pln?: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          description_en: string | null
          description_pl: string | null
          exclude_from_stats: boolean | null
          id: string
          image_url: string | null
          name_en: string
          name_pl: string
          price_eur: number
          price_pln: number
          published: boolean
          size: string | null
          stock_quantity: number
          updated_at: string
          weight: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description_en?: string | null
          description_pl?: string | null
          exclude_from_stats?: boolean | null
          id?: string
          image_url?: string | null
          name_en: string
          name_pl: string
          price_eur: number
          price_pln: number
          published?: boolean
          size?: string | null
          stock_quantity?: number
          updated_at?: string
          weight?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description_en?: string | null
          description_pl?: string | null
          exclude_from_stats?: boolean | null
          id?: string
          image_url?: string | null
          name_en?: string
          name_pl?: string
          price_eur?: number
          price_pln?: number
          published?: boolean
          size?: string | null
          stock_quantity?: number
          updated_at?: string
          weight?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          email_language_preference: string | null
          exclude_from_stats: boolean | null
          first_name: string | null
          id: string
          last_name: string | null
          marketing_consent: boolean | null
          marketing_consent_date: string | null
          newsletter_consent: boolean | null
          newsletter_consent_date: string | null
          preferred_language: string
          quiz_results: Json | null
          role: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          email: string
          email_language_preference?: string | null
          exclude_from_stats?: boolean | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          marketing_consent?: boolean | null
          marketing_consent_date?: string | null
          newsletter_consent?: boolean | null
          newsletter_consent_date?: string | null
          preferred_language?: string
          quiz_results?: Json | null
          role?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          email_language_preference?: string | null
          exclude_from_stats?: boolean | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          marketing_consent?: boolean | null
          marketing_consent_date?: string | null
          newsletter_consent?: boolean | null
          newsletter_consent_date?: string | null
          preferred_language?: string
          quiz_results?: Json | null
          role?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referee_email: string
          referee_id: string | null
          referrer_id: string
          reward_points: number | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          referee_email: string
          referee_id?: string | null
          referrer_id: string
          reward_points?: number | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          referee_email?: string
          referee_id?: string | null
          referrer_id?: string
          reward_points?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referee_id_fkey"
            columns: ["referee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          product_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_wishlists: {
        Row: {
          created_at: string
          id: string
          is_public: boolean | null
          items: Json
          name: string | null
          share_token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean | null
          items?: Json
          name?: string | null
          share_token: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean | null
          items?: Json
          name?: string | null
          share_token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_wishlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      social_posts: {
        Row: {
          caption: string | null
          caption_en: string | null
          caption_pl: string | null
          created_at: string | null
          display_order: number | null
          embed_url: string | null
          external_link: string | null
          id: string
          is_active: boolean | null
          media_url: string
          platform: string
          preview_image_url: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          caption?: string | null
          caption_en?: string | null
          caption_pl?: string | null
          created_at?: string | null
          display_order?: number | null
          embed_url?: string | null
          external_link?: string | null
          id?: string
          is_active?: boolean | null
          media_url: string
          platform: string
          preview_image_url?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          caption?: string | null
          caption_en?: string | null
          caption_pl?: string | null
          created_at?: string | null
          display_order?: number | null
          embed_url?: string | null
          external_link?: string | null
          id?: string
          is_active?: boolean | null
          media_url?: string
          platform?: string
          preview_image_url?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar: string | null
          comment: string
          created_at: string
          id: string
          is_featured: boolean | null
          location: string
          name: string
          product: string | null
          rating: number
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          comment: string
          created_at?: string
          id?: string
          is_featured?: boolean | null
          location: string
          name: string
          product?: string | null
          rating: number
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          comment?: string
          created_at?: string
          id?: string
          is_featured?: boolean | null
          location?: string
          name?: string
          product?: string | null
          rating?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      wishlist: {
        Row: {
          collection: string | null
          created_at: string
          id: string
          price_alert_enabled: boolean | null
          product_id: string
          stock_alert_enabled: boolean | null
          user_id: string
        }
        Insert: {
          collection?: string | null
          created_at?: string
          id?: string
          price_alert_enabled?: boolean | null
          product_id: string
          stock_alert_enabled?: boolean | null
          user_id: string
        }
        Update: {
          collection?: string | null
          created_at?: string
          id?: string
          price_alert_enabled?: boolean | null
          product_id?: string
          stock_alert_enabled?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_user_by_username_or_email: {
        Args: { identifier: string }
        Returns: {
          email: string
          role: string
          user_id: string
          username: string
        }[]
      }
      get_current_user_role: { Args: never; Returns: string }
      search_products: {
        Args: { search_text: string }
        Returns: {
          category: string
          description_en: string
          description_pl: string
          id: string
          image_url: string
          name_en: string
          name_pl: string
          price_eur: number
          price_pln: number
          size: string
          stock_quantity: number
        }[]
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
