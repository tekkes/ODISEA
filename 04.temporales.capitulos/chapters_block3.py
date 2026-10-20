import sys
from pathlib import Path

SKILL_ROOT = Path(r"C:\Users\IsaNet\.gemini\config\skills\technical-book-pdf")
sys.path.insert(0, str(SKILL_ROOT / "scripts"))

from components import EditorialComponents as EC
from generate_diagram import TechnicalDiagrams as TD

def get_chapter_5():
    p1_html = f"""
    {EC.section_header("Proyectos, Grupos Jerárquicos y Taxonomía Editorial", 1, "5.1")}
    <p>La biblioteca de Odisea (Panel 1) trasciende la rígida estructura de carpetas tradicional para ofrecer un sistema de organización tridimensional concebido para proyectos de largo aliento. Un autor que escribe una novela histórica de cuatro volúmenes, una tesis doctoral o un manual técnico requiere compartimentar borradores, fuentes y material de descarte sin perder la visión de conjunto:</p>

    <ul>
        <li><strong>Proyectos:</strong> Entidades raíz con nombre propio, icono representativo (libro, pluma, código, engranaje) y paleta de color distintiva. Cada proyecto almacena sus grupos, hojas, palabras clave y preferencias de exportación predeterminadas.</li>
        <li><strong>Grupos Jerárquicos Multinivel:</strong> Carpetas estructuradas con soporte de anidamiento ilimitado. Cada grupo se clasifica bajo cuatro categorías semánticas:
            <ul>
                <li><em>Sección Principal (main):</em> Los capítulos y textos que forman el cuerpo central de la obra.</li>
                <li><em>Sección de Extras (extras):</em> Prólogos, epílogos, anexos, bibliografía y glosarios.</li>
                <li><em>Plantillas (templates):</em> Estructuras predefinidas para fichas de personajes, tramas o actas.</li>
                <li><em>Notas y Bocetos (notes):</em> Ideas sueltas, fragmentos de investigación e inspiración efímera.</li>
            </ul>
        </li>
        <li><strong>Palabras Clave (Keywords):</strong> Etiquetas transversales policromáticas asignadas a las hojas. Se muestran como micro-píldoras de 16px en la lista de documentos, permitiendo correlacionar tramas secundarias, estados de revisión o áreas temáticas.</li>
    </ul>

    {EC.callout(
        "DEFINICIÓN CLAVE · TAXONOMÍA EDITORIAL EN LA BASE SQLITE",
        "Toda la jerarquía de proyectos y grupos se gestiona de forma atómica en <code>library.odiseadb</code> con integridad referencial ON DELETE CASCADE. La reorganización de grupos mediante arrastre actualiza el campo <code>sort_order</code> en milisegundos sin bloquear la interfaz.",
        "definition"
    )}
    """

    p2_html = f"""
    {EC.section_header("Hojas Pegadas (Glued Sheets) y Modularidad de Capítulos", 1, "5.2")}
    <p>Uno de los mayores retos de la escritura de gran volumen es el dilema de la granularidad: si escribes toda una novela en un único archivo inmenso, desplazarse por el texto es agotador; si divides la obra en decenas de pequeños archivos, compilarlos y leerlos de continuo resulta engorroso. Odisea resuelve esta paradoja mediante las <strong>Hojas Pegadas (Glued Sheets)</strong>:</p>

    <ul>
        <li><strong>El Concepto de Unión Fluida:</strong> Al seleccionar una hoja y pulsar <strong>Ctrl+Shift+G</strong> (o activar la opción en el menú contextual), la hoja se vincula de manera indivisible con la hoja inmediatamente inferior. En la Lista de Hojas, las tarjetas unidas muestran una elegante barra vertical continua que certifica su fusión estructural.</li>
        <li><strong>Comportamiento en la Exportación:</strong> Durante la compilación o exportación a PDF, DOCX o ePub, Odisea concatena automáticamente todas las hojas pegadas como un único texto continuo, suprimiendo saltos forzados de página entre ellas o respetando separadores temáticos si se han declarado.</li>
        <li><strong>Ventaja para Escritores Profesionales:</strong> Puedes redactar cada escena, sub-apartado o diálogo en una hoja independiente de 300 a 600 palabras con su propio objetivo de escritura, y mantenerlas unidas como un solo capítulo formal dentro del libro.</li>
    </ul>

    {EC.callout(
        "HITO METODOLÓGICO · MODULARIDAD SIN FRICCIÓN",
        "Las hojas pegadas permiten reordenar escenas de una novela o secciones de un manual técnico con solo arrastrar una tarjeta arriba o abajo en la lista. Si decides despegar dos hojas, basta con pulsar nuevamente <strong>Ctrl+Shift+G</strong> para independizarlas al instante.",
        "milestone"
    )}
    """

    p3_html = f"""
    {EC.section_header("Filtros Inteligentes y Carpetas Externas Sincronizadas", 1, "5.3")}
    <p>Para recuperar información instantáneamente entre miles de documentos, Odisea incorpora dos herramientas de primer orden:</p>

    <p><strong>1. Filtros Inteligentes (Smart Filters):</strong> Búsquedas dinámicas guardadas en la Biblioteca que evalúan en tiempo real los metadatos de las hojas mediante reglas booleanas combinables:</p>
    <ul>
        <li>Hojas que contienen o excluyen determinadas palabras clave (Keywords).</li>
        <li>Hojas modificadas en las últimas 24 horas, semana o mes actual.</li>
        <li>Hojas con objetivos de escritura activos o metas completadas.</li>
        <li>Hojas marcadas como favoritas o publicadas en plataformas web.</li>
    </ul>

    <p><strong>2. Carpetas Externas (External Folders):</strong> Odisea permite vincular cualquier directorio del sistema de archivos de Windows 11 o carpetas sincronizadas en la nube (Dropbox, OneDrive, repositorios Git):</p>

    {EC.table(
        ["Modo de Carpeta Externa", "Formato en Disco", "Comportamiento y Preservación de Metadatos"],
        [
            ["Modo Markdown Estándar", "Archivos <code>.md</code> o <code>.txt</code>", "Lectura y escritura directa. Preserva frontmatter YAML intacto y almacena metadatos en comentarios HTML."],
            ["Modo Nativo Ulysses / Odisea", "Contenedores <code>.ulyz</code> / <code>.odisea</code>", "Almacén comprimido con texto Markdown XL íntegro, anotaciones al margen, notas al pie, objetivos e imágenes adjuntas."]
        ],
        ["28%", "22%", "50%"]
    )}

    {EC.callout(
        "CONSEJO TÉCNICO · WATCHER ASÍNCRONO CON EL CRATE NOTIFY",
        "El subsistema en Rust monitoriza las carpetas externas con el crate <code>notify</code>. Si un archivo Markdown es modificado, renombrado o creado externamente (por ejemplo, mediante un <code>git pull</code> o un editor externo), Odisea emite un evento interno en <strong>menos de 100 ms</strong> actualizando la vista sin recargar la aplicación.",
        "takeaway"
    )}
    """

    return {
        "number": 5,
        "title": "Gestión Documental, Hojas Pegadas y Carpetas Externas",
        "short_title": "ORGANIZACIÓN Y CARPETAS",
        "block": "BLOQUE III — ORGANIZACIÓN Y PRODUCTIVIDAD",
        "block_kicker": "BLOQUE III · ORGANIZACIÓN Y PRODUCTIVIDAD",
        "objectives": [
            "Organizar obras complejas mediante proyectos, grupos jerárquicos y secciones especializadas.",
            "Utilizar las Hojas Pegadas (Glued Sheets) con Ctrl+Shift+G para componer capítulos continuos.",
            "Diseñar Filtros Inteligentes basados en reglas dinámicas para localizar borradores al instante.",
            "Sincronizar carpetas externas de Windows 11 con watcher en tiempo real (<100 ms)."
        ],
        "pages": [
            {"header_section": "PROYECTOS Y TAXONOMÍA EDITORIAL", "html_content": p1_html},
            {"header_section": "HOJAS PEGADAS Y MODULARIDAD", "html_content": p2_html},
            {"header_section": "FILTROS INTELIGENTES Y CARPETAS", "html_content": p3_html}
        ],
        "summary": {
            "key_points": [
                "Los grupos admiten 4 roles semánticos: principal (main), extras, plantillas y notas de trabajo.",
                "Glued Sheets (Ctrl+Shift+G) unen hojas contiguas para exportarlas fusionadas como un único texto.",
                "Las palabras clave se muestran como micro-píldoras de colores facilitando la categorización cruzada.",
                "Los Smart Filters evalúan reglas booleanas dinámicas actualizando la vista sin demoras.",
                "Las carpetas externas admiten modo .md puro y contenedor nativo .ulyz con watcher asíncrono."
            ],
            "requirements": [
                "Dominar el atajo Ctrl+Shift+G para enlazar o independizar hojas consecutivas.",
                "Saber configurar un filtro inteligente para localizar borradores según palabras clave.",
                "Conocer la diferencia entre el modo .md plano y el contenedor .ulyz en carpetas externas."
            ]
        },
        "questionnaire": {
            "columns": 2,
            "questions": [
                {
                    "text": "¿Qué atajo de teclado permite unir o despegar dos hojas consecutivas (Glued Sheets)?",
                    "options": ["a) Ctrl + G", "b) Ctrl + Shift + G", "c) Alt + J", "d) Ctrl + U"]
                },
                {
                    "text": "¿Cómo se representa visualmente una unión de Hojas Pegadas en la Lista de Hojas?",
                    "options": ["a) Con un icono de clip", "b) Con una barra vertical continua entre los márgenes de las tarjetas", "c) Cambiando el texto a cursiva", "d) Ocultando la segunda hoja"]
                },
                {
                    "text": "¿Cuál de las siguientes NO es una categoría semántica de grupo en la Biblioteca?",
                    "options": ["a) main (sección principal)", "b) extras (anexos)", "c) trash_permanent (papelera destructiva)", "d) templates (plantillas)"]
                },
                {
                    "text": "¿Qué motor de monitorización de archivos en Rust detecta cambios en carpetas externas en <100 ms?",
                    "options": ["a) El crate notify", "b) Un bucle infinito con sleep()", "c) PowerShell FileSystemWatcher", "d) No detecta cambios en tiempo real"]
                },
                {
                    "text": "¿Qué extensión utiliza el contenedor nativo comprimido de Ulysses/Odisea en carpetas externas?",
                    "options": ["a) .zip", "b) .ulyz / .odisea", "c) .rar", "d) .7z"]
                },
                {
                    "text": "¿Qué sucede con el frontmatter YAML de un archivo .md estándar vinculado en una carpeta externa?",
                    "options": ["a) Se borra automáticamente", "b) Se preserva íntegramente al leer y guardar el documento", "c) Se convierte en una tabla", "d) Bloquea la apertura del archivo"]
                },
                {
                    "text": "¿Qué criterio de búsqueda puede evaluar un Filtro Inteligente (Smart Filter)?",
                    "options": ["a) Fecha de modificación", "b) Palabras clave asignadas", "c) Estado de objetivos de escritura", "d) Todas las anteriores son correctas"]
                },
                {
                    "text": "¿Cómo se compilan las Hojas Pegadas durante la exportación a PDF o DOCX?",
                    "options": ["a) Cada hoja sale en un archivo PDF distinto", "b) Se concatenan en un único flujo de texto continuo respetando la secuencia", "c) Solo se exporta la primera hoja", "d) Se genera un archivo ZIP"]
                },
                {
                    "text": "¿Dónde se guardan las relaciones de jerarquía y orden de los grupos en Odisea?",
                    "options": ["a) En un archivo INI", "b) En la tabla groups de library.odiseadb con ON DELETE CASCADE", "c) En el registro de Windows", "d) En la nube"]
                },
                {
                    "text": "¿Qué ventaja tiene subdividir un capítulo extenso en hojas pegadas breves?",
                    "options": ["a) Permite fijar objetivos de escritura individuales por cada escena o subsección", "b) Hace que el programa ocupe menos memoria", "c) Es obligatorio por el sistema", "d) Evita tener que usar palabras clave"]
                }
            ]
        },
        "solutions": {
            "items": [
                {"correct_answer": "b) Ctrl + Shift + G", "explanation": "Ctrl+Shift+G conmuta el estado glued_with_next en la base de datos y la interfaz."},
                {"correct_answer": "b) Con una barra vertical continua entre los márgenes de las tarjetas", "explanation": "El trazo vertical continuo une físicamente las tarjetas indicando su secuencia indivisible."},
                {"correct_answer": "c) trash_permanent (papelera destructiva)", "explanation": "Las 4 secciones son 'main', 'extras', 'templates' y 'notes'."},
                {"correct_answer": "a) El crate notify", "explanation": "El crate notify de Rust se enlaza a las APIs nativas del kernel de Windows para detectar eventos I/O al instante."},
                {"correct_answer": "b) .ulyz / .odisea", "explanation": ".ulyz es el paquete empaquetado canónico que almacena texto, metadatos y medios adjuntos."},
                {"correct_answer": "b) Se preserva íntegramente al leer y guardar el documento", "explanation": "Odisea respeta el encabezado YAML frontal para garantizar interoperabilidad con Hugo, Astro y Obsidian."},
                {"correct_answer": "d) Todas las anteriores son correctas", "explanation": "Los Smart Filters permiten combinar múltiples predicados de metadatos, estado y fechas."},
                {"correct_answer": "b) Se concatenan en un único flujo de texto continuo respetando la secuencia", "explanation": "El compilador fusiona los bloques de texto garantizando la continuidad de la lectura."},
                {"correct_answer": "b) En la tabla groups de library.odiseadb con ON DELETE CASCADE", "explanation": "La base SQLite garantiza que al suprimir un grupo padre se gestionen sus hijos de forma íntegra."},
                {"correct_answer": "a) Permite fijar objetivos de escritura individuales por cada escena o subsección", "explanation": "Facilita la metodología de micro-metas diarias sin fracturar la unidad del libro."}
            ]
        }
    }

def get_chapter_6():
    p1_html = f"""
    {EC.section_header("Métricas de Prosa y Ritmo de Lectura en Vivo", 1, "6.1")}
    <p>El dominio de la prosa requiere consciencia cuantitativa del ritmo, la longitud y la densidad de las oraciones. El <strong>Dashboard de Odisea (Panel 4)</strong> reúne un sofisticado laboratorio métrico que procesa el documento en tiempo real sin degradar el rendimiento del editor:</p>

    <ul>
        <li><strong>Contadores Cuantitativos Instantáneos:</strong>
            <ul>
                <li><strong>Palabras:</strong> Contadas mediante el estándar Unicode de segmentación léxica.</li>
                <li><strong>Caracteres con y sin espacios:</strong> Crucial para artículos periodísticos, convocatorias editoriales y límites estrictos de publicación.</li>
                <li><strong>Estructura Formal:</strong> Recuento exacto de Oraciones, Párrafos, Líneas y Páginas estimadas según el estándar editorial de 250 palabras por página.</li>
            </ul>
        </li>
        <li><strong>Velocidad y Tiempos de Lectura Estimados:</strong> Odisea calcula el tiempo que demandará la lectura de tu texto en tres ritmos calibrados:
            <ul>
                <li><em>Ritmo Lento (150 palabras/min):</em> Adecuado para discursos públicos, poesía o ponencias magistrales.</li>
                <li><em>Ritmo Medio (220 palabras/min):</em> Velocidad estándar de lectura silenciosa en adultos.</li>
                <li><em>Ritmo Rápido (300 palabras/min):</em> Lectura veloz orientada a escaneo visual de artículos técnicos.</li>
            </ul>
        </li>
        <li><strong>Índice de Legibilidad Flesch-Szigriszt:</strong> Evaluación analítica del nivel de dificultad léxica calibrada para el idioma español (desde estilo periodístico accesible hasta prosa técnica de alta complejidad).</li>
    </ul>

    {EC.callout(
        "BUENA PRÁCTICA · CONTROL DEL RITMO PROSÓDICO",
        "Alternar oraciones breves y contundentes con periodos subordinados más extensos dota al texto de musicalidad. El panel de métricas te ayuda a detectar párrafos excesivamente densos antes de pasar a la fase de edición estilística.",
        "practice"
    )}
    """

    p2_html = f"""
    {EC.section_header("Writing Goals y Anillos Circulares Progresivos SVG", 1, "6.2")}
    <p>La disciplina de escribir a diario se sustenta en el establecimiento de metas claras y alcanzables. El sistema de <strong>Writing Goals</strong> de Odisea transforma los objetivos abstractos en una experiencia visual motivadora mediante micro-anillos de progreso SVG proyectados en la barra de estado y en el Dashboard:</p>

    <p>Odisea admite tres modalidades de objetivo tanto para hojas individuales como para grupos enteros:</p>
    <ol>
        <li><strong>Al menos (At least):</strong> Fija una meta mínima indispensable (por ejemplo, 1,000 palabras por jornada de trabajo). Ideal para redactar el primer borrador de una novela.</li>
        <li><strong>Como máximo (At most):</strong> Impone un techo estricto (por ejemplo, 300 palabras para un resumen ejecutivo o 5,000 caracteres para una columna de prensa).</li>
        <li><strong>Aproximadamente (About):</strong> Define un rango objetivo con una tolerancia automática del ±10% alrededor de la cifra elegida.</li>
    </ol>

    {EC.callout(
        "HITO VISUAL · EL CÓDIGO DE COLOR CUATRICOLOR DEL PROGRESS RING",
        "El anillo de progreso SVG comunica el estado de tu objetivo al instante con cuatro transiciones cromáticas calibradas:<br>"
        "1. <strong>Naranja Cálido (#ff9500):</strong> Arranque de la sesión (del 0% al 30% del objetivo).<br>"
        "2. <strong>Azul Vibrante (#007aff):</strong> Escritura fluida en progreso (del 30% al 99%).<br>"
        "3. <strong>Verde Esmeralda (#34c759):</strong> ¡Objetivo completado con éxito! (100% de la meta).<br>"
        "4. <strong>Rojo Carmesí (#ff3b30):</strong> Advertencia de sobrepaso en la modalidad 'Como máximo'.",
        "milestone"
    )}

    <p>Además, al asignar una <strong>Fecha Límite (Deadline)</strong>, Odisea calcula automáticamente tu <em>cuota diaria requerida</em> en función de los días restantes y registra tu historial de escritura de los últimos 30 días para evaluar tu regularidad.</p>
    """

    p3_html = f"""
    {EC.section_header("El Árbol de Esquema (Outline) y Enlaces Entrantes (Backlinks)", 1, "6.3")}
    <p>Las otras dos pestañas esenciales del Dashboard potencian la visión global y la interconexión de tus textos:</p>

    <ul>
        <li><strong>Pestaña Esquema (Outline):</strong> Extrae dinámicamente todos los encabezados <code>#</code> a <code>######</code> presentes en la hoja activa (o en el conjunto de hojas pegadas). Se presentan como un árbol jerárquico indentado. Al hacer clic en cualquier sección, el editor se desplaza suavemente hasta ella situando el cursor en el encabezado.</li>
        <li><strong>Pestaña Vista General (Overview):</strong> Consolida en una lista filtrable todos los enlaces externos, notas al pie, anotaciones y medios adjuntos de la hoja, permitiendo comprobar su validez sin tener que rastrearlos manualmente por los párrafos.</li>
        <li><strong>Pestaña Enlaces Entrantes (Backlinks):</strong> Odisea implementa enlaces wiki internos bidireccionales mediante <code>[[Título de Hoja]]</code>. Esta pestaña lista instantáneamente todos los documentos de la biblioteca que enlazan hacia la hoja activa, fomentando la creación de redes de conocimiento no lineales (Zettelkasten / Knowledge Graph).</li>
    </ul>

    {EC.table(
        ["Pestaña del Dashboard", "Atajo de Acceso", "Contenido y Funciones Principales"],
        [
            ["Progreso y Metas", "Panel 4 · Tab 1", "Contadores instantáneos, Writing Goals, anillos SVG, cuota diaria e historial"],
            ["Esquema (Outline)", "Panel 4 · Tab 2", "Navegación jerárquica instantánea por encabezados H1 a H6"],
            ["Vista General", "Panel 4 · Tab 3", "Auditoría de Enlaces, Notas al pie (FN), Anotaciones y Medios adjuntos"],
            ["Enlaces Entrantes", "Panel 4 · Tab 4", "Rastreo bidireccional de Backlinks entre hojas interconectadas"]
        ],
        ["25%", "25%", "50%"]
    )}
    """

    return {
        "number": 6,
        "title": "Dashboard de Escritura, Métricas y Objetivos (Goals)",
        "short_title": "MÉTRICAS Y OBJETIVOS",
        "block": "BLOQUE III — ORGANIZACIÓN Y PRODUCTIVIDAD",
        "block_kicker": "BLOQUE III · ORGANIZACIÓN Y PRODUCTIVIDAD",
        "objectives": [
            "Interpretar las estadísticas en tiempo real: palabras, caracteres, oraciones y tiempo de lectura.",
            "Configurar objetivos cuantitativos de escritura con fecha límite y cuota diaria automática.",
            "Interpretar el código de color de 4 estados en los anillos circulares de progreso SVG.",
            "Navegar ágilmente mediante el árbol de esquema (Outline) y rastrear enlaces entrantes (Backlinks)."
        ],
        "pages": [
            {"header_section": "MÉTRICAS Y RITMO DE LECTURA", "html_content": p1_html},
            {"header_section": "WRITING GOALS Y ANILLOS SVG", "html_content": p2_html},
            {"header_section": "ESQUEMA Y ENLACES ENTRANTES", "html_content": p3_html}
        ],
        "summary": {
            "key_points": [
                "El Dashboard (Ctrl+4) proporciona métricas completas de palabras, caracteres y legibilidad en vivo.",
                "Ofrece tiempos de lectura estimados en tres ritmos: Lento (150 ppm), Medio (220 ppm) y Rápido (300 ppm).",
                "Writing Goals admite 3 modos: Al menos (mínimo), Como máximo (límite) y Aproximadamente (±10%).",
                "El anillo SVG cambia de color: Naranja (inicio), Azul (progreso), Verde (logro) y Rojo (exceso).",
                "El Outline permite saltar entre encabezados H1..H6 y los Backlinks gestionan conexiones bidireccionales."
            ],
            "requirements": [
                "Saber fijar un Writing Goal en una hoja y asignar una fecha límite.",
                "Identificar el significado de cada color en el indicador circular de progreso.",
                "Utilizar la pestaña Outline para desplazarse por documentos extensos."
            ]
        },
        "questionnaire": {
            "columns": 2,
            "questions": [
                {
                    "text": "¿Qué velocidad en palabras por minuto se asigna al ritmo de lectura 'Medio' en Odisea?",
                    "options": ["a) 150 palabras/min", "b) 220 palabras/min", "c) 300 palabras/min", "d) 500 palabras/min"]
                },
                {
                    "text": "¿Qué color adopta el anillo SVG cuando se alcanza exactamente el 100% de la meta de escritura?",
                    "options": ["a) Azul vibrante", "b) Verde esmeralda", "c) Naranja cálido", "d) Amarillo brillante"]
                },
                {
                    "text": "¿En qué modalidad de Writing Goal se torna rojo el indicador si se rebasa la cifra fijada?",
                    "options": ["a) En modo 'Al menos'", "b) En modo 'Como máximo' (At most)", "c) En modo 'Aproximadamente'", "d) En ninguna"]
                },
                {
                    "text": "¿Qué calcula Odisea automáticamente al fijar una fecha límite (Deadline) para un objetivo?",
                    "options": ["a) El coste de impresión", "b) La cuota diaria recomendada de palabras", "c) El tamaño del archivo en disco", "d) La fecha de caducidad"]
                },
                {
                    "text": "¿Qué muestra la pestaña 'Outline' en el Dashboard de Odisea?",
                    "options": ["a) La lista de archivos eliminados", "b) El árbol jerárquico de encabezados H1 a H6 para navegación instantánea", "c) La paleta de colores del tema", "d) Las contraseñas guardadas"]
                },
                {
                    "text": "¿Qué tolerancia de variación admite el modo de objetivo 'Aproximadamente'?",
                    "options": ["a) ±2%", "b) ±10% alrededor de la cifra objetivo", "c) ±25%", "d) ±50%"]
                },
                {
                    "text": "¿Cómo se crea un enlace bidireccional hacia otra hoja de la biblioteca en Markdown XL?",
                    "options": ["a) Mediante [[Título de la Hoja]]", "b) Con @link:hoja", "c) Mediante un comando FTP", "d) Arrastrando el ejecutable"]
                },
                {
                    "text": "¿Qué información recopila la pestaña 'Vista General' (Overview)?",
                    "options": ["a) El clima local", "b) La lista consolidada de enlaces, notas al pie, anotaciones y medios adjuntos", "c) Los correos del usuario", "d) El historial de navegación web"]
                },
                {
                    "text": "¿Cuántas palabras por página estándar utiliza Odisea para estimar la paginación impresa?",
                    "options": ["a) 100 palabras", "b) 250 palabras por página estándar", "c) 500 palabras", "d) 1000 palabras"]
                },
                {
                    "text": "¿Dónde se reflejan visualmente los micro-anillos de progreso además de en el Dashboard?",
                    "options": ["a) En la barra de título de Windows", "b) En la tarjeta de la hoja en la Lista de Hojas y en la barra de estado", "c) En el fondo de pantalla", "d) En el menú inicio"]
                }
            ]
        },
        "solutions": {
            "items": [
                {"correct_answer": "b) 220 palabras/min", "explanation": "220 ppm es la media internacional estandarizada para lectura comprensiva de prosa en adultos."},
                {"correct_answer": "b) Verde esmeralda", "explanation": "El verde esmeralda (#34c759) certifica visualmente que la meta diaria o capitular ha sido cumplida."},
                {"correct_answer": "b) En modo 'Como máximo' (At most)", "explanation": "En 'Como máximo', el rojo advierte que el texto ha excedido el límite editorial permitido."},
                {"correct_answer": "b) La cuota diaria recomendada de palabras", "explanation": "El algoritmo divide las palabras pendientes entre los días restantes hasta la fecha límite."},
                {"correct_answer": "b) El árbol jerárquico de encabezados H1 a H6 para navegación instantánea", "explanation": "Outline permite desplazarse por capítulos de decenas de miles de palabras en milisegundos."},
                {"correct_answer": "b) ±10% alrededor de la cifra objetivo", "explanation": "El modo 'Aproximadamente' considera cumplida la meta dentro del margen del 90% al 110%."},
                {"correct_answer": "a) Mediante [[Título de la Hoja]]", "explanation": "La sintaxis wiki [[...]] enlaza documentos alimentando la tabla interna de internal_links."},
                {"correct_answer": "b) La lista consolidada de enlaces, notas al pie, anotaciones y medios adjuntos", "explanation": "Permite auditar todos los recursos complementarios del documento desde una sola vista."},
                {"correct_answer": "b) 250 palabras por página estándar", "explanation": "250 palabras por página es el estándar editorial clásico de cuartilla mecanografiada."},
                {"correct_answer": "b) En la tarjeta de la hoja en la Lista de Hojas y en la barra de estado", "explanation": "El autor percibe el progreso de cada documento sin necesidad de abrir el Dashboard lateral."}
            ]
        }
    }
