export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      recipes: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          ingredients: Json
          instructions: Json
          image_url: string | null
          prep_time: number
          cook_time: number
          servings: number
          user_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          ingredients?: Json
          instructions?: Json
          image_url?: string | null
          prep_time?: number
          cook_time?: number
          servings?: number
          user_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          ingredients?: Json
          instructions?: Json
          image_url?: string | null
          prep_time?: number
          cook_time?: number
          servings?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      meal_plans: {
        Row: {
          id: string
          created_at: string
          date: string
          meals: Json
          user_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          date: string
          meals?: Json
          user_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          date?: string
          meals?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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

