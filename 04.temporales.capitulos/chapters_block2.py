import sys
from pathlib import Path

SKILL_ROOT = Path(r"C:\Users\IsaNet\.gemini\config\skills\technical-book-pdf")
sys.path.insert(0, str(SKILL_ROOT / "scripts"))
sys.path.insert(0, str(Path(__file__).parent.resolve()))

from components import EditorialComponents as EC
from generate_diagram import TechnicalDiagrams as TD
from img_helper import screenshot_figure

def get_chapter_3():
    p1_html = f"""
    {EC.section_header("Filosofía de Marcado y Bloques Estructurales", 1, "3.1")}
    <p>El estándar <strong>Markdown XL</strong> constituye el corazón expresivo de Odisea. Desarrollado como una evolución semántica rigurosa del Markdown tradicional, su principio rector es la <strong>separación estricta entre el token sintáctico y el texto sustantivo</strong>. En el motor de edición basado en CodeMirror 6, los caracteres delimitadores (como <code>#</code>, <code>**</code>, <code>_</code>, <code>::</code> o <code>||</code>) reciben una clase CSS dedicada (<code>.ulysses-tag</code>) que los atenúa visualmente sin ocultarlos, permitiendo al autor percibir la estructura con naturalidad.</p>

    {EC.callout(
        "DEFINICIÓN CLAVE · GRAMÁTICA FORMAL DE MARKDOWN XL",
        "A diferencia de los editores que reemplazan el texto por cajas opacas, Odisea preserva la naturaleza textual del documento. La gramática formal EBNF extraída en <code>.rea_evidence/markdown_xl_grammar.ebnf</code> define exactamente 28 etiquetas semánticas agrupadas en bloques de nivel superior y estilos de carácter inline.",
        "definition"
    )}

    <p>Los bloques estructurales principales incluyen:</p>
    <ul>
        <li><strong>Encabezados Jerárquicos (H1 a H6):</strong> Declarados mediante <code># </code> hasta <code>###### </code>. En el margen izquierdo del editor, Odisea proyecta automáticamente un micro-indicador compacto (<code>H1</code>..<code>H6</code>) que permite identificar el nivel de sección sin desbordar el sangrado del párrafo.</li>
        <li><strong>Listas Inteligentes (Smart Lists):</strong> Listas no ordenadas (<code>- </code>, <code>* </code>, <code>+ </code>) y listas numeradas (<code>1. </code>) con reordenación matemática automática: si insertas o eliminas un ítem intermedio, los numerales subsiguientes se actualizan en tiempo real.</li>
        <li><strong>Checklists Interactivos:</strong> Marcados mediante <code>- [ ]</code> y <code>- [x]</code>. Se renderizan como casillas vectoriales seleccionables con un clic directo o mediante la barra espaciadora.</li>
        <li><strong>Citas Editoriales (Blockquotes):</strong> Prefijadas con <code>> </code>, con soporte completo de anidamiento multinivel (<code>>> </code>) y borde vertical de acento cian.</li>
        <li><strong>Separadores de Sección (Dividers):</strong> Insertados con cuatro guiones <code>----</code> o asteriscos <code>****</code>, generando una línea tenue de transición capitular.</li>
    </ul>
    """

    p2_html = f"""
    {EC.section_header("Marcado Inline Enriquecido y Bloques Especiales de Autor", 1, "3.2")}
    <p>La prosa literaria, académica y técnica requiere distinciones sutiles de tono y propósito que van mucho más allá de la negrita y la cursiva convencionales. Markdown XL despliega un arsenal completo de modificadores de carácter:</p>

    <ul>
        <li><strong>Negrita y Cursiva:</strong> <code>**fuerte**</code> y <code>*énfasis*</code> (o alternativamente <code>__fuerte__</code> y <code>_énfasis_</code>), interpretadas con peso tipográfico calibrado.</li>
        <li><strong>Marcado Fluorescente (Highlight):</strong> Delimitado mediante <code>::texto resaltado::</code>. Genera un fondo amarillo cálido traslúcido (#ffea79 en modo claro, #594800 en modo oscuro), esencial para señalar pasajes que requieren revisión posterior.</li>
        <li><strong>Tachado y Descarte (Strikethrough):</strong> Marcado con <code>||texto tachado||</code>. Aplica una fina línea coral sobre el texto atenuado para registrar correcciones o pasajes descartados sin borrarlos del borrador.</li>
        <li><strong>Código en Línea y Texto Crudo (Raw):</strong> <code>''let x = 42;''</code> para código embebido en el párrafo, y <code>++código raw++</code> para fragmentos que deben exportarse literalmente sin procesamiento tipográfico (por ejemplo, comandos LaTeX o entidades HTML).</li>
    </ul>

    {EC.callout(
        "BUENA PRÁCTICA · BLOQUES EXCLUSIVOS DE AUTOR",
        "Odisea incluye dos tipos de bloque fundamentales para escritores creativos e investigadores:<br>"
        "1. <strong>Bloque de Verso (|&quot; ):</strong> Cada línea precedida de <code>|&quot; </code> respeta estrictamente los retornos de carro sin requerir dobles espacios al final, manteniendo el ritmo poético de la estrofa.<br>"
        "2. <strong>Bloques de Comentario (%% ):</strong> Todo texto comprendido entre <code>%%</code> queda confinado al borrador privado: <strong>nunca se exporta</strong> a PDF, DOCX ni se publica en la web.",
        "practice"
    )}

    <p>Asimismo, los bloques de código delimitados por <code>''''</code> o triples tildes graves incorporan selector de lenguaje y coloreado sintáctico de alto contraste mediante Shiki/Highlight.js (Rust, Python, JavaScript, SQL, CSS, TOML, JSON, Bash, LaTeX).</p>
    """

    p3_html = f"""
    {EC.section_header("El Lienzo de Edición Real: Marcado Semántico en Vivo", 1, "3.3")}
    <p>La siguiente captura real muestra el comportamiento del lienzo de redacción de Odisea procesando sintaxis Markdown XL con indicadores en el margen izquierdo y formateo dinámico inline:</p>

    {screenshot_figure(
        "08_editor_prosa_markdown_xl",
        "Captura real del editor de prosa pura de Odisea. Se aprecian las etiquetas semánticas atenuadas, el micro-badge marginal H2, el marcado fluorescente y la fórmula matemática renderizada.",
        "3.1",
        max_height_mm=85
    )}

    {EC.table(
        ["Elemento Visual", "Sintaxis en Documento", "Renderizado y Comportamiento en Pantalla"],
        [
            ["<strong>Micro-Badge H2</strong>", "<code>## Título de Sección</code>", "Micro-píldora azul en el margen izquierdo sin desplazar la prosa."],
            ["<strong>Resaltado ::</strong>", "<code>::pasaje clave::</code>", "Fondo amarillo ámbar translúcido que preserva la legibilidad del texto."],
            ["<strong>Tachado ||</strong>", "<code>||texto descartado||</code>", "Línea coral de corrección manteniendo el registro histórico de cambios."],
            ["<strong>Badge FN</strong>", "<code>(fn: Nota al pie)</code>", "Micro-píldora marginal interactiva que abre un popover al hacer clic."],
            ["<strong>Fórmula KaTeX</strong>", "<code>$f(x) = \\int e^x dx$</code>", "Renderizado vectorial matemático inmediato con tipografía Computer Modern."]
        ],
        ["25%", "35%", "40%"]
    )}
    """

    p4_html = f"""
    {EC.section_header("Anotaciones Flotantes y Tabla Maestra de las 28 Etiquetas", 1, "3.4")}
    <p>La redacción fluida se interrumpe cuando el autor debe desplazarse hasta el final del documento para insertar una nota al pie. En Odisea, las notas y anotaciones se declaran <strong>en el mismo punto donde surge la idea</strong>, desplegándose en micro-popovers editables sin abandonar la línea activa:</p>

    {EC.table(
        ["N.º", "Etiqueta Semántica", "Sintaxis Markdown XL", "Función y Comportamiento Editorial"],
        [
            ["1-6", "Encabezados H1 a H6", "<code># </code> a <code>###### </code>", "Nivel de sección con micro-indicador marginal H1..H6"],
            ["7", "Lista no ordenada", "<code>- </code> / <code>* </code> / <code>+ </code>", "Viñeta clásica con sangría tipográfica equilibrada"],
            ["8", "Lista numerada inteligente", "<code>1. </code>", "Renumeración matemática automática al mover ítems"],
            ["9", "Checklist interactivo", "<code>- [ ]</code> / <code>- [x]</code>", "Casilla vectorial seleccionable directamente con ratón o teclado"],
            ["10", "Cita en bloque", "<code>> </code>", "Párrafo editorial indentado con barra de acento"],
            ["11", "Bloque de verso", "<code>|\" </code>", "Preserva saltos de estrofa sin espacios artificiales"],
            ["12", "Bloque de código", "<code>''''</code> / <code>```lang</code>", "Resaltado de sintaxis Shiki con selector de lenguaje"],
            ["13", "Bloque de texto crudo", "<code>++ </code>", "Escape literal directo a motor de salida (LaTeX/HTML)"],
            ["14", "Bloque de comentario", "<code>%% </code>", "Notas de trabajo privadas que nunca se exportan"],
            ["15", "Separador temático", "<code>----</code> / <code>****</code>", "Línea horizontal sutil de transición capitular"],
            ["16", "Tabla de contenidos", "<code>(toc)</code>", "Índice jerárquico dinámico proyectado en el margen"],
            ["17-18", "Negrita y Cursiva", "<code>**texto**</code> / <code>*texto*</code>", "Énfasis tipográfico clásico de alta legibilidad"],
            ["19", "Marcado / Resaltado", "<code>::texto::</code>", "Fondo fluorescente traslúcido para pasajes en revisión"],
            ["20", "Tachado / Descarte", "<code>||texto||</code>", "Línea fina coral sobre texto atenuado de borrador"],
            ["21-22", "Código y Raw inline", "<code>''código''</code> / <code>++raw++</code>", "Variables, snippets y entidades literales en el párrafo"],
            ["23-24", "Comentario y Anotación", "<code>{nota}</code> / <code>{a: nota}</code>", "Micro-popovers editables no intrusivos al margen"],
            ["25", "Nota al pie (Footnote)", "<code>(fn: texto)</code>", "Compilación automática al pie de página editorial"],
            ["26-27", "Enlaces e Imágenes", "<code>[ancla](url)</code> / <code>(img: ruta)</code>", "Vínculos web y miniaturas de medios con badge IMG"],
            ["28", "Ecuación Matemática", "<code>$fórmula$</code> / <code>$$bloque$$</code>", "Motor KaTeX integrado para álgebra, física y cálculo"]
        ],
        ["8%", "26%", "26%", "40%"]
    )}
    """

    return {
        "number": 3,
        "title": "La Sintaxis Markdown XL: Las 28 Etiquetas Semánticas",
        "short_title": "SINTAXIS MARKDOWN XL",
        "block": "BLOQUE II — EL MOTOR DE EDICIÓN Y MARKDOWN XL",
        "block_kicker": "BLOQUE II · EL MOTOR DE EDICIÓN",
        "objectives": [
            "Comprender la filosofía de separación entre tokens de sintaxis y contenido semántico.",
            "Dominar los bloques estructurales: encabezados con badges marginales, listas inteligentes y citas.",
            "Utilizar las anotaciones no intrusivas: comentarios de autor, anotaciones al margen y notas al pie.",
            "Conocer las 28 etiquetas canónicas de Markdown XL y su correspondencia en la exportación ULSS."
        ],
        "pages": [
            {"header_section": "FILOSOFÍA Y BLOQUES ESTRUCTURALES", "html_content": p1_html},
            {"header_section": "MARCADO INLINE Y BLOQUES ESPECIALES", "html_content": p2_html},
            {"header_section": "EL LIENZO DE EDICIÓN REAL", "html_content": p3_html},
            {"header_section": "TABLA MAESTRA DE 28 ETIQUETAS", "html_content": p4_html}
        ],
        "summary": {
            "key_points": [
                "Markdown XL separa los delimitadores sintácticos (.ulysses-tag) del contenido de prosa pura.",
                "Los encabezados (# a ######) proyectan micro-indicadores marginales compactos (H1 a H6).",
                "Incorpora modificadores avanzados: resaltado ::texto::, tachado ||texto|| y bloques de verso |\" .",
                "Los bloques %% y llaves {comentario} quedan confinados al borrador y nunca se exportan.",
                "La gramática formal consta de exactamente 28 etiquetas semánticas normalizadas."
            ],
            "requirements": [
                "Dominar la diferencia entre marcado tradicional y el modelo atenuado de Markdown XL.",
                "Memorizar la sintaxis de notas al pie (fn: ...) y enlaces [ancla](url).",
                "Aprender a insertar fórmulas KaTeX mediante $fórmula$ inline o $$bloque$$."
            ]
        },
        "questionnaire": {
            "columns": 2,
            "questions": [
                {
                    "text": "¿Cómo se delimita el texto resaltado (highlight) en Markdown XL?",
                    "options": ["a) ==texto==", "b) ::texto::", "c) ++texto++", "d) **texto**"]
                },
                {
                    "text": "¿Qué ocurre con los bloques delimitados por %% durante la exportación a PDF?",
                    "options": ["a) Se imprimen en rojo", "b) Se omiten completamente, son notas privadas", "c) Se colocan al pie de página", "d) Provocan un error de compilación"]
                },
                {
                    "text": "¿Qué sintaxis se utiliza para insertar una nota al pie en Markdown XL?",
                    "options": ["a) [^1]: texto", "b) (fn: texto de la nota)", "c) {footnote: texto}", "d) <fn>texto</fn>"]
                },
                {
                    "text": "¿Cómo se indica un bloque de verso para preservar saltos de línea poéticos?",
                    "options": ["a) Cada línea con |\" al inicio", "b) Tres espacios al final de cada línea", "c) Con la etiqueta <verse>", "d) Con cuatro comillas simples ''''"]
                },
                {
                    "text": "¿Cuántas etiquetas semánticas formales componen el estándar Markdown XL en Odisea?",
                    "options": ["a) 12 etiquetas", "b) 28 etiquetas", "c) 45 etiquetas", "d) 16 etiquetas"]
                },
                {
                    "text": "¿Qué motor matemático procesa las fórmulas $fórmula$ dentro del editor?",
                    "options": ["a) MathJax 2", "b) KaTeX integrado en local", "c) Wolfram Alpha API", "d) LibreOffice Math"]
                },
                {
                    "text": "¿Qué delimitador aplica el estilo tachado (strikethrough) en Markdown XL?",
                    "options": ["a) ~~texto~~", "b) ||texto||", "c) --texto--", "d) <<texto>>"]
                },
                {
                    "text": "¿Dónde se proyectan los micro-badges H1..H6 en el editor?",
                    "options": ["a) En una ventana emergente", "b) En el margen izquierdo del renglón", "c) En la barra de estado inferior", "d) No se muestran"]
                },
                {
                    "text": "¿Qué combinación de caracteres inserta un separador de sección horizontal?",
                    "options": ["a) ---- o ****", "b) ====", "c) ______", "d) ####"]
                },
                {
                    "text": "¿Cómo se declaran las anotaciones al margen de revisión de autor?",
                    "options": ["a) {a: texto de la anotación}", "b) [[anotacion]]", "c) /* nota */", "d) <!-- nota -->"]
                }
            ]
        },
        "solutions": {
            "items": [
                {"correct_answer": "b) ::texto::", "explanation": "El doble dos puntos :: delimita texto resaltado con fondo amarillo suave en Markdown XL."},
                {"correct_answer": "b) Se omiten completamente, son notas privadas", "explanation": "Los bloques %% son exclusivos de borrador y se descartan en cualquier exportación editorial."},
                {"correct_answer": "b) (fn: texto de la nota)", "explanation": "La sintaxis nativa de Ulysses y Odisea para notas al pie es (fn: contenido de la nota)."},
                {"correct_answer": "a) Cada línea con |\" al inicio", "explanation": "El prefijo |\" preserva fielmente los retornos de carro sin requerir espacios dobles."},
                {"correct_answer": "b) 28 etiquetas", "explanation": "La gramática EBNF de Markdown XL especifica exactamente 28 etiquetas sintácticas."},
                {"correct_answer": "b) KaTeX integrado en local", "explanation": "KaTeX ofrece renderizado instantáneo a 60 FPS sin conexiones externas ni latencia."},
                {"correct_answer": "b) ||texto||", "explanation": "La doble barra vertical || aplica tachado en Markdown XL (a diferencia de ~~ en GFM)."},
                {"correct_answer": "b) En el margen izquierdo del renglón", "explanation": "Los micro-badges se posicionan en el 'gutter' izquierdo sin romper el sangrado de la prosa."},
                {"correct_answer": "a) ---- o ****", "explanation": "Cuatro guiones o cuatro asteriscos definen un divisor temático capitular."},
                {"correct_answer": "a) {a: texto de la anotación}", "explanation": "Las llaves con prefijo a: identifican anotaciones al margen para el autor."}
            ]
        }
    }

