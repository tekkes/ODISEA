use rusqlite::{params, Connection, Result};

pub fn seed_default_tutorial(conn: &Connection) -> Result<()> {
    let project_id = "cb8f4826-6b30-40b5-9c99-693c40ad8082";
    let now = "2026-10-19T21:13:17.597265+00:00";

    // 1. Insert Project: Manual Interactivo de Odisea
    conn.execute(
        "INSERT OR IGNORE INTO projects (id, name, icon, color, is_archived, export_style_id, export_format, sort_order, created_at, updated_at)
         VALUES (?1, 'Manual Interactivo de Odisea', 'book-open', '#007aff', 0, 'Swiss Knife', 'pdf', 0, ?2, ?2)",
        params![project_id, now],
    )?;

    // 2. Insert Groups
    let groups = [
        ("8bbc2176-0e7a-4a88-be0c-731b648a4476", "main", "01. Primeros Pasos y Ergonomía", "compass", "#007aff", 0),
        ("f05d16ad-4b50-48ac-bd6a-1496d209a365", "main", "02. Sintaxis Markdown XL (28 Etiquetas)", "code", "#34c759", 1),
        ("045d2e1e-dec0-4d20-9c19-5c53ec4620d3", "main", "03. Metas de Escritura y Dashboard", "target", "#ff9500", 2),
        ("6bda3a40-976c-4e28-a006-c58ea809d363", "main", "04. Exportación ULSS y Publicación Web", "send", "#af52de", 3),
        ("c7fd2a46-ef5a-47d4-9ce5-8b0649b3e944", "notes", "Notas y Referencias Rápidas", "file-text", "#8e8e93", 4),
    ];

    for (gid, stype, name, icon, color, sorder) in groups {
        conn.execute(
            "INSERT OR IGNORE INTO groups (id, project_id, parent_group_id, section_type, name, icon, color, writing_goal_json, sort_order)
             VALUES (?1, ?2, NULL, ?3, ?4, ?5, ?6, NULL, ?7)",
            params![gid, project_id, stype, name, icon, color, sorder],
        )?;
    }

    // 3. Insert Keywords
    let keywords = [
        ("2feea124-dd94-430e-9ff4-1531930aa200", "Tutorial", "#007aff"),
        ("9e865d78-c3ae-4621-a90d-632b5835d98f", "Markdown XL", "#34c759"),
        ("86b5a825-8e7c-4ab2-b028-261b26f14204", "Atajos", "#ff9500"),
        ("90817b83-4644-4133-a29c-f82cb5aa7036", "Publicación", "#af52de"),
        ("a075dfce-9821-4699-9bce-3c9c90a2137a", "Editorial", "#ff2d55"),
    ];

    for (kid, kname, kcolor) in keywords {
        conn.execute(
            "INSERT OR IGNORE INTO keywords (id, project_id, name, color)
             VALUES (?1, ?2, ?3, ?4)",
            params![kid, project_id, kname, kcolor],
        )?;
    }

    // 4. Insert 5 Sheets
    let s1_content = "# ¡Bienvenido a Odisea para Windows 11!\n\nOdisea es la primera experiencia de escritura inmersiva de alta fidelidad inspirada en **Ulysses para macOS**, desarrollada íntegramente para la arquitectura moderna de **Windows 11**.\n\n## La Filosofía Odisea: Tu Entorno de Prosa Puro\nOdisea está diseñada con una arquitectura **Micro-UI de alta densidad visual**: cada icono mide exactamente 16 píxeles, cada etiqueta es una micro-píldora tipográfica y ningún elemento decorativo roba espacio a tus palabras.\n\n### Arquitectura de 3+1 Paneles Fluidos\n1. **Panel 1: Biblioteca (Ctrl+1)**: Organiza tus proyectos, grupos jerárquicos, carpetas externas sincronizadas y filtros inteligentes.\n2. **Panel 2: Lista de Hojas (Ctrl+2)**: Gestiona tus textos con vista previa de dos líneas, fechas relativas, micro-badges y estado de publicación en la nube.\n3. **Panel 3: Editor WYSIWYM (Ctrl+3)**: Lienzo tipográfico en tiempo real sin recargas, con las 28 etiquetas semánticas de Markdown XL.\n4. **Panel 4: Dashboard y Objetivos (Ctrl+4)**: Panel flotante o acoplable con métricas en vivo, esquema de encabezados y control de objetivos de escritura.\n\n> \"La sencillez no es la ausencia de funciones, sino la claridad absoluta de propósito.\"\n\n### Atajos Esenciales para Escribir sin Ratón\n- **Ctrl+P**: Paleta de Comandos unificada para ejecutar cualquier acción al instante.\n- **Ctrl+N**: Crear una nueva hoja en el grupo activo.\n- **Ctrl+Shift+N**: Crear un nuevo grupo.\n- **Ctrl+Shift+P**: Publicar en WordPress, Ghost, Medium o Micro.blog.\n- **Ctrl+E**: Abrir la ventana de exportación editorial con motor de estilos ULSS.\n- **F11**: Modo Pantalla Completa y Enfoque Zen.\n";

    let s2_content = "# Guía Completa de la Sintaxis Markdown XL\n\nMarkdown XL amplía la sintaxis tradicional de Markdown para convertir el editor en un entorno de maquetación semántica sin perder la legibilidad del texto plano.\n\n## 1. Formato de Carácter y Énfasis\n- **Negrita**: `**texto fuerte**` o `__texto destacado__`\n- *Cursiva*: `*énfasis sutil*` o `_pensamiento interior_`\n- ::Texto Resaltado con Marcador Fluorescente:: (`::marcado::`)\n- ||Texto Tachado o Descartado|| (`||eliminado||`)\n- Código en línea: `''let buffer = [0u8; 1024];''`\n- Texto crudo sin interpretar: `++\\frac{a}{b}++`\n\n## 2. Párrafos Estructurados y Bloques Especiales\n> Este es un bloque de cita editorial.\n> Puede extenderse a través de múltiples párrafos manteniendo la elegancia visual.\n\n|\" Bloque de verso o poesía:\n|\" Las palabras navegan en silencio,\n|\" trazando senderos sobre el lienzo blanco.\n\n%% Este es un bloque de comentario privado.\n%% No se incluirá en ninguna exportación a PDF, DOCX ni HTML. %%\n\n## 3. Anotaciones, Comentarios y Notas al Pie\nLas notas al pie no intrusivas se redactan directamente en el flujo: (fn: Las notas al pie de Odisea se expanden en un micro-popover sin interrumpir tu concentración).\nTambién dispones de anotaciones al margen {a: Esta es una nota de revisión editorial} y comentarios de autor {revisar fuente bibliográfica antes de imprenta}.\n\n## 4. Tablas Interactivas y Fórmulas Matemáticas\nLas tablas se adaptan perfectamente a tu documento:\n\n| Función | Atajo Global | Estado |\n| :--- | :---: | ---: |\n| Paleta de Comandos | Ctrl+P | Activo |\n| Exportación Editorial | Ctrl+E | Activo |\n| Publicación Web | Ctrl+Shift+P | Activo |\n\nY las ecuaciones matemáticas se renderizan con precisión KaTeX:\n$$\n\\oint_C \\mathbf{B} \\cdot d\\mathbf{l} = \\mu_0 \\left( I_{\\text{enc}} + \\varepsilon_0 \\frac{d\\Phi_E}{dt} \\right)\n$$\n";

    let s3_content = "# Metas de Escritura y Dashboard de Análisis\n\nEl **Dashboard de Odisea (Ctrl+4)** transforma la métrica de tus textos en una palanca de hábito y concentración constante.\n\n## Anillos Progresivos de Escritura (Writing Goals)\nPuedes fijar objetivos individuales por cada hoja o acumulativos para un grupo entero:\n- **Al menos (At least)**: Ideal para cuotas diarias mínimas (ej. 1,000 palabras por jornada).\n- **Como máximo (At most)**: Esencial para artículos académicos, abstracts o columnas de prensa con límite estricto de caracteres.\n- **Aproximadamente (About)**: Permite una tolerancia del ±10% alrededor de tu meta.\n\n### Estados de Color del Indicador Circular:\n1. **Naranja cálido**: Inicio de sesión (0% a 30% del progreso).\n2. **Azul vibrante**: Escritura fluida en progreso (30% a 99%).\n3. **Verde esmeralda**: ¡Objetivo completado con éxito! (100%).\n4. **Rojo carmesí**: Advertencia de exceso en modo \"Como máximo\".\n\n## Estadísticas en Tiempo Real\nEn la barra inferior y en la pestaña de progreso del Dashboard dispones de:\n- Conteo instantáneo de Palabras, Caracteres, Caracteres sin espacios.\n- Estructura métrica: Oraciones, Párrafos, Líneas y Páginas estimadas.\n- Velocidad de lectura estimada en tres ritmos: Lento (150 ppm), Medio (220 ppm) y Rápido (300 ppm).\n- Esquema jerárquico interactivo (Outline) para saltar de inmediato a cualquier sección `H1` a `H6`.\n";

    let s4_content = "# Exportación Editorial (.ulss) y Publicación en la Nube\n\nOdisea incorpora un motor de renderizado y compilación de vanguardia que separa el contenido textual de su diseño tipográfico final.\n\n## El Motor de Hojas de Estilo de Ulysses (.ulss)\nLas hojas de estilo `.ulss` permiten aplicar reglas tipográficas avanzadas con variables (`$font-serif = \"Charter\"`), mixins, herencia en cascada y selectores contextuales (`paragraph + paragraph` para sangría de primera línea).\n\n### Estilos Editoriales Incluidos de Serie:\n- **Swiss Knife**: Diseño limpio, contemporáneo y universal.\n- **Novel (Manuscript)**: Formato canónico de entrega editorial a doble espacio con tipografía monoespaciada.\n- **Academic Paper**: Estilo formal para tesis y papers con citas al pie y referencias numeradas.\n- **Business Report**: Documento corporativo con tablas destacadas y portadas sobrias.\n- **Two-Column Magazine**: Diseño periodístico a dos columnas con justificación equilibrada.\n- **Minimalist Essay**: Prosa pura centrada en márgenes amplios.\n\n## Publicación Directa a la Web (Ctrl+Shift+P)\nConecta tus cuentas directamente y publica sin salir de Odisea:\n- **WordPress REST API v2**: Envía borradores o actualiza entradas existentes con categorías y etiquetas.\n- **Ghost Admin API**: Publicación directa con integración de imágenes destacadas.\n- **Medium & Micro.blog**: Sincronización instantánea con tu feed personal.\n- **Copy for Substack**: Copia con un clic el contenido transformado exactamente en el portapapeles enriquecido que acepta el editor de Substack.\n";

    let s5_content = "# Referencia Rápida de Atajos y Consejos Pro\n\nGuarda esta hoja en tus favoritos o márcala como material de referencia.\n\n## Tabla Maestra de Atajos de Teclado\n| Acción | Atajo Windows 11 | Descripción |\n| :--- | :--- | :--- |\n| **Paleta de Comandos** | `Ctrl + P` | Acceso universal a todos los comandos |\n| **Mostrar/Ocultar Biblioteca** | `Ctrl + 1` | Alterna el panel de navegación de proyectos |\n| **Mostrar/Ocultar Hojas** | `Ctrl + 2` | Alterna la lista de documentos |\n| **Modo Editor Único** | `Ctrl + 3` | Oculta Biblioteca y Lista para máxima inmersión |\n| **Dashboard y Estadísticas** | `Ctrl + 4` | Despliega métricas, metas y esquema |\n| **Pegar Hojas (Glue)** | `Ctrl + Shift + G` | Une la hoja actual con la siguiente |\n| **Exportar Documento** | `Ctrl + E` | Previsualiza y compila con estilos .ulss |\n| **Publicar en la Web** | `Ctrl + Shift + P` | Envía a WordPress, Ghost, Medium o Substack |\n| **Modo Pantalla Completa** | `F11` | Oculta la barra de tareas y decoraciones del sistema |\n| **Nueva Hoja** | `Ctrl + N` | Inserta una hoja inmediatamente debajo |\n| **Nuevo Grupo** | `Ctrl + Shift + N` | Crea una carpeta en la biblioteca activa |\n\n## Portabilidad Total Garantizada\nRecuerda que Odisea es **100% portable**:\n- Todos tus textos, estilos, temas, copias de seguridad e índices FTS5 residen exclusivamente en la carpeta `./odisea_data/` junto a `Odisea.exe`.\n- Puedes mover la carpeta entera a una memoria USB o a tu almacenamiento en la nube sin requerir derechos de administrador ni dejar rastros en el Registro de Windows.\n";

    let sheets = [
        ("3a18e84d-238d-454a-a8b1-806cd021ef09", "8bbc2176-0e7a-4a88-be0c-731b648a4476", "¡Bienvenido a Odisea para Windows 11!", s1_content, 1, 0, Some("{\"target\": 500, \"type\": \"at_least\", \"unit\": \"words\", \"current\": 240, \"deadline\": null}")),
        ("40abf26f-33b4-4241-b67d-f5cc159a3986", "f05d16ad-4b50-48ac-bd6a-1496d209a365", "Guía Completa de la Sintaxis Markdown XL", s2_content, 0, 0, Some("{\"target\": 600, \"type\": \"at_least\", \"unit\": \"words\", \"current\": 320, \"deadline\": null}")),
        ("a436937e-116a-4639-b881-06e096d30912", "045d2e1e-dec0-4d20-9c19-5c53ec4620d3", "Metas de Escritura y Dashboard de Análisis", s3_content, 0, 0, Some("{\"target\": 400, \"type\": \"at_least\", \"unit\": \"words\", \"current\": 210, \"deadline\": null}")),
        ("3421c5b8-8984-4aa1-8fcb-dd36190449e9", "6bda3a40-976c-4e28-a006-c58ea809d363", "Exportación Editorial (.ulss) y Publicación en la Nube", s4_content, 0, 0, Some("{\"target\": 450, \"type\": \"at_least\", \"unit\": \"words\", \"current\": 250, \"deadline\": null}")),
        ("42db3baf-01ff-4034-8892-789a68874d07", "c7fd2a46-ef5a-47d4-9ce5-8b0649b3e944", "Referencia Rápida de Atajos y Consejos Pro", s5_content, 1, 1, None),
    ];

    for (sid, gid, title, content, fav, mat, goal) in sheets {
        conn.execute(
            "INSERT OR IGNORE INTO sheets (id, group_id, title, content_mdxl, markup_dialect, is_favorite, is_material, glued_with_next, sort_order, writing_goal_json, publish_status_json, created_at, updated_at, deleted_at)
             VALUES (?1, ?2, ?3, ?4, 'markdown_xl', ?5, ?6, 0, 0, ?7, NULL, ?8, ?8, NULL)",
            params![sid, gid, title, content, fav, mat, goal, now],
        )?;
    }

    // 5. Connect Sheet Keywords
    let sheet_keywords = [
        ("3a18e84d-238d-454a-a8b1-806cd021ef09", "2feea124-dd94-430e-9ff4-1531930aa200"),
        ("3a18e84d-238d-454a-a8b1-806cd021ef09", "86b5a825-8e7c-4ab2-b028-261b26f14204"),
        ("40abf26f-33b4-4241-b67d-f5cc159a3986", "2feea124-dd94-430e-9ff4-1531930aa200"),
        ("40abf26f-33b4-4241-b67d-f5cc159a3986", "9e865d78-c3ae-4621-a90d-632b5835d98f"),
        ("a436937e-116a-4639-b881-06e096d30912", "2feea124-dd94-430e-9ff4-1531930aa200"),
        ("3421c5b8-8984-4aa1-8fcb-dd36190449e9", "2feea124-dd94-430e-9ff4-1531930aa200"),
        ("3421c5b8-8984-4aa1-8fcb-dd36190449e9", "90817b83-4644-4133-a29c-f82cb5aa7036"),
        ("3421c5b8-8984-4aa1-8fcb-dd36190449e9", "a075dfce-9821-4699-9bce-3c9c90a2137a"),
        ("42db3baf-01ff-4034-8892-789a68874d07", "86b5a825-8e7c-4ab2-b028-261b26f14204"),
        ("42db3baf-01ff-4034-8892-789a68874d07", "2feea124-dd94-430e-9ff4-1531930aa200"),
    ];

    for (sid, kid) in sheet_keywords {
        conn.execute(
            "INSERT OR IGNORE INTO sheet_keywords (sheet_id, keyword_id) VALUES (?1, ?2)",
            params![sid, kid],
        )?;
    }

    Ok(())
}
