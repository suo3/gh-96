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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["admin_role"]
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      coin_pricing: {
        Row: {
          coins: number
          created_at: string
          currency: string
          display_order: number | null
          features: string[]
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          plan_id: string
          price: number
          savings: string | null
          updated_at: string
        }
        Insert: {
          coins: number
          created_at?: string
          currency?: string
          display_order?: number | null
          features?: string[]
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          plan_id: string
          price: number
          savings?: string | null
          updated_at?: string
        }
        Update: {
          coins?: number
          created_at?: string
          currency?: string
          display_order?: number | null
          features?: string[]
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          plan_id?: string
          price?: number
          savings?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      coin_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          stripe_payment_intent_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          stripe_payment_intent_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          stripe_payment_intent_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      conditions: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          value: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          value: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          value?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          item_title: string | null
          listing_id: string | null
          updated_at: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_title?: string | null
          listing_id?: string | null
          updated_at?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_title?: string | null
          listing_id?: string | null
          updated_at?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_sellers: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          position: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          position?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          position?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ghana_regions: {
        Row: {
          cities: string[]
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          cities?: string[]
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          cities?: string[]
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      listings: {
        Row: {
          category: string
          condition: string
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          likes: number | null
          location: string | null
          price: number | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          views: number | null
          wanted_items: string[] | null
        }
        Insert: {
          category: string
          condition: string
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          likes?: number | null
          location?: string | null
          price?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          views?: number | null
          wanted_items?: string[] | null
        }
        Update: {
          category?: string
          condition?: string
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          likes?: number | null
          location?: string | null
          price?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          views?: number | null
          wanted_items?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_money_transactions: {
        Row: {
          amount: number
          coin_amount: number
          created_at: string
          currency: string
          external_reference: string | null
          id: string
          phone_number: string
          plan_type: string
          provider: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          coin_amount: number
          created_at?: string
          currency?: string
          external_reference?: string | null
          id?: string
          phone_number: string
          plan_type: string
          provider: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          coin_amount?: number
          created_at?: string
          currency?: string
          external_reference?: string | null
          id?: string
          phone_number?: string
          plan_type?: string
          provider?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          achievements: string[] | null
          avatar: string | null
          bio: string | null
          business_type: string | null
          city: string | null
          coins: number
          created_at: string | null
          first_name: string | null
          id: string
          is_verified: boolean | null
          joined_date: string | null
          last_name: string | null
          location: string | null
          monthly_listings: number | null
          monthly_sales: number | null
          phone_number: string | null
          preferred_contact_method: string | null
          preferred_language: string | null
          profile_image_url: string | null
          rating: number | null
          region: string | null
          social_media_handles: Json | null
          total_sales: number | null
          updated_at: string | null
          username: string | null
          verification_documents: string[] | null
        }
        Insert: {
          achievements?: string[] | null
          avatar?: string | null
          bio?: string | null
          business_type?: string | null
          city?: string | null
          coins?: number
          created_at?: string | null
          first_name?: string | null
          id: string
          is_verified?: boolean | null
          joined_date?: string | null
          last_name?: string | null
          location?: string | null
          monthly_listings?: number | null
          monthly_sales?: number | null
          phone_number?: string | null
          preferred_contact_method?: string | null
          preferred_language?: string | null
          profile_image_url?: string | null
          rating?: number | null
          region?: string | null
          social_media_handles?: Json | null
          total_sales?: number | null
          updated_at?: string | null
          username?: string | null
          verification_documents?: string[] | null
        }
        Update: {
          achievements?: string[] | null
          avatar?: string | null
          bio?: string | null
          business_type?: string | null
          city?: string | null
          coins?: number
          created_at?: string | null
          first_name?: string | null
          id?: string
          is_verified?: boolean | null
          joined_date?: string | null
          last_name?: string | null
          location?: string | null
          monthly_listings?: number | null
          monthly_sales?: number | null
          phone_number?: string | null
          preferred_contact_method?: string | null
          preferred_language?: string | null
          profile_image_url?: string | null
          rating?: number | null
          region?: string | null
          social_media_handles?: Json | null
          total_sales?: number | null
          updated_at?: string | null
          username?: string | null
          verification_documents?: string[] | null
        }
        Relationships: []
      }
      promoted_items: {
        Row: {
          amount_paid: number
          created_at: string
          currency: string
          ends_at: string
          id: string
          listing_id: string
          promotion_type: string
          starts_at: string
          status: string
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid: number
          created_at?: string
          currency?: string
          ends_at: string
          id?: string
          listing_id: string
          promotion_type?: string
          starts_at?: string
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          currency?: string
          ends_at?: string
          id?: string
          listing_id?: string
          promotion_type?: string
          starts_at?: string
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promotion_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          external_reference: string | null
          id: string
          listing_id: string
          phone_number: string
          promotion_duration_days: number
          promotion_type: string
          provider: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          external_reference?: string | null
          id?: string
          listing_id: string
          phone_number: string
          promotion_duration_days?: number
          promotion_type: string
          provider: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          external_reference?: string | null
          id?: string
          listing_id?: string
          phone_number?: string
          promotion_duration_days?: number
          promotion_type?: string
          provider?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          item_title: string | null
          rated_user_id: string
          rater_user_id: string
          rating: number
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          item_title?: string | null
          rated_user_id: string
          rater_user_id: string
          rating: number
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          item_title?: string | null
          rated_user_id?: string
          rater_user_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "ratings_rated_user_id_fkey"
            columns: ["rated_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_rater_user_id_fkey"
            columns: ["rater_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reported_listings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          listing_id: string
          reason: string
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          listing_id: string
          reason: string
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          listing_id?: string
          reason?: string
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reported_listings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string | null
          id: string
          item1_id: string | null
          item1_title: string
          item2_id: string | null
          item2_title: string
          status: string | null
          updated_at: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item1_id?: string | null
          item1_title: string
          item2_id?: string | null
          item2_title: string
          status?: string | null
          updated_at?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item1_id?: string | null
          item1_title?: string
          item2_id?: string | null
          item2_title?: string
          status?: string | null
          updated_at?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swaps_item1_id_fkey"
            columns: ["item1_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swaps_item2_id_fkey"
            columns: ["item2_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_coins: {
        Args: {
          coin_amount: number
          description: string
          payment_intent_id?: string
        }
        Returns: undefined
      }
      can_create_listing: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_user_coins: {
        Args: { required_coins: number }
        Returns: boolean
      }
      delete_user_account: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_admin_role: {
        Args: { user_uuid?: string }
        Returns: Database["public"]["Enums"]["admin_role"]
      }
      get_conversations_with_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          conv_id: string
          created_at: string
          item_title: string
          last_message: string
          last_message_time: string
          partner_avatar: string
          partner_name: string
          partner_username: string
          unread_count: number
          updated_at: string
          user1_id: string
          user2_id: string
        }[]
      }
      get_conversations_with_unread: {
        Args: Record<PropertyKey, never>
        Returns: {
          conv_id: string
          created_at: string
          item_title: string
          last_message: string
          last_message_time: string
          unread_count: number
          updated_at: string
          user1_id: string
          user2_id: string
        }[]
      }
      get_default_starting_coins: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_listing_cost: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_promotion_price: {
        Args: { promotion_type: string }
        Returns: number
      }
      get_public_profile: {
        Args: { profile_id: string }
        Returns: {
          achievements: string[]
          avatar: string
          bio: string
          city: string
          first_name: string
          id: string
          is_verified: boolean
          joined_date: string
          last_name: string
          rating: number
          region: string
          total_sales: number
          username: string
        }[]
      }
      get_sale_cost: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_swap_cost: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_user_average_rating: {
        Args: { user_uuid: string }
        Returns: number
      }
      get_user_favorites_count: {
        Args: { user_uuid?: string }
        Returns: number
      }
      get_user_rating_count: {
        Args: { user_uuid: string }
        Returns: number
      }
      get_user_total_listings: {
        Args: { user_uuid?: string }
        Returns: number
      }
      increment_listing_likes: {
        Args: { listing_uuid: string }
        Returns: undefined
      }
      increment_listing_views: {
        Args: { listing_uuid: string }
        Returns: undefined
      }
      is_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      is_anonymous_allowed: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_item_favorited: {
        Args: { listing_uuid: string; user_uuid?: string }
        Returns: boolean
      }
      listing_has_active_conversation: {
        Args: { listing_uuid: string }
        Returns: boolean
      }
      requires_approval: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      spend_coins: {
        Args: { coin_amount: number; description: string }
        Returns: boolean
      }
    }
    Enums: {
      admin_role: "super_admin" | "moderator" | "support"
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
      admin_role: ["super_admin", "moderator", "support"],
    },
  },
} as const
