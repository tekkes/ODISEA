import sys
from pathlib import Path

SKILL_ROOT = Path(r"C:\Users\IsaNet\.gemini\config\skills\technical-book-pdf")
sys.path.insert(0, str(SKILL_ROOT / "scripts"))

from components import EditorialComponents as EC
from generate_diagram import TechnicalDiagrams as TD

def get_chapter_7():
    p1_html = f"""
    {EC.section_header("Arquitectura del Motor de Hojas de Estilo (.ulss) en Rust", 1, "7.1")}
    <p>La culminación del paradigma WYSIWYM en Odisea se materializa en su <strong>motor nativo de hojas de estilo de Ulysses (.ulss)</strong>, reimplementado íntegramente en Rust bajo el subsistema <code>src-tauri/src/ulss_engine/</code>. Este motor permite transformar cualquier manuscrito redactado en Markdown XL en un documento de calidad tipográfica idéntica a Adobe InDesign, gobernado por reglas de diseño reutilizables y desacopladas del texto:</p>

    <ul>
        <li><strong>Analizador Léxico (lexer.rs):</strong> Tokeniza selectores tipográficos (<code>defaults</code>, <code>heading-1</code>, <code>paragraph</code>, <code>inline-strong</code>), valores numéricos con unidades físicas (<code>pt</code>, <code>in</code>, <code>mm</code>, <code>cm</code>), fuentes con o sin comillas, y variables que inician con el prefijo <code>$</code>.</li>
        <li><strong>Analizador Sintáctico (parser.rs):</strong> Construye el Árbol de Sintaxis Abstracta (AST) resolviendo directivas <code>@mixin</code>, selectores anidados y asignaciones de variables tanto con el operador igual (<code>$font = "Charter"</code>) como con dos puntos (<code>$color: #111111</code>).</li>
        <li><strong>Resolutor de Cascada (resolver.rs):</strong> Aplica la herencia jerárquica estandarizada de Ulysses: las propiedades declaradas en <code>defaults</code> fluyen hacia <code>heading-all</code> y de ahí a <code>heading-1</code>..<code>heading-6</code>, resolviendo selectores adyacentes contextuales como <code>paragraph + paragraph</code>.</li>
        <li><strong>Compilador de Diseño (compiler.rs):</strong> Traduce el AST a CSS tipográfico avanzado de alto rendimiento con soporte de alineación a rejilla base (<em>baseline-grid</em>) y expansión de columnas (<em>column-span: all</em>) para maquetaciones multicolumna modernas.</li>
    </ul>

    {EC.callout(
        "DEFINICIÓN CLAVE · EL FORMATO ESTÁNDAR .ULSS",
        "El formato <code>.ulss</code> (Ulysses Style Sheet) es el estándar internacional de hojas de estilo para edición de prosa. Odisea es plenamente compatible con los miles de estilos comunitarios disponibles en el repositorio oficial de Ulysses (styles.ulysses.app), permitiendo importar cualquier archivo .ulss sin conversiones.",
        "definition"
    )}
    """

    p2_html = f"""
    {EC.section_header("Los 11 Estilos Editoriales Canónicos Incluidos de Serie", 1, "7.2")}
    <p>En el subdirectorio <code>./odisea_data/styles/</code>, Odisea incluye de serie una biblioteca completa de <strong>11 hojas de estilo .ulss</strong> optimizadas para los principales géneros literarios, académicos y corporativos:</p>

    {EC.table(
        ["Hoja de Estilo (.ulss)", "Tipografías Base", "Propósito y Características Editoriales"],
        [
            ["Swiss Knife", "Helvetica / System Sans", "Diseño contemporáneo, neutro y universal; márgenes amplios y títulos limpios."],
            ["Novel (Manuscript)", "Courier New (12pt / 24pt)", "Estándar clásico de entrega editorial: doble espacio, márgenes de 1 pulgada y sangría."],
            ["Academic Paper", "Times New Roman (12pt)", "Formato riguroso para tesis y papers: notas al pie numeradas y citas en bloque."],
            ["Business Report", "Plus Jakarta Sans / Arial", "Documento corporativo moderno: tablas destacadas, cabeceras azul marino y sumarios."],
            ["Two-Column Magazine", "Charter / Georgia", "Diseño periodístico a dos columnas justificadas con micro-balanceo y letras capitulares."],
            ["Minimalist Essay", "Charter Serif (11pt)", "Prosa pura de ensayo humanístico: márgenes generosos y máxima ligereza visual."],
            ["Technical Docs", "JetBrains Mono / Inter", "Manuales de software e ingeniería: bloques de código resaltados y callouts coloridos."],
            ["Revision", "Charter / Courier", "Modo de corrección editorial: notas de autor, tachados en rojo y resaltados visibles."],
            ["Modern Novel", "Georgia (11.5pt)", "Novela contemporánea comercial: encabezados sutiles y foliación alterna."],
            ["Standard Academic", "Garamond / Times", "Estilo universitario tradicional con bibliografía al final y citas formateadas."],
            ["sample_style", "System Fonts", "Plantilla base documentada para la creación de nuevos estilos personalizados."]
        ],
        ["24%", "26%", "50%"]
    )}

    {EC.callout(
        "HITO TIPOGRÁFICO · EL SELECTOR ADYACENTE DE SANGRÍA",
        "En la edición profesional de libros, el primer párrafo de un capítulo <strong>nunca lleva sangría</strong>, mientras que los párrafos subsiguientes sí la llevan. El motor de Odisea implementa esta regla de forma automática mediante la regla ULSS <code>paragraph + paragraph { first-line-indent: 0.5in; }</code>, emulando la precisión de InDesign sin requerir marcas manuales.",
        "milestone"
    )}
    """

    p3_html = f"""
    {EC.section_header("El Modal de Previsualización (Ctrl+E) y Formatos de Salida", 1, "7.3")}
    <p>Al pulsar <strong>Ctrl+E</strong> o seleccionar el botón de exportación en la barra superior, Odisea abre el <strong>Modal de Previsualización Editorial</strong> (<code>ExportPreviewModal.tsx</code>). Esta interfaz permite auditar el documento renderizado en tiempo real antes de generar el archivo final:</p>

    <ul>
        <li><strong>Selector de Formato de Salida:</strong>
            <ul>
                <li><strong>PDF Editorial:</strong> Renderizado vectorial con sangrado completo, numeración de páginas alterna (pares a la izquierda, impares a la derecha) y marcadores interactivos (outlines/bookmarks).</li>
                <li><strong>DOCX (Microsoft Word):</strong> Documento estructurado con estilos nativos de Word (Título 1, Título 2, Citas, Tablas nativas) respetando la jerarquía de encabezados.</li>
                <li><strong>ePub 3.0:</strong> Libro electrónico estándar para Apple Books, Kindle y lectores e-reader, con tabla de contenidos digital y tipografía escalable.</li>
                <li><strong>HTML Autónomo:</strong> Archivo web autocontenido con estilos CSS incrustados e imágenes convertidas a Base64 para distribución inmediata.</li>
                <li><strong>Markdown Plano (.md):</strong> Exportación limpia sin extensiones propietarias para publicación en plataformas estáticas (Astro, Hugo, Jekyll).</li>
            </ul>
        </li>
        <li><strong>Conmutador de Estilos en Vivo:</strong> Cambia de estilo ULSS en el desplegable (por ejemplo, de <em>Swiss Knife</em> a <em>Novel Manuscript</em>) y observa cómo la previsualización se recompila en menos de 200 ms.</li>
        <li><strong>Ajustes de Página:</strong> Selección de formato de papel (A4, Letter, A5, B5), orientación (Vertical / Horizontal) y configuración de márgenes personalizados.</li>
    </ul>
    """

    return {
        "number": 7,
        "title": "Motor de Hojas de Estilo (.ulss) y Exportación Multi-Formato",
        "short_title": "MOTOR ULSS Y EXPORTACIÓN",
        "block": "BLOQUE IV — MAQUETACIÓN EDITORIAL Y PUBLICACIÓN",
        "block_kicker": "BLOQUE IV · MAQUETACIÓN EDITORIAL",
        "objectives": [
            "Comprender la arquitectura de compilación del motor ULSS en Rust (lexer, parser, resolver, compiler).",
            "Dominar la sintaxis de hojas de estilo .ulss: variables, mixins, cascada y selectores adyacentes.",
            "Conocer las características tipográficas de los 11 estilos editoriales preinstalados de serie.",
            "Operar el modal de exportación (Ctrl+E) para compilar en PDF, DOCX, ePub, HTML y Markdown plano."
        ],
        "pages": [
            {"header_section": "ARQUITECTURA DEL MOTOR ULSS", "html_content": p1_html},
            {"header_section": "LOS 11 ESTILOS PREINSTALADOS", "html_content": p2_html},
            {"header_section": "EL MODAL DE PREVISUALIZACIÓN", "html_content": p3_html}
        ],
        "summary": {
            "key_points": [
                "El motor ULSS en Rust tokeniza, parsea y resuelve estilos tipográficos con fidelidad absoluta a Ulysses.",
                "Soporta variables ($var), mixins (@mixin) y selectores adyacentes (paragraph + paragraph).",
                "Incluye 11 estilos predeterminados: Swiss Knife, Novel, Academic Paper, Technical Docs, etc.",
                "El modal Ctrl+E permite previsualizar la composición antes de generar el archivo definitivo.",
                "Exporta a 5 formatos mayores: PDF vectorial, DOCX con estilos, ePub 3, HTML y Markdown estándar."
            ],
            "requirements": [
                "Saber abrir la previsualización editorial mediante el atajo Ctrl+E.",
                "Identificar el estilo adecuado para cada proyecto (ej. Novel para manuscritos, Academic para tesis).",
                "Comprender cómo se personalizan o añaden nuevos estilos en ./odisea_data/styles/."
            ]
        },
        "questionnaire": {
            "columns": 2,
            "questions": [
                {
                    "text": "¿Qué extensión tienen las hojas de estilo tipográficas canónicas de Ulysses y Odisea?",
                    "options": ["a) .css", "b) .ulss", "c) .style", "d) .theme"]
                },
                {
                    "text": "¿Cómo se declara una variable en el lenguaje de estilos .ulss?",
                    "options": ["a) var font = 'Arial'", "b) $font-name = 'Charter' o $font-name: 'Charter'", "c) @font: 'Charter'", "d) #font = 'Charter'"]
                },
                {
                    "text": "¿Qué regla ULSS se utiliza para aplicar sangría de primera línea solo a partir del segundo párrafo?",
                    "options": ["a) paragraph:all { indent: true; }", "b) paragraph + paragraph { first-line-indent: 0.5in; }", "c) indent-after-first { 20px; }", "d) paragraph:not(:first)"]
                },
                {
                    "text": "¿Cuántos estilos editoriales .ulss incluye Odisea preconfigurados en ./odisea_data/styles/?",
                    "options": ["a) 2 estilos", "b) 11 estilos", "c) 50 estilos", "d) 1 estilo"]
                },
                {
                    "text": "¿Qué estilo .ulss reproduce el formato canónico de entrega a doble espacio en Courier New para editoriales?",
                    "options": ["a) Swiss Knife", "b) Novel (Manuscript).ulss", "c) Minimalist Essay", "d) Business Report"]
                },
                {
                    "text": "¿Qué atajo de teclado lanza el modal de previsualización y exportación editorial?",
                    "options": ["a) Ctrl + Shift + P", "b) Ctrl + E", "c) Alt + P", "d) F12"]
                },
                {
                    "text": "¿A qué formatos permite compilar el motor de exportación de Odisea?",
                    "options": ["a) Solo a texto plano .txt", "b) PDF editorial, DOCX estructurado, ePub 3, HTML autónomo y Markdown plano", "c) Únicamente a PDF", "d) A formato propietario cifrado"]
                },
                {
                    "text": "¿Dónde se guardan los archivos finales exportados por Odisea de forma predeterminada?",
                    "options": ["a) En C:\\Users\\Desktop", "b) En ./odisea_data/exports/", "c) En Mis Documentos", "d) En la papelera"]
                },
                {
                    "text": "¿Qué directiva permite reutilizar bloques comunes de reglas en un archivo .ulss?",
                    "options": ["a) @import", "b) @mixin nombre { ... }", "c) @include", "d) @copy"]
                },
                {
                    "text": "¿Qué ventaja tiene la exportación ePub 3 generada por Odisea?",
                    "options": ["a) Es solo una imagen escaneada", "b) Incluye tabla de contenidos digital navegable y texto redimensionable para lectores e-reader", "c) Requiere conexión permanente", "d) Solo funciona en iPhone"]
                }
            ]
        },
        "solutions": {
            "items": [
                {"correct_answer": "b) .ulss", "explanation": "Las Ulysses Style Sheets (.ulss) son el formato estándar soportado por el motor en Rust de Odisea."},
                {"correct_answer": "b) $font-name = 'Charter' o $font-name: 'Charter'", "explanation": "El parser admite asignación con signo igual y con dos puntos para máxima compatibilidad."},
                {"correct_answer": "b) paragraph + paragraph { first-line-indent: 0.5in; }", "explanation": "El selector de hermano adyacente (+) aplica la regla únicamente cuando un párrafo sigue a otro párrafo."},
                {"correct_answer": "b) 11 estilos", "explanation": "Incluye Swiss Knife, Novel, Academic Paper, Business Report, Two-Column Magazine, etc."},
                {"correct_answer": "b) Novel (Manuscript).ulss", "explanation": "Cumple los requerimientos tradicionales de las agencias y editoriales literarias norteamericanas y europeas."},
                {"correct_answer": "b) Ctrl + E", "explanation": "Ctrl+E abre de forma inmediata el modal de previsualización antes de generar el archivo en disco."},
                {"correct_answer": "b) PDF editorial, DOCX estructurado, ePub 3, HTML autónomo y Markdown plano", "explanation": "Cubre todas las fases del ciclo editorial: imprenta, distribución digital, oficina e interoperabilidad web."},
                {"correct_answer": "b) En ./odisea_data/exports/", "explanation": "El principio de portabilidad absoluta asegura que las salidas queden recogidas en el subdirectorio exports."},
                {"correct_answer": "b) @mixin nombre { ... }", "explanation": "Los mixins permiten encapsular propiedades tipográficas repetitivas y aplicarlas en múltiples selectores."},
                {"correct_answer": "b) Incluye tabla de contenidos digital navegable y texto redimensionable para lectores e-reader", "explanation": "El archivo ePub cumple con los estándares IDPF/W3C con metadatos completos y maquetación fluida."}
            ]
        }
    }

