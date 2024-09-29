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
      appointments: {
        Row: {
          appointment_length_minutes: number | null
          appointment_start_time: string
          created_at: string
          id: number
          is_pending: boolean
          patient: number | null
          therapist: number | null
        }
        Insert: {
          appointment_length_minutes?: number | null
          appointment_start_time: string
          created_at?: string
          id?: number
          is_pending?: boolean
          patient?: number | null
          therapist?: number | null
        }
        Update: {
          appointment_length_minutes?: number | null
          appointment_start_time?: string
          created_at?: string
          id?: number
          is_pending?: boolean
          patient?: number | null
          therapist?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_fkey"
            columns: ["patient"]
            isOneToOne: false
            referencedRelation: "patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_therapist_fkey"
            columns: ["therapist"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          id: string
          name: string | null
          routing_code: string
          welcome_message: string
        }
        Insert: {
          id: string
          name?: string | null
          routing_code: string
          welcome_message?: string
        }
        Update: {
          id?: string
          name?: string | null
          routing_code?: string
          welcome_message?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinics_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      patient: {
        Row: {
          began_session: boolean | null
          description: string | null
          details: string | null
          id: number
          is_new: boolean | null
          name: string | null
          phone_number: string
          therapist_id: number
        }
        Insert: {
          began_session?: boolean | null
          description?: string | null
          details?: string | null
          id?: never
          is_new?: boolean | null
          name?: string | null
          phone_number: string
          therapist_id: number
        }
        Update: {
          began_session?: boolean | null
          description?: string | null
          details?: string | null
          id?: never
          is_new?: boolean | null
          name?: string | null
          phone_number?: string
          therapist_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "patient_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapists: {
        Row: {
          age: number | null
          ageRange: string | null
          availabilities: Json[]
          bio: string | null
          clinic_id: string | null
          days_off: Json[]
          ethnicity: string
          gender: string
          id: number
          name: string
          specialization: string | null
        }
        Insert: {
          age?: number | null
          ageRange?: string | null
          availabilities?: Json[]
          bio?: string | null
          clinic_id?: string | null
          days_off?: Json[]
          ethnicity: string
          gender: string
          id?: never
          name: string
          specialization?: string | null
        }
        Update: {
          age?: number | null
          ageRange?: string | null
          availabilities?: Json[]
          bio?: string | null
          clinic_id?: string | null
          days_off?: Json[]
          ethnicity?: string
          gender?: string
          id?: never
          name?: string
          specialization?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "therapists_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_appointments: {
        Args: {
          therapist_id: number
        }
        Returns: {
          id: number
          created_at: string
          patient_id: number
          name: string
          description: string
          is_new: boolean
          is_pending: boolean
          appointment_start_date: string
          appointment_length_minutes: number
          phone_number: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
