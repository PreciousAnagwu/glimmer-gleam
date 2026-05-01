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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          icon: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          icon?: string
          id: string
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          current_uses: number
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          min_order_amount: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_amount?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      game_plays: {
        Row: {
          game_type: string
          id: string
          metadata: Json | null
          played_at: string
          points_earned: number
          user_id: string
        }
        Insert: {
          game_type: string
          id?: string
          metadata?: Json | null
          played_at?: string
          points_earned?: number
          user_id: string
        }
        Update: {
          game_type?: string
          id?: string
          metadata?: Json | null
          played_at?: string
          points_earned?: number
          user_id?: string
        }
        Relationships: []
      }
      gift_wishlists: {
        Row: {
          created_at: string
          email_sent_at: string | null
          expires_at: string | null
          id: string
          message: string | null
          occasion: string | null
          opened_at: string | null
          product_ids: string[]
          recipient_email: string | null
          recipient_name: string | null
          sender_id: string | null
          sender_name: string
          slug: string
          updated_at: string
          view_count: number
        }
        Insert: {
          created_at?: string
          email_sent_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string | null
          occasion?: string | null
          opened_at?: string | null
          product_ids?: string[]
          recipient_email?: string | null
          recipient_name?: string | null
          sender_id?: string | null
          sender_name: string
          slug?: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          created_at?: string
          email_sent_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string | null
          occasion?: string | null
          opened_at?: string | null
          product_ids?: string[]
          recipient_email?: string | null
          recipient_name?: string | null
          sender_id?: string | null
          sender_name?: string
          slug?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      loyalty_points: {
        Row: {
          created_at: string
          id: string
          lifetime_points: number
          points_balance: number
          referral_code: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lifetime_points?: number
          points_balance?: number
          referral_code?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lifetime_points?: number
          points_balance?: number
          referral_code?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          source: string
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          source?: string
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          source?: string
          subscribed_at?: string
        }
        Relationships: []
      }
      newsletters: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          recipient_count: number
          sent_at: string | null
          status: string
          subject: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          recipient_count?: number
          sent_at?: string | null
          status?: string
          subject: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          recipient_count?: number
          sent_at?: string | null
          status?: string
          subject?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          color: string
          created_at: string
          id: string
          order_id: string
          product_id: string
          product_image: string | null
          product_name: string
          quantity: number
          variant_price: number
          variant_style: string
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          product_image?: string | null
          product_name: string
          quantity?: number
          variant_price: number
          variant_style: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          product_image?: string | null
          product_name?: string
          quantity?: number
          variant_price?: number
          variant_style?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          coupon_code: string | null
          created_at: string
          discount: number
          id: string
          is_test_order: boolean
          notes: string | null
          payment_method: string
          payment_receipt_url: string | null
          payment_reference: string | null
          payment_status: string
          shipping_address: string
          shipping_city: string
          shipping_email: string
          shipping_fee: number
          shipping_name: string
          shipping_phone: string
          shipping_state: string
          status: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string
          discount?: number
          id?: string
          is_test_order?: boolean
          notes?: string | null
          payment_method: string
          payment_receipt_url?: string | null
          payment_reference?: string | null
          payment_status?: string
          shipping_address: string
          shipping_city: string
          shipping_email: string
          shipping_fee?: number
          shipping_name: string
          shipping_phone: string
          shipping_state: string
          status?: string
          subtotal: number
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          coupon_code?: string | null
          created_at?: string
          discount?: number
          id?: string
          is_test_order?: boolean
          notes?: string | null
          payment_method?: string
          payment_receipt_url?: string | null
          payment_reference?: string | null
          payment_status?: string
          shipping_address?: string
          shipping_city?: string
          shipping_email?: string
          shipping_fee?: number
          shipping_name?: string
          shipping_phone?: string
          shipping_state?: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      points_transactions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_id: string | null
          points: number
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points: number
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points?: number
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_answers: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_ai_generated: boolean
          is_approved: boolean
          question_id: string
          responder_id: string | null
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_ai_generated?: boolean
          is_approved?: boolean
          question_id: string
          responder_id?: string | null
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_ai_generated?: boolean
          is_approved?: boolean
          question_id?: string
          responder_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "product_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      product_colors: {
        Row: {
          hex: string
          id: string
          name: string
          product_id: string
        }
        Insert: {
          hex: string
          id?: string
          name: string
          product_id: string
        }
        Update: {
          hex?: string
          id?: string
          name?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_colors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          sort_order: number
          url: string
        }
        Insert: {
          id?: string
          product_id: string
          sort_order?: number
          url: string
        }
        Update: {
          id?: string
          product_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_questions: {
        Row: {
          created_at: string
          id: string
          product_id: string
          question: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          question: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          question?: string
          user_id?: string
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          comment: string
          created_at: string
          id: string
          is_approved: boolean
          is_verified_buyer: boolean
          product_id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          is_approved?: boolean
          is_verified_buyer?: boolean
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          is_verified_buyer?: boolean
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          id: string
          original_price: number | null
          price: number
          product_id: string
          style: string
        }
        Insert: {
          id?: string
          original_price?: number | null
          price: number
          product_id: string
          style: string
        }
        Update: {
          id?: string
          original_price?: number | null
          price?: number
          product_id?: string
          style?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          bestseller: boolean
          category_id: string
          created_at: string
          description: string
          featured: boolean
          id: string
          in_stock: boolean
          name: string
          new_arrival: boolean
          rating: number
          reviews: number
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          bestseller?: boolean
          category_id: string
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          in_stock?: boolean
          name: string
          new_arrival?: boolean
          rating?: number
          reviews?: number
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          bestseller?: boolean
          category_id?: string
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          in_stock?: boolean
          name?: string
          new_arrival?: boolean
          rating?: number
          reviews?: number
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          points_awarded: number
          referred_id: string
          referrer_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          points_awarded?: number
          referred_id: string
          referrer_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          points_awarded?: number
          referred_id?: string
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      rewards_settings: {
        Row: {
          id: string
          is_singleton: boolean
          min_redeem_points: number
          order_description: string
          order_label: string
          page_heading: string
          page_subheading: string
          points_per_naira: number
          points_per_order: number
          referral_bonus: number
          referral_description: string
          referral_label: string
          signup_bonus: number
          signup_description: string
          signup_label: string
          updated_at: string
        }
        Insert: {
          id?: string
          is_singleton?: boolean
          min_redeem_points?: number
          order_description?: string
          order_label?: string
          page_heading?: string
          page_subheading?: string
          points_per_naira?: number
          points_per_order?: number
          referral_bonus?: number
          referral_description?: string
          referral_label?: string
          signup_bonus?: number
          signup_description?: string
          signup_label?: string
          updated_at?: string
        }
        Update: {
          id?: string
          is_singleton?: boolean
          min_redeem_points?: number
          order_description?: string
          order_label?: string
          page_heading?: string
          page_subheading?: string
          points_per_naira?: number
          points_per_order?: number
          referral_bonus?: number
          referral_description?: string
          referral_label?: string
          signup_bonus?: number
          signup_description?: string
          signup_label?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      record_gift_view: { Args: { _slug: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
