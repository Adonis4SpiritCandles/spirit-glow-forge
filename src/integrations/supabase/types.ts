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
      badge_rewards: {
        Row: {
          badge_id: string
          created_at: string | null
          description_en: string | null
          description_pl: string | null
          id: string
          is_active: boolean | null
          reward_type: string
          reward_value: string
        }
        Insert: {
          badge_id: string
          created_at?: string | null
          description_en?: string | null
          description_pl?: string | null
          id?: string
          is_active?: boolean | null
          reward_type: string
          reward_value: string
        }
        Update: {
          badge_id?: string
          created_at?: string | null
          description_en?: string | null
          description_pl?: string | null
          id?: string
          is_active?: boolean | null
          reward_type?: string
          reward_value?: string
        }
        Relationships: []
      }
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
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles_safe"
            referencedColumns: ["user_id"]
          },
        ]
      }
      chat_responses: {
        Row: {
          category: string
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          response_en: string
          response_pl: string
          trigger_keywords_en: string[] | null
          trigger_keywords_pl: string[] | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          response_en: string
          response_pl: string
          trigger_keywords_en?: string[] | null
          trigger_keywords_pl?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          response_en?: string
          response_pl?: string
          trigger_keywords_en?: string[] | null
          trigger_keywords_pl?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      collections: {
        Row: {
          created_at: string | null
          description_en: string | null
          description_pl: string | null
          display_order: number | null
          featured: boolean | null
          gradient_classes: string | null
          icon_name: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name_en: string
          name_pl: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description_en?: string | null
          description_pl?: string | null
          display_order?: number | null
          featured?: boolean | null
          gradient_classes?: string | null
          icon_name?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name_en: string
          name_pl: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description_en?: string | null
          description_pl?: string | null
          display_order?: number | null
          featured?: boolean | null
          gradient_classes?: string | null
          icon_name?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name_en?: string
          name_pl?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
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
      contact_messages: {
        Row: {
          category: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          newsletter_consent: boolean | null
          subject: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          newsletter_consent?: boolean | null
          subject?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          newsletter_consent?: boolean | null
          subject?: string | null
        }
        Relationships: []
      }
      coupon_redemptions: {
        Row: {
          amount_saved_eur: number | null
          amount_saved_pln: number | null
          coupon_id: string
          id: string
          order_id: string | null
          redeemed_at: string | null
          user_id: string
        }
        Insert: {
          amount_saved_eur?: number | null
          amount_saved_pln?: number | null
          coupon_id: string
          id?: string
          order_id?: string | null
          redeemed_at?: string | null
          user_id: string
        }
        Update: {
          amount_saved_eur?: number | null
          amount_saved_pln?: number | null
          coupon_id?: string
          id?: string
          order_id?: string | null
          redeemed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
          referral_only: boolean | null
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
          referral_only?: boolean | null
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
          referral_only?: boolean | null
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: []
      }
      custom_candles_settings: {
        Row: {
          created_at: string | null
          fragrances: Json | null
          hero_image_url: string | null
          id: string
          info_card_text_en: string | null
          info_card_text_pl: string | null
          info_card_title_en: string | null
          info_card_title_pl: string | null
          is_active: boolean | null
          quality_items_en: Json | null
          quality_items_pl: Json | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          fragrances?: Json | null
          hero_image_url?: string | null
          id?: string
          info_card_text_en?: string | null
          info_card_text_pl?: string | null
          info_card_title_en?: string | null
          info_card_title_pl?: string | null
          is_active?: boolean | null
          quality_items_en?: Json | null
          quality_items_pl?: Json | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          fragrances?: Json | null
          hero_image_url?: string | null
          id?: string
          info_card_text_en?: string | null
          info_card_text_pl?: string | null
          info_card_title_en?: string | null
          info_card_title_pl?: string | null
          is_active?: boolean | null
          quality_items_en?: Json | null
          quality_items_pl?: Json | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      data_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          details: string | null
          email: string
          id: string
          name: string
          processed_at: string | null
          request_type: string
          status: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          details?: string | null
          email: string
          id?: string
          name: string
          processed_at?: string | null
          request_type: string
          status?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          details?: string | null
          email?: string
          id?: string
          name?: string
          processed_at?: string | null
          request_type?: string
          status?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string | null
          description_en: string | null
          description_pl: string | null
          edge_function_name: string
          id: string
          is_active: boolean | null
          last_sent_at: string | null
          name_en: string
          name_pl: string
          subject_en: string
          subject_pl: string
          template_key: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description_en?: string | null
          description_pl?: string | null
          edge_function_name: string
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          name_en: string
          name_pl: string
          subject_en: string
          subject_pl: string
          template_key: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description_en?: string | null
          description_pl?: string | null
          edge_function_name?: string
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          name_en?: string
          name_pl?: string
          subject_en?: string
          subject_pl?: string
          template_key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      footer_contact_info: {
        Row: {
          address_line1: string
          address_line2: string | null
          company_legal_name: string
          company_name: string
          email: string
          id: string
          languages: string
          nip: string
          phone: string
          regon: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          address_line1?: string
          address_line2?: string | null
          company_legal_name?: string
          company_name?: string
          email?: string
          id?: string
          languages?: string
          nip?: string
          phone?: string
          regon?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          company_legal_name?: string
          company_name?: string
          email?: string
          id?: string
          languages?: string
          nip?: string
          phone?: string
          regon?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      footer_disclaimers: {
        Row: {
          id: string
          independent_brand_en: string
          independent_brand_pl: string
          inspiration_notice_en: string
          inspiration_notice_pl: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          independent_brand_en?: string
          independent_brand_pl?: string
          inspiration_notice_en?: string
          inspiration_notice_pl?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          independent_brand_en?: string
          independent_brand_pl?: string
          inspiration_notice_en?: string
          inspiration_notice_pl?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      footer_social_icons: {
        Row: {
          created_at: string
          display_order: number
          icon_url: string | null
          id: string
          is_active: boolean | null
          link_url: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          link_url: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          link_url?: string
          name?: string
          updated_at?: string
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
      homepage_features: {
        Row: {
          created_at: string | null
          description_en: string
          description_pl: string
          display_order: number
          icon_name: string
          id: string
          is_active: boolean | null
          title_en: string
          title_pl: string
          tooltip_en: string | null
          tooltip_pl: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description_en: string
          description_pl: string
          display_order?: number
          icon_name: string
          id?: string
          is_active?: boolean | null
          title_en: string
          title_pl: string
          tooltip_en?: string | null
          tooltip_pl?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description_en?: string
          description_pl?: string
          display_order?: number
          icon_name?: string
          id?: string
          is_active?: boolean | null
          title_en?: string
          title_pl?: string
          tooltip_en?: string | null
          tooltip_pl?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      homepage_hero_text: {
        Row: {
          cta1_link: string
          cta1_text_en: string
          cta1_text_pl: string
          cta2_link: string
          cta2_text_en: string
          cta2_text_pl: string
          description_en: string
          description_pl: string
          heading_font_size: string
          heading_line1_en: string
          heading_line1_pl: string
          heading_line2_en: string
          heading_line2_pl: string
          id: string
          subtitle_en: string
          subtitle_font_size: string
          subtitle_pl: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          cta1_link?: string
          cta1_text_en?: string
          cta1_text_pl?: string
          cta2_link?: string
          cta2_text_en?: string
          cta2_text_pl?: string
          description_en?: string
          description_pl?: string
          heading_font_size?: string
          heading_line1_en?: string
          heading_line1_pl?: string
          heading_line2_en?: string
          heading_line2_pl?: string
          id?: string
          subtitle_en?: string
          subtitle_font_size?: string
          subtitle_pl?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          cta1_link?: string
          cta1_text_en?: string
          cta1_text_pl?: string
          cta2_link?: string
          cta2_text_en?: string
          cta2_text_pl?: string
          description_en?: string
          description_pl?: string
          heading_font_size?: string
          heading_line1_en?: string
          heading_line1_pl?: string
          heading_line2_en?: string
          heading_line2_pl?: string
          id?: string
          subtitle_en?: string
          subtitle_font_size?: string
          subtitle_pl?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      homepage_hero_video: {
        Row: {
          autoplay: boolean
          id: string
          loop_video: boolean
          mobile_video_url: string | null
          muted: boolean
          opacity_overlay: number
          updated_at: string | null
          updated_by: string | null
          video_url: string
        }
        Insert: {
          autoplay?: boolean
          id?: string
          loop_video?: boolean
          mobile_video_url?: string | null
          muted?: boolean
          opacity_overlay?: number
          updated_at?: string | null
          updated_by?: string | null
          video_url?: string
        }
        Update: {
          autoplay?: boolean
          id?: string
          loop_video?: boolean
          mobile_video_url?: string | null
          muted?: boolean
          opacity_overlay?: number
          updated_at?: string | null
          updated_by?: string | null
          video_url?: string
        }
        Relationships: []
      }
      legal_documents: {
        Row: {
          document_type: string
          id: string
          page_route: string
          pdf_url_en: string | null
          pdf_url_pl: string | null
          title_en: string
          title_pl: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          document_type: string
          id?: string
          page_route: string
          pdf_url_en?: string | null
          pdf_url_pl?: string | null
          title_en: string
          title_pl: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          document_type?: string
          id?: string
          page_route?: string
          pdf_url_en?: string | null
          pdf_url_pl?: string | null
          title_en?: string
          title_pl?: string
          updated_at?: string
          updated_by?: string | null
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
          {
            foreignKeyName: "loyalty_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profiles_safe"
            referencedColumns: ["user_id"]
          },
        ]
      }
      newsletter_settings: {
        Row: {
          discount_percentage: number
          gdpr_text_en: string
          gdpr_text_pl: string
          heading_en: string
          heading_pl: string
          id: string
          is_active: boolean | null
          subtitle_en: string
          subtitle_pl: string
          success_message_en: string
          success_message_pl: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          discount_percentage?: number
          gdpr_text_en?: string
          gdpr_text_pl?: string
          heading_en?: string
          heading_pl?: string
          id?: string
          is_active?: boolean | null
          subtitle_en?: string
          subtitle_pl?: string
          success_message_en?: string
          success_message_pl?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          discount_percentage?: number
          gdpr_text_en?: string
          gdpr_text_pl?: string
          heading_en?: string
          heading_pl?: string
          id?: string
          is_active?: boolean | null
          subtitle_en?: string
          subtitle_pl?: string
          success_message_en?: string
          success_message_pl?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          confirmed_at: string | null
          consent: boolean
          consent_ip: unknown
          consent_text: string | null
          created_at: string
          double_opt_in_token: string | null
          email: string
          id: string
          is_active: boolean | null
          language: string | null
          name: string | null
          preferences: Json | null
          source: string | null
          status: string | null
          subscribed_at: string
          unsubscribed_at: string | null
          user_agent: string | null
        }
        Insert: {
          confirmed_at?: string | null
          consent?: boolean
          consent_ip?: unknown
          consent_text?: string | null
          created_at?: string
          double_opt_in_token?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          language?: string | null
          name?: string | null
          preferences?: Json | null
          source?: string | null
          status?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
          user_agent?: string | null
        }
        Update: {
          confirmed_at?: string | null
          consent?: boolean
          consent_ip?: unknown
          consent_text?: string | null
          created_at?: string
          double_opt_in_token?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          language?: string | null
          name?: string | null
          preferences?: Json | null
          source?: string | null
          status?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
          user_agent?: string | null
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
          delivered_email_sent: boolean
          discount_eur: number | null
          discount_pln: number | null
          estimated_delivery_date: string | null
          exclude_from_stats: boolean | null
          furgonetka_package_id: string | null
          has_issue: boolean | null
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
          tracking_email_sent: boolean
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
          delivered_email_sent?: boolean
          discount_eur?: number | null
          discount_pln?: number | null
          estimated_delivery_date?: string | null
          exclude_from_stats?: boolean | null
          furgonetka_package_id?: string | null
          has_issue?: boolean | null
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
          tracking_email_sent?: boolean
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
          delivered_email_sent?: boolean
          discount_eur?: number | null
          discount_pln?: number | null
          estimated_delivery_date?: string | null
          exclude_from_stats?: boolean | null
          furgonetka_package_id?: string | null
          has_issue?: boolean | null
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
          tracking_email_sent?: boolean
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_collections: {
        Row: {
          collection_id: string
          created_at: string
          id: string
          product_id: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          id?: string
          product_id: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_collections_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_collections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          collection_id: string | null
          created_at: string
          description_en: string | null
          description_pl: string | null
          exclude_from_stats: boolean | null
          id: string
          image_url: string | null
          image_urls: string[] | null
          name_en: string
          name_pl: string
          preferred_card_tag: string | null
          price_eur: number
          price_pln: number
          published: boolean
          size: string | null
          stock_quantity: number
          summary_en: string | null
          summary_pl: string | null
          updated_at: string
          weight: string | null
        }
        Insert: {
          category: string
          collection_id?: string | null
          created_at?: string
          description_en?: string | null
          description_pl?: string | null
          exclude_from_stats?: boolean | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          name_en: string
          name_pl: string
          preferred_card_tag?: string | null
          price_eur: number
          price_pln: number
          published?: boolean
          size?: string | null
          stock_quantity?: number
          summary_en?: string | null
          summary_pl?: string | null
          updated_at?: string
          weight?: string | null
        }
        Update: {
          category?: string
          collection_id?: string | null
          created_at?: string
          description_en?: string | null
          description_pl?: string | null
          exclude_from_stats?: boolean | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          name_en?: string
          name_pl?: string
          preferred_card_tag?: string | null
          price_eur?: number
          price_pln?: number
          published?: boolean
          size?: string | null
          stock_quantity?: number
          summary_en?: string | null
          summary_pl?: string | null
          updated_at?: string
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "profile_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_comment_ratings: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          rating: number | null
          user_id: string | null
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          user_id?: string | null
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_comment_ratings_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "profile_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_comment_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "profile_comment_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles_safe"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profile_comments: {
        Row: {
          average_rating: number | null
          comment: string
          commenter_id: string
          created_at: string | null
          id: string
          is_visible: boolean | null
          parent_comment_id: string | null
          profile_user_id: string
          rating_count: number | null
          updated_at: string | null
        }
        Insert: {
          average_rating?: number | null
          comment: string
          commenter_id: string
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          parent_comment_id?: string | null
          profile_user_id: string
          rating_count?: number | null
          updated_at?: string | null
        }
        Update: {
          average_rating?: number | null
          comment?: string
          commenter_id?: string
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          parent_comment_id?: string | null
          profile_user_id?: string
          rating_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "profile_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_notifications: {
        Row: {
          actor_id: string
          comment_id: string | null
          created_at: string | null
          id: string
          profile_user_id: string | null
          read: boolean | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id: string
          comment_id?: string | null
          created_at?: string | null
          id?: string
          profile_user_id?: string | null
          read?: boolean | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string
          comment_id?: string | null
          created_at?: string | null
          id?: string
          profile_user_id?: string | null
          read?: boolean | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_notifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "profile_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          cover_image_url: string | null
          created_at: string
          email: string
          email_language: string | null
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
          profile_image_url: string | null
          public_profile: boolean | null
          quiz_results: Json | null
          referral_short_code: string | null
          referral_source_id: string | null
          role: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string
          email: string
          email_language?: string | null
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
          profile_image_url?: string | null
          public_profile?: boolean | null
          quiz_results?: Json | null
          referral_short_code?: string | null
          referral_source_id?: string | null
          role?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string
          email?: string
          email_language?: string | null
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
          profile_image_url?: string | null
          public_profile?: boolean | null
          quiz_results?: Json | null
          referral_short_code?: string | null
          referral_source_id?: string | null
          role?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referral_source_id_fkey"
            columns: ["referral_source_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "profiles_referral_source_id_fkey"
            columns: ["referral_source_id"]
            isOneToOne: false
            referencedRelation: "public_profiles_safe"
            referencedColumns: ["user_id"]
          },
        ]
      }
      public_profile_directory: {
        Row: {
          created_at: string
          first_name: string | null
          last_name: string | null
          profile_image_url: string | null
          public_profile: boolean | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          last_name?: string | null
          profile_image_url?: string | null
          public_profile?: boolean | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          first_name?: string | null
          last_name?: string | null
          profile_image_url?: string | null
          public_profile?: boolean | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          created_at: string | null
          description_en: string | null
          description_pl: string | null
          id: string
          is_active: boolean | null
          referrals_count: number
          reward_type: string
          reward_value: string
        }
        Insert: {
          created_at?: string | null
          description_en?: string | null
          description_pl?: string | null
          id?: string
          is_active?: boolean | null
          referrals_count: number
          reward_type: string
          reward_value: string
        }
        Update: {
          created_at?: string | null
          description_en?: string | null
          description_pl?: string | null
          id?: string
          is_active?: boolean | null
          referrals_count?: number
          reward_type?: string
          reward_value?: string
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
            foreignKeyName: "referrals_referee_id_fkey"
            columns: ["referee_id"]
            isOneToOne: false
            referencedRelation: "public_profiles_safe"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles_safe"
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
      seo_settings: {
        Row: {
          created_at: string | null
          description_en: string | null
          description_pl: string | null
          id: string
          keywords_en: string | null
          keywords_pl: string | null
          noindex: boolean | null
          og_image_url: string | null
          page_type: string
          title_en: string | null
          title_pl: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description_en?: string | null
          description_pl?: string | null
          id?: string
          keywords_en?: string | null
          keywords_pl?: string | null
          noindex?: boolean | null
          og_image_url?: string | null
          page_type: string
          title_en?: string | null
          title_pl?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description_en?: string | null
          description_pl?: string | null
          id?: string
          keywords_en?: string | null
          keywords_pl?: string | null
          noindex?: boolean | null
          og_image_url?: string | null
          page_type?: string
          title_en?: string | null
          title_pl?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
          {
            foreignKeyName: "shared_wishlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles_safe"
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
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles_safe"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      public_profiles_safe: {
        Row: {
          first_name: string | null
          last_name: string | null
          profile_image_url: string | null
          public_profile: boolean | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          first_name?: string | null
          last_name?: string | null
          profile_image_url?: string | null
          public_profile?: boolean | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          first_name?: string | null
          last_name?: string | null
          profile_image_url?: string | null
          public_profile?: boolean | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      complete_referral: {
        Args: { referee_user_id: string; referrer_user_id: string }
        Returns: undefined
      }
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
      has_role:
        | { Args: { _role: string; _user_id: string }; Returns: boolean }
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
      is_admin_from_profile: { Args: never; Returns: boolean }
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
      validate_email: { Args: { email: string }; Returns: boolean }
    }
    Enums: {
      app_role: "user" | "admin"
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
      app_role: ["user", "admin"],
    },
  },
} as const
