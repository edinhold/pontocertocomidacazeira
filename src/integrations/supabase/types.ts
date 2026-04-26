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
      adicionais: {
        Row: {
          created_at: string
          id: string
          nome: string
          preco: number
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          preco: number
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          preco?: number
        }
        Relationships: []
      }
      bebidas: {
        Row: {
          categoria: string
          created_at: string
          id: string
          imagem: string | null
          nome: string
          preco: number
          updated_at: string
        }
        Insert: {
          categoria: string
          created_at?: string
          id?: string
          imagem?: string | null
          nome: string
          preco: number
          updated_at?: string
        }
        Update: {
          categoria?: string
          created_at?: string
          id?: string
          imagem?: string | null
          nome?: string
          preco?: number
          updated_at?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          ativo: boolean
          criado_em: string
          email: string
          endereco: string | null
          id: string
          nome: string
          senha: string
          whatsapp: string | null
        }
        Insert: {
          ativo?: boolean
          criado_em?: string
          email: string
          endereco?: string | null
          id?: string
          nome: string
          senha: string
          whatsapp?: string | null
        }
        Update: {
          ativo?: boolean
          criado_em?: string
          email?: string
          endereco?: string | null
          id?: string
          nome?: string
          senha?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      configuracoes: {
        Row: {
          chave: string
          id: string
          updated_at: string
          valor: string
        }
        Insert: {
          chave: string
          id?: string
          updated_at?: string
          valor?: string
        }
        Update: {
          chave?: string
          id?: string
          updated_at?: string
          valor?: string
        }
        Relationships: []
      }
      funcionarios: {
        Row: {
          cargo: string
          created_at: string
          email: string
          id: string
          nome: string
          senha: string
        }
        Insert: {
          cargo: string
          created_at?: string
          email: string
          id?: string
          nome: string
          senha: string
        }
        Update: {
          cargo?: string
          created_at?: string
          email?: string
          id?: string
          nome?: string
          senha?: string
        }
        Relationships: []
      }
      logo_alteracoes: {
        Row: {
          alterado_em: string
          id: string
          url_anterior: string | null
          url_nova: string
        }
        Insert: {
          alterado_em?: string
          id?: string
          url_anterior?: string | null
          url_nova: string
        }
        Update: {
          alterado_em?: string
          id?: string
          url_anterior?: string | null
          url_nova?: string
        }
        Relationships: []
      }
      mensagens_programadas: {
        Row: {
          ativa: boolean
          conteudo: string
          created_at: string
          dias_semana: number[] | null
          frequencia: string
          horario: string
          id: string
          titulo: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          conteudo: string
          created_at?: string
          dias_semana?: number[] | null
          frequencia: string
          horario: string
          id?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          conteudo?: string
          created_at?: string
          dias_semana?: number[] | null
          frequencia?: string
          horario?: string
          id?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      mesas: {
        Row: {
          capacidade: number
          created_at: string
          id: string
          numero: number
        }
        Insert: {
          capacidade?: number
          created_at?: string
          id?: string
          numero: number
        }
        Update: {
          capacidade?: number
          created_at?: string
          id?: string
          numero?: number
        }
        Relationships: []
      }
      pedidos: {
        Row: {
          criado_em: string
          hora: string
          id: string
          itens: Json
          mesa: number
          observacao_geral: string | null
          status: string
          total: number
        }
        Insert: {
          criado_em?: string
          hora?: string
          id: string
          itens?: Json
          mesa?: number
          observacao_geral?: string | null
          status?: string
          total?: number
        }
        Update: {
          criado_em?: string
          hora?: string
          id?: string
          itens?: Json
          mesa?: number
          observacao_geral?: string | null
          status?: string
          total?: number
        }
        Relationships: []
      }
      pratos: {
        Row: {
          categoria: string
          created_at: string
          descricao: string | null
          disponivel: boolean
          id: string
          imagem: string | null
          nome: string
          preco: number
          updated_at: string
        }
        Insert: {
          categoria: string
          created_at?: string
          descricao?: string | null
          disponivel?: boolean
          id?: string
          imagem?: string | null
          nome: string
          preco: number
          updated_at?: string
        }
        Update: {
          categoria?: string
          created_at?: string
          descricao?: string | null
          disponivel?: boolean
          id?: string
          imagem?: string | null
          nome?: string
          preco?: number
          updated_at?: string
        }
        Relationships: []
      }
      vendas: {
        Row: {
          fechado_em: string
          id: string
          itens: Json
          mesa: number
          observacao_geral: string | null
          total: number
        }
        Insert: {
          fechado_em?: string
          id: string
          itens?: Json
          mesa?: number
          observacao_geral?: string | null
          total?: number
        }
        Update: {
          fechado_em?: string
          id?: string
          itens?: Json
          mesa?: number
          observacao_geral?: string | null
          total?: number
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
    Enums: {},
  },
} as const
