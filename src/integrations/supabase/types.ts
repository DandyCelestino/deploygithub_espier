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
      cliente_feedbacks: {
        Row: {
          codigo_rastreio: string
          created_at: string
          id: string
          mensagem: string | null
          nota: number | null
          ordem_servico_id: string
          tipo: string
        }
        Insert: {
          codigo_rastreio: string
          created_at?: string
          id?: string
          mensagem?: string | null
          nota?: number | null
          ordem_servico_id: string
          tipo?: string
        }
        Update: {
          codigo_rastreio?: string
          created_at?: string
          id?: string
          mensagem?: string | null
          nota?: number | null
          ordem_servico_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "cliente_feedbacks_ordem_servico_id_fkey"
            columns: ["ordem_servico_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes: {
        Row: {
          chave: string
          descricao: string | null
          id: string
          updated_at: string
          valor: string | null
        }
        Insert: {
          chave: string
          descricao?: string | null
          id?: string
          updated_at?: string
          valor?: string | null
        }
        Update: {
          chave?: string
          descricao?: string | null
          id?: string
          updated_at?: string
          valor?: string | null
        }
        Relationships: []
      }
      estoque_itens: {
        Row: {
          codigo: string | null
          created_at: string
          descricao: string
          id: string
          localizacao: string | null
          quantidade: number
          quantidade_minima: number
          unidade: string
          updated_at: string
        }
        Insert: {
          codigo?: string | null
          created_at?: string
          descricao: string
          id?: string
          localizacao?: string | null
          quantidade?: number
          quantidade_minima?: number
          unidade?: string
          updated_at?: string
        }
        Update: {
          codigo?: string | null
          created_at?: string
          descricao?: string
          id?: string
          localizacao?: string | null
          quantidade?: number
          quantidade_minima?: number
          unidade?: string
          updated_at?: string
        }
        Relationships: []
      }
      estoque_movimentacoes: {
        Row: {
          created_at: string
          id: string
          item_id: string
          observacao: string | null
          quantidade: number
          tecnico_id: string | null
          tecnico_nome: string | null
          tipo: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          observacao?: string | null
          quantidade: number
          tecnico_id?: string | null
          tecnico_nome?: string | null
          tipo: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          observacao?: string | null
          quantidade?: number
          tecnico_id?: string | null
          tecnico_nome?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "estoque_movimentacoes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "estoque_itens"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_contas: {
        Row: {
          categoria: string | null
          created_at: string
          criado_por: string
          data_pagamento: string | null
          data_vencimento: string
          descricao: string
          id: string
          referencia_id: string | null
          referencia_tipo: string | null
          status: string
          tipo: string
          updated_at: string
          valor: number
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          criado_por: string
          data_pagamento?: string | null
          data_vencimento: string
          descricao: string
          id?: string
          referencia_id?: string | null
          referencia_tipo?: string | null
          status?: string
          tipo: string
          updated_at?: string
          valor: number
        }
        Update: {
          categoria?: string | null
          created_at?: string
          criado_por?: string
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string
          id?: string
          referencia_id?: string | null
          referencia_tipo?: string | null
          status?: string
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: []
      }
      orcamentos: {
        Row: {
          cidade: string
          cliente_email: string | null
          cliente_nome: string
          cliente_telefone: string | null
          created_at: string
          criado_por: string
          descricao: string | null
          endereco: string
          estado: string
          id: string
          servico_solicitado: string
          status: string
          updated_at: string
          valor_instalacao: number
          valor_total: number
        }
        Insert: {
          cidade: string
          cliente_email?: string | null
          cliente_nome: string
          cliente_telefone?: string | null
          created_at?: string
          criado_por: string
          descricao?: string | null
          endereco: string
          estado?: string
          id?: string
          servico_solicitado: string
          status?: string
          updated_at?: string
          valor_instalacao?: number
          valor_total?: number
        }
        Update: {
          cidade?: string
          cliente_email?: string | null
          cliente_nome?: string
          cliente_telefone?: string | null
          created_at?: string
          criado_por?: string
          descricao?: string | null
          endereco?: string
          estado?: string
          id?: string
          servico_solicitado?: string
          status?: string
          updated_at?: string
          valor_instalacao?: number
          valor_total?: number
        }
        Relationships: []
      }
      ordens_servico: {
        Row: {
          checklist_assinatura_cliente: boolean
          checklist_fotos: boolean
          checklist_instalacao: boolean
          checklist_limpeza: boolean
          checklist_materiais: boolean
          checklist_teste: boolean
          cidade: string
          cliente_nome: string
          codigo_rastreio: string
          created_at: string
          data_conclusao: string | null
          data_inicio: string | null
          endereco: string
          id: string
          observacoes: string | null
          orcamento_id: string | null
          prazo_termino: string | null
          servico_solicitado: string
          status: string
          supervisao_aprovada: boolean
          supervisao_data: string | null
          supervisao_por: string | null
          tecnico_id: string | null
          tecnico_nome: string | null
          updated_at: string
          valor_instalacao: number
          valor_liberado: boolean
        }
        Insert: {
          checklist_assinatura_cliente?: boolean
          checklist_fotos?: boolean
          checklist_instalacao?: boolean
          checklist_limpeza?: boolean
          checklist_materiais?: boolean
          checklist_teste?: boolean
          cidade: string
          cliente_nome: string
          codigo_rastreio?: string
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string | null
          endereco: string
          id?: string
          observacoes?: string | null
          orcamento_id?: string | null
          prazo_termino?: string | null
          servico_solicitado: string
          status?: string
          supervisao_aprovada?: boolean
          supervisao_data?: string | null
          supervisao_por?: string | null
          tecnico_id?: string | null
          tecnico_nome?: string | null
          updated_at?: string
          valor_instalacao?: number
          valor_liberado?: boolean
        }
        Update: {
          checklist_assinatura_cliente?: boolean
          checklist_fotos?: boolean
          checklist_instalacao?: boolean
          checklist_limpeza?: boolean
          checklist_materiais?: boolean
          checklist_teste?: boolean
          cidade?: string
          cliente_nome?: string
          codigo_rastreio?: string
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string | null
          endereco?: string
          id?: string
          observacoes?: string | null
          orcamento_id?: string | null
          prazo_termino?: string | null
          servico_solicitado?: string
          status?: string
          supervisao_aprovada?: boolean
          supervisao_data?: string | null
          supervisao_por?: string | null
          tecnico_id?: string | null
          tecnico_nome?: string | null
          updated_at?: string
          valor_instalacao?: number
          valor_liberado?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "ordens_servico_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          email: string
          full_name: string
          id: string
          matricula: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          matricula?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          matricula?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      relatorios_diarios: {
        Row: {
          created_at: string
          data_relatorio: string
          descricao: string
          fotos: string[] | null
          id: string
          ordem_servico_id: string
          tecnico_id: string
          tecnico_nome: string | null
        }
        Insert: {
          created_at?: string
          data_relatorio?: string
          descricao: string
          fotos?: string[] | null
          id?: string
          ordem_servico_id: string
          tecnico_id: string
          tecnico_nome?: string | null
        }
        Update: {
          created_at?: string
          data_relatorio?: string
          descricao?: string
          fotos?: string[] | null
          id?: string
          ordem_servico_id?: string
          tecnico_id?: string
          tecnico_nome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_diarios_ordem_servico_id_fkey"
            columns: ["ordem_servico_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
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
      get_os_by_tracking_code: { Args: { _codigo: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      validate_feedback_os: {
        Args: { _codigo_rastreio: string; _ordem_servico_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "gerente" | "tecnico" | "financeiro"
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
      app_role: ["admin", "gerente", "tecnico", "financeiro"],
    },
  },
} as const
