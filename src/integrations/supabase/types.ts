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
      profiles: {
        Row: {
          id: string
          email: string
          nome: string | null
          empresa: string | null
          logo_url: string | null
          avatar_url: string | null
          telefone: string | null
          cargo: string | null
          status: string
          role: 'admin' | 'cliente'
          aceite_termos_em: string | null
          aceite_termos_versao: number
          ultimo_acesso: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          nome?: string | null
          empresa?: string | null
          logo_url?: string | null
          avatar_url?: string | null
          telefone?: string | null
          cargo?: string | null
          status?: string
          role?: 'admin' | 'cliente'
          aceite_termos_em?: string | null
          aceite_termos_versao?: number
          ultimo_acesso?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nome?: string | null
          empresa?: string | null
          logo_url?: string | null
          avatar_url?: string | null
          telefone?: string | null
          cargo?: string | null
          status?: string
          role?: 'admin' | 'cliente'
          aceite_termos_em?: string | null
          aceite_termos_versao?: number
          ultimo_acesso?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          categoria: string
          thumbnail_url: string | null
          dados_template: Json
          ativo: boolean
          criado_por: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          descricao?: string | null
          categoria: string
          thumbnail_url?: string | null
          dados_template: Json
          ativo?: boolean
          criado_por: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          nome?: string
          descricao?: string | null
          categoria?: string
          thumbnail_url?: string | null
          dados_template?: Json
          ativo?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      projetos: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          template_id: string | null
          dados_pagina: Json
          usuario_id: string
          publicado: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          descricao?: string | null
          template_id?: string | null
          dados_pagina: Json
          usuario_id: string
          publicado?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          nome?: string
          descricao?: string | null
          dados_pagina?: Json
          publicado?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      componentes_biblioteca: {
        Row: {
          id: string
          nome: string
          categoria: string
          descricao: string | null
          thumbnail_url: string | null
          dados_componente: Json
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          categoria: string
          descricao?: string | null
          thumbnail_url?: string | null
          dados_componente: Json
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          nome?: string
          categoria?: string
          descricao?: string | null
          thumbnail_url?: string | null
          dados_componente?: Json
          ativo?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          id: string
          projeto_id: string
          nome: string
          email: string
          telefone: string | null
          mensagem: string | null
          created_at: string
        }
        Insert: {
          id?: string
          projeto_id: string
          nome: string
          email: string
          telefone?: string | null
          mensagem?: string | null
          created_at?: string
        }
        Update: {
          nome?: string
          email?: string
          telefone?: string | null
          mensagem?: string | null
        }
        Relationships: []
      }
      perfil_empresa: {
        Row: {
          id: string
          user_id: string
          nome_empresa: string | null
          cnpj: string | null
          tipo_escritorio: 'individual' | 'sociedade' | null
          slogan: string | null
          ano_fundacao: number | null
          telefone: string | null
          whatsapp: string | null
          email_contato: string | null
          horario_atendimento: string | null
          cep: string | null
          logradouro: string | null
          numero: string | null
          complemento: string | null
          bairro: string | null
          cidade: string | null
          estado: string | null
          logo_url: string | null
          cor_primaria: string
          cor_secundaria: string
          historia: string | null
          missao: string | null
          visao: string | null
          valores: string | null
          diferenciais: Json
          servicos: Json
          redes_sociais: Json
          onboarding_completo: boolean
          etapa_atual: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nome_empresa?: string | null
          cnpj?: string | null
          tipo_escritorio?: 'individual' | 'sociedade' | null
          slogan?: string | null
          ano_fundacao?: number | null
          telefone?: string | null
          whatsapp?: string | null
          email_contato?: string | null
          horario_atendimento?: string | null
          cep?: string | null
          logradouro?: string | null
          numero?: string | null
          complemento?: string | null
          bairro?: string | null
          cidade?: string | null
          estado?: string | null
          logo_url?: string | null
          cor_primaria?: string
          cor_secundaria?: string
          historia?: string | null
          missao?: string | null
          visao?: string | null
          valores?: string | null
          diferenciais?: string[]
          servicos?: Json
          redes_sociais?: Json
          onboarding_completo?: boolean
          etapa_atual?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          nome_empresa?: string | null
          cnpj?: string | null
          tipo_escritorio?: 'individual' | 'sociedade' | null
          slogan?: string | null
          ano_fundacao?: number | null
          telefone?: string | null
          whatsapp?: string | null
          email_contato?: string | null
          horario_atendimento?: string | null
          cep?: string | null
          logradouro?: string | null
          numero?: string | null
          complemento?: string | null
          bairro?: string | null
          cidade?: string | null
          estado?: string | null
          logo_url?: string | null
          cor_primaria?: string
          cor_secundaria?: string
          historia?: string | null
          missao?: string | null
          visao?: string | null
          valores?: string | null
          diferenciais?: string[]
          servicos?: Json
          redes_sociais?: Json
          onboarding_completo?: boolean
          etapa_atual?: number
          updated_at?: string
        }
        Relationships: []
      }
      socios: {
        Row: {
          id: string
          perfil_empresa_id: string
          nome_completo: string
          crc_numero: string | null
          crc_estado: string | null
          cargo: string | null
          foto_url: string | null
          especialidades: string[]
          mini_bio: string | null
          exibir_landing_page: boolean
          ordem: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          perfil_empresa_id: string
          nome_completo: string
          crc_numero?: string | null
          crc_estado?: string | null
          cargo?: string | null
          foto_url?: string | null
          especialidades?: string[]
          mini_bio?: string | null
          exibir_landing_page?: boolean
          ordem?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          nome_completo?: string
          crc_numero?: string | null
          crc_estado?: string | null
          cargo?: string | null
          foto_url?: string | null
          especialidades?: string[]
          mini_bio?: string | null
          exibir_landing_page?: boolean
          ordem?: number
          updated_at?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          id: string
          key: string
          value: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          key: string
          value?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          key?: string
          value?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      legal_pages: {
        Row: {
          id: string
          slug: string
          title: string
          content: string
          current_version: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          slug: string
          title: string
          content?: string
          current_version?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          slug?: string
          title?: string
          content?: string
          current_version?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      legal_page_versions: {
        Row: {
          id: string
          legal_page_id: string
          version: number
          content: string | null
          published_by: string | null
          published_at: string
        }
        Insert: {
          id?: string
          legal_page_id: string
          version: number
          content?: string | null
          published_by?: string | null
          published_at?: string
        }
        Update: {
          legal_page_id?: string
          version?: number
          content?: string | null
          published_by?: string | null
          published_at?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          type: string
          priority: string
          is_published: boolean
          has_detail: boolean
          detail_body: string | null
          external_url: string | null
          internal_path: string | null
          expires_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          type?: string
          priority?: string
          is_published?: boolean
          has_detail?: boolean
          detail_body?: string | null
          external_url?: string | null
          internal_path?: string | null
          expires_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          content?: string
          type?: string
          priority?: string
          is_published?: boolean
          has_detail?: boolean
          detail_body?: string | null
          external_url?: string | null
          internal_path?: string | null
          expires_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      announcement_dismissals: {
        Row: {
          id: string
          announcement_id: string
          user_id: string
          dismissed_at: string
        }
        Insert: {
          id?: string
          announcement_id: string
          user_id: string
          dismissed_at?: string
        }
        Update: {
          announcement_id?: string
          user_id?: string
          dismissed_at?: string
        }
        Relationships: []
      }
      learning_modules: {
        Row: {
          id: string
          title: string
          description: string | null
          thumbnail_url: string | null
          is_published: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          thumbnail_url?: string | null
          is_published?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          thumbnail_url?: string | null
          is_published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      learning_lessons: {
        Row: {
          id: string
          module_id: string
          title: string
          description: string | null
          youtube_url: string | null
          duration_seconds: number
          is_published: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          description?: string | null
          youtube_url?: string | null
          duration_seconds?: number
          is_published?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          module_id?: string
          title?: string
          description?: string | null
          youtube_url?: string | null
          duration_seconds?: number
          is_published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      learning_attachments: {
        Row: {
          id: string
          lesson_id: string
          file_name: string
          file_size: number | null
          file_type: string | null
          storage_path: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          storage_path: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          lesson_id?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          storage_path?: string
          sort_order?: number
        }
        Relationships: []
      }
      learning_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed: boolean
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          completed?: boolean
          completed_at?: string | null
        }
        Update: {
          user_id?: string
          lesson_id?: string
          completed?: boolean
          completed_at?: string | null
        }
        Relationships: []
      }
      help_tips: {
        Row: {
          id: string
          page_path: string
          page_name: string
          section_title: string | null
          anchor_key: string | null
          title: string | null
          description: string | null
          video_url: string | null
          is_active: boolean
          last_seen_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          page_path: string
          page_name: string
          section_title?: string | null
          anchor_key?: string | null
          title?: string | null
          description?: string | null
          video_url?: string | null
          is_active?: boolean
          last_seen_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          page_path?: string
          page_name?: string
          section_title?: string | null
          anchor_key?: string | null
          title?: string | null
          description?: string | null
          video_url?: string | null
          is_active?: boolean
          last_seen_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      openrouter_user_overrides: {
        Row: {
          id: string
          user_id: string
          image_model: string
          reason: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          user_id: string
          image_model: string
          reason?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          user_id?: string
          image_model?: string
          reason?: string | null
          is_active?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      ai_model_prompts: {
        Row: {
          id: string
          model_id: string
          prompt_template: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          model_id: string
          prompt_template?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          model_id?: string
          prompt_template?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: Record<string, never>
  }
}
