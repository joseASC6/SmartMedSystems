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
      appointments: {
        Row: {
          appointment_id: number
          patient_id: string
          staff_id: string
          status: string | null
          time_slot_id: number
        }
        Insert: {
          appointment_id: number
          patient_id: string
          staff_id: string
          status?: string | null
          time_slot_id: number
        }
        Update: {
          appointment_id?: number
          patient_id?: string
          staff_id?: string
          status?: string | null
          time_slot_id?: number
        }
      }
      // Add other table definitions as needed
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
  }
}