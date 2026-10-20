import sys
from pathlib import Path

SKILL_ROOT = Path(r"C:\Users\IsaNet\.gemini\config\skills\technical-book-pdf")
sys.path.insert(0, str(SKILL_ROOT / "scripts"))

from components import EditorialComponents as EC
from generate_diagram import TechnicalDiagrams as TD

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
    {EC.section_header("Anotaciones Flotantes, Notas al Pie y Tabla Maestra de las 28 Etiquetas", 1, "3.3")}
    <p>La redacción fluida se interrumpe cuando el autor debe desplazarse hasta el final del documento para insertar una nota al pie. En Odisea, las notas y anotaciones se declaran <strong>en el mismo punto donde surge la idea</strong>, desplegándose en micro-popovers editables sin abandonar la línea activa:</p>

    <ul>
        <li><strong>Notas al Pie no Intrusivas:</strong> Se declaran como <code>(fn: Texto explicativo de la nota)</code>. En el editor se muestran como una micro-píldora marginal <code>FN</code>; al hacer clic, un popover permite editar su contenido. En la exportación, se compilan automáticamente como notas al pie numeradas al final de la página o del capítulo.</li>
        <li><strong>Anotaciones al Margen:</strong> Declaradas como <code>{{a: Nota de revisión o fuente}}</code>, con micro-badge ámbar de advertencia visual.</li>
        <li><strong>Comentarios Inline de Autor:</strong> Escritos entre llaves simples <code>{{recordar comprobar esta fecha}}</code>. Se muestran atenuados en cursiva sepia y se omiten en la exportación final.</li>
    </ul>

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
            {"header_section": "TABLA MAESTRA DE LAS 28 ETIQUETAS", "html_content": p3_html}
        ],
        "summary": {
            "key_points": [
                "Markdown XL separa el token .ulysses-tag del texto para lograr un lienzo limpio pero explícito.",
                "Los encabezados (# a ######) proyectan micro-indicadores compactos (H1..H6) en el margen.",
                "Las Smart Lists renumeran automáticamente las secuencias de ítems al insertar o suprimir elementos.",
                "Los bloques de verso (|&quot; ) y comentarios privados (%% ) cubren necesidades exclusivas de autores.",
                "Las 28 etiquetas abarcan desde matemáticas KaTeX hasta anotaciones popover y tablas interactivas."
            ],
            "requirements": [
                "Distinguir el comportamiento de las notas al pie (fn:...) de las anotaciones {a:...}.",
                "Recordar que el texto contenido en bloques de comentario %% nunca se incluye en exportaciones.",
                "Dominar el uso de ::marcado:: y ||tachado|| durante la fase de corrección de textos."
            ]
        },
        "questionnaire": {
            "columns": 2,
            "questions": [
                {
                    "text": "¿Cómo se indica una nota al pie en Markdown XL dentro de Odisea?",
                    "options": ["a) [^1]: nota al pie", "b) (fn: Contenido de la nota)", "c) {footnote: nota}", "d) <footnote>nota</footnote>"]
                },
                {
                    "text": "¿Qué ocurre con el texto encerrado en bloques de comentario %% al exportar a PDF o DOCX?",
                    "options": ["a) Se imprime en color rojo", "b) Se exporta al final como anexo", "c) Nunca se exporta; permanece estrictamente privado", "d) Genera un error de compilación"]
                },
                {
                    "text": "¿Qué sintaxis se utiliza en Markdown XL para aplicar resaltado fluorescente a un texto?",
                    "options": ["a) ==texto resaltado==", "b) ::texto resaltado::", "c) ++texto resaltado++", "d) **texto resaltado**"]
                },
                {
                    "text": "¿Cuál es la función del prefijo |\" al comienzo de una línea?",
                    "options": ["a) Iniciar una tabla", "b) Declarar un bloque de verso o poesía respetando los retornos de carro", "c) Crear una barra vertical divisoria", "d) Insertar una fórmula matemática"]
                },
                {
                    "text": "¿Qué micro-indicador visual proyecta Odisea en el margen izquierdo ante una etiqueta ### ?",
                    "options": ["a) Un icono de lápiz", "b) Una micro-píldora con el texto 'H3'", "c) Un número 3 gigante", "d) Nada, lo oculta"]
                },
                {
                    "text": "¿Qué sintaxis se emplea para tachar texto descartado en Markdown XL?",
                    "options": ["a) ~~texto tachado~~", "b) ||texto tachado||", "c) --texto tachado--", "d) [del]texto[/del]"]
                },
                {
                    "text": "¿Qué ventaja ofrecen las Smart Lists numeradas (1. ) en Odisea?",
                    "options": ["a) Tienen colores aleatorios", "b) Se renumeran automáticamente al añadir o reordenar elementos", "c) Solo admiten números romanos", "d) Convierten la lista en tabla"]
                },
                {
                    "text": "¿Cómo se define un comentario breve de autor en línea?",
                    "options": ["a) /* comentario */", "b) {comentario de autor}", "c) <!-- comentario -->", "d) # comentario"]
                },
                {
                    "text": "¿Qué motor de coloreado sintáctico gestiona los bloques de código delimitados por ''''?",
                    "options": ["a) Prism clásico", "b) Shiki / Highlight.js con soporte multi-lenguaje", "c) Compilador de C++", "d) Expresiones regulares básicas"]
                },
                {
                    "text": "¿Cuántas etiquetas semánticas formales componen la especificación canónica de Markdown XL en Odisea?",
                    "options": ["a) 12 etiquetas", "b) 28 etiquetas", "c) 50 etiquetas", "d) 16 etiquetas"]
                }
            ]
        },
        "solutions": {
            "items": [
                {"correct_answer": "b) (fn: Contenido de la nota)", "explanation": "La sintaxis (fn:...) define notas al pie en el punto exacto de la prosa, abriendo un micro-popover no intrusivo."},
                {"correct_answer": "c) Nunca se exporta; permanece estrictamente privado", "explanation": "Los bloques %% están concebidos para notas íntimas del autor, advertencias y borradores intermedios."},
                {"correct_answer": "b) ::texto resaltado::", "explanation": "El doble dos puntos :: es el estándar canónico de Ulysses y Odisea para texto marcado con resaltador."},
                {"correct_answer": "b) Declarar un bloque de verso o poesía respetando los retornos de carro", "explanation": "El prefijo |\" resuelve el clásico problema de Markdown, preservando las pausas métricas sin trucos de espacios dobles."},
                {"correct_answer": "b) Una micro-píldora con el texto 'H3'", "explanation": "Las micro-píldoras de margen (H1 a H6) ofrecen orientación espacial inmediata sin sobrecargar el flujo de texto."},
                {"correct_answer": "b) ||texto tachado||", "explanation": "El doble pipe || indica texto suprimido o descartado en la especificación Markdown XL."},
                {"correct_answer": "b) Se renumeran automáticamente al añadir o reordenar elementos", "explanation": "El analizador inteligente recalcula la progresión ordinal al mover párrafos arriba o abajo."},
                {"correct_answer": "b) {comentario de autor}", "explanation": "Las llaves simples { } delimitan comentarios de autor inline atenuados visualmente."},
                {"correct_answer": "b) Shiki / Highlight.js con soporte multi-lenguaje", "explanation": "Shiki proporciona coloreado sintáctico con la misma fidelidad de temas que Visual Studio Code."},
                {"correct_answer": "b) 28 etiquetas", "explanation": "La gramática EBNF en .rea_evidence/markdown_xl_grammar.ebnf especifica exactamente las 28 etiquetas de Ulysses."}
            ]
        }
    }

