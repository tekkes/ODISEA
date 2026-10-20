import sys
from pathlib import Path

SKILL_ROOT = Path(r"C:\Users\IsaNet\.gemini\config\skills\technical-book-pdf")
sys.path.insert(0, str(SKILL_ROOT / "scripts"))
sys.path.insert(0, str(Path(__file__).parent.resolve()))

from components import EditorialComponents as EC
from generate_diagram import TechnicalDiagrams as TD
from img_helper import screenshot_figure

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
    {EC.section_header("El Modal de Exportación Editorial y Publicación (Ctrl+E)", 1, "7.3")}
    <p>Al pulsar <strong>Ctrl+E</strong> o seleccionar el botón de exportación en la barra superior, Odisea abre el <strong>Modal de Previsualización y Exportación Editorial</strong> (<code>ExportPreviewModal.tsx</code>). Esta interfaz permite auditar el documento renderizado en tiempo real antes de generar el archivo final:</p>

    {screenshot_figure(
        "07_modal_exportacion_publicacion",
        "Captura real del Modal de Exportación y Publicación (Ctrl+E). Incluye selector de formatos (PDF, DOCX, ePub, HTML), previsualizador en vivo con motor ULSS compilado y pestaña de publicación web.",
        "7.1",
        max_height_mm=88
    )}

    {EC.table(
        ["Control / Pestaña", "Función Técnica", "Opciones y Parámetros Disponibles"],
        [
            ["<strong>Selector de Formato</strong>", "Elige el motor de compilación de salida.", "Pestañas: PDF, DOCX, ePub, HTML, RTF y Publicación Web."],
            ["<strong>Desplegable de Estilos</strong>", "Aplica hojas de estilo .ulss al manuscrito.", "Selección instantánea entre los 11 estilos preinstalados."],
            ["<strong>Previsualización en Vivo</strong>", "Auditoría visual idéntica al documento final.", "Zoom dinámico, foliación y navegación de páginas."],
            ["<strong>Configuración de Página</strong>", "Ajuste de parámetros físicos del documento.", "Formatos A4, Letter, A5; orientación y márgenes."],
            ["<strong>Botón 'Exportar'</strong>", "Compila y guarda el archivo en disco.", "Destino automático en ./odisea_data/exports/."]
        ],
        ["26%", "38%", "36%"]
    )}
    """

    p4_html = f"""
    {EC.section_header("Tipografía Avanzada: Rejilla Base y Maquetación Editorial", 1, "7.4")}
    <p>La calidad estética de una publicación radica en la regularidad rítmica de sus líneas. El motor de diseño tipográfico de Odisea introduce conceptos propios de la alta tipografía que lo sitúan a la vanguardia de los entornos de redacción en Windows 11:</p>

    <ul>
        <li><strong>Alineación a Rejilla Base (Baseline Grid Alignment):</strong> Todas las líneas de texto, independientemente de que se trate de encabezados de gran tamaño, subtítulos, citas o tablas, se fuerzan a encajar en una rejilla vertical uniforme (generalmente de 12 a 16 puntos). Esto evita que las líneas de texto de páginas opuestas o columnas adyacentes queden desfasadas visualmente.</li>
        <li><strong>Control de Huérfanas y Viudas (Widows & Orphans):</strong> En la compilación a PDF, el motor aplica de forma predeterminada la regla <code>orphans: 2; widows: 2;</code>, impidiendo que una sola línea de texto quede descolgada al final o al inicio de una página.</li>
        <li><strong>Letras Capitulares (Drop Caps):</strong> Definidas mediante el selector <code>paragraph:first-child::first-letter</code> en las hojas ULSS, estilizando la letra inicial con un tamaño equivalente a 3 líneas de texto y sangría contigua estilizada.</li>
    </ul>

    {EC.callout(
        "REGLA DE CONVERSIÓN VECTORIAL PURA",
        "Durante la generación de PDFs, todo el texto se compila como trazados tipográficos vectoriales seleccionables, indexables y compatibles con la norma ISO 19005-1 (PDF/A) para preservación documental a largo plazo.",
        "takeaway"
    )}
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
            {"header_section": "EL MODAL DE PREVISUALIZACIÓN", "html_content": p3_html},
            {"header_section": "TIPOGRAFÍA Y REJILLA BASE", "html_content": p4_html}
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
                "Localizar los estilos preinstalados en la carpeta ./odisea_data/styles/.",
                "Abrir el modal de previsualización mediante el atajo Ctrl+E.",
                "Aprender a conmutar entre estilos ULSS para comparar resultados tipográficos."
            ]
        },
        "questionnaire": {
            "columns": 2,
            "questions": [
                {
                    "text": "¿Qué extensión tienen las hojas de estilo tipográfico nativas de Ulysses y Odisea?",
                    "options": ["a) .css", "b) .ulss", "c) .sass", "d) .theme"]
                },
                {
                    "text": "¿En qué lenguaje de programación está implementado el motor de compilación ULSS de Odisea?",
                    "options": ["a) Python", "b) Rust nativo", "c) JavaScript en el navegador", "d) C++"]
                },
                {
                    "text": "¿Qué regla ULSS aplica sangría solo a partir del segundo párrafo de un capítulo?",
                    "options": ["a) paragraph + paragraph { first-line-indent: ... }", "b) paragraph:all { indent: true }", "c) indent-second: 0.5in", "d) p2 { margin-left: 20px }"]
                },
                {
                    "text": "¿Cuántas hojas de estilo .ulss canónicas se incluyen preinstaladas en Odisea?",
                    "options": ["a) 3 estilos", "b) 11 estilos", "c) 25 estilos", "d) 50 estilos"]
                },
                {
                    "text": "¿Qué atajo de teclado abre directamente el modal de Previsualización y Exportación?",
                    "options": ["a) Ctrl + Shift + E", "b) Ctrl + E", "c) Alt + X", "d) Ctrl + P"]
                },
                {
                    "text": "¿Qué tipografía base utiliza la hoja de estilo 'Novel (Manuscript)' de serie?",
                    "options": ["a) Arial", "b) Courier New a doble espacio", "c) Comic Sans", "d) Papyrus"]
                },
                {
                    "text": "¿Cuál es la función del resolutor de cascada (resolver.rs) en el motor ULSS?",
                    "options": ["a) Borrar archivos temporales", "b) Propagar la herencia desde defaults hacia selectores específicos", "c) Encriptar el PDF", "d) Descargar fuentes de internet"]
                },
                {
                    "text": "¿Qué formato de libro electrónico estándar genera Odisea para lectores e-reader?",
                    "options": ["a) MOBI antiguo", "b) ePub 3.0 con tabla de contenidos", "c) FB2", "d) AZW3"]
                },
                {
                    "text": "¿Qué estándar internacional de preservación documental cumple el exportador a PDF?",
                    "options": ["a) ISO 9001", "b) ISO 19005-1 (PDF/A vectorial)", "c) W3C WCAG 1.0", "d) POSIX 2008"]
                },
                {
                    "text": "¿En qué carpeta relativa se guardan los archivos generados por defecto?",
                    "options": ["a) C:\\Mis Documentos", "b) ./odisea_data/exports/", "c) %TEMP%", "d) Escritorio"]
                }
            ]
        },
        "solutions": {
            "items": [
                {"correct_answer": "b) .ulss", "explanation": "El formato .ulss (Ulysses Style Sheet) define la tipografía y márgenes editoriales."},
                {"correct_answer": "b) Rust nativo", "explanation": "El motor en Rust compila y procesa el AST tipográfico en milisegundos con seguridad de memoria."},
                {"correct_answer": "a) paragraph + paragraph { first-line-indent: ... }", "explanation": "El selector adyacente identifica cualquier párrafo precedido por otro párrafo."},
                {"correct_answer": "b) 11 estilos", "explanation": "Odisea incluye 11 hojas de estilo canónicas optimizadas para novelas, tesis, reportes y manuales."},
                {"correct_answer": "b) Ctrl + E", "explanation": "Ctrl+E lanza la previsualización editorial con conmutador de estilos y formatos."},
                {"correct_answer": "b) Courier New a doble espacio", "explanation": "Es el estándar tradicional exigido por agencias literarias y editoriales comerciales."},
                {"correct_answer": "b) Propagar la herencia desde defaults hacia selectores específicos", "explanation": "Garantiza que las propiedades comunes se hereden sin duplicar declaraciones."},
                {"correct_answer": "b) ePub 3.0 con tabla de contenidos", "explanation": "ePub 3 es el estándar moderno adoptado por Apple Books, Google Play y Kobo."},
                {"correct_answer": "b) ISO 19005-1 (PDF/A vectorial)", "explanation": "Garantiza fidelidad visual idéntica en cualquier visor y preservación a largo plazo."},
                {"correct_answer": "b) ./odisea_data/exports/", "explanation": "Mantiene el aislamiento del paquete portable en su carpeta relativa de datos."}
            ]
        }
    }