def get_chapter_8():
    p1_html = f"""
    {EC.section_header("Publicación Web Directa: WordPress, Ghost, Medium, Micro.blog y Substack", 1, "8.1")}
    <p>Para periodistas digitales, blogueros y ensayistas contemporáneos, el flujo de trabajo suele fracturarse al transferir el texto desde el procesador de escritorio al gestor de contenidos (CMS) web: imágenes que se desconfiguran, párrafos que pierden formato o etiquetas rotas. Odisea resuelve esta fricción integrando <strong>conectores de publicación web en la nube</strong> directamente desde el ejecutable nativo:</p>

    <ul>
        <li><strong>WordPress (REST API v2):</strong> Permite publicar nuevas entradas o <strong>actualizar entradas ya publicadas</strong> de forma bidireccional. Puedes configurar múltiples cuentas seguras, asignar el estado inicial (Borrador, Publicado, Programado con selector de fecha/hora), seleccionar categorías, añadir etiquetas y enviar la imagen destacada automáticamente desde los adjuntos locales.</li>
        <li><strong>Ghost (Admin API):</strong> Generación autónoma de tokens criptográficos JWT en Rust (<code>publishers/ghost.rs</code>). Envía entradas estructuradas en HTML semántico limpio con imagen de cabecera y tags remotos.</li>
        <li><strong>Medium & Micro.blog:</strong> Publicación instantánea en tus feeds personales mediante tokens de acceso directo. En Micro.blog, Odisea soporta además la actualización remota de microposts existentes.</li>
        <li><strong>Función 'Copy for Substack':</strong> Substack cuenta con un editor web cerrado que rechaza la mayoría de códigos Markdown pegados. La función dedicada de Odisea transforma el documento Markdown XL en el <em>formato exacto de portapapeles enriquecido (HTML/Rich-Text MIME)</em> que acepta el editor de Substack, preservando subtítulos, citas en bloque, enlaces y notas al pie sin descuadres visuales.</li>
    </ul>

    {EC.callout(
        "HITO OPERATIVO · INDICADOR VISUAL DE PUBLICACIÓN EN LA NUBE",
        "Cuando una hoja ha sido enviada con éxito a un servicio web, su tarjeta en la Lista de Hojas incorpora automáticamente un elegante <strong>micro-icono de avión de papel</strong>. En el Dashboard lateral, la pestaña de publicación muestra el enlace permanente (permalink) remoto y permite sincronizar las modificaciones futuras con un solo clic.",
        "milestone"
    )}
    """

    p2_html = f"""
    {EC.section_header("El Ciclo de Respaldo Automático con Zstandard (.odiseabak)", 1, "8.2")}
    <p>La peor pesadilla de un escritor es la pérdida accidental de días o meses de trabajo debido a fallos de hardware, cortes de suministro o borrados involuntarios. Odisea implementa un sistema de <strong>copias de seguridad continuas en segundo plano</strong> (<code>src-tauri/src/backups/</code>) con compresión Zstandard de alto ratio:</p>

    <ul>
        <li><strong>Instantáneas Horarias (hourly):</strong> Odisea genera automáticamente una copia comprimida cada 60 minutos de escritura activa en <code>./odisea_data/backups/hourly/</code>. Se conservan los últimos 24 respaldos horarios.</li>
        <li><strong>Instantáneas Diarias (daily):</strong> Al concluir cada jornada, se consolida una copia diaria en <code>./odisea_data/backups/daily/</code>, preservando el historial de los últimos 7 días.</li>
        <li><strong>Instantáneas Semanales (weekly):</strong> Cada semana se archiva un resguardo definitivo en <code>./odisea_data/backups/weekly/</code>, almacenando hasta 4 semanas consecutivas.</li>
    </ul>

    <div class="code-box">
        <pre><code class="language-text"># Estructura del archivo de snapshot Zstandard (.odiseabak)
odisea_backup_20261019_230000.odiseabak  [Compresión Zstd Level 3]
├── library.odiseadb                     # Base de datos relacional completa con índices FTS5
├── config.toml                          # Preferencias y configuración de usuario
├── styles/                              # Hojas de estilo .ulss personalizadas
└── manifest.json                        # Metadatos del snapshot: fecha, checksum SHA-256, versión</code></pre>
    </div>

    {EC.callout(
        "SEGURIDAD DE DATOS · RESGUARDO PREVIO ANTES DE RESTAURAR",
        "Si necesitas restaurar una copia de seguridad anterior desde el menú de opciones, Odisea genera automáticamente un respaldo de emergencia de tu estado actual (<code>library.pre_restore.bak</code>) antes de sobreescribir la base de datos, garantizando que ninguna palabra se pierda en el proceso.",
        "danger"
    )}
    """

    p3_html = f"""
    {EC.section_header("Mantenimiento, Optimización FTS5 y Migración Portable", 1, "8.3")}
    <p>La salud a largo plazo de una biblioteca con cientos de proyectos y miles de hojas depende de un motor de almacenamiento eficiente. Odisea mantiene su base SQLite optimizada de forma totalmente invisible para el usuario:</p>

    <ul>
        <li><strong>Puntos de Control WAL (Write-Ahead Logging):</strong> Las escrituras en disco se registran en el diario WAL de SQLite a máxima velocidad sin bloquear la lectura de otros paneles. Al cerrar la aplicación, se ejecuta un <code>wal_checkpoint(TRUNCATE)</code> consolidando los datos en el archivo principal <code>library.odiseadb</code>.</li>
        <li><strong>Búsqueda de Texto Completo FTS5:</strong> Cada vez que insertas, modificas o eliminas una hoja, triggers atómicos sincronizan la tabla virtual <code>sheets_fts</code>. Las búsquedas en la biblioteca devuelven resultados en menos de 5 milisegundos, incluso en bibliotecas de más de 100,000 páginas.</li>
        <li><strong>Migración Portable Entre Equipos:</strong> Para trasladar todo tu entorno de trabajo a otro ordenador con Windows 11, basta con copiar la carpeta completa <code>Odisea_Win11_Portable</code> (o mantenerla en una memoria USB o unidad en la nube). Al ejecutar <code>Odisea.exe</code> en el nuevo equipo, la aplicación funcionará de inmediato con el 100% de tus datos, estilos, temas y configuración intactos.</li>
    </ul>

    {EC.table(
        ["Escenario Operativo", "Acción Recomendada", "Procedimiento Técnico en Odisea"],
        [
            ["Mover a un nuevo PC con Windows 11", "Copiar carpeta Odisea_Win11_Portable", "No requiere instalador ni activación; arranque instantáneo."],
            ["Respaldar toda la biblioteca", "Archivar ./odisea_data/backups/", "Contiene todos los snapshots horarios, diarios y semanales."],
            ["Actualizar un artículo en WordPress", "Ctrl + Shift + P en la hoja activa", "Detecta el ID remoto y actualiza la entrada sin duplicarla."],
            ["Publicar en Substack", "Comando 'Copy for Substack' en la paleta", "Pega directamente con Ctrl+V en el navegador web de Substack."],
            ["Restaurar un texto borrado", "Menú Configuración > Restaurar Snapshot", "Selecciona el backup .odiseabak deseado; genera .bak preventivo."]
        ],
        ["28%", "28%", "44%"]
    )}
    """

    return {
        "number": 8,
        "title": "Conectores de Publicación Web y Mantenimiento Portable",
        "short_title": "PUBLICACIÓN Y MANTENIMIENTO",
        "block": "BLOQUE IV — MAQUETACIÓN EDITORIAL Y PUBLICACIÓN",
        "block_kicker": "BLOQUE IV · MAQUETACIÓN EDITORIAL",
        "objectives": [
            "Configurar y utilizar los conectores de publicación web en WordPress, Ghost, Medium y Micro.blog.",
            "Emplear la función 'Copy for Substack' para transferir prosa enriquecida al editor web de Substack.",
            "Actualizar entradas ya publicadas de forma bidireccional identificadas con el icono de avión de papel.",
            "Comprender el ciclo de respaldos automáticos Zstandard y la migración portable en Windows 11."
        ],
        "pages": [
            {"header_section": "CONECTORES DE PUBLICACIÓN WEB", "html_content": p1_html},
            {"header_section": "EL CICLO DE RESPALDOS ZSTANDARD", "html_content": p2_html},
            {"header_section": "MANTENIMIENTO Y MIGRACIÓN PORTABLE", "html_content": p3_html}
        ],
        "summary": {
            "key_points": [
                "Odisea publica y actualiza entradas en WordPress, Ghost, Medium y Micro.blog con un solo clic.",
                "La función 'Copy for Substack' adapta el formato enriquecido al portapapeles para pegado sin fallos.",
                "Las hojas publicadas lucen un micro-icono de avión de papel y registran su permalink remoto.",
                "El subsistema de backups genera copias continuas comprimidas con Zstandard (hourly, daily, weekly).",
                "Portabilidad garantizada: mover la carpeta Odisea_Win11_Portable traslada el 100% de la biblioteca."
            ],
            "requirements": [
                "Saber introducir credenciales seguras (Application Passwords / JWT) en la configuración de publicación.",
                "Conocer la ubicación de los archivos .odiseabak en ./odisea_data/backups/.",
                "Comprender cómo se migra la carpeta portable a una memoria USB o servicio en la nube."
            ]
        },
        "questionnaire": {
            "columns": 2,
            "questions": [
                {
                    "text": "¿Qué API utiliza Odisea para conectarse con blogs y sitios de WordPress?",
                    "options": ["a) XML-RPC obsoleto", "b) WordPress REST API v2 con contraseñas de aplicación", "c) Conexión directa a MySQL", "d) Envío por correo POP3"]
                },
                {
                    "text": "¿Qué token criptográfico genera Odisea en Rust para autenticar con Ghost Admin API?",
                    "options": ["a) Token OAuth1", "b) Tokens JWT (JSON Web Tokens) firmados en tiempo real", "c) Certificados SSL X.509", "d) Claves PGP"]
                },
                {
                    "text": "¿Qué función facilita pegar prosa con formato intacto en el editor web de Substack?",
                    "options": ["a) 'Export to Word'", "b) 'Copy for Substack' (portapapeles enriquecido MIME)", "c) 'Convert to PDF'", "d) 'Screenshot to clipboard'"]
                },
                {
                    "text": "¿Cómo se distingue en la Lista de Hojas un documento que ya ha sido publicado en la web?",
                    "options": ["a) Se pone el texto en color azul", "b) Muestra un micro-icono vectorial de avión de papel", "c) Aparece un candado cerrado", "d) Se bloquea la edición"]
                },
                {
                    "text": "¿Permite Odisea actualizar una entrada que ya fue publicada en WordPress o Ghost sin duplicarla?",
                    "options": ["a) No, siempre crea una entrada nueva", "b) Sí, detecta el ID remoto y actualiza título, cuerpo y metadatos", "c) Solo si se borra antes en la web", "d) Requiere editar en el navegador"]
                },
                {
                    "text": "¿Qué algoritmo de compresión de alto rendimiento utiliza Odisea para sus backups automáticos?",
                    "options": ["a) ZIP clásico", "b) Zstandard (.odiseabak)", "c) BZIP2", "d) Compresión LZW"]
                },
                {
                    "text": "¿En qué tres frecuencias temporales clasifica Odisea sus copias de seguridad continuas?",
                    "options": ["a) Minutaria, mensual y anual", "b) Horaria (hourly), diaria (daily) y semanal (weekly)", "c) Solo cuando el usuario lo pide", "d) Cada vez que se pulsa Guardar"]
                },
                {
                    "text": "¿Qué archivo preventivo genera Odisea antes de restaurar un snapshot de copia de seguridad?",
                    "options": ["a) backup_fatal.err", "b) library.pre_restore.bak", "c) recovery.sys", "d) restore.log"]
                },
                {
                    "text": "¿Qué tabla virtual de SQLite gestiona las búsquedas ultrarrápidas de texto completo en Odisea?",
                    "options": ["a) sheets_fulltext", "b) sheets_fts (módulo FTS5 con triggers atómicos)", "c) search_index_lucence", "d) text_master"]
                },
                {
                    "text": "¿Qué pasos se requieren para migrar Odisea a otro ordenador con Windows 11?",
                    "options": ["a) Reinstalar el programa y volver a escribir el registro de Windows", "b) Simplemente copiar la carpeta Odisea_Win11_Portable entera al nuevo equipo", "c) Exportar cada hoja una por una", "d) Solicitar una clave de licencia nueva"]
                }
            ]
        },
        "solutions": {
            "items": [
                {"correct_answer": "b) WordPress REST API v2 con contraseñas de aplicación", "explanation": "REST API v2 es el protocolo oficial moderno y seguro recomendado por la Fundación WordPress."},
                {"correct_answer": "b) Tokens JWT (JSON Web Tokens) firmados en tiempo real", "explanation": "Ghost Admin API requiere autenticación mediante tokens JWT firmados con el algoritmo HMAC-SHA256."},
                {"correct_answer": "b) 'Copy for Substack' (portapapeles enriquecido MIME)", "explanation": "La función inyecta simultáneamente las variantes text/html y text/plain compatibles con Substack."},
                {"correct_answer": "b) Muestra un micro-icono vectorial de avión de papel", "explanation": "El micro-badge del avión de papel es el distintivo visual canónico de publicación remota."},
                {"correct_answer": "b) Sí, detecta el ID remoto y actualiza título, cuerpo y metadatos", "explanation": "Odisea almacena el publish_status_json en SQLite vinculando la hoja al post remoto."},
                {"correct_answer": "b) Zstandard (.odiseabak)", "explanation": "Zstandard ofrece ratios de compresión excepcionales con un impacto insignificante en la CPU."},
                {"correct_answer": "b) Horaria (hourly), diaria (daily) y semanal (weekly)", "explanation": "Este esquema en 3 niveles asegura puntos de restauración tanto recientes como históricos."},
                {"correct_answer": "b) library.pre_restore.bak", "explanation": "Garantiza una red de seguridad infalible en caso de restaurar una copia equivocada."},
                {"correct_answer": "b) sheets_fts (módulo FTS5 con triggers atómicos)", "explanation": "FTS5 indexa tokens de palabras completas permitiendo búsquedas booleanas en milisegundos."},
                {"correct_answer": "b) Simplemente copiar la carpeta Odisea_Win11_Portable entera al nuevo equipo", "explanation": "El aislamiento total en ./odisea_data/ garantiza portabilidad 'plug and play' inmediata."}
            ]
        }
    }
