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
    case 'cmd_get_history':
      return [
        {
          id: '3a18e84d-238d-454a-a8b1-806cd021ef09',
          item_type: 'sheet',
          title: '¡Bienvenido a Odisea para Windows 11!',
          context: 'Manual Interactivo de Odisea / 01. Primeros Pasos y Ergonomía',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
        {
          id: 'cb8f4826-6b30-40b5-9c99-693c40ad8082',
          item_type: 'project',
          title: 'Manual Interactivo de Odisea',
          context: 'Proyecto Tutorial Oficial',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        },
      ] as T;
    case 'cmd_save_session_state':
    case 'cmd_record_history':
    case 'cmd_clear_history':
      return undefined as T;
    case 'cmd_list_projects':
      return [
        {
          id: 'cb8f4826-6b30-40b5-9c99-693c40ad8082',
          name: 'Manual Interactivo de Odisea',
          icon: 'book-open',
          color: '#007aff',
          is_archived: false,
          export_style_id: 'Swiss Knife',
          export_format: 'pdf',
          sort_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ] as T;
    case 'cmd_list_groups':
      return [
        {
          id: '8bbc2176-0e7a-4a88-be0c-731b648a4476',
          project_id: 'cb8f4826-6b30-40b5-9c99-693c40ad8082',
          parent_group_id: null,
          section_type: 'main',
          name: '01. Primeros Pasos y Ergonomía',
          icon: 'compass',
          color: '#007aff',
          writing_goal_json: null,
          sort_order: 0,
        },
        {
          id: 'f05d16ad-4b50-48ac-bd6a-1496d209a365',
          project_id: 'cb8f4826-6b30-40b5-9c99-693c40ad8082',
          parent_group_id: null,
          section_type: 'main',
          name: '02. Sintaxis Markdown XL (28 Etiquetas)',
          icon: 'code',
          color: '#34c759',
          writing_goal_json: null,
          sort_order: 1,
        },
        {
          id: '045d2e1e-dec0-4d20-9c19-5c53ec4620d3',
          project_id: 'cb8f4826-6b30-40b5-9c99-693c40ad8082',
          parent_group_id: null,
          section_type: 'main',
          name: '03. Metas de Escritura y Dashboard',
          icon: 'target',
          color: '#ff9500',
          writing_goal_json: null,
          sort_order: 2,
        },
        {
          id: '6bda3a40-976c-4e28-a006-c58ea809d363',
          project_id: 'cb8f4826-6b30-40b5-9c99-693c40ad8082',
          parent_group_id: null,
          section_type: 'main',
          name: '04. Exportación ULSS y Publicación Web',
          icon: 'send',
          color: '#af52de',
          writing_goal_json: null,
          sort_order: 3,
        },
        {
          id: 'c7fd2a46-ef5a-47d4-9ce5-8b0649b3e944',
          project_id: 'cb8f4826-6b30-40b5-9c99-693c40ad8082',
          parent_group_id: null,
          section_type: 'notes',
          name: 'Notas y Referencias Rápidas',
          icon: 'file-text',
          color: '#8e8e93',
          writing_goal_json: null,
          sort_order: 4,
        },
      ] as T;
    case 'cmd_list_sheets':
    case 'cmd_list_global_filter':
      return [
        {
          id: '3a18e84d-238d-454a-a8b1-806cd021ef09',
          group_id: '8bbc2176-0e7a-4a88-be0c-731b648a4476',
          title: '¡Bienvenido a Odisea para Windows 11!',
          content_mdxl: '# ¡Bienvenido a Odisea para Windows 11!\n\nOdisea es la primera experiencia de escritura inmersiva de alta fidelidad inspirada en **Ulysses para macOS**, desarrollada íntegramente para la arquitectura moderna de **Windows 11**.\n\n## La Filosofía Odisea: Tu Entorno de Prosa Puro\nOdisea está diseñada con una arquitectura **Micro-UI de alta densidad visual**: cada icono mide exactamente 16 píxeles, cada etiqueta es una micro-píldora tipográfica y ningún elemento decorativo roba espacio a tus palabras.\n\n### Arquitectura de 3+1 Paneles Fluidos\n1. **Panel 1: Biblioteca (Ctrl+1)**: Organiza tus proyectos, grupos jerárquicos, carpetas externas sincronizadas y filtros inteligentes.\n2. **Panel 2: Lista de Hojas (Ctrl+2)**: Gestiona tus textos con vista previa de dos líneas, fechas relativas, micro-badges y estado de publicación en la nube.\n3. **Panel 3: Editor WYSIWYM (Ctrl+3)**: Lienzo tipográfico en tiempo real sin recargas, con las 28 etiquetas semánticas de Markdown XL.\n4. **Panel 4: Dashboard y Objetivos (Ctrl+4)**: Panel flotante o acoplable con métricas en vivo, esquema de encabezados y control de objetivos de escritura.\n\n> "La sencillez no es la ausencia de funciones, sino la claridad absoluta de propósito."\n\n### Atajos Esenciales para Escribir sin Ratón\n- **Ctrl+P**: Paleta de Comandos unificada para ejecutar cualquier acción al instante.\n- **Ctrl+N**: Crear una nueva hoja en el grupo activo.\n- **Ctrl+Shift+N**: Crear un nuevo grupo.\n- **Ctrl+Shift+P**: Publicar en WordPress, Ghost, Medium o Micro.blog.\n- **Ctrl+E**: Abrir la ventana de exportación editorial con motor de estilos ULSS.\n- **F11**: Modo Pantalla Completa y Enfoque Zen.\n',
          markup_dialect: 'markdown_xl',
          is_favorite: true,
          is_material: false,
          glued_with_next: false,
          sort_order: 0,
          writing_goal_json: '{"target": 500, "type": "at_least", "unit": "words", "current": 240, "deadline": null}',
          publish_status_json: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        },
        {
          id: '40abf26f-33b4-4241-b67d-f5cc159a3986',
          group_id: 'f05d16ad-4b50-48ac-bd6a-1496d209a365',
          title: 'Guía Completa de la Sintaxis Markdown XL',
          content_mdxl: '# Guía Completa de la Sintaxis Markdown XL\n\nMarkdown XL amplía la sintaxis tradicional de Markdown para convertir el editor en un entorno de maquetación semántica sin perder la legibilidad del texto plano.\n\n## 1. Formato de Carácter y Énfasis\n- **Negrita**: `**texto fuerte**` o `__texto destacado__`\n- *Cursiva*: `*énfasis sutil*` o `_pensamiento interior_`\n- ::Texto Resaltado con Marcador Fluorescente:: (`::marcado::`)\n- ||Texto Tachado o Descartado|| (`||eliminado||`)\n- Código en línea: `\'\'let buffer = [0u8; 1024];\'\'`\n- Texto crudo sin interpretar: `++\\frac{a}{b}++`\n\n## 2. Párrafos Estructurados y Bloques Especiales\n> Este es un bloque de cita editorial.\n> Puede extenderse a través de múltiples párrafos manteniendo la elegancia visual.\n\n|\" Bloque de verso o poesía:\n|\" Las palabras navegan en silencio,\n|\" trazando senderos sobre el lienzo blanco.\n\n%% Este es un bloque de comentario privado.\n%% No se incluirá en ninguna exportación a PDF, DOCX ni HTML. %%\n',
          markup_dialect: 'markdown_xl',
          is_favorite: false,
          is_material: false,
          glued_with_next: false,
          sort_order: 1,
          writing_goal_json: '{"target": 600, "type": "at_least", "unit": "words", "current": 320, "deadline": null}',
          publish_status_json: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        },
        {
          id: 'a436937e-116a-4639-b881-06e096d30912',
          group_id: '045d2e1e-dec0-4d20-9c19-5c53ec4620d3',
          title: 'Metas de Escritura y Dashboard de Análisis',
          content_mdxl: '# Metas de Escritura y Dashboard de Análisis\n\nEl **Dashboard de Odisea (Ctrl+4)** transforma la métrica de tus textos en una palanca de hábito y concentración constante.\n\n## Anillos Progresivos de Escritura (Writing Goals)\nPuedes fijar objetivos individuales por cada hoja o acumulativos para un grupo entero:\n- **Al menos (At least)**: Ideal para cuotas diarias mínimas (ej. 1,000 palabras por jornada).\n- **Como máximo (At most)**: Esencial para artículos académicos, abstracts o columnas de prensa con límite estricto de caracteres.\n- **Aproximadamente (About)**: Permite una tolerancia del ±10% alrededor de tu meta.\n',
          markup_dialect: 'markdown_xl',
          is_favorite: false,
          is_material: false,
          glued_with_next: false,
          sort_order: 2,
          writing_goal_json: '{"target": 400, "type": "at_least", "unit": "words", "current": 210, "deadline": null}',
          publish_status_json: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        },
        {
          id: '3421c5b8-8984-4aa1-8fcb-dd36190449e9',
          group_id: '6bda3a40-976c-4e28-a006-c58ea809d363',
          title: 'Exportación Editorial (.ulss) y Publicación en la Nube',
          content_mdxl: '# Exportación Editorial (.ulss) y Publicación en la Nube\n\nOdisea incorpora un motor de renderizado y compilación de vanguardia que separa el contenido textual de su diseño tipográfico final.\n\n## El Motor de Hojas de Estilo de Ulysses (.ulss)\nLas hojas de estilo `.ulss` permiten aplicar reglas tipográficas avanzadas con variables (`$font-serif = "Charter"`), mixins, herencia en cascada y selectores contextuales (`paragraph + paragraph` para sangría de primera línea).\n',
          markup_dialect: 'markdown_xl',
          is_favorite: false,
          is_material: false,
          glued_with_next: false,
          sort_order: 3,
          writing_goal_json: '{"target": 450, "type": "at_least", "unit": "words", "current": 250, "deadline": null}',
          publish_status_json: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        },
        {
          id: '42db3baf-01ff-4034-8892-789a68874d07',
          group_id: 'c7fd2a46-ef5a-47d4-9ce5-8b0649b3e944',
          title: 'Referencia Rápida de Atajos y Consejos Pro',
          content_mdxl: '# Referencia Rápida de Atajos y Consejos Pro\n\nGuarda esta hoja en tus favoritos o márcala como material de referencia.\n\n## Tabla Maestra de Atajos de Teclado\n| Acción | Atajo Windows 11 | Descripción |\n| :--- | :--- | :--- |\n| **Paleta de Comandos** | `Ctrl + P` | Acceso universal a todos los comandos |\n| **Mostrar/Ocultar Biblioteca** | `Ctrl + 1` | Alterna el panel de navegación de proyectos |\n| **Mostrar/Ocultar Hojas** | `Ctrl + 2` | Alterna la lista de documentos |\n| **Modo Editor Único** | `Ctrl + 3` | Oculta Biblioteca y Lista para máxima inmersión |\n| **Dashboard y Estadísticas** | `Ctrl + 4` | Despliega métricas, metas y esquema |\n| **Pegar Hojas (Glue)** | `Ctrl + Shift + G` | Une la hoja actual con la siguiente |\n| **Exportar Documento** | `Ctrl + E` | Previsualiza y compila con estilos .ulss |\n| **Publicar en la Web** | `Ctrl + Shift + P` | Envía a WordPress, Ghost, Medium o Substack |\n| **Modo Pantalla Completa** | `F11` | Oculta la barra de tareas y decoraciones del sistema |\n| **Nueva Hoja** | `Ctrl + N` | Inserta una hoja inmediatamente debajo |\n| **Nuevo Grupo** | `Ctrl + Shift + N` | Crea una carpeta en la biblioteca activa |\n',
          markup_dialect: 'markdown_xl',
          is_favorite: true,
          is_material: true,
          glued_with_next: false,
          sort_order: 4,
          writing_goal_json: null,
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

