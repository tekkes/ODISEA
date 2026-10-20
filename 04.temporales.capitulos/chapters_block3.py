import sys
from pathlib import Path

SKILL_ROOT = Path(r"C:\Users\IsaNet\.gemini\config\skills\technical-book-pdf")
sys.path.insert(0, str(SKILL_ROOT / "scripts"))
sys.path.insert(0, str(Path(__file__).parent.resolve()))

from components import EditorialComponents as EC
from generate_diagram import TechnicalDiagrams as TD
from img_helper import screenshot_figure

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
    </ul>

    <p><strong>2. Carpetas Externas Vinculadas (External Folders):</strong> Odisea permite anclar cualquier directorio de tu disco duro (incluyendo carpetas compartidas de Dropbox, OneDrive, Nextcloud o repositorios Git) directamente en el Panel 1 de la Biblioteca:</p>
    <ul>
        <li>Odisea lee y edita los archivos de texto plano (.md, .txt) directamente en su ubicación de origen, sin obligar a importarlos ni duplicarlos en la base de datos interna.</li>
        <li>Un vigilante nativo de sistema de archivos (<em>File Watcher</em> en Rust) detecta cualquier modificación externa y actualiza la vista de Odisea en menos de 50 milisegundos.</li>
    </ul>

    {EC.callout(
        "CONSEJO DE COLABORACIÓN PROFESIONAL",
        "Al vincular una carpeta externa alojada en un repositorio Git corporativo o en OneDrive, puedes redactar con la ergonomía superior de Odisea mientras tus colaboradores leen o integran los mismos archivos Markdown en sus flujos de integración continua.",
        "practice"
    )}
    """

    p4_html = f"""
    {EC.section_header("El Modal de Historial de Navegación (Ctrl+H) en Detalle", 1, "5.4")}
    <p>A medida que la biblioteca crece con cientos de documentos, saltar entre capítulos o consultar fichas de investigación recientes requiere una vía ultrarrápida. El nuevo <strong>Modal de Historial de Navegación (Ctrl+H)</strong> resuelve esta necesidad con precisión táctica:</p>

    {screenshot_figure(
        "03_modal_historial_navegacion",
        "Captura real del Modal de Historial de Navegación (Ctrl+H). Permite filtrar por tipo (Hojas, Proyectos, Todo), buscar por texto incremental y acceder al instante mediante teclado.",
        "5.1",
        max_height_mm=88
    )}

    {EC.table(
        ["Componente del Modal", "Función y Comportamiento", "Atajo de Acceso"],
        [
            ["<strong>Buscador en Vivo</strong>", "Filtrado incremental difuso por título o grupo.", "Enfocado automáticamente al abrir."],
            ["<strong>Pestaña 'Todo'</strong>", "Muestra la cronología unificada de navegación.", "Clic o conmutación con <code>Tab</code>."],
            ["<strong>Pestaña 'Hojas'</strong>", "Aísla únicamente los documentos de prosa.", "Filtro rápido para redactores."],
            ["<strong>Pestaña 'Proyectos'</strong>", "Muestra los grupos y proyectos visitados.", "Salto rápido entre estructuras."],
            ["<strong>Badge de Palabras</strong>", "Muestra el volumen de texto de cada documento.", "Indicador de densidad en micro-badge."],
            ["<strong>Teclas Arriba / Abajo</strong>", "Selección directa de ítems de la lista.", "Pulsar <code>Enter</code> para abrir."],
            ["<strong>Tecla Escape (Esc)</strong>", "Cierra el modal y devuelve el foco al editor.", "Cierre instantáneo sin ratón."]
        ],
        ["26%", "48%", "26%"]
    )}
    """

    return {
        "number": 5,
        "title": "Gestión Documental, Hojas Pegadas y Carpetas Externas",
        "short_title": "GESTIÓN DOCUMENTAL Y HISTORIAL",
        "block": "BLOQUE III — ORGANIZACIÓN Y PRODUCTIVIDAD",
        "block_kicker": "BLOQUE III · ORGANIZACIÓN Y PRODUCTIVIDAD",
        "objectives": [
            "Estructurar bibliotecas complejas con Proyectos, Grupos jerárquicos y las cuatro categorías semánticas.",
            "Dominar las Hojas Pegadas (Ctrl+Shift+G) para redactar obras extensas de forma modular.",
            "Configurar Filtros Inteligentes y vincular Carpetas Externas sin duplicar archivos.",
            "Navegar ágilmente entre documentos mediante el Modal de Historial de Navegación (Ctrl+H)."
        ],
        "pages": [
            {"header_section": "TAXONOMÍA EDITORIAL", "html_content": p1_html},
            {"header_section": "HOJAS PEGADAS Y MODULARIDAD", "html_content": p2_html},
            {"header_section": "FILTROS Y CARPETAS EXTERNAS", "html_content": p3_html},
            {"header_section": "HISTORIAL DE NAVEGACIÓN REAL", "html_content": p4_html}
        ],
        "summary": {
            "key_points": [
                "Los grupos se clasifican en cuatro categorías semánticas: main, extras, templates y notes.",
                "Las Hojas Pegadas (Ctrl+Shift+G) concatenan documentos contiguos como una unidad indivisible.",
                "Los Filtros Inteligentes ejecutan consultas dinámicas basadas en palabras clave y fechas.",
                "Las Carpetas Externas sincronizan directorios de OneDrive, Dropbox o Git en tiempo real.",
                "El Modal de Historial (Ctrl+H) ofrece acceso instantáneo a los documentos recientes."
            ],
            "requirements": [
                "Aprender a pegar y despegar hojas contiguas utilizando Ctrl+Shift+G.",
                "Dominar el buscador del historial de navegación con el atajo Ctrl+H.",
                "Vincular una carpeta externa desde el menú contextual de la Biblioteca."
            ]
        },
        "questionnaire": {
            "columns": 2,
            "questions": [
                {
                    "text": "¿Qué combinación de teclas pega o despega dos hojas contiguas?",
                    "options": ["a) Ctrl + G", "b) Ctrl + Shift + G", "c) Alt + G", "d) Ctrl + J"]
                },
                {
                    "text": "¿Cómo se indica visualmente en la Lista de Hojas que dos documentos están pegados?",
                    "options": ["a) Con un icono de candado", "b) Con una barra vertical continua entre sus tarjetas", "c) Cambian a color verde", "d) Se oculta la segunda hoja"]
                },
                {
                    "text": "¿Qué ocurre al exportar a PDF dos hojas que están pegadas?",
                    "options": ["a) Se exportan en dos archivos separados", "b) Se concatenan como un único texto continuo sin salto forzado", "c) Da un error de formato", "d) Se imprime solo la primera"]
                },
                {
                    "text": "¿Cuál de las siguientes NO es una de las 4 categorías semánticas de grupos?",
                    "options": ["a) main", "b) extras", "c) temporary_trash", "d) notes"]
                },
                {
                    "text": "¿Qué atajo de teclado abre el Modal de Historial de Navegación?",
                    "options": ["a) Ctrl + H", "b) Ctrl + Y", "c) Alt + H", "d) Ctrl + Shift + H"]
                },
                {
                    "text": "¿Qué sucede al vincular una Carpeta Externa en Odisea?",
                    "options": ["a) Los archivos se borran del disco", "b) Odisea lee y escribe directamente en su ubicación original", "c) Se convierten obligatoriamente a formato binario", "d) Requiere suscripción a internet"]
                },
                {
                    "text": "¿Qué componente de Rust supervisa los cambios en carpetas externas?",
                    "options": ["a) Polling cada 10 minutos", "b) File Watcher nativo con notificación sub-50ms", "c) Cron job", "d) Un plugin externo"]
                },
                {
                    "text": "¿Cómo se aplican las palabras clave (Keywords) en Odisea?",
                    "options": ["a) Como micro-píldoras policromáticas de 16px", "b) Solo en texto oculto", "c) Como marcas de agua", "d) Mediante comentarios de código"]
                },
                {
                    "text": "¿Qué tecla permite cerrar el Modal de Historial devolviendo el foco al editor?",
                    "options": ["a) Espacio", "b) Escape (Esc)", "c) F1", "d) Alt + F4"]
                },
                {
                    "text": "¿En qué base relacional se almacena la jerarquía y el orden de los grupos?",
                    "options": ["a) library.odiseadb (SQLite)", "b) registry.ini", "c) config.xml", "d) MySQL remoto"]
                }
            ]
        },
        "solutions": {
            "items": [
                {"correct_answer": "b) Ctrl + Shift + G", "explanation": "Ctrl+Shift+G conmutada el estado de unión de la hoja con la inmediatamente inferior."},
                {"correct_answer": "b) Con una barra vertical continua entre sus tarjetas", "explanation": "La barra vertical unificada simboliza visualmente la continuidad del flujo editorial."},
                {"correct_answer": "b) Se concatenan como un único texto continuo sin salto forzado", "explanation": "Las hojas pegadas se tratan como secciones fluidas de un mismo capítulo."},
                {"correct_answer": "c) temporary_trash", "explanation": "Las cuatro categorías semánticas son main, extras, templates y notes."},
                {"correct_answer": "a) Ctrl + H", "explanation": "Ctrl+H lanza el modal de navegación rápida por el historial reciente."},
                {"correct_answer": "b) Odisea lee y escribe directamente en su ubicación original", "explanation": "Preserva la compatibilidad total con Git, OneDrive y herramientas de terceros."},
                {"correct_answer": "b) File Watcher nativo con notificación sub-50ms", "explanation": "El subsistema en Rust monitoriza eventos del kernel de Windows sin sobrecarga de CPU."},
                {"correct_answer": "a) Como micro-píldoras policromáticas de 16px", "explanation": "Las micro-píldoras decoran la tarjeta identificando temas o estados de borrador."},
                {"correct_answer": "b) Escape (Esc)", "explanation": "La tecla Esc descarta el modal flotante de forma limpia y restaura el cursor."},
                {"correct_answer": "a) library.odiseadb (SQLite)", "explanation": "SQLite gestiona de forma atómica y relacional toda la estructura de la biblioteca."}
            ]
        }
    }

def get_chapter_6():
    p1_html = f"""
    {EC.section_header("El Panel Inspector y Métricas en Tiempo Real", 1, "6.1")}
    <p>Para el escritor profesional, el control cuantitativo del texto es esencial: desde el periodista que debe ajustar su crónica a 800 palabras exactas hasta el orador que prepara un discurso de diez minutos. Al pulsar <strong>Ctrl+4</strong> o hacer clic en el icono de velocímetro de la barra superior, Odisea despliega el <strong>Panel Inspector / Dashboard</strong>:</p>

    {screenshot_figure(
        "05_panel_inspector_metricas",
        "Captura real del Panel Inspector lateral (Ctrl+4). Muestra el recuento de palabras y caracteres, estimaciones de tiempo de lectura y locución, objetivos activos y gestor de palabras clave.",
        "6.1",
        max_height_mm=88
    )}

    {EC.table(
        ["Métrica / Sección", "Algoritmo de Cálculo", "Utilidad Práctica para el Autor"],
        [
            ["<strong>Palabras y Caracteres</strong>", "Tokenización Unicode con y sin espacios", "Control de longitud para requisitos editoriales."],
            ["<strong>Párrafos y Frases</strong>", "Detección léxica de puntuación de cierre", "Auditoría de ritmo y cadencia de la prosa."],
            ["<strong>Tiempo de Lectura</strong>", "Calibrado a 220 palabras por minuto (ppm)", "Estimación de tiempo para el lector medio."],
            ["<strong>Tiempo de Locución</strong>", "Calibrado a 130 ppm en voz alta", "Imprescindible para discursos, podcasts y audiolibros."],
            ["<strong>Palabras Clave (Tags)</strong>", "Gestión de micro-etiquetas con paleta de color", "Clasificación transversal y filtrado temático."]
        ],
        ["28%", "36%", "36%"]
    )}
    """

    p2_html = f"""
    {EC.section_header("Definición y Seguimiento de Objetivos de Escritura (Goals)", 1, "6.2")}
    <p>La disciplina de escritura se consolida cuando se establecen metas tangibles y alcanzables. En Odisea, cada hoja o grupo jerárquico puede tener asignado un <strong>Objetivo de Escritura (Goal)</strong> personalizado con seguimiento visual continuo:</p>

    <ul>
        <li><strong>Tipos de Meta Cuantitativa:</strong>
            <ul>
                <li><em>Escribir al Menos:</em> Meta mínima para forzar el avance del borrador (ej. redactar un mínimo de 1.500 palabras).</li>
                <li><em>Escribir como Máximo:</em> Techo estricto para artículos de prensa, convocatorias o resúmenes ejecutivos (ej. no exceder 2.000 caracteres).</li>
                <li><em>Escribir un Rango:</em> Ventana óptima para capítulos estándar (ej. entre 3.000 y 4.000 palabras).</li>
            </ul>
        </li>
        <li><strong>Indicador de Progreso Dinámico:</strong> En el Panel 4 y en la barra de estado inferior, Odisea proyecta un <strong>micro-anillo circular o barra de progreso</strong> que evoluciona cromáticamente:
            <ul>
                <li><em>Azul (#3b82f6):</em> Meta en progreso activo (0% a 99%).</li>
                <li><em>Verde Esmeralda (#10b981):</em> Meta completada con éxito (100%).</li>
                <li><em>Rojo Coral (#ef4444):</em> Advertencia de sobrepaso en metas de tipo máximo.</li>
            </ul>
        </li>
        <li><strong>Fecha Límite (Deadline):</strong> Puedes fijar una fecha y hora límite; Odisea calcula automáticamente cuántas palabras debes escribir por día para entregar a tiempo.</li>
    </ul>

    {EC.callout(
        "HITO DE PRODUCTIVIDAD · METAS EN GRUPOS Y PROYECTOS",
        "Si defines un objetivo sobre un Grupo o Proyecto completo, Odisea sumará automáticamente las palabras de todas sus hojas internas y hojas pegadas, mostrándote el avance global de tu libro o tesis en una sola mirada.",
        "milestone"
    )}
    """

    p3_html = f"""
    {EC.section_header("El Asistente de Revisión y Corrección de Estilo", 1, "6.3")}
    <p>El pulido final de un manuscrito exige erradicar muletillas, redundancias y vicios sintácticos. Odisea incorpora un <strong>Asistente de Revisión y Estilo</strong> que audita el documento en segundo plano:</p>

    {screenshot_figure(
        "06_asistente_revision_estilo",
        "Captura real del Asistente de Revisión y Estilo. Analiza en tiempo real el texto, señalando redundancias, pasajes en voz pasiva, frases excesivamente largas y sugerencias de mejora directa.",
        "6.2",
        max_height_mm=88
    )}

    {EC.table(
        ["Regla de Estilo", "Criterio de Detección", "Acción de Corrección Sugerida"],
        [
            ["<strong>Frases Demasiado Largas</strong>", "Oraciones continuas que superan las 30 palabras.", "Propone dividir la frase en dos oraciones coordinadas."],
            ["<strong>Voz Pasiva Recurrente</strong>", "Uso reiterado de perífrasis pasivas (ser + participio).", "Sustituye por formas activas más ágiles y directas."],
            ["<strong>Redundancias y Pleonasmos</strong>", "Expresiones como 'subir arriba' o 'completamente lleno'.", "Elimina la palabra superflua con un clic en Reemplazar."],
            ["<strong>Palabras Complejas / Jerga</strong>", "Términos farragosos con alternativas cotidianas claras.", "Ofrece sinónimos directos para agilizar la lectura."]
        ],
        ["28%", "36%", "36%"]
    )}
    """

    p4_html = f"""
    {EC.section_header("Búsqueda Global FTS5 y Copias Zstandard en Segundo Plano", 1, "6.4")}
    <p>La integridad de la obra del autor está blindada mediante dos motores nativos en Rust de alta tecnología:</p>

    <p><strong>1. Motor de Búsqueda Full-Text FTS5:</strong> En <code>library.odiseadb</code>, cada palabra redactada se indexa en tiempo real mediante una tabla virtual SQLite FTS5 (<em>Full-Text Search 5</em>). Al teclear cualquier consulta en la Paleta de Comandos o en el buscador general, Odisea localiza coincidencias en milisegundos entre miles de páginas, con resaltado de fragmentos contextuales (<em>snippets</em>).</p>

    <p><strong>2. Sistema de Copias de Seguridad Automáticas con Zstandard:</strong> Cada cambio se guarda de forma atómica. Además, Odisea ejecuta instantáneas automáticas en <code>./odisea_data/backups/</code>:</p>
    <ul>
        <li><strong>Snapshots Horarios:</strong> Guardados cada 60 minutos de trabajo activo (retención de 24 horas).</li>
        <li><strong>Copias Diarias:</strong> Instantánea consolidada al cierre de cada jornada (retención de 30 días).</li>
        <li><strong>Copias Semanales:</strong> Archivos permanentes comprimidos con el algoritmo <strong>Zstandard (.odiseabak)</strong>, que reduce el tamaño en más de un 85% sin pérdida de rendimiento.</li>
    </ul>

    {EC.callout(
        "GARANTÍA DE INTEGRIDAD · BLINDAJE CONTRA FALLOS DE ENERGÍA",
        "SQLite opera bajo el modo <code>PRAGMA journal_mode = WAL</code> (Write-Ahead Logging). Si tu ordenador sufre un corte eléctrico imprevisto o reinicio forzado, ningún párrafo se corromperá jamás: al reabrir Odisea, la base recupera la última transacción confirmada de forma 100% matemática.",
        "takeaway"
    )}
    """

    return {
        "number": 6,
        "title": "Dashboard de Escritura, Métricas y Objetivos (Goals)",
        "short_title": "DASHBOARD Y REVISIÓN",
        "block": "BLOQUE III — ORGANIZACIÓN Y PRODUCTIVIDAD",
        "block_kicker": "BLOQUE III · ORGANIZACIÓN Y PRODUCTIVIDAD",
        "objectives": [
            "Operar el Panel Inspector (Ctrl+4) para monitorizar métricas y tiempos de lectura/locución.",
            "Configurar Objetivos de Escritura (Goals) diarios y por proyecto con seguimiento cromático.",
            "Utilizar el Asistente de Revisión y Estilo para pulir la prosa y eliminar vicios sintácticos.",
            "Comprender el motor de indexación FTS5 y la política de copias de seguridad Zstandard."
        ],
        "pages": [
            {"header_section": "EL PANEL INSPECTOR Y MÉTRICAS", "html_content": p1_html},
            {"header_section": "OBJETIVOS DE ESCRITURA (GOALS)", "html_content": p2_html},
            {"header_section": "ASISTENTE DE REVISIÓN Y ESTILO", "html_content": p3_html},
            {"header_section": "BÚSQUEDA FTS5 Y BACKUPS ZSTD", "html_content": p4_html}
        ],
        "summary": {
            "key_points": [
                "El Inspector (Ctrl+4) calcula palabras, caracteres, tiempo de lectura (220 ppm) y locución (130 ppm).",
                "Los Objetivos de Escritura soportan metas de mínimo, máximo y rangos con micro-anillos de color.",
                "El Asistente de Revisión señala redundancias, frases largas (>30 palabras) y voz pasiva.",
                "SQLite FTS5 indexa cada término permitiendo búsquedas ultrarrápidas con fragmentos contextuales.",
                "Las copias horarias, diarias y semanales se comprimen con Zstandard en ./odisea_data/backups/."
            ],
            "requirements": [
                "Desplegar el Panel Inspector mediante el atajo Ctrl+4.",
                "Definir un objetivo de 1.000 palabras en una hoja de borrador.",
                "Ejecutar el Asistente de Revisión para verificar la claridad de un capítulo."
            ]
        },
        "questionnaire": {
            "columns": 2,
            "questions": [
                {
                    "text": "¿A qué velocidad media en palabras por minuto se calcula el tiempo de lectura en silencio?",
                    "options": ["a) 120 ppm", "b) 220 ppm", "c) 350 ppm", "d) 500 ppm"]
                },
                {
                    "text": "¿Qué velocidad media se emplea para estimar el tiempo de locución o lectura en voz alta?",
                    "options": ["a) 130 ppm", "b) 200 ppm", "c) 80 ppm", "d) 250 ppm"]
                },
                {
                    "text": "¿Qué atajo de teclado despliega u oculta el Panel Inspector / Dashboard?",
                    "options": ["a) Ctrl + 1", "b) Ctrl + 4", "c) Alt + I", "d) Ctrl + Shift + M"]
                },
                {
                    "text": "¿De qué color se muestra el anillo de objetivo cuando se ha alcanzado la meta al 100%?",
                    "options": ["a) Azul marino", "b) Verde esmeralda", "c) Amarillo", "d) Rojo coral"]
                },
                {
                    "text": "¿Qué tipo de meta cuantitativa alerta en rojo si se sobrepasa el límite fijado?",
                    "options": ["a) Escribir al menos", "b) Escribir como máximo", "c) Modo libre", "d) Meta de lectura"]
                },
                {
                    "text": "¿Qué extensión llevan los archivos de copia de seguridad comprimidos con Zstandard?",
                    "options": ["a) .zip", "b) .odiseabak", "c) .tar.gz", "d) .bak"]
                },
                {
                    "text": "¿Qué longitud de frase activa la advertencia de 'Frase demasiado larga' en el Asistente de Revisión?",
                    "options": ["a) Más de 15 palabras", "b) Más de 30 palabras", "c) Más de 60 palabras", "d) Más de 100 palabras"]
                },
                {
                    "text": "¿Qué modo transaccional de SQLite previene la pérdida de datos ante cortes eléctricos?",
                    "options": ["a) WAL (Write-Ahead Logging)", "b) Modo memoria pura", "c) Sincronización OFF", "d) Bloqueo exclusivo continuo"]
                },
                {
                    "text": "¿Qué tecnología impulsa la búsqueda instantánea de texto en la base de datos?",
                    "options": ["a) Búsqueda lineal con grep", "b) SQLite FTS5 (Full-Text Search)", "c) Expresiones regulares en frontend", "d) Búsqueda remota en la nube"]
                },
                {
                    "text": "¿En qué carpeta se almacenan las instantáneas horarias, diarias y semanales?",
                    "options": ["a) C:\\Backups", "b) ./odisea_data/backups/", "c) %TEMP%\\odisea", "d) ./odisea_data/exports/"]
                }
            ]
        },
        "solutions": {
            "items": [
                {"correct_answer": "b) 220 ppm", "explanation": "220 palabras por minuto es el estándar de lectura silenciosa en adultos."},
                {"correct_answer": "a) 130 ppm", "explanation": "130 palabras por minuto es el promedio internacional para locución en voz alta y audiolibros."},
                {"correct_answer": "b) Ctrl + 4", "explanation": "Ctrl+4 conmutada la visibilidad del Panel 4 (Dashboard de métricas y notas)."},
                {"correct_answer": "b) Verde esmeralda", "explanation": "El verde esmeralda (#10b981) certifica el cumplimiento satisfactorio de la meta."},
                {"correct_answer": "b) Escribir como máximo", "explanation": "Las metas de tipo techo alertan visualmente en coral para evitar excesos editoriales."},
                {"correct_answer": "b) .odiseabak", "explanation": "Los archivos .odiseabak contienen la base e imágenes comprimidas con Zstandard."},
                {"correct_answer": "b) Más de 30 palabras", "explanation": "Frases de más de 30 palabras sobrecargan la memoria de trabajo del lector."},
                {"correct_answer": "a) WAL (Write-Ahead Logging)", "explanation": "WAL escribe las operaciones en un log temporal antes de consolidarlas en disco."},
                {"correct_answer": "b) SQLite FTS5 (Full-Text Search)", "explanation": "FTS5 crea índices invertidos de tokens de palabras para búsquedas en milisegundos."},
                {"correct_answer": "b) ./odisea_data/backups/", "explanation": "Toda la política de copias se confina estrictamente a la ruta de persistencia relativa."}
            ]
        }
    }
