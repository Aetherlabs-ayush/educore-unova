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
  public: {
    Tables: {
      attendance: {
        Row: {
          class: string | null
          created_at: string
          date: string
          division: string | null
          id: string
          status: string
          student_name: string | null
          student_phone: string
        }
        Insert: {
          class?: string | null
          created_at?: string
          date?: string
          division?: string | null
          id?: string
          status?: string
          student_name?: string | null
          student_phone: string
        }
        Update: {
          class?: string | null
          created_at?: string
          date?: string
          division?: string | null
          id?: string
          status?: string
          student_name?: string | null
          student_phone?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          file_url: string | null
          id: string
          message: string | null
          message_type: string | null
          sender_image: string | null
          sender_name: string
          sender_phone: string | null
          timestamp: string
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          id?: string
          message?: string | null
          message_type?: string | null
          sender_image?: string | null
          sender_name: string
          sender_phone?: string | null
          timestamp?: string
        }
        Update: {
          created_at?: string
          file_url?: string | null
          id?: string
          message?: string | null
          message_type?: string | null
          sender_image?: string | null
          sender_name?: string
          sender_phone?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      chat_participants: {
        Row: {
          chat_id: string | null
          created_at: string
          id: string
          user_id: string | null
          user_name: string | null
          user_phone: string | null
        }
        Insert: {
          chat_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
          user_name?: string | null
          user_phone?: string | null
        }
        Update: {
          chat_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
          user_name?: string | null
          user_phone?: string | null
        }
        Relationships: []
      }
      club_applications: {
        Row: {
          club_id: string | null
          club_name: string | null
          created_at: string
          id: string
          status: string
          student_class: string | null
          student_division: string | null
          student_name: string | null
          student_phone: string
        }
        Insert: {
          club_id?: string | null
          club_name?: string | null
          created_at?: string
          id?: string
          status?: string
          student_class?: string | null
          student_division?: string | null
          student_name?: string | null
          student_phone: string
        }
        Update: {
          club_id?: string | null
          club_name?: string | null
          created_at?: string
          id?: string
          status?: string
          student_class?: string | null
          student_division?: string | null
          student_name?: string | null
          student_phone?: string
        }
        Relationships: []
      }
      club_chat_messages: {
        Row: {
          club_id: string | null
          created_at: string
          id: string
          sender_name: string | null
          sender_phone: string
          text: string
        }
        Insert: {
          club_id?: string | null
          created_at?: string
          id?: string
          sender_name?: string | null
          sender_phone: string
          text: string
        }
        Update: {
          club_id?: string | null
          created_at?: string
          id?: string
          sender_name?: string | null
          sender_phone?: string
          text?: string
        }
        Relationships: []
      }
      clubs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image: string | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name?: string
        }
        Relationships: []
      }
      homework_status: {
        Row: {
          assignment_id: string
          created_at: string
          due_date: string | null
          id: string
          status: string
          student_phone: string
          title: string | null
          updated_at: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          status?: string
          student_phone: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          status?: string
          student_phone?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      leave_applications: {
        Row: {
          class: string | null
          created_at: string
          division: string | null
          end_date: string | null
          from_date: string
          id: string
          number_of_days: number | null
          reason: string
          return_date: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          start_date: string | null
          status: string
          student_class: string | null
          student_division: string | null
          student_dob: string | null
          student_name: string | null
          student_phone: string
          to_date: string
          updated_at: string
        }
        Insert: {
          class?: string | null
          created_at?: string
          division?: string | null
          end_date?: string | null
          from_date: string
          id?: string
          number_of_days?: number | null
          reason: string
          return_date?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string | null
          status?: string
          student_class?: string | null
          student_division?: string | null
          student_dob?: string | null
          student_name?: string | null
          student_phone: string
          to_date: string
          updated_at?: string
        }
        Update: {
          class?: string | null
          created_at?: string
          division?: string | null
          end_date?: string | null
          from_date?: string
          id?: string
          number_of_days?: number | null
          reason?: string
          return_date?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string | null
          status?: string
          student_class?: string | null
          student_division?: string | null
          student_dob?: string | null
          student_name?: string | null
          student_phone?: string
          to_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          audio_url: string | null
          created_at: string
          id: string
          read: boolean
          receiver_phone: string | null
          room: string | null
          sender_name: string | null
          sender_phone: string
          text: string
          timestamp: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          id?: string
          read?: boolean
          receiver_phone?: string | null
          room?: string | null
          sender_name?: string | null
          sender_phone: string
          text: string
          timestamp?: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          id?: string
          read?: boolean
          receiver_phone?: string | null
          room?: string | null
          sender_name?: string | null
          sender_phone?: string
          text?: string
          timestamp?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          read: boolean
          role: string | null
          target_phone: string | null
          target_role: string | null
          target_user_phone: string | null
          timestamp: string
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          read?: boolean
          role?: string | null
          target_phone?: string | null
          target_role?: string | null
          target_user_phone?: string | null
          timestamp?: string
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          read?: boolean
          role?: string | null
          target_phone?: string | null
          target_role?: string | null
          target_user_phone?: string | null
          timestamp?: string
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          class: string | null
          created_at: string
          division: string | null
          dob: string | null
          id: string
          image: string | null
          name: string
          phone: string
          role: string
          updated_at: string
        }
        Insert: {
          class?: string | null
          created_at?: string
          division?: string | null
          dob?: string | null
          id?: string
          image?: string | null
          name: string
          phone: string
          role?: string
          updated_at?: string
        }
        Update: {
          class?: string | null
          created_at?: string
          division?: string | null
          dob?: string | null
          id?: string
          image?: string | null
          name?: string
          phone?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      teacher_messages: {
        Row: {
          created_at: string
          id: string
          read: boolean
          receiver_phone: string
          sender_name: string | null
          sender_phone: string
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          read?: boolean
          receiver_phone: string
          sender_name?: string | null
          sender_phone: string
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          read?: boolean
          receiver_phone?: string
          sender_name?: string | null
          sender_phone?: string
          text?: string
        }
        Relationships: []
      }
      teachers: {
        Row: {
          bio: string | null
          created_at: string
          email: string | null
          id: string
          image: string | null
          name: string
          phone: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          image?: string | null
          name: string
          phone?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          image?: string | null
          name?: string
          phone?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      test_scores: {
        Row: {
          class: string | null
          created_at: string
          date: string
          division: string | null
          exam_name: string | null
          id: string
          max_score: number
          score: number
          student_name: string | null
          student_phone: string
          subject: string
        }
        Insert: {
          class?: string | null
          created_at?: string
          date?: string
          division?: string | null
          exam_name?: string | null
          id?: string
          max_score?: number
          score?: number
          student_name?: string | null
          student_phone: string
          subject: string
        }
        Update: {
          class?: string | null
          created_at?: string
          date?: string
          division?: string | null
          exam_name?: string | null
          id?: string
          max_score?: number
          score?: number
          student_name?: string | null
          student_phone?: string
          subject?: string
        }
        Relationships: []
      }
      timetable: {
        Row: {
          class: string | null
          created_at: string
          day: string
          division: string | null
          end_time: string | null
          id: string
          period: number
          start_time: string | null
          subject: string
          teacher: string | null
        }
        Insert: {
          class?: string | null
          created_at?: string
          day: string
          division?: string | null
          end_time?: string | null
          id?: string
          period?: number
          start_time?: string | null
          subject: string
          teacher?: string | null
        }
        Update: {
          class?: string | null
          created_at?: string
          day?: string
          division?: string | null
          end_time?: string | null
          id?: string
          period?: number
          start_time?: string | null
          subject?: string
          teacher?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          id: string
          is_online: boolean
          last_seen: string
          name: string | null
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_online?: boolean
          last_seen?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_online?: boolean
          last_seen?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      current_user_phone: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "teacher" | "staff" | "student"
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
      app_role: ["admin", "teacher", "staff", "student"],
    },
  },
} as const
