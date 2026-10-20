// Safe IPC caller that works both inside Tauri and in browser dev mode

export async function invokeCommand<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<T>(cmd, args);
  } catch (err) {
    // Fallback for browser-only dev server mode
    console.warn(`[Odisea IPC Dev Fallback] Command '${cmd}' called with:`, args, err);
    return getMockFallback<T>(cmd, args);
  }
}

function getMockFallback<T>(cmd: string, _args?: Record<string, unknown>): T {
  switch (cmd) {
    case 'cmd_get_config': {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('odisea_config_json');
        if (saved) {
          try {
            return JSON.parse(saved) as T;
          } catch {}
        }
      }
      return {
        theme_mode: 'dark',
        active_theme: 'carbon_dark',
        active_style: 'default',
        typewriter_enabled: false,
        typewriter_position: 'center',
        focus_mode: 'none',
        show_library: true,
        show_sheet_list: true,
        show_dashboard: false,
        auto_backup_hours: 1,
        spell_check_language: 'es',
      } as T;
    }
    case 'cmd_save_config': {
      if (typeof localStorage !== 'undefined' && _args?.config) {
        localStorage.setItem('odisea_config_json', JSON.stringify(_args.config));
      }
      return {} as T;
    }
    case 'cmd_set_theme': {
      if (typeof localStorage !== 'undefined') {
        const themeId = _args?.themeId as string;
        const themeMode = _args?.themeMode as string;
        if (themeId) localStorage.setItem('odisea_active_theme', themeId);
        if (themeMode) localStorage.setItem('odisea_theme_mode', themeMode);
        const saved = localStorage.getItem('odisea_config_json');
        let cfg: any = {};
        if (saved) {
          try { cfg = JSON.parse(saved); } catch {}
        }
        cfg.active_theme = themeId;
        cfg.theme_mode = themeMode;
        localStorage.setItem('odisea_config_json', JSON.stringify(cfg));
      }
      return {} as T;
    }
    case 'cmd_list_projects':
      return [
        {
          id: 'proj-1',
          name: 'Novela: Odisea 2026',
          icon: 'book',
          color: '#007aff',
          is_archived: false,
          export_style_id: null,
          export_format: 'pdf',
          sort_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ] as T;
    case 'cmd_list_groups':
      return [
        {
          id: 'grp-1',
          project_id: 'proj-1',
          parent_group_id: null,
          section_type: 'main',
          name: 'Parte I: El Viaje',
          icon: 'folder',
          color: '#007aff',
          writing_goal_json: null,
          sort_order: 0,
        },
        {
          id: 'grp-2',
          project_id: 'proj-1',
          parent_group_id: null,
          section_type: 'extras',
          name: 'Investigación y Fichas',
          icon: 'archive',
          color: '#8e8e93',
          writing_goal_json: null,
          sort_order: 1,
        },
      ] as T;
    case 'cmd_list_sheets':
    case 'cmd_list_global_filter':
      return [
        {
          id: 'sheet-1',
          group_id: 'grp-1',
          title: 'Capítulo 1: El Umbral Desconocido',
          content_mdxl: '# Capítulo 1: El Umbral Desconocido\n\n(toc)\n\nEl viento soplaba con fuerza a través del estrecho...',
          markup_dialect: 'markdown_xl',
          is_favorite: true,
          is_material: false,
          glued_with_next: false,
          sort_order: 0,
          writing_goal_json: '{"target": 1500, "type": "at_least"}',
          publish_status_json: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        },
      ] as T;
    case 'cmd_get_statistics':
      return {
        word_count: 350,
        character_count: 2100,
        character_count_no_spaces: 1750,
        sentence_count: 24,
        paragraph_count: 6,
        estimated_reading_time_minutes: 1.6,
        estimated_speaking_time_minutes: 2.7,
      } as T;
    case 'cmd_list_styles':
      return [
        'Swiss Knife.ulss',
        'Novel (Manuscript).ulss',
        'Academic Paper.ulss',
        'Business Report.ulss',
        'Two-Column Magazine.ulss',
        'Minimalist Essay.ulss',
        'Technical Docs.ulss',
        'Revision.ulss',
      ] as T;
    case 'cmd_export_document':
      return {
        file_path: './odisea_data/exports/documento.pdf',
        format: 'pdf',
        preview_html: '<h1>Vista Previa</h1><p>Documento exportado exitosamente.</p>',
      } as T;
    case 'cmd_preview_export':
      return '<h1>Vista Previa de Exportación</h1><p>El viento soplaba con fuerza a través del estrecho...</p>' as T;
    case 'cmd_calculate_goal_progress':
      return {
        target_words: 1500,
        goal_mode: 'at_least',
        deadline_date: '2026-12-31',
        daily_quota: 45,
        progress_percent: 42,
        status_color: 'blue',
        history: Array.from({ length: 30 }, (_, i) => ({
          date: `2026-10-${String(i + 1).padStart(2, '0')}`,
          word_count: Math.round(20 * (i + 1)),
          words_added: 20,
        })),
      } as T;
    case 'cmd_run_revision_check':
      return [
        {
          id: 'TYPO-CURLY-QUOTES',
          category: 'Tipografía',
          message: 'Comillas rectas detectadas. Se aconseja usar comillas tipográficas « » o “ ”.',
          context_snippet: 'Párrafo: "hola"',
          line_number: 3,
          start_offset: 12,
          length: 6,
          severity: 'style',
          replacements: ['«hola»', '“hola”'],
        },
        {
          id: 'REDUN-PLEONASM',
          category: 'Redundancia',
          message: 'Pleonasmo redundante detectado.',
          context_snippet: 'Párrafo: "subir arriba"',
          line_number: 4,
          start_offset: 45,
          length: 12,
          severity: 'suggestion',
          replacements: ['subir'],
        },
      ] as T;
    case 'cmd_llm_assist':
      return 'Esta es una versión reescrita por el asistente de inteligencia artificial, refinando el estilo y la cadencia narrativa del fragmento.' as T;
    case 'cmd_get_backlinks_with_context':
      return [
        {
          id: 'lnk-1',
          source_sheet_id: 'sheet-2',
          source_title: 'Prólogo y Notas de Autor',
          group_name: 'Introducción',
          project_name: 'Novela: Odisea 2026',
          line_number: 14,
          anchor_text: 'Capítulo 1',
          snippet: 'Como se describirá detalladamente en el [[Capítulo 1: El Umbral Desconocido]], el viaje comenzó...',
        },
      ] as T;
    case 'cmd_list_sheet_attachments':
      return [] as T;
    case 'cmd_get_publish_accounts':
      return {
        wordpress: [
          {
            name: 'Mi Blog WordPress',
            endpoint: 'https://mi-sitio.com',
            username: 'admin',
            app_password: 'xxxx xxxx xxxx xxxx',
          },
        ],
        ghost: [
          {
            name: 'Ghost Publicación',
            endpoint: 'https://odisea.ghost.io',
            admin_api_key: '60123456789abcdef:1234567890abcdef1234567890abcdef',
          },
        ],
        medium: [
          {
            name: 'Medium Personal',
            token: '2xxxxxxxxxxxxxxxxxxxxxxx',
          },
        ],
        microblog: [
          {
            name: 'Micro.blog Dev',
            app_token: 'mcr_xxxxxxxxx',
          },
        ],
      } as T;
    case 'cmd_save_publish_accounts':
      return undefined as T;
    case 'cmd_publish_to_wordpress':
      return {
        platform: 'wordpress',
        post_id: '1042',
        url: 'https://mi-sitio.com/capitulo-1-el-umbral-desconocido',
        status: 'publish',
        published_at: new Date().toISOString(),
      } as T;
    case 'cmd_publish_to_ghost':
      return {
        platform: 'ghost',
        post_id: '654321deadbeef',
        url: 'https://odisea.ghost.io/capitulo-1-el-umbral-desconocido/',
        status: 'published',
        published_at: new Date().toISOString(),
      } as T;
    case 'cmd_publish_to_medium':
      return {
        platform: 'medium',
        post_id: 'med-987654321',
        url: 'https://medium.com/@autor/el-umbral-desconocido',
        status: 'public',
        published_at: new Date().toISOString(),
      } as T;
    case 'cmd_publish_to_microblog':
      return {
        platform: 'microblog',
        post_id: 'https://micro.blog/usuario/2026/10/19/el-umbral-desconocido.html',
        url: 'https://micro.blog/usuario/2026/10/19/el-umbral-desconocido.html',
        status: 'published',
        published_at: new Date().toISOString(),
      } as T;
    case 'cmd_copy_for_substack':
      return {
        html: '<h1>Capítulo 1: El Umbral Desconocido</h1><p>El viento soplaba con fuerza a través del estrecho...</p>',
        markdown: '# Capítulo 1: El Umbral Desconocido\n\nEl viento soplaba con fuerza a través del estrecho...',
        char_count: 78,
        word_count: 14,
      } as T;
    default:
      return {} as T;
  }
}