def get_chapter_4():
    p1_html = f"""
    {EC.section_header("Tablas Dinámicas y Edición sin Fricción", 1, "4.1")}
    <p>En la redacción de informes técnicos, ensayos científicos o novelas de intriga con cronologías densas, las tablas son un recurso indispensable. Históricamente, crear tablas en Markdown representaba una de las experiencias más frustrantes debido a la necesidad de alinear manualmente barras verticales y guiones.</p>

    <p>Odisea incorpora un <strong>Widget de Tabla Dinámica Interactivo</strong> integrado directamente en el editor CodeMirror 6:</p>

    <ul>
        <li><strong>Navegación Fluida por Teclado:</strong> Al pulsar <strong>Tab</strong>, el cursor salta a la celda siguiente; con <strong>Shift+Tab</strong>, retrocede a la celda anterior. Al pulsar <strong>Enter</strong> en la última celda de una fila, Odisea genera automáticamente una nueva fila sin interrumpir el flujo de entrada de datos.</li>
        <li><strong>Alineación Inteligente de Columnas:</strong> Soporta alineación a la izquierda (<code>:---</code>), centrada (<code>:---:</code>) y a la derecha (<code>---:</code>). La anchura visual de cada columna se ajusta en tiempo real según el contenido.</li>
        <li><strong>Menú Contextual de Celda:</strong> Al hacer clic derecho o pulsar el micro-botón de cabecera de columna, se despliega un menú flotante para <em>Insertar Fila Arriba/Abajo</em>, <em>Insertar Columna Izquierda/Derecha</em> o <em>Eliminar Selección</em>.</li>
    </ul>

    {EC.callout(
        "DEFINICIÓN CLAVE · RENDERIZADO HÍBRIDO DE TABLAS",
        "En modo edición, la tabla se manipula como una cuadrícula interactiva ágil. En el archivo subyacente, se almacena como texto plano Markdown estándar, garantizando que el documento pueda abrirse y procesarse en cualquier otro editor sin bloqueos de formato propietario.",
        "definition"
    )}
    """

    p2_html = f"""
    {EC.section_header("Fórmulas Matemáticas con Motor KaTeX Integrado", 1, "4.2")}
    <p>Para científicos, matemáticos, ingenieros y economistas, la notación matemática rigurosa es tan vital como las palabras. Odisea incorpora de serie el motor <strong>KaTeX</strong> compilado localmente, ofreciendo renderizado tipográfico a 60 FPS con calidad de publicación científica idéntica a LaTeX:</p>

    <ul>
        <li><strong>Fórmulas en Línea (Inline):</strong> Se delimitan entre signos de dólar simples <code>$E = mc^2$</code> o <code>$\\nabla \\times \\mathbf{{B}} = \\mu_0 \\mathbf{{J}}$</code>. La ecuación se estiliza en el propio párrafo respetando la línea base tipográfica.</li>
        <li><strong>Ecuaciones en Bloque Destacado (Display):</strong> Se delimitan entre dobles signos de dólar <code>$$</code>. Odisea centra la fórmula en la página, aplica una fuente tipográfica Computer Modern de alta resolución y permite numerar la ecuación en el margen derecho:</li>
    </ul>

    <div class="code-box">
        <pre><code class="language-latex">$$\\oint_{{C}} \\mathbf{{F}} \\cdot d\\mathbf{{r}} = \\iint_{{S}} (\\nabla \\times \\mathbf{{F}}) \\cdot d\\mathbf{{S}}$$</code></pre>
    </div>

    {EC.callout(
        "HITO DE RENDIMIENTO · CERO RETRASO DE RED",
        "A diferencia de herramientas que consultan servidores web para renderizar imágenes de fórmulas, el motor KaTeX de Odisea opera <strong>100% desconectado y fuera de línea</strong>. El análisis léxico y la generación vectorial SVG se ejecutan en menos de 2 milisegundos por ecuación, sin consumir ancho de banda.",
        "milestone"
    )}
    """

    p3_html = f"""
    {EC.section_header("Repositorio de Medios y Miniaturas Embebidas", 1, "4.3")}
    <p>Las imágenes e ilustraciones en Odisea se tratan como <strong>activos de primera clase</strong> mediante el repositorio interno <code>./odisea_data/attachments/</code>. Cuando un autor arrastra una imagen desde el Explorador de Windows o la pega desde el portapapeles (<code>Ctrl+V</code>), Odisea ejecuta un protocolo optimizado:</p>

    <ol>
        <li><strong>Almacenamiento Local Aislado:</strong> La imagen se copia al subdirectorio de adjuntos de la hoja, generando un identificador único SHA-256 para prevenir colisiones o pérdidas de enlace si el archivo original cambia de ubicación.</li>
        <li><strong>Micro-Badge Visual IMG:</strong> En el editor se inserta la etiqueta <code>(img: nombre_archivo.png)</code>, proyectando un micro-badge compacto <code>IMG</code> con el nombre de la imagen y un icono de miniatura de 16px.</li>
        <li><strong>Popover de Previsualización:</strong> Al situar el cursor o hacer clic sobre el badge, emerge un popover flotante con la vista previa a escala, opciones de alineación (Izquierda, Centro, Derecha, Ancho Completo) y campo editable para el pie de foto (<em>caption</em>).</li>
    </ol>

    {EC.callout(
        "CONSEJO DE OPTIMIZACIÓN EDITORIAL",
        "Durante la exportación a PDF o ePub, Odisea comprime y redimensiona automáticamente las imágenes según el perfil de salida (300 DPI para impresión vectorial o 150 DPI para ePub ligero), garantizando documentos nítidos sin tamaños de archivo desmesurados.",
        "practice"
    )}
    """

    p4_html = f"""
    {EC.section_header("Enlaces Inteligentes, Backlinks y Notas al Margen", 1, "4.4")}
    <p>Para interconectar ideas y fuentes documentales, Odisea despliega un sistema de enlaces multidireccionales concebido para escritores de no ficción e investigadores:</p>

    <ul>
        <li><strong>Enlaces Web Estándar:</strong> Marcados mediante <code>[texto ancla](https://ejemplo.com)</code>. Se estilizan con subrayado punteado sutil; al pulsar <code>Ctrl+Clic</code>, la URL se abre en el navegador predeterminado del sistema.</li>
        <li><strong>Vínculos Internos entre Hojas ([[WikiLinks]]):</strong> Puedes enlazar cualquier otra hoja de tu biblioteca escribiendo dobles corchetes <code>[[Título de la Hoja]]</code>. Al teclear los corchetes, un desplegable de autocompletado sugiere coincidencias instantáneamente.</li>
        <li><strong>Detección Automática de Backlinks:</strong> En el Panel 4 (Dashboard), la pestaña de Enlaces muestra automáticamente qué otras hojas de la biblioteca citan o enlazan al documento activo, tejiendo una red de conocimiento viva.</li>
    </ul>

    {EC.table(
        ["Tipo de Vínculo", "Sintaxis Utilizada", "Destino / Comportamiento en Exportación"],
        [
            ["Enlace Web Externo", "<code>[Nombre](https://...)</code>", "Hipervínculo activo en PDF, DOCX y HTML."],
            ["Vínculo Interno", "<code>[[Capítulo 02]]</code>", "Salto de página cruzado o bookmark interactivo."],
            ["Anotación Marginal", "<code>{a: Revisar fecha}</code>", "Micro-popover ámbar; se omite en versión final."],
            ["Nota al Pie", "<code>(fn: Fuente citada)</code>", "Compilada automáticamente como nota numerada al pie."]
        ],
        ["25%", "35%", "40%"]
    )}
    """

    return {
        "number": 4,
        "title": "Widgets Interactivos: Tablas, Fórmulas KaTeX y Medios",
        "short_title": "WIDGETS INTERACTIVOS Y MEDIOS",
        "block": "BLOQUE II — EL MOTOR DE EDICIÓN Y MARKDOWN XL",
        "block_kicker": "BLOQUE II · EL MOTOR DE EDICIÓN",
        "objectives": [
            "Crear y manipular tablas dinámicas mediante navegación fluida por teclado (Tab / Enter).",
            "Escribir fórmulas matemáticas avanzadas utilizando la notación KaTeX integrada sin conexión.",
            "Gestionar imágenes y medios locales con micro-badges IMG y popovers de previsualización.",
            "Construir redes de conocimiento mediante enlaces cruzados ([[WikiLinks]]) y notas marginales."
        ],
        "pages": [
            {"header_section": "TABLAS DINÁMICAS", "html_content": p1_html},
            {"header_section": "FÓRMULAS MATEMÁTICAS KATEX", "html_content": p2_html},
            {"header_section": "REPOSITORIO DE MEDIOS", "html_content": p3_html},
            {"header_section": "ENLACES Y NOTAS MARGINALES", "html_content": p4_html}
        ],
        "summary": {
            "key_points": [
                "Las tablas se editan como cuadrículas interactivas navegables con Tab y Shift+Tab.",
                "El motor KaTeX offline procesa fórmulas en línea ($formula$) y en bloque ($$formula$$) a 60 FPS.",
                "Las imágenes se copian a ./odisea_data/attachments/ con identificadores únicos SHA-256.",
                "Los badges IMG y FN permiten inspeccionar y editar activos sin abandonar la línea activa.",
                "Soporta enlaces internos [[WikiLinks]] con autocompletado y detección de backlinks."
            ],
            "requirements": [
                "Aprender a saltar entre celdas de una tabla utilizando la tecla Tab.",
                "Conocer la sintaxis de ecuaciones KaTeX para notación científica.",
                "Verificar la gestión de adjuntos locales en la carpeta relativa odisea_data/attachments/."
            ]
        },
        "questionnaire": {
            "columns": 2,
            "questions": [
                {
                    "text": "¿Qué tecla permite avanzar a la celda siguiente en una tabla interactiva?",
                    "options": ["a) Espacio", "b) Tab", "c) Enter", "d) Flecha Arriba"]
                },
                {
                    "text": "¿Cómo se indica una fórmula matemática destacada en bloque?",
                    "options": ["a) $fórmula$", "b) $$fórmula$$", "c) [math]fórmula[/math]", "d) ==fórmula=="]
                },
                {
                    "text": "¿Dónde almacena Odisea las imágenes pegadas o arrastradas al editor?",
                    "options": ["a) En C:\\Windows\\Temp", "b) En ./odisea_data/attachments/", "c) En la nube pública", "d) En el portapapeles únicamente"]
                },
                {
                    "text": "¿Qué micro-badge se proyecta en el editor al insertar una imagen?",
                    "options": ["a) PIC", "b) IMG", "c) MEDIA", "d) FOTO"]
                },
                {
                    "text": "¿Qué sintaxis permite crear un vínculo interno hacia otra hoja de la biblioteca?",
                    "options": ["a) ((Nombre Hoja))", "b) [[Nombre Hoja]]", "c) {{Nombre Hoja}}", "d) <<Nombre Hoja>>"]
                },
                {
                    "text": "¿Qué motor matemático utiliza Odisea para renderizar fórmulas?",
                    "options": ["a) SymPy", "b) KaTeX", "c) MathML nativo", "d) PostScript"]
                },
                {
                    "text": "¿Cómo se alinea una columna de tabla al centro en la sintaxis subyacente?",
                    "options": ["a) :---", "b) :---:", "c) ---:", "d) |center|"]
                },
                {
                    "text": "¿Qué ocurre al pulsar Enter en la última celda de una fila de tabla?",
                    "options": ["a) Se cierra la tabla", "b) Se inserta una nueva fila automáticamente", "c) Se borra el contenido", "d) Salta fuera de la tabla"]
                },
                {
                    "text": "¿Qué resolución estándar aplica Odisea a las imágenes en la exportación a PDF para imprenta?",
                    "options": ["a) 72 DPI", "b) 300 DPI", "c) 1200 DPI", "d) 96 DPI"]
                },
                {
                    "text": "¿Dónde se pueden inspeccionar los enlaces entrantes (backlinks) de la hoja activa?",
                    "options": ["a) En el menú Ayuda", "b) En el Panel 4 (Dashboard de Escritura)", "c) En la barra de título de Windows", "d) En la Papelera"]
                }
            ]
        },
        "solutions": {
            "items": [
                {"correct_answer": "b) Tab", "explanation": "La tecla Tab navega de celda en celda hacia adelante; Shift+Tab retrocede."},
                {"correct_answer": "b) $$fórmula$$", "explanation": "El doble delimitador $$ genera una fórmula centrada en bloque destacado."},
                {"correct_answer": "b) En ./odisea_data/attachments/", "explanation": "El repositorio local relativo almacena todas las imágenes con hash SHA-256."},
                {"correct_answer": "b) IMG", "explanation": "El micro-badge IMG de 16px identifica la presencia de una imagen en la línea."},
                {"correct_answer": "b) [[Nombre Hoja]]", "explanation": "La sintaxis [[WikiLink]] vincula documentos internamente con sugerencias automáticas."},
                {"correct_answer": "b) KaTeX", "explanation": "KaTeX garantiza renderizado ultrarrápido y sin conexión de fórmulas matemáticas."},
                {"correct_answer": "b) :---:", "explanation": "Los dos puntos en ambos extremos de los guiones centran la columna."},
                {"correct_answer": "b) Se inserta una nueva fila automáticamente", "explanation": "Enter en la última celda añade una fila nueva sin interrumpir la escritura."},
                {"correct_answer": "b) 300 DPI", "explanation": "300 DPI es el estándar internacional de artes gráficas e imprenta editorial."},
                {"correct_answer": "b) En el Panel 4 (Dashboard de Escritura)", "explanation": "El Dashboard reúne la sección de enlaces entrantes y red de referencias."}
            ]
        }
    }
