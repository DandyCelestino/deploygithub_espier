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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      agenda_eventos: {
        Row: {
          cliente_id: string | null
          created_at: string
          criado_por: string
          criado_por_nome: string | null
          data_fim: string | null
          data_inicio: string
          descricao: string | null
          id: string
          local: string | null
          ordem_servico_id: string | null
          participantes: string[] | null
          status: string
          target_roles: Database["public"]["Enums"]["app_role"][]
          target_user_ids: string[]
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          criado_por: string
          criado_por_nome?: string | null
          data_fim?: string | null
          data_inicio: string
          descricao?: string | null
          id?: string
          local?: string | null
          ordem_servico_id?: string | null
          participantes?: string[] | null
          status?: string
          target_roles?: Database["public"]["Enums"]["app_role"][]
          target_user_ids?: string[]
          tipo?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          criado_por?: string
          criado_por_nome?: string | null
          data_fim?: string | null
          data_inicio?: string
          descricao?: string | null
          id?: string
          local?: string | null
          ordem_servico_id?: string | null
          participantes?: string[] | null
          status?: string
          target_roles?: Database["public"]["Enums"]["app_role"][]
          target_user_ids?: string[]
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      candidaturas: {
        Row: {
          avaliado_em: string | null
          avaliado_por: string | null
          cargo_desejado: string
          cpf: string
          created_at: string
          curriculo_url: string | null
          disponibilidade: string
          email: string
          endereco: string
          experiencia: string
          id: string
          mensagem: string | null
          nome_completo: string
          observacoes_internas: string | null
          status: string
          telefone: string
          updated_at: string
          user_id_criado: string | null
        }
        Insert: {
          avaliado_em?: string | null
          avaliado_por?: string | null
          cargo_desejado: string
          cpf: string
          created_at?: string
          curriculo_url?: string | null
          disponibilidade: string
          email: string
          endereco: string
          experiencia: string
          id?: string
          mensagem?: string | null
          nome_completo: string
          observacoes_internas?: string | null
          status?: string
          telefone: string
          updated_at?: string
          user_id_criado?: string | null
        }
        Update: {
          avaliado_em?: string | null
          avaliado_por?: string | null
          cargo_desejado?: string
          cpf?: string
          created_at?: string
          curriculo_url?: string | null
          disponibilidade?: string
          email?: string
          endereco?: string
          experiencia?: string
          id?: string
          mensagem?: string | null
          nome_completo?: string
          observacoes_internas?: string | null
          status?: string
          telefone?: string
          updated_at?: string
          user_id_criado?: string | null
        }
        Relationships: []
      }
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
      clientes: {
        Row: {
          address: string | null
          cep: string | null
          city: string | null
          created_at: string
          created_by: string | null
          document: string | null
          email: string | null
          id: string
          name: string
          observacoes: string | null
          phone: string | null
          state: string | null
          tipo_pessoa: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          cep?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          document?: string | null
          email?: string | null
          id?: string
          name: string
          observacoes?: string | null
          phone?: string | null
          state?: string | null
          tipo_pessoa?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          cep?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          observacoes?: string | null
          phone?: string | null
          state?: string | null
          tipo_pessoa?: string | null
          updated_at?: string
        }
        Relationships: []
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
      contratos: {
        Row: {
          client_id: string
          commission_value: number
          created_at: string
          id: string
          status: string
          total_value: number
          updated_at: string
          vendedor_id: string
        }
        Insert: {
          client_id: string
          commission_value?: number
          created_at?: string
          id?: string
          status?: string
          total_value?: number
          updated_at?: string
          vendedor_id: string
        }
        Update: {
          client_id?: string
          commission_value?: number
          created_at?: string
          id?: string
          status?: string
          total_value?: number
          updated_at?: string
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contratos_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque_itens: {
        Row: {
          categoria_uso: string
          codigo: string | null
          created_at: string
          descricao: string
          descricao_produto: string | null
          id: string
          localizacao: string | null
          produtos_associados: string[]
          quantidade: number
          quantidade_minima: number
          unidade: string
          updated_at: string
          usabilidade: string | null
          valor_compra: number
          valor_venda: number
        }
        Insert: {
          categoria_uso?: string
          codigo?: string | null
          created_at?: string
          descricao: string
          descricao_produto?: string | null
          id?: string
          localizacao?: string | null
          produtos_associados?: string[]
          quantidade?: number
          quantidade_minima?: number
          unidade?: string
          updated_at?: string
          usabilidade?: string | null
          valor_compra?: number
          valor_venda?: number
        }
        Update: {
          categoria_uso?: string
          codigo?: string | null
          created_at?: string
          descricao?: string
          descricao_produto?: string | null
          id?: string
          localizacao?: string | null
          produtos_associados?: string[]
          quantidade?: number
          quantidade_minima?: number
          unidade?: string
          updated_at?: string
          usabilidade?: string | null
          valor_compra?: number
          valor_venda?: number
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
      lead_atividades: {
        Row: {
          anexo_url: string | null
          autor_id: string | null
          autor_nome: string | null
          created_at: string
          data_evento: string
          descricao: string
          id: string
          lead_id: string
          tipo: string
        }
        Insert: {
          anexo_url?: string | null
          autor_id?: string | null
          autor_nome?: string | null
          created_at?: string
          data_evento?: string
          descricao: string
          id?: string
          lead_id: string
          tipo?: string
        }
        Update: {
          anexo_url?: string | null
          autor_id?: string | null
          autor_nome?: string | null
          created_at?: string
          data_evento?: string
          descricao?: string
          id?: string
          lead_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_atividades_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          cidade: string | null
          cliente_id: string | null
          contrato_id: string | null
          created_at: string
          email: string | null
          empresa: string | null
          estado: string | null
          etapa: string
          etapa_changed_at: string
          foto_url: string | null
          id: string
          motivo_perda: string | null
          nome: string
          observacoes_internas: string | null
          orcamento_id: string | null
          ordem_servico_id: string | null
          origem: string | null
          prioridade: string
          proxima_acao: string | null
          proxima_acao_data: string | null
          servico_interesse: string | null
          tags: string[]
          telefone: string | null
          ultimo_contato: string | null
          updated_at: string
          valor_estimado: number
          vendedor_id: string
          vendedor_nome: string | null
          whatsapp: string | null
        }
        Insert: {
          cidade?: string | null
          cliente_id?: string | null
          contrato_id?: string | null
          created_at?: string
          email?: string | null
          empresa?: string | null
          estado?: string | null
          etapa?: string
          etapa_changed_at?: string
          foto_url?: string | null
          id?: string
          motivo_perda?: string | null
          nome: string
          observacoes_internas?: string | null
          orcamento_id?: string | null
          ordem_servico_id?: string | null
          origem?: string | null
          prioridade?: string
          proxima_acao?: string | null
          proxima_acao_data?: string | null
          servico_interesse?: string | null
          tags?: string[]
          telefone?: string | null
          ultimo_contato?: string | null
          updated_at?: string
          valor_estimado?: number
          vendedor_id: string
          vendedor_nome?: string | null
          whatsapp?: string | null
        }
        Update: {
          cidade?: string | null
          cliente_id?: string | null
          contrato_id?: string | null
          created_at?: string
          email?: string | null
          empresa?: string | null
          estado?: string | null
          etapa?: string
          etapa_changed_at?: string
          foto_url?: string | null
          id?: string
          motivo_perda?: string | null
          nome?: string
          observacoes_internas?: string | null
          orcamento_id?: string | null
          ordem_servico_id?: string | null
          origem?: string | null
          prioridade?: string
          proxima_acao?: string | null
          proxima_acao_data?: string | null
          servico_interesse?: string | null
          tags?: string[]
          telefone?: string | null
          ultimo_contato?: string | null
          updated_at?: string
          valor_estimado?: number
          vendedor_id?: string
          vendedor_nome?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_ordem_servico_id_fkey"
            columns: ["ordem_servico_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamento_itens: {
        Row: {
          created_at: string
          descricao: string
          estoque_item_id: string | null
          id: string
          orcamento_id: string
          quantidade: number
          unidade: string
          valor_total: number
        }
        Insert: {
          created_at?: string
          descricao: string
          estoque_item_id?: string | null
          id?: string
          orcamento_id: string
          quantidade?: number
          unidade?: string
          valor_total?: number
        }
        Update: {
          created_at?: string
          descricao?: string
          estoque_item_id?: string | null
          id?: string
          orcamento_id?: string
          quantidade?: number
          unidade?: string
          valor_total?: number
        }
        Relationships: []
      }
      orcamentos: {
        Row: {
          cidade: string
          cliente_email: string | null
          cliente_id: string | null
          cliente_nome: string
          cliente_telefone: string | null
          commission_value: number
          contrato_id: string | null
          created_at: string
          criado_por: string | null
          descricao: string | null
          endereco: string
          estado: string
          id: string
          origem: string
          servico_solicitado: string
          setor_responsavel: string | null
          status: string
          tipo_servico: string
          updated_at: string
          validade_dias: number
          valor_instalacao: number
          valor_mensal: number
          valor_total: number
          vendedor_id: string | null
        }
        Insert: {
          cidade: string
          cliente_email?: string | null
          cliente_id?: string | null
          cliente_nome: string
          cliente_telefone?: string | null
          commission_value?: number
          contrato_id?: string | null
          created_at?: string
          criado_por?: string | null
          descricao?: string | null
          endereco: string
          estado?: string
          id?: string
          origem?: string
          servico_solicitado: string
          setor_responsavel?: string | null
          status?: string
          tipo_servico?: string
          updated_at?: string
          validade_dias?: number
          valor_instalacao?: number
          valor_mensal?: number
          valor_total?: number
          vendedor_id?: string | null
        }
        Update: {
          cidade?: string
          cliente_email?: string | null
          cliente_id?: string | null
          cliente_nome?: string
          cliente_telefone?: string | null
          commission_value?: number
          contrato_id?: string | null
          created_at?: string
          criado_por?: string | null
          descricao?: string | null
          endereco?: string
          estado?: string
          id?: string
          origem?: string
          servico_solicitado?: string
          setor_responsavel?: string | null
          status?: string
          tipo_servico?: string
          updated_at?: string
          validade_dias?: number
          valor_instalacao?: number
          valor_mensal?: number
          valor_total?: number
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
        ]
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
          vistoria_checklist_documentacao: boolean
          vistoria_checklist_qualidade: boolean
          vistoria_checklist_seguranca: boolean
          vistoria_motivo_reprovacao: string | null
          vistoria_observacoes: string | null
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
          vistoria_checklist_documentacao?: boolean
          vistoria_checklist_qualidade?: boolean
          vistoria_checklist_seguranca?: boolean
          vistoria_motivo_reprovacao?: string | null
          vistoria_observacoes?: string | null
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
          vistoria_checklist_documentacao?: boolean
          vistoria_checklist_qualidade?: boolean
          vistoria_checklist_seguranca?: boolean
          vistoria_motivo_reprovacao?: string | null
          vistoria_observacoes?: string | null
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
      user_permissions: {
        Row: {
          can_create: boolean
          can_delete: boolean
          can_edit: boolean
          can_view: boolean
          created_at: string
          id: string
          module: string
          updated_at: string
          user_id: string
        }
        Insert: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module: string
          updated_at?: string
          user_id: string
        }
        Update: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      vendedor_comissoes: {
        Row: {
          created_at: string
          data_prevista: string | null
          id: string
          observacao: string | null
          orcamento_id: string | null
          ordem_servico_id: string | null
          parcela_num: number
          parcela_total: number
          status: string
          tipo: string
          updated_at: string
          valor: number
          vendedor_id: string
        }
        Insert: {
          created_at?: string
          data_prevista?: string | null
          id?: string
          observacao?: string | null
          orcamento_id?: string | null
          ordem_servico_id?: string | null
          parcela_num?: number
          parcela_total?: number
          status?: string
          tipo?: string
          updated_at?: string
          valor?: number
          vendedor_id: string
        }
        Update: {
          created_at?: string
          data_prevista?: string | null
          id?: string
          observacao?: string | null
          orcamento_id?: string | null
          ordem_servico_id?: string | null
          parcela_num?: number
          parcela_total?: number
          status?: string
          tipo?: string
          updated_at?: string
          valor?: number
          vendedor_id?: string
        }
        Relationships: []
      }
      vendedor_metas: {
        Row: {
          ano: number
          created_at: string
          id: string
          mes: number
          meta_valor: number
          meta_vendas: number
          updated_at: string
          vendedor_id: string
        }
        Insert: {
          ano: number
          created_at?: string
          id?: string
          mes: number
          meta_valor?: number
          meta_vendas?: number
          updated_at?: string
          vendedor_id: string
        }
        Update: {
          ano?: number
          created_at?: string
          id?: string
          mes?: number
          meta_valor?: number
          meta_vendas?: number
          updated_at?: string
          vendedor_id?: string
        }
        Relationships: []
      }
      visitas: {
        Row: {
          autoriza_orcamento: boolean
          cidade: string | null
          cliente_email: string | null
          cliente_id: string | null
          cliente_nome: string
          cliente_telefone: string | null
          created_at: string
          data_visita: string
          endereco: string | null
          id: string
          observacoes: string | null
          orcamento_id: string | null
          servico_descricao: string | null
          status: string
          updated_at: string
          valor_estimado: number
          vendedor_id: string
          vendedor_nome: string | null
        }
        Insert: {
          autoriza_orcamento?: boolean
          cidade?: string | null
          cliente_email?: string | null
          cliente_id?: string | null
          cliente_nome: string
          cliente_telefone?: string | null
          created_at?: string
          data_visita: string
          endereco?: string | null
          id?: string
          observacoes?: string | null
          orcamento_id?: string | null
          servico_descricao?: string | null
          status?: string
          updated_at?: string
          valor_estimado?: number
          vendedor_id: string
          vendedor_nome?: string | null
        }
        Update: {
          autoriza_orcamento?: boolean
          cidade?: string | null
          cliente_email?: string | null
          cliente_id?: string | null
          cliente_nome?: string
          cliente_telefone?: string | null
          created_at?: string
          data_visita?: string
          endereco?: string | null
          id?: string
          observacoes?: string | null
          orcamento_id?: string | null
          servico_descricao?: string | null
          status?: string
          updated_at?: string
          valor_estimado?: number
          vendedor_id?: string
          vendedor_nome?: string | null
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
      log_activity: {
        Args: {
          _action: string
          _details?: Json
          _entity_id: string
          _entity_type: string
          _user_id: string
        }
        Returns: undefined
      }
      user_has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
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
      app_role: "admin" | "gerente" | "tecnico" | "financeiro" | "vendedor"
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
      app_role: ["admin", "gerente", "tecnico", "financeiro", "vendedor"],
    },
  },
} as const