def get_chapter_4():
    p1_html = f"""
    {EC.section_header("El Editor Visual de Tablas (TableWidget)", 1, "4.1")}
    <p>Uno de los mayores obstáculos históricos del formato Markdown ha sido la penosa redacción manual de tablas mediante barras verticales y guiones desalineados. Odisea supera esta limitación con <strong>TableWidget</strong>, un componente visual interactivo incrustado directamente en el flujo del documento que combina la agilidad de una hoja de cálculo con la pureza semántica del texto plano:</p>

    <ul>
        <li><strong>Controles Directos de Estructura:</strong> Al situar el cursor sobre cualquier tabla, aparecen micro-botones contextuales (+) en los bordes derecho e inferior que permiten insertar nuevas columnas y filas al instante con un solo clic.</li>
        <li><strong>Alineación y Ancho Proporcional:</strong> Cada encabezado de columna dispone de un micro-selector para fijar la alineación (izquierda, centro o derecha) y ajustar la distribución visual de anchos.</li>
        <li><strong>Reordenación por Arrastre (Drag & Drop):</strong> Las filas y columnas se pueden reorganizar arrastrando sus tiradores marginales sin alterar el resto del documento.</li>
        <li><strong>Ordenación Numérica y Alfabética:</strong> Haz clic en el indicador de ordenación de cualquier columna para ordenar la tabla en sentido ascendente o descendente al instante.</li>
    </ul>

    {EC.callout(
        "HITO TECNOLÓGICO · INTEROPERABILIDAD DIRECTA CON EXCEL Y SHEETS",
        "Puedes seleccionar cualquier rango de celdas en <strong>Microsoft Excel</strong>, <strong>Google Sheets</strong> o copiar datos separados por comas (CSV) y pegarlos directamente (<code>Ctrl+V</code>) en el editor de Odisea. El motor intercepta los datos tabulares del portapapeles y los transforma instantáneamente en una tabla Markdown XL perfectamente formateada.",
        "milestone"
    )}
    """

    p2_html = f"""
    {EC.section_header("Ecuaciones Matemáticas en Vivo con KaTeX (EquationWidget)", 1, "4.2")}
    <p>Para la redacción de informes científicos, papers de ingeniería, apuntes de física o tratados analíticos, Odisea incorpora un motor de renderizado matemático de ultra-alta velocidad basado en <strong>KaTeX</strong>. Las expresiones matemáticas se editan en sintaxis estándar LaTeX con previsualización vectorial instantánea sin parpadeos:</p>

    <ul>
        <li><strong>Ecuaciones en Línea (Inline Math):</strong> Declaradas entre signos de dólar simples: <code>$E = mc^2$</code> o <code>$\\lambda = \\frac{{h}}{{p}}$</code>. El texto matemático se integra con precisión métrica en el flujo de la línea manteniendo la alineación de la línea base tipográfica.</li>
        <li><strong>Bloques Matemáticos Desplegados (Display Math):</strong> Declarados entre dobles signos de dólar: <code>$$ ... $$</code> o escribiendo la macro <code>(eq)</code>. Despliegan un bloque centralizado con edición de código LaTeX y vista previa matemática en vivo:</li>
    </ul>

    <div class="code-box">
        <pre><code class="language-text">$$
\\nabla \\times \\mathbf{{E}} = -\\frac{{\\partial \\mathbf{{B}}}}{{\\partial t}} \\quad ; \\quad
\\nabla \\times \\mathbf{{B}} = \\mu_0 \\mathbf{{J}} + \\mu_0 \\varepsilon_0 \\frac{{\\partial \\mathbf{{E}}}}{{\\partial t}}
$$</code></pre>
    </div>

    {EC.callout(
        "DEFINICIÓN · COMPILACIÓN LOCAL SIN DEPENDENCIAS DE RED",
        "El motor KaTeX está completamente embebido en el binario de Odisea. No requiere conexión a internet, compiladores externos de TeX ni servidores remotos. Las fórmulas se renderizan como vectores matemáticos puros listos para impresión editorial.",
        "definition"
    )}
    """

    p3_html = f"""
    {EC.section_header("Medios Adjuntos, Imágenes y Tabla de Contenidos Marginal", 1, "4.3")}
    <p>El tratamiento de gráficos e ilustraciones en Odisea conjuga la ligereza del texto con la riqueza visual de los medios modernos:</p>

    <ul>
        <li><strong>Imágenes en Línea (img):</strong> Se declaran mediante <code>(img: ruta_o_nombre.png)</code>. En el editor se proyectan como una tarjeta compacta con miniatura, dimensiones y micro-badge <code>IMG</code>. Al hacer clic, se abre un popover para definir el pie de figura, texto alternativo accesible y escala de visualización.</li>
        <li><strong>Almacenamiento Local de Adjuntos:</strong> Cuando arrastras una imagen desde el Explorador de archivos de Windows 11 al editor, Odisea la copia automáticamente en la carpeta relativa <code>./odisea_data/attachments/</code> calculando su hash SHA-256 para prevenir duplicados.</li>
        <li><strong>Tabla de Contenidos Marginal (TOC):</strong> Al insertar la etiqueta <code>(toc)</code>, Odisea genera un árbol interactivo en miniatura que refleja en tiempo real todos los encabezados del documento, permitiendo saltar con un clic a cualquier sección sin salir de la hoja.</li>
    </ul>

    {EC.table(
        ["Widget Interactivo", "Disparador Sintáctico", "Capacidades Operativas Principales"],
        [
            ["TableWidget", "Sintaxis de tabla o pegar desde Excel", "Filas/columnas dinámicas, ordenación, alineación y drag-and-drop"],
            ["EquationWidget", "<code>$fórmula$</code> o <code>$$bloque$$</code>", "Motor KaTeX local, previsualización en vivo sin red"],
            ["MediaWidget", "<code>(img: archivo.png)</code> o arrastrar", "Almacenamiento automático en attachments/, captions y micro-badge IMG"],
            ["TocWidget", "<code>(toc)</code>", "Navegación jerárquica marginal dinámica por encabezados H1..H6"],
            ["FootnotePopover", "<code>(fn: nota)</code>", "Edición no intrusiva en micro-ventana flotante sin saltar al final"],
            ["AnnotationPopover", "<code>{a: nota}</code>", "Micro-píldora marginal con notas de revisión editorial"]
        ],
        ["22%", "28%", "50%"]
    )}
    """

    return {
        "number": 4,
        "title": "Widgets Interactivos: Tablas, Fórmulas KaTeX y Medios",
        "short_title": "WIDGETS INTERACTIVOS",
        "block": "BLOQUE II — EL MOTOR DE EDICIÓN Y MARKDOWN XL",
        "block_kicker": "BLOQUE II · EL MOTOR DE EDICIÓN",
        "objectives": [
            "Operar el editor visual de tablas integrado con ordenación, alineación y drag-and-drop.",
            "Pegar rangos tabulares directamente desde Microsoft Excel y Google Sheets con auto-conversión.",
            "Redactar y renderizar expresiones matemáticas LaTeX en tiempo real con el motor KaTeX local.",
            "Gestionar imágenes adjuntas en ./odisea_data/attachments/ y tablas de contenidos marginales (TOC)."
        ],
        "pages": [
            {"header_section": "EL EDITOR VISUAL DE TABLAS", "html_content": p1_html},
            {"header_section": "FÓRMULAS MATEMÁTICAS CON KATEX", "html_content": p2_html},
            {"header_section": "MEDIOS ADJUNTOS Y TABLA DE CONTENIDOS", "html_content": p3_html}
        ],
        "summary": {
            "key_points": [
                "TableWidget permite editar tablas complejas visualmente sin lidiar con barras y guiones manuales.",
                "Soporta pegado directo desde Excel y Google Sheets convirtiéndolos en tablas limpias de Markdown XL.",
                "EquationWidget integra KaTeX para renderizar matemáticas LaTeX locales sin conexión a internet.",
                "Las imágenes se guardan automáticamente en ./odisea_data/attachments/ con verificación SHA-256.",
                "La etiqueta (toc) proyecta un mapa jerárquico dinámico en el margen para navegación rápida."
            ],
            "requirements": [
                "Saber insertar una tabla y configurar la alineación de sus columnas.",
                "Conocer la diferencia entre fórmulas inline ($) y bloques matemáticos desplegados ($$).",
                "Comprender cómo se asocian las imágenes en la carpeta ./odisea_data/attachments/."
            ]
        },
        "questionnaire": {
            "columns": 2,
            "questions": [
                {
                    "text": "¿Qué ocurre al copiar celdas en Microsoft Excel y pulsar Ctrl+V dentro de Odisea?",
                    "options": ["a) Se pega una captura gráfica en mapa de bits", "b) Se transforma automáticamente en una tabla interactiva Markdown XL", "c) Da un error de formato no compatible", "d) Se borra el portapapeles"]
                },
                {
                    "text": "¿Qué motor matemático integra Odisea para la composición de fórmulas científicas?",
                    "options": ["a) MathJax vía servidor web", "b) KaTeX local de alto rendimiento", "c) Microsoft Equation 3.0", "d) Wolfram Alpha API"]
                },
                {
                    "text": "¿Cómo se delimita una fórmula matemática en línea dentro de un párrafo?",
                    "options": ["a) Entre corchetes [math]...[/math]", "b) Entre signos de dólar simples $fórmula$", "c) Entre comillas dobles \"fórmula\"", "d) Con la etiqueta <math>"]
                },
                {
                    "text": "¿Dónde se guardan las imágenes que arrastras al editor de Odisea?",
                    "options": ["a) En C:\\Windows\\Temp", "b) En ./odisea_data/attachments/ con hash SHA-256", "c) En la nube de Microsoft", "d) En %APPDATA%\\Roaming"]
                },
                {
                    "text": "¿Qué micro-badge se proyecta en el margen ante una imagen adjunta?",
                    "options": ["a) PHOTO", "b) IMG", "c) PIC", "d) MEDIA"]
                },
                {
                    "text": "¿Qué etiqueta genera una tabla de contenidos jerárquica marginal?",
                    "options": ["a) [indice]", "b) (toc)", "c) {table-of-contents}", "d) ----toc----"]
                },
                {
                    "text": "¿Requiere KaTeX conexión a internet para renderizar fórmulas matemáticas en Odisea?",
                    "options": ["a) Sí, descarga las fuentes de Google", "b) No, funciona de manera 100% local y autónoma", "c) Solo en la primera ejecución", "d) Requiere suscripción activa"]
                },
                {
                    "text": "¿Qué micro-botones aparecen en los bordes de una tabla al situar el cursor sobre ella?",
                    "options": ["a) Botones de borrado masivo", "b) Botones contextuales (+) para insertar filas y columnas al instante", "c) Botones de exportación a Word", "d) Ninguno"]
                },
                {
                    "text": "¿Permite TableWidget ordenar los datos de una columna de forma ascendente o descendente?",
                    "options": ["a) No, las tablas son estáticas", "b) Sí, haciendo clic en el control de ordenación de cada columna", "c) Solo mediante fórmulas SQL", "d) Requiere reiniciar el programa"]
                },
                {
                    "text": "¿Cómo se edita una nota al pie declarada con (fn:...)?",
                    "options": ["a) Hay que desplazarse manualmente a la última página", "b) Haciendo clic sobre su micro-badge FN para abrir su popover flotante", "c) En un archivo de texto separado", "d) En la barra de estado inferior"]
                }
            ]
        },
        "solutions": {
            "items": [
                {"correct_answer": "b) Se transforma automáticamente en una tabla interactiva Markdown XL", "explanation": "El manejador de pegado intercepta el texto tabulado de Excel y construye el bloque TableWidget automáticamente."},
                {"correct_answer": "b) KaTeX local de alto rendimiento", "explanation": "KaTeX ofrece una velocidad de renderizado superior a MathJax y funciona completamente sin conexión."},
                {"correct_answer": "b) Entre signos de dólar simples $fórmula$", "explanation": "La convención estándar de LaTeX $...$ sitúa la fórmula en línea alineando su línea base."},
                {"correct_answer": "b) En ./odisea_data/attachments/ con hash SHA-256", "explanation": "El mandato de portabilidad confina los medios al subdirectorio attachments de odisea_data."},
                {"correct_answer": "b) IMG", "explanation": "La micro-píldora IMG identifica visualmente la presencia de medios en el margen de la hoja."},
                {"correct_answer": "b) (toc)", "explanation": "La macro (toc) evalúa el árbol de encabezados H1 a H6 proyectando el índice dinámico."},
                {"correct_answer": "b) No, funciona de manera 100% local y autónoma", "explanation": "KaTeX y sus fuentes vectoriales matemáticas están embebidos en el propio paquete ejecutable."},
                {"correct_answer": "b) Botones contextuales (+) para insertar filas y columnas al instante", "explanation": "Los controles interactivos permiten expandir la matriz tabular de forma táctil y precisa."},
                {"correct_answer": "b) Sí, haciendo clic en el control de ordenación de cada columna", "explanation": "TableWidget incluye lógica de ordenación numérica y alfabética instantánea en memoria."},
                {"correct_answer": "b) Haciendo clic sobre su micro-badge FN para abrir su popover flotante", "explanation": "Los micro-popovers permiten corregir la nota sin perder el contexto visual de la frase que se redacta."}
            ]
        }
    }
