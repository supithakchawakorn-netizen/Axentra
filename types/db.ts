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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      broker_accounts: {
        Row: {
          account_name: string
          account_type: string | null
          broker_name: string | null
          cached_balance: number | null
          cached_balance_updated_at: string | null
          connection_id: string
          created_at: string
          currency: string
          external_id: string
          id: string
          updated_at: string
        }
        Insert: {
          account_name: string
          account_type?: string | null
          broker_name?: string | null
          cached_balance?: number | null
          cached_balance_updated_at?: string | null
          connection_id: string
          created_at?: string
          currency?: string
          external_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_type?: string | null
          broker_name?: string | null
          cached_balance?: number | null
          cached_balance_updated_at?: string | null
          connection_id?: string
          created_at?: string
          currency?: string
          external_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "broker_accounts_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "broker_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      broker_activities: {
        Row: {
          account_id: string
          created_at: string
          external_id: string | null
          id: string
          occurred_at: string
          price: number | null
          quantity: number | null
          symbol: string | null
          type: string
        }
        Insert: {
          account_id: string
          created_at?: string
          external_id?: string | null
          id?: string
          occurred_at: string
          price?: number | null
          quantity?: number | null
          symbol?: string | null
          type: string
        }
        Update: {
          account_id?: string
          created_at?: string
          external_id?: string | null
          id?: string
          occurred_at?: string
          price?: number | null
          quantity?: number | null
          symbol?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "broker_activities_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "broker_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broker_activities_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "public_broker_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      broker_connections: {
        Row: {
          connected_at: string | null
          created_at: string
          id: string
          last_sync_at: string | null
          provider: string
          snaptrade_user_id: string | null
          snaptrade_user_secret_id: string | null
          status: Database["public"]["Enums"]["broker_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          connected_at?: string | null
          created_at?: string
          id?: string
          last_sync_at?: string | null
          provider?: string
          snaptrade_user_id?: string | null
          snaptrade_user_secret_id?: string | null
          status?: Database["public"]["Enums"]["broker_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          connected_at?: string | null
          created_at?: string
          id?: string
          last_sync_at?: string | null
          provider?: string
          snaptrade_user_id?: string | null
          snaptrade_user_secret_id?: string | null
          status?: Database["public"]["Enums"]["broker_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "broker_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      broker_positions: {
        Row: {
          account_id: string
          avg_price: number | null
          created_at: string
          id: string
          last_synced_at: string
          market_value: number | null
          quantity: number
          symbol: string
          updated_at: string
        }
        Insert: {
          account_id: string
          avg_price?: number | null
          created_at?: string
          id?: string
          last_synced_at?: string
          market_value?: number | null
          quantity?: number
          symbol: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          avg_price?: number | null
          created_at?: string
          id?: string
          last_synced_at?: string
          market_value?: number | null
          quantity?: number
          symbol?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "broker_positions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "broker_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broker_positions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "public_broker_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      broker_visibility: {
        Row: {
          created_at: string
          show_activity: boolean
          show_balances: boolean
          show_broker_name: boolean
          show_positions: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          show_activity?: boolean
          show_balances?: boolean
          show_broker_name?: boolean
          show_positions?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          show_activity?: boolean
          show_balances?: boolean
          show_broker_name?: boolean
          show_positions?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "broker_visibility_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      live_rooms: {
        Row: {
          created_at: string
          creator_id: string
          description: string
          ended_at: string | null
          id: string
          livekit_room_name: string
          recording_video_id: string | null
          scheduled_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["room_status"]
          title: string
          updated_at: string
          viewer_count: number
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string
          ended_at?: string | null
          id?: string
          livekit_room_name: string
          recording_video_id?: string | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["room_status"]
          title: string
          updated_at?: string
          viewer_count?: number
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string
          ended_at?: string | null
          id?: string
          livekit_room_name?: string
          recording_video_id?: string | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["room_status"]
          title?: string
          updated_at?: string
          viewer_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "live_rooms_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_rooms_recording_video_id_fkey"
            columns: ["recording_video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          handle: string
          id: string
          socials: Json
          updated_at: string
          verified_broker: boolean
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          handle: string
          id: string
          socials?: Json
          updated_at?: string
          verified_broker?: boolean
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          handle?: string
          id?: string
          socials?: Json
          updated_at?: string
          verified_broker?: boolean
        }
        Relationships: []
      }
      room_tickers: {
        Row: {
          room_id: string
          ticker_id: string
        }
        Insert: {
          room_id: string
          ticker_id: string
        }
        Update: {
          room_id?: string
          ticker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_tickers_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "live_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_tickers_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "tickers"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ticker_news_summaries: {
        Row: {
          as_of_date: string
          body: string
          created_at: string
          generated_at: string
          headline_count: number
          id: string
          model: string
          prompt_version: number
          ticker_id: string
        }
        Insert: {
          as_of_date: string
          body: string
          created_at?: string
          generated_at?: string
          headline_count?: number
          id?: string
          model: string
          prompt_version?: number
          ticker_id: string
        }
        Update: {
          as_of_date?: string
          body?: string
          created_at?: string
          generated_at?: string
          headline_count?: number
          id?: string
          model?: string
          prompt_version?: number
          ticker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticker_news_summaries_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "tickers"
            referencedColumns: ["id"]
          },
        ]
      }
      ticker_summaries: {
        Row: {
          body: string
          created_at: string
          expires_at: string
          generated_at: string
          id: string
          model: string
          prompt_version: number
          source_count: number
          ticker_id: string
        }
        Insert: {
          body: string
          created_at?: string
          expires_at: string
          generated_at?: string
          id?: string
          model: string
          prompt_version?: number
          source_count?: number
          ticker_id: string
        }
        Update: {
          body?: string
          created_at?: string
          expires_at?: string
          generated_at?: string
          id?: string
          model?: string
          prompt_version?: number
          source_count?: number
          ticker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticker_summaries_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "tickers"
            referencedColumns: ["id"]
          },
        ]
      }
      tickers: {
        Row: {
          country: string | null
          exchange: string | null
          id: string
          name: string
          sector: string | null
          symbol: string
        }
        Insert: {
          country?: string | null
          exchange?: string | null
          id?: string
          name: string
          sector?: string | null
          symbol: string
        }
        Update: {
          country?: string | null
          exchange?: string | null
          id?: string
          name?: string
          sector?: string | null
          symbol?: string
        }
        Relationships: []
      }
      video_tickers: {
        Row: {
          ticker_id: string
          video_id: string
        }
        Insert: {
          ticker_id: string
          video_id: string
        }
        Update: {
          ticker_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_tickers_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "tickers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_tickers_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          created_at: string
          creator_id: string
          description: string
          duration_seconds: number | null
          id: string
          mux_asset_id: string | null
          mux_playback_id: string | null
          mux_upload_id: string | null
          published_at: string | null
          status: Database["public"]["Enums"]["video_status"]
          thumbnail_url: string | null
          title: string
          updated_at: string
          visibility: Database["public"]["Enums"]["video_visibility"]
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string
          duration_seconds?: number | null
          id?: string
          mux_asset_id?: string | null
          mux_playback_id?: string | null
          mux_upload_id?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["video_status"]
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["video_visibility"]
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string
          duration_seconds?: number | null
          id?: string
          mux_asset_id?: string | null
          mux_playback_id?: string | null
          mux_upload_id?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["video_status"]
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["video_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "videos_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_broker_accounts: {
        Row: {
          account_name: string | null
          broker_name: string | null
          cached_balance: number | null
          cached_balance_updated_at: string | null
          currency: string | null
          id: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broker_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      public_broker_activities: {
        Row: {
          id: string | null
          occurred_at: string | null
          price: number | null
          quantity: number | null
          symbol: string | null
          type: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broker_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      public_broker_positions: {
        Row: {
          avg_price: number | null
          id: string | null
          last_synced_at: string | null
          market_value: number | null
          quantity: number | null
          symbol: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broker_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      maintain_verified_broker: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      broker_status: "pending" | "connected" | "disconnected" | "error"
      room_status: "scheduled" | "live" | "ended"
      video_status: "pending" | "processing" | "ready" | "errored"
      video_visibility: "public" | "unlisted"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      broker_status: ["pending", "connected", "disconnected", "error"],
      room_status: ["scheduled", "live", "ended"],
      video_status: ["pending", "processing", "ready", "errored"],
      video_visibility: ["public", "unlisted"],
    },
  },
} as const
