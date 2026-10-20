// PLACEHOLDER: hand-written to match supabase/migrations/20261020151327_initial_schema.sql.
// Regenerate after `supabase db push`:
//   pnpm supabase gen types typescript --linked > src/types/database.ts

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
      custom_prompts: {
        Row: {
          created_at: string
          id: string
          instructions: string
          mode: Database["public"]["Enums"]["writing_mode"]
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          instructions: string
          mode: Database["public"]["Enums"]["writing_mode"]
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          instructions?: string
          mode?: Database["public"]["Enums"]["writing_mode"]
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      generations: {
        Row: {
          created_at: string
          id: string
          input: string
          input_tokens: number
          mode: Database["public"]["Enums"]["writing_mode"]
          model: string
          options: Json
          output: string
          output_tokens: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          input: string
          input_tokens?: number
          mode: Database["public"]["Enums"]["writing_mode"]
          model: string
          options?: Json
          output: string
          output_tokens?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          input?: string
          input_tokens?: number
          mode?: Database["public"]["Enums"]["writing_mode"]
          model?: string
          options?: Json
          output?: string
          output_tokens?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          default_mode: Database["public"]["Enums"]["writing_mode"] | null
          default_target_language: string | null
          default_tone: Database["public"]["Enums"]["tone"] | null
          id: string
          plan: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_mode?: Database["public"]["Enums"]["writing_mode"] | null
          default_target_language?: string | null
          default_tone?: Database["public"]["Enums"]["tone"] | null
          id: string
          plan?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_mode?: Database["public"]["Enums"]["writing_mode"] | null
          default_target_language?: string | null
          default_tone?: Database["public"]["Enums"]["tone"] | null
          id?: string
          plan?: string
          updated_at?: string
        }
        Relationships: []
      }
      usage: {
        Row: {
          period: string
          request_count: number
          token_count: number
          user_id: string
        }
        Insert: {
          period: string
          request_count?: number
          token_count?: number
          user_id: string
        }
        Update: {
          period?: string
          request_count?: number
          token_count?: number
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
      tone: "formal" | "casual" | "friendly" | "confident" | "empathetic"
      writing_mode:
        | "improve"
        | "email"
        | "linkedin"
        | "technical"
        | "translate"
        | "tone"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
