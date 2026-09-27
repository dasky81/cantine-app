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
      cantine: {
        Row: {
          bottiglie_anno: number | null
          certificazioni: string[] | null
          comune: string | null
          created_at: string | null
          denominazioni: string[] | null
          descrizione: string | null
          descrizione_breve: string | null
          email: string | null
          embedding: string | null
          ettari_vigneto: number | null
          featured: boolean | null
          foto_galleria: string[] | null
          foto_principale: string | null
          id: string
          indirizzo: string | null
          instagram: string | null
          lat: number | null
          lingua_visita: string[] | null
          lng: number | null
          nome: string
          orari_apertura: string | null
          owner_id: string | null
          prezzo_degustazione: string | null
          provincia: string | null
          regione: string
          servizi: string[] | null
          sito_web: string | null
          slug: string
          telefono: string | null
          updated_at: string | null
          verified: boolean | null
          vini_prodotti: string[] | null
        }
        Insert: {
          bottiglie_anno?: number | null
          certificazioni?: string[] | null
          comune?: string | null
          created_at?: string | null
          denominazioni?: string[] | null
          descrizione?: string | null
          descrizione_breve?: string | null
          email?: string | null
          embedding?: string | null
          ettari_vigneto?: number | null
          featured?: boolean | null
          foto_galleria?: string[] | null
          foto_principale?: string | null
          id?: string
          indirizzo?: string | null
          instagram?: string | null
          lat?: number | null
          lingua_visita?: string[] | null
          lng?: number | null
          nome: string
          orari_apertura?: string | null
          owner_id?: string | null
          prezzo_degustazione?: string | null
          provincia?: string | null
          regione: string
          servizi?: string[] | null
          sito_web?: string | null
          slug: string
          telefono?: string | null
          updated_at?: string | null
          verified?: boolean | null
          vini_prodotti?: string[] | null
        }
        Update: {
          bottiglie_anno?: number | null
          certificazioni?: string[] | null
          comune?: string | null
          created_at?: string | null
          denominazioni?: string[] | null
          descrizione?: string | null
          descrizione_breve?: string | null
          email?: string | null
          embedding?: string | null
          ettari_vigneto?: number | null
          featured?: boolean | null
          foto_galleria?: string[] | null
          foto_principale?: string | null
          id?: string
          indirizzo?: string | null
          instagram?: string | null
          lat?: number | null
          lingua_visita?: string[] | null
          lng?: number | null
          nome?: string
          orari_apertura?: string | null
          owner_id?: string | null
          prezzo_degustazione?: string | null
          provincia?: string | null
          regione?: string
          servizi?: string[] | null
          sito_web?: string | null
          slug?: string
          telefono?: string | null
          updated_at?: string | null
          verified?: boolean | null
          vini_prodotti?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "cantine_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post: {
        Row: {
          autore_id: string | null
          contenuto: string | null
          cover_url: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          published: boolean | null
          published_at: string | null
          slug: string
          tag: string[] | null
          titolo: string
        }
        Insert: {
          autore_id?: string | null
          contenuto?: string | null
          cover_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          slug: string
          tag?: string[] | null
          titolo: string
        }
        Update: {
          autore_id?: string | null
          contenuto?: string | null
          cover_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          slug?: string
          tag?: string[] | null
          titolo?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_autore_id_fkey"
            columns: ["autore_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      preferiti: {
        Row: {
          cantina_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          cantina_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          cantina_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "preferiti_cantina_id_fkey"
            columns: ["cantina_id"]
            isOneToOne: false
            referencedRelation: "cantine"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preferiti_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cognome: string | null
          created_at: string | null
          email: string | null
          id: string
          nome: string | null
          role: string
        }
        Insert: {
          avatar_url?: string | null
          cognome?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          nome?: string | null
          role?: string
        }
        Update: {
          avatar_url?: string | null
          cognome?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          role?: string
        }
        Relationships: []
      }
      ricerche_log: {
        Row: {
          created_at: string | null
          id: string
          query: string
          risultati_ids: string[] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          query: string
          risultati_ids?: string[] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          query?: string
          risultati_ids?: string[] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ricerche_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rivendicazioni: {
        Row: {
          cantina_id: string
          created_at: string | null
          email_referente: string | null
          id: string
          messaggio: string | null
          nome_referente: string | null
          status: string
          telefono: string | null
          user_id: string
        }
        Insert: {
          cantina_id: string
          created_at?: string | null
          email_referente?: string | null
          id?: string
          messaggio?: string | null
          nome_referente?: string | null
          status?: string
          telefono?: string | null
          user_id: string
        }
        Update: {
          cantina_id?: string
          created_at?: string | null
          email_referente?: string | null
          id?: string
          messaggio?: string | null
          nome_referente?: string | null
          status?: string
          telefono?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rivendicazioni_cantina_id_fkey"
            columns: ["cantina_id"]
            isOneToOne: false
            referencedRelation: "cantine"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rivendicazioni_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      visite_log: {
        Row: {
          created_at: string | null
          id: string
          path: string
          referrer: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          path: string
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          path?: string
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visite_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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