def get_chapter_8():
    p1_html = f"""
    {EC.section_header("Arquitectura de Conectividad Cloud y Protocolos de Publicación", 1, "8.1")}
    <p>Para el ensayista moderno, el periodista digital o el creador de newsletters, redactar es solo la mitad del viaje; la otra mitad es difundir las ideas en las plataformas de mayor audiencia. Odisea incorpora un subsistema de <strong>Publicación Directa en la Web</strong> desacoplado y seguro:</p>

    <ul>
        <li><strong>Conectores Nativos en Rust:</strong> A diferencia de extensiones vulnerables de terceros, los conectores de publicación de Odisea están escritos en Rust en <code>src-tauri/src/publishing/</code>, garantizando transferencias cifradas con TLS 1.3 sin intermediarios ni telemetría.</li>
        <li><strong>Plataformas Compatibles de Serie:</strong>
            <ul>
                <li><strong>WordPress (REST API v2):</strong> Publicación en sitios autoalojados (WordPress.org) o en WordPress.com, con autenticación mediante contraseñas de aplicación (<em>Application Passwords</em>).</li>
                <li><strong>Ghost (Admin API v4/v5):</strong> Conexión con blogs modernos mediante tokens JWT generados localmente.</li>
                <li><strong>Medium (OAuth2 / Integration Tokens):</strong> Envío directo a perfiles personales o publicaciones asociadas.</li>
                <li><strong>Micro.blog (Micropub Protocol):</strong> Publicación ágil en el estándar abierto del Fediverso e IndieWeb.</li>
                <li><strong>Substack / Newsletters:</strong> Exportación formateada lista para entrega por correo electrónico con maquetación limpia.</li>
            </ul>
        </li>
    </ul>

    {EC.callout(
        "DEFINICIÓN CLAVE · SEGURIDAD DE CREDENCIALES PORTABLES",
        "Las credenciales y tokens de acceso se almacenan de forma cifrada en <code>./odisea_data/config.toml</code> utilizando criptografía AES-256-GCM. Al mover la carpeta portable de un ordenador a otro, tus credenciales viajan contigo sin exponerse en el Administrador de Credenciales de Windows ni en la nube.",
        "definition"
    )}
    """

    p2_html = f"""
    {EC.section_header("Flujo Operativo de Publicación desde Odisea", 1, "8.2")}
    <p>El proceso para difundir un artículo o capítulo desde Odisea está diseñado para completarse en menos de diez segundos sin salir de la aplicación:</p>

    <ol>
        <li><strong>Invocación Rápida (Ctrl+Shift+P):</strong> Pulsa <code>Ctrl+Shift+P</code> o accede a la pestaña <em>Publicar</em> dentro del modal de exportación (<code>Ctrl+E</code>).</li>
        <li><strong>Selección de Plataforma y Cuenta:</strong> Elige en el desplegable la cuenta de destino (por ejemplo, <em>Blog Corporativo Ghost</em> o <em>Revista WordPress</em>).</li>
        <li><strong>Configuración de Metadatos Editoriales:</strong>
            <ul>
                <li><em>Título del Post:</em> Se toma automáticamente del primer encabezado <code># </code> de la hoja.</li>
                <li><em>Slug de URL:</em> Generación automática normalizada (ejemplo: <code>/el-manifiesto-de-prosa-pura</code>).</li>
                <li><em>Extracto / Sumario:</em> Tomado de las dos primeras oraciones o definido manualmente.</li>
                <li><em>Etiquetas (Tags):</em> Las palabras clave de Odisea se convierten automáticamente en tags de la plataforma.</li>
            </ul>
        </li>
        <li><strong>Estado de Publicación:</strong> Selecciona entre publicar como <strong>Borrador (Draft)</strong> para una última revisión en el panel web, publicar como <strong>Privado</strong> o publicar de forma <strong>Pública e Inmediata</strong>.</li>
        <li><strong>Subida Automática de Medios:</strong> Las imágenes asociadas a la hoja en <code>./odisea_data/attachments/</code> se cargan a la biblioteca multimedia del CMS remoto y sus enlaces se sustituyen de forma transparente.</li>
    </ol>
    """

    p3_html = f"""
    {EC.section_header("Registro y Auditoría del Estado de Publicación", 1, "8.3")}
    <p>Una vez completada la publicación, Odisea registra la trazabilidad del documento en su base relacional <code>library.odiseadb</code> para evitar duplicidades accidentales o desincronizaciones:</p>

    <ul>
        <li><strong>Micro-Badge de Avión de Papel:</strong> En la Lista de Hojas (Panel 2), la tarjeta del documento muestra un elegante icono vectorial de 14px de un avión de papel, certificando que el manuscrito ya vive en la web.</li>
        <li><strong>Sincronización Bidireccional de Estado:</strong> Al reabrir el modal de publicación sobre una hoja ya publicada, Odisea ofrece dos acciones inmediatas: <em>Actualizar Post Existente</em> (sobrescribiendo cambios) o <em>Ver en Navegador</em> (abriendo la URL pública directa).</li>
        <li><strong>Historial de Envíos:</strong> Cada evento de publicación guarda un registro con timestamp ISO 8601, plataforma de destino, código de respuesta HTTP del servidor y URL asignada.</li>
    </ul>

    {EC.callout(
        "BUENA PRÁCTICA · FLUJO BORRADOR SEGURO",
        "Se recomienda publicar siempre inicialmente en estado <strong>Borrador (Draft)</strong>. Esto te permite verificar la maquetación final en el tema visual específico de tu sitio web antes de notificar a tus suscriptores.",
        "practice"
    )}
    """

    p4_html = f"""
    {EC.section_header("Ciclo de Vida Portable, Actualizaciones y Mantenimiento", 1, "8.4")}
    <p>Mantener una suite de software profesional en Windows 11 durante años exige un ciclo de vida predecible y procedimientos de actualización que no comprometan la biblioteca del autor:</p>

    <ul>
        <li><strong>Actualización del Binario Portable:</strong> Para actualizar Odisea a una versión superior (por ejemplo, de v1.0.1 a futuras versiones), el usuario únicamente debe descargar el nuevo archivo <code>Odisea.exe</code> y sustituir el binario existente en la carpeta <code>Odisea_Win11_Portable/</code>. La carpeta <code>./odisea_data/</code> con todos tus escritos, estilos y copias permanecerá intacta.</li>
        <li><strong>Migraciones Automáticas de Esquema SQLite:</strong> Cada versión nueva incorpora scripts de migración que se ejecutan al vuelo al detectar un <code>PRAGMA user_version</code> anterior, agregando columnas o tablas sin riesgo de pérdida de datos.</li>
        <li><strong>Auditoría de Integridad SHA-256:</strong> Cada versión oficial se entrega acompañada del archivo <code>CERTIFICADO_CALIDAD_ODISEA.md</code>, que contiene el hash criptográfico oficial para verificar que el binario no ha sido manipulado por malware.</li>
    </ul>

    {EC.table(
        ["Componente de Datos", "Ubicación en ./odisea_data/", "Estrategia de Copia y Preservación"],
        [
            ["Biblioteca Relacional", "<code>library.odiseadb</code>", "Respaldada automáticamente por SQLite WAL y backups Zstd."],
            ["Hojas de Estilo Propias", "<code>styles/*.ulss</code>", "Archivos de texto editables con cualquier editor de código."],
            ["Temas Personalizados", "<code>themes/*.ultheme</code>", "Ficheros JSON/CSS independientes copiables entre equipos."],
            ["Archivos e Imágenes", "<code>attachments/</code>", "Medios físicos clasificados por identificador SHA-256."],
            ["Copias de Seguridad", "<code>backups/weekly/*.odiseabak</code>", "Archivos zstd autónomos restaurables en cualquier momento."]
        ],
        ["28%", "34%", "38%"]
    )}
    """

    return {
        "number": 8,
        "title": "Conectores de Publicación Web y Mantenimiento Portable",
        "short_title": "PUBLICACIÓN WEB Y MANTENIMIENTO",
        "block": "BLOQUE IV — MAQUETACIÓN EDITORIAL Y PUBLICACIÓN",
        "block_kicker": "BLOQUE IV · MAQUETACIÓN EDITORIAL",
        "objectives": [
            "Configurar los conectores web nativos en Rust para WordPress, Ghost, Medium y Micro.blog.",
            "Publicar manuscritos en la web con subida automática de imágenes y conversión de tags.",
            "Interpretar los micro-badges de publicación y gestionar el enlace con posts remotos.",
            "Ejecutar actualizaciones del binario Odisea.exe y políticas de respaldo de ./odisea_data/."
        ],
        "pages": [
            {"header_section": "CONECTIVIDAD CLOUD Y PROTOCOLOS", "html_content": p1_html},
            {"header_section": "FLUJO OPERATIVO DE PUBLICACIÓN", "html_content": p2_html},
            {"header_section": "REGISTRO Y ESTADO DE PUBLICACIÓN", "html_content": p3_html},
            {"header_section": "MANTENIMIENTO DEL PAQUETE PORTABLE", "html_content": p4_html}
        ],
        "summary": {
            "key_points": [
                "Los conectores de publicación en Rust se comunican directamente con WordPress, Ghost, Medium y Micro.blog.",
                "Las credenciales viajan cifradas con AES-256-GCM en el archivo relativo ./odisea_data/config.toml.",
                "El atajo Ctrl+Shift+P publica en 10 segundos convirtiendo encabezados, imágenes y tags.",
                "El micro-badge del avión de papel certifica en la Lista de Hojas que el documento ya está publicado.",
                "Para actualizar Odisea, solo se reemplaza Odisea.exe; la carpeta ./odisea_data/ conserva todo el trabajo."
            ],
            "requirements": [
                "Configurar una cuenta de publicación en la pestaña 'Publicar' del modal Ctrl+E.",
                "Publicar un artículo de prueba en estado Borrador (Draft).",
                "Comprobar la creación de backups Zstandard en la carpeta ./odisea_data/backups/."
            ]
        },
        "questionnaire": {
            "columns": 2,
            "questions": [
                {
                    "text": "¿Qué atajo de teclado abre directamente la función de Publicación en la Web?",
                    "options": ["a) Ctrl + Shift + P", "b) Ctrl + W", "c) Alt + P", "d) Ctrl + F10"]
                },
                {
                    "text": "¿Qué algoritmo de cifrado protege las credenciales de publicación en config.toml?",
                    "options": ["a) Texto plano", "b) AES-256-GCM", "c) MD5", "d) Base64 simple"]
                },
                {
                    "text": "¿Qué plataforma de publicación abierta del Fediverso soporta Odisea de serie?",
                    "options": ["a) Micro.blog (Micropub)", "b) Blogger antiguo", "c) MySpace", "d) GeoCities"]
                },
                {
                    "text": "¿Qué indicador visual certifica en la Lista de Hojas que un texto ha sido publicado?",
                    "options": ["a) Una campana", "b) Un avión de papel", "c) Un candado", "d) Un globo terráqueo"]
                },
                {
                    "text": "¿Cómo se gestionan las imágenes embebidas en una hoja al publicarla en WordPress o Ghost?",
                    "options": ["a) Se borran", "b) Se suben a la biblioteca del CMS y se reemplaza el enlace automáticamente", "c) Se convierten a enlaces rotos", "d) Hay que subirlas a mano"]
                },
                {
                    "text": "¿Qué estado de publicación se recomienda seleccionar para una verificación final?",
                    "options": ["a) Borrador (Draft)", "b) Público inmediato", "c) Destructivo", "d) Desactivado"]
                },
                {
                    "text": "¿Qué procedimiento se sigue para actualizar Odisea a una versión superior?",
                    "options": ["a) Formatear el disco duro", "b) Reemplazar el archivo Odisea.exe conservando la carpeta ./odisea_data/", "c) Reinstalar Windows 11", "d) Ejecutar un instalador MSI"]
                },
                {
                    "text": "¿Qué mecanismo garantiza que la base de datos se adapte a nuevas versiones sin pérdidas?",
                    "options": ["a) PRAGMA user_version y migraciones automáticas al vuelo", "b) Borrado de la base antigua", "c) Conversión a XML", "d) No es posible"]
                },
                {
                    "text": "¿Qué tipo de autenticación se utiliza preferentemente con WordPress REST API v2?",
                    "options": ["a) Tu contraseña personal de correo", "b) Application Passwords (contraseñas de aplicación)", "c) Certificado en tarjeta inteligente", "d) Sin autenticación"]
                },
                {
                    "text": "¿Qué archivo certifica el hash SHA-256 del binario oficial de Odisea?",
                    "options": ["a) CERTIFICADO_CALIDAD_ODISEA.md", "b) checksum.log", "c) readme.doc", "d) license.txt"]
                }
            ]
        },
        "solutions": {
            "items": [
                {"correct_answer": "a) Ctrl + Shift + P", "explanation": "Ctrl+Shift+P lanza directamente el asistente de publicación web rápida."},
                {"correct_answer": "b) AES-256-GCM", "explanation": "Cifra los tokens con autenticación para impedir accesos no autorizados a tus blogs."},
                {"correct_answer": "a) Micro.blog (Micropub)", "explanation": "Micro.blog implementa el estándar abierto W3C Micropub promovido por la comunidad IndieWeb."},
                {"correct_answer": "b) Un avión de papel", "explanation": "El micro-badge del avión de papel indica que el contenido tiene una réplica activa en la red."},
                {"correct_answer": "b) Se suben a la biblioteca del CMS y se reemplaza el enlace automáticamente", "explanation": "El conector de Odisea sube las imágenes binarias y reescribe los enlaces a las URLs del servidor."},
                {"correct_answer": "a) Borrador (Draft)", "explanation": "Permite auditar el artículo en el diseño web real antes de que se envíe a los lectores."},
                {"correct_answer": "b) Reemplazar el archivo Odisea.exe conservando la carpeta ./odisea_data/", "explanation": "Al residir toda la persistencia en ./odisea_data/, la actualización es instantánea y no destructiva."},
                {"correct_answer": "a) PRAGMA user_version y migraciones automáticas al vuelo", "explanation": "SQLite comprueba la versión del esquema y ejecuta únicamente las sentencias DDL pendientes."},
                {"correct_answer": "b) Application Passwords (contraseñas de aplicación)", "explanation": "Permiten revocar el acceso a la aplicación sin cambiar la clave maestra del usuario."},
                {"correct_answer": "a) CERTIFICADO_CALIDAD_ODISEA.md", "explanation": "El certificado oficial audita las características técnicas, el hash SHA-256 y la portabilidad."}
            ]
        }
    }
