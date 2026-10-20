# Guía Maestra de Ingeniería y Desarrollo de Software: Proyecto ODISEA para Windows 11
**Réplica Exacta y Extendida de Ulysses (macOS) mediante Google Antigravity IDE, Arquitectura Portable de Ejecutable Único y Metodología REA (Morluto) vía MCP**

---

## Índice de Contenidos
1. [Sección 1: Análisis Exhaustivo de Funcionalidades y Capacidades de Ulysses](#seccion-1)
2. [Sección 2: Especificación de Requisitos Software (SRS) de Odisea para Windows 11](#seccion-2)
3. [Sección 3: Investigación e Implementación del Motor de Estilos (ULSS) y Temas Visuales](#seccion-3)
4. [Sección 4: Configuración Paso a Paso de Google Antigravity IDE y REA (Morluto) vía MCP](#seccion-4)
5. [Sección 5: Catálogo Maestro de Prompts Secuenciales para Google Antigravity IDE](#seccion-5)
6. [Sección 6: Arquitectura de Agentes Adversarios (Red Team / Blue Team) en Bucle Autónomo](#seccion-6)
7. [Anexo: Exportación de esta Guía a PDF de Alta Calidad](#anexo-pdf)

---

<a name="seccion-1"></a>
## 1. Análisis Exhaustivo de Funcionalidades y Capacidades de Ulysses

A partir del análisis profundo de la documentación oficial de Ulysses (`ulysses.app`, `help.ulysses.app/en_US/guides`, `the-library/ulysses-library`, `releases/` hasta las versiones de finales de 2026 y `styles.ulysses.app`), se desglosa la totalidad de la arquitectura funcional que convierte a Ulysses en el referente de la escritura estructurada.

### 1.1. Filosofía Operativa: WYSIWYM (*What You See Is What You Mean*)
A diferencia de los procesadores de texto tradicionales basados en WYSIWYG (*What You See Is What You Get*, como Microsoft Word), Ulysses separa estrictamente **la creación semántica del contenido** de **la maquetación visual final**:
* El autor escribe en texto plano enriquecido semánticamente mediante **Markdown XL** (un lenguaje propio de 28 etiquetas).
* El aspecto dentro del editor está gobernado por **Temas de Editor** (*Editor Themes*), diseñados para maximizar la ergonomía visual y la concentración.
* El aspecto del documento final exportado (PDF, DOCX, ePub, HTML) está gobernado por **Hojas de Estilo de Exportación** (*Ulysses Style Sheets* - `.ulss` y CSS).

### 1.2. Arquitectura de Interfaz de Tres Paneles + Dashboard
La interfaz se estructura en cuatro áreas colapsables con navegación completa por teclado físico (incluyendo el paso fluido entre paneles con teclas de dirección, `Return` para profundizar o *drill-down* y `Ctrl/Cmd + Return` para subir de nivel):
1. **Panel 1 — La Biblioteca (*The Library*)**: Árbol jerárquico izquierdo que centraliza todas las fuentes de documentos.
2. **Panel 2 — Lista de Hojas (*Sheet List*)**: Columna intermedia que muestra las hojas (*Sheets*) pertenecientes al grupo, proyecto o filtro seleccionado, con extractos de texto, indicadores de progreso, etiquetas (*Keywords*) e iconos de publicación.
3. **Panel 3 — El Editor (*The Editor*)**: Lienzo central de escritura con barra de herramientas personalizable (*Customizable Toolbar*), barra inferior contextual de marcado (*Markup Bar*) y contador flotante en vivo.
4. **Panel 4 — El Cuadro de Mandos (*Dashboard*)**: Panel lateral derecho multipropósito que muestra estadísticas, objetivos, esquema de encabezados (*Outline*), vista general de elementos (*Overview*), palabras clave, adjuntos, enlaces entrantes (*Backlinks*) y el modo de revisión gramatical/estilística (*Revision Mode*).

### 1.3. Análisis Profundo de La Biblioteca (*The Library*)
Según la especificación oficial de `the-library/ulysses-library` y las actualizaciones de gestión de 2025–2026, la Biblioteca no utiliza el sistema de ficheros tradicional expuesto al usuario, sino un repositorio unificado dividido en secciones reordenables y configurables:

| Sección de Biblioteca | Comportamiento y Capacidades Técnicas |
| :--- | :--- |
| **1. Filtros Globales (*Global Filters*)** | Opcionales en la parte superior. Incluyen: **Todo (*All*)** (orden cronológico), **Últimos 7 días (*Last 7 Days*)**, **Favoritos (*Favorites*)** (aparece automáticamente al marcar la primera hoja como favorita) y **Papelera (*Trash*)**. Permite configurar si se incluyen o excluyen las hojas pertenecientes a *Proyectos*. |
| **2. Notas (*Notes*)** | Orientada a textos sueltos, apuntes o artículos independientes. Incluye una **Bandeja de Entrada (*Inbox*)** por defecto (con contador opcional de hojas) y permite crear una jerarquía infinita de **Grupos** y **Subgrupos**, además de **Filtros Inteligentes**. Soporta dividir entre notas sincronizadas y notas estrictamente locales. |
| **3. Proyectos (*Projects*)** | Espacios de trabajo autocontenidos que actúan como bibliotecas independientes. Al abrir un proyecto, el resto de la biblioteca puede ocultarse para garantizar foco absoluto. Cada proyecto cuenta con:<br>• **Contenido Principal (*Main Content*)** vs. **Extras** (investigación, fichas de personajes).<br>• **Grupo de Plantillas (*Templates Group*)** dedicado a plantillas de hojas.<br>• **Plantillas de Proyecto (*Project Templates*)** al inicializar.<br>• **Pool de Palabras Clave (*Keyword Pool*)** exclusivo con colores propios.<br>• **Exportador Dedicado**: recuerda el formato y estilo `.ulss` preferido.<br>• **Archivo de Proyectos (*Project Archives*)** para ocultar proyectos finalizados.<br>• **Duplicación y Exportación ZIP (*Share Projects*)**. |
| **4. Carpetas Externas (*External Folders*)** | Permite montar directorios del disco duro local, unidades de red, repositorios Git o carpetas sincronizadas por servicios cloud (Dropbox, OneDrive, Google Drive). Soporta dos modos de almacenamiento por carpeta:<br>• **Modo Markdown Estándar** (`.md`, `.txt`, `.markdown`): máxima compatibilidad con herramientas externas; lee y escribe metadatos básicos.<br>• **Modo Nativo (`.ulyz` / `.odisea`)**: conserva las 28 etiquetas de Markdown XL, anotaciones, comentarios, objetivos y adjuntos. |
| **5. Copias de Seguridad (*Backups*)** | Sistema automático e inmutable de instantáneas temporales: copias horarias (últimas 12 horas), diarias (últimos 7 días) y semanales (histórico completo), con visor integrado para restaurar hojas individuales o bibliotecas completas. |

#### Operaciones Avanzadas sobre Hojas (*Sheets*) y Grupos (*Groups*)
* **Pegado Virtual de Hojas (*Glue Sheets*)**: Varias hojas consecutivas dentro de un grupo pueden "pegarse" (*Glue*) para que el editor las muestre y edite como un único documento continuo sin fusionarlas físicamente en la base de datos.
* **Dividir y Fusionar (*Split & Merge*)**: Dividir una hoja exactamente en la posición del cursor en dos hojas independientes, o fusionar múltiples hojas seleccionadas en una sola.
* **Hojas de Material (*Material Sheets*)**: Hojas marcadas como "Material" que residen junto a los capítulos pero quedan automáticamente excluidas del cómputo de palabras de exportación y del documento final compilado.
* **Personalización Visual de Entidades**: Grupos, Proyectos y Filtros disponen de vista de edición dedicada (*Edit View*) para nombre, color personalizado e icono seleccionable entre más de 60 pictogramas vectoriales, además de una vista de Estadísticas e Historial de sesiones (*Statistics View*).

### 1.4. El Motor de Edición y las 28 Etiquetas de Markdown XL
Ulysses soporta cuatro dialectos de marcado configurables por hoja: **Markdown XL** (por defecto), **Markdown estándar**, **Minimark** y **Textil'd**. Markdown XL consta exactamente de **28 etiquetas semánticas** distribuidas en cuatro categorías:

#### A. Etiquetas de Párrafo y Bloque (10 etiquetas)
1. **Encabezados 1 a 6 (`#` a `######`)**: Seis niveles jerárquicos. Atajos `Ctrl + #` y `Ctrl + Shift + #` para incrementar o reducir el nivel.
2. **Lista Desordenada (`- `, `* `, `+ `)**: Con continuación automática inteligente (*Smart Lists*).
3. **Lista Ordenada (`1. `, `2. `)**: Numeración secuencial automática al insertar o reordenar líneas.
4. **Lista de Tareas (`- [ ]`, `- [x]`)**: Casillas de verificación interactivas clicables en el editor y listadas en el Dashboard.
5. **Cita en Bloque (*Blockquote*, `> `)**: Soporta anidamiento multinivel (`>> `).
6. **Bloque de Verso / Poesía (`|" `)**: Conserva los saltos de línea internos y sangrías poéticas en la exportación.
7. **Bloque de Comentario (`%% `)**: Párrafo completo de notas del autor; excluido de la exportación estándar pero incluido en el estilo *Revision*.
8. **Bloque de Código (`''` o ```` ``` ````)**: Bloque con resaltado de sintaxis (más de 50 lenguajes), selector de lenguaje y fuente monoespaciada.
9. **Bloque de Código Fuente Crudo (*Raw Source Block*, `~~ `)**: Inyecta el contenido directamente sin escapar en el motor de destino (por ejemplo, código HTML puro al exportar a HTML/ePub o comandos LaTeX al exportar a PDF).
10. **Divisor (*Divider*, `----`)**: Separador temático de escena o sección.

#### B. Objetos Estructurados de Nivel Bloque (3 etiquetas especiales)
11. **Tablas Interactivas (`|` / `(tbl)`)**: Creación rápida de tablas con soporte para reordenar filas y columnas mediante *drag & drop*, alineación por columna (izquierda, centro, derecha), ajuste de ancho, ordenación alfabética/numérica de filas, importación directa al pegar desde Excel/CSV, imágenes en línea dentro de celdas y revisión ortográfica en celdas.
12. **Ecuaciones Matemáticas (`$$` / `(eq)`)**: Soporte nativo de ecuaciones LaTeX en bloque e inline (`$...$`), renderizadas en tiempo real en el editor y tipografiadas vectorialmente al exportar. Por ejemplo:
    $$\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}$$
13. **Tabla de Contenidos Automática (`(toc)`)**: Etiqueta literal `(toc)` que genera e inyecta el índice jerárquico paginado o hipervinculado durante la exportación.

#### C. Etiquetas en Línea (*Inline Tags*) (10 etiquetas)
14. **Énfasis Fuerte / Negrita (`**texto**`)**: Atajo `Ctrl + B`.
15. **Énfasis / Cursiva (`_texto_`)**: Atajo `Ctrl + I`.
16. **Resaltado / Marcado (`::texto::`)**: Equivalente a marcador fluorescente sobre el texto.
17. **Tachado / Redactar (`||texto||`)**: Marca el texto como eliminado; las hojas de estilo de exportación lo omiten automáticamente salvo en modo *Revision*.
18. **Comentario en Línea (`++texto++`)**: Nota editorial intercalada en una frase, omitida en la exportación final.
19. **Anotación (`{texto anotado}`)**: Subraya el fragmento de texto y abre un globo emergente (*popover*) donde el autor redacta una reflexión o nota extensa asociada a ese fragmento sin ensuciar el flujo del párrafo.
20. **Código en Línea (`` `código` ``)**: Fragmento técnico monoespaciado.
21. **Fuente Cruda en Línea (`~raw~`)**: Inyección inline directa para el exportador.
22. **Enlaces Web (`[texto]`)**: Abre un cuadro de diálogo emergente para definir URL, título y previsualización; o reconoce URLs pegadas automáticamente. Atajo `Ctrl + K`.
23. **Enlaces Internos (*Internal Links* y *Backlinks*)**: Permite enlazar a cualquier encabezado de la misma hoja o de otra hoja/proyecto de la biblioteca. El Dashboard registra automáticamente los **Enlaces Entrantes (*Incoming Links / Backlinks*)** permitiendo navegar como en una base de conocimiento bidireccional.

#### D. Objetos Rich Media y Marcadores de Posición (5 etiquetas)
24. **Nota al Pie (`(fn)`)**: Inserta un marcador superíndice interactivo (`＊`) que despliega un editor emergente para el contenido de la nota al pie, auto-numerándose al exportar.
25. **Imagen (`(img)`)**: Inserta imágenes locales o por URL con previsualización en línea (*Inline Image Previews* incluso dentro de párrafos y tablas), ajuste de tamaño, pie de foto (*Caption*), texto alternativo (*Alt*), título y lienzo integrado de bocetos/anotaciones (*Sketch & Annotate*).
26. **Vídeo (`(vid)`)**: Marcador semántico para vídeo local o embebido en exportaciones HTML/ePub.
27. **Salto de Línea Manual (`Shift + Enter` $\rightarrow$ `\`)**: Fuerza salto de línea dentro del mismo párrafo.
28. **Espacio en Blanco Protegido (`Alt + Espacio`)**: Carácter de espacio no colapsable que el motor Markdown respeta en la exportación.

### 1.5. Ergonomía Avanzada de Escritura, Dashboard, Objetivos y Publicación
* **Modo Máquina de Escribir (*Typewriter Mode*)**:
  * **Fijación de Línea Activa**: Mantiene la línea donde escribe el cursor centrada verticalmente, en el tercio superior, en el tercio inferior, o dentro de una banda variable.
  * **Resaltado de Foco (*Focus Highlight*)**: Atenúa todo el documento excepto la **Línea Actual**, la **Frase Actual** o el **Párrafo Actual**.
* **Objetivos de Escritura (*Writing Goals*) e Historial**:
  * Definibles por Hoja, por Grupo o por Proyecto.
  * Métricas: **Al menos (*At least*)**, **Alrededor de (*About*)** o **Como máximo (*At most*)** $N$ palabras, caracteres, líneas o páginas.
  * Soporte de fecha límite (*Deadline*) con cálculo automático de la cuota diaria necesaria y registro del historial de palabras escritas por día.
* **Modo Revisión (*Revision Mode*) y Herramientas de Escritura**:
  * Verificación avanzada en más de 20 idiomas de ortografía, gramática, puntuación, estilo, redundancia, tipografía y semántica (incluyendo el interior de tablas).
  * Funciones de asistencia para corregir, reescribir y resumir pasajes seleccionados.
* **Motor de Exportación y Publicación Directa**:
  * **Exportadores Locales**: PDF, DOCX, ePub, HTML (código limpio o página completa con estilos) y Texto Plano / Markdown / Rich Text.
  * **Publicación Directa en Plataformas**: Conectores nativos vía API REST con **WordPress** (WordPress.com y autoalojado, incluyendo actualización de entradas ya publicadas, imagen destacada, extracto, categorías, etiquetas y programación de fecha), **Ghost** (Admin API con actualización de posts), **Medium**, **Micro.blog**, e integración de **Copia optimizada para Substack** (*Copy for Substack*).

---

<a name="seccion-2"></a>
## 2. Especificación de Requisitos Software (SRS) de Odisea para Windows 11

Para cumplir con las exigencias de ser una aplicación nativa para **Windows 11**, **100% portable**, basada en un **único fichero ejecutable (`Odisea.exe`)**, ligera, de arranque instantáneo y capaz de replicar y superar a Ulysses, se define la siguiente arquitectura e ingeniería de requisitos.

### 2.1. Stack Tecnológico Seleccionado (Arquitectura Portable de Alto Rendimiento)
* **Core Backend & Empaquetado Nativo**: **Rust (Edición 2024) + Tauri v2**.
  * *Justificación*: Windows 11 incluye de serie en el sistema operativo el motor **Microsoft Edge WebView2 Runtime**. Gracias a esto, Tauri v2 compila toda la lógica de negocio en Rust y todos los recursos del frontend dentro de un **único binario nativo `Odisea.exe` de entre 8 MB y 12 MB**, sin necesidad de empaquetar Chromium (a diferencia de Electron que genera ejecutables de más de 180 MB).
  * **Arranque en frío (*Cold Start*)**: $< 120\text{ ms}$ en Windows 11.
  * **Consumo de RAM en reposo**: $< 65\text{ MB}$.
* **Motor de Base de Datos y Búsqueda**: **SQLite 3 embebido (`rusqlite` con flag `bundled`) + FTS5 (Full-Text Search 5)**.
  * Compilado estáticamente dentro de `Odisea.exe` (cero DLLs externas requeridas).
* **Frontend e Interfaz de Usuario**: **React 19 + TypeScript 5.8 + Tailwind CSS v4 + Zustand (Estado Global) + Lucide Icons (14px-16px)**.
* **Motor del Editor WYSIWYM**: **CodeMirror 6** con un **Parser Incremental Lezer a medida para las 28 etiquetas de Markdown XL**, decoraciones de línea/bloque en tiempo real y widgets interactivos para tablas, ecuaciones ($\text{KaTeX}$), notas al pie, anotaciones e imágenes.
* **Motor de Tipografía y Compilación ULSS (PDF / DOCX / ePub)**:
  * **PDF**: **Typst embebido en Rust (`typst` crate)** que traduce el árbol AST de Markdown XL + las reglas de la hoja `.ulss` a PDF nativo con rejilla base (*baseline grid*), soporte de columnas (*colspan*) y tipografía OpenType en milisegundos.
  * **DOCX**: Generador nativo en Rust de paquetes OpenXML (`.docx`) mapeando selectores `.ulss` a estilos de párrafo y carácter de Word.
  * **ePub**: Empaquetador nativo EPUB 3 en Rust.

### 2.2. Arquitectura de Portabilidad en Windows 11
Al ejecutarse `Odisea.exe` desde cualquier ubicación (disco local, carpeta de usuario o memoria USB externa), el ejecutable detecta su propio directorio de trabajo (`std::env::current_exe()`) y gestiona sus ficheros auxiliares de forma 100% relativa:

```text
📁 Directorio_Portable_Odisea/
 ├── 🚀 Odisea.exe                     <-- Único ejecutable autónomo (Rust + Tauri v2 + Assets embebidos)
 └── 📁 odisea_data/                   <-- Creado y gestionado automáticamente junto al .exe
      ├── ⚙️ config.toml               <-- Configuración general, atajos, modo visual activo y barras
      ├── 🗄️ library.odiseadb          <-- Base de datos SQLite + índice FTS5 de Notas y Proyectos
      ├── 📁 themes/                   <-- Temas de editor (.ultheme y .odiseatheme JSON)
      ├── 📁 styles/                   <-- Hojas de estilo de exportación (.ulss y .css)
      ├── 📁 attachments/              <-- Imágenes, PDFs y bocetos vinculados por hash SHA-256
      ├── 📁 backups/                  <-- Instantáneas automáticas comprimidas (.zst) horarias/diarias/semanales
      └── 📁 webview_profile/          <-- Caché aislada de WebView2 para no dejar rastro en %APPDATA%
```

> **Nota crítica de portabilidad**: En el arranque de `Odisea.exe`, el proceso Rust configura la variable de entorno `WEBVIEW2_USER_DATA_FOLDER` apuntando a `./odisea_data/webview_profile/`. Esto garantiza que ni siquiera el motor WebView2 de Windows 11 escriba datos en `C:\Users\<Usuario>\AppData\Local`, logrando **portabilidad pura de nivel forense**.

### 2.3. Catálogo Exhaustivo de Requisitos Funcionales (RF) y No Funcionales (RNF)

#### Módulo 1: Gestión de Biblioteca y Almacenamiento (RF-LIB)
* **RF-LIB-01**: El sistema proveerá las secciones *Global Filters*, *Projects*, *Notes* y *External Folders*, permitiendo reordenarlas mediante *drag & drop* y colapsarlas individualmente.
* **RF-LIB-02**: Los *Proyectos* aislarán su espacio de trabajo e incluirán subsecciones predefinidas (*Main Content*, *Extras*, *Templates*), su propio *Keyword Pool* coloreado y su configuración de exportación persistente.
* **RF-LIB-03**: Soporte de *Grupos* y *Subgrupos* con profundidad ilimitada, personalizables con título, color RGB/HEX e icono entre un catálogo de más de 70 micro-iconos vectoriales.
* **RF-LIB-04**: Implementación de *Filtros Inteligentes* evaluados en SQL/FTS5 con condiciones combinables (`AND`/`OR`/`NOT`) por texto contenido, presencia/ausencia de *Keywords*, fecha de creación y fecha de modificación.
* **RF-LIB-05**: Soporte de *Carpetas Externas* monitorizadas en tiempo real mediante el crate `notify` de Rust (eventos del sistema de archivos NTFS/FAT32 de Windows), sincronizando instantáneamente cambios realizados en archivos `.md`, `.txt` o `.ulyz` por editores externos.
* **RF-LIB-06**: Operaciones de hoja: Crear, Duplicar, Dividir en el cursor (*Split at Cursor*), Fusionar (*Merge*), Pegar virtualmente (*Glue Sheets*), Marcar como Favorita, Marcar como Hoja de Material (*Material Sheet*) y Mover a Papelera.
* **RF-LIB-07**: Motor de *Backups* automático en segundo plano con retención rotativa (12 copias horarias, 7 diarias, indefinidas semanales) y visor diferencial de restauración.

#### Módulo 2: Motor de Edición Markdown XL (RF-EDT)
* **RF-EDT-01**: Parser incremental completo para las **28 etiquetas de Markdown XL**, además de modos de compatibilidad para Markdown estándar (CommonMark/GFM), Minimark y Textil'd.
* **RF-EDT-02**: Widgets interactivos embebidos en el flujo del editor para:
  * **Tablas**: edición de celdas con tabulación, inserción/borrado/reordenación de filas y columnas, alineación, ordenación de filas e importación directa desde el portapapeles de Excel/CSV.
  * **Ecuaciones**: renderizado matemático instantáneo mediante $\text{KaTeX}$ para bloques `$$...$$` y expresiones inline `$...$`.
  * **Notas al pie `(fn)`, Anotaciones `{...}`, Enlaces `[...]` e Imágenes `(img)`**: edición en *popovers* flotantes no intrusivos y previsualización de miniaturas en línea.
* **RF-EDT-03**: Lienzo integrado de dibujo y anotación (*Sketch & Annotate*) sobre imágenes adjuntas con exportación vectorial SVG/PNG.
* **RF-EDT-04**: Sistema de Enlaces Internos entre encabezados y hojas (`odisea://sheet/<uuid>#<heading-slug>`) con cálculo automático de *Backlinks* (enlaces entrantes) e historial de navegación (*Atrás / Adelante*).
* **RF-EDT-05**: Modos de concentración: *Typewriter Scrolling* (fijo superior, central, inferior o banda variable), *Focus Highlight* (línea, frase o párrafo actual), enumeración de líneas opcional y modo pantalla completa sin bordes.
* **RF-EDT-06**: Barra de herramientas superior totalmente configurable (*Customizable Toolbar*), barra inferior contextual de marcado (*Markup Bar*) y paleta rápida de etiquetas invocada con `Ctrl + 9`.

#### Módulo 3: Modos Visuales, Micro-UI y Ergonomía Espacial (RF-VIS)
* **RF-VIS-01 (Modos de Visualización Obligatorios)**: Odisea incluirá un conmutador instantáneo de modos visuales en la barra superior (`Ctrl + Shift + M`) y en ajustes, con al menos los siguientes modos:
  1. **Modo Minimalista (Por Defecto)**: Inspirado en el diseño puro de Ulysses, sin bordes innecesarios y con máxima superficie de papel blanco cálido (`#FAFAFA`).
  2. **Modo Oscuro (*Odisea Dark & OLED*)**: Variante gris carbón (`#18181B`) y variante negro puro OLED (`#09090B`) con contraste calibrado para sesiones nocturnas.
  3. **Modo Solarizado (*Solarized Light & Solarized Dark*)**: Implementación matemática exacta de la paleta de Ethan Schoonover (`#FDF6E3` base clara / `#002B36` base oscura, texto `#657B83` / `#839496`, acentos `#B58900`, `#CB4B16`, `#268BD2`, `#2AA198`, `#859900`).
  4. **Modo Sepia (*Editorial Parchment*)**: Fondo pergamino cálido (`#F4ECD8`), texto tinta sepia profunda (`#433422`) y reducción de luz azul para lectura y escritura prolongada.
  5. **Modos Predefinidos Modernos y Visuales**:
     * **Windows 11 Mica / Liquid Glass**: Integración con la API DWM de Windows 11 para superficies translúcidas sutiles en los paneles laterales.
     * **Nordic Frost**: Paleta ártica de alto confort visual (`#2E3440` / `#ECEFF4`).
     * **Monokai Pro Editorial**: Para escritores técnicos y desarrolladores.
  6. **Modo Configurable por el Usuario (*Custom Studio Mode*)**: Editor visual en vivo donde el usuario define colores de interfaz, tipografías, densidad de paneles, radio de bordes, opacidad de etiquetas y colores de cada una de las 28 etiquetas de Markdown XL, guardando perfiles en `./odisea_data/themes/`.
* **RF-VIS-02 (Arquitectura Micro-UI de Alta Densidad)**:
  * Todos los iconos de interfaz, árbol de biblioteca, barra de herramientas y estados de publicación utilizarán **iconografía vectorial de pequeño tamaño (`14px` $\times$ `14px` en listas y `16px` $\times$ `16px` en barras)** con trazo nítido de `1.5px`.
  * Las etiquetas (*Keywords*), indicadores de etiquetas Markdown XL (`H1`–`H6`, `FN`, `IMG`, `TOC`, `RAW`) y contadores en vivo se mostrarán como **micro-píldoras compactas (*Micro-Tags*)** con altura máxima de `18px`, fuente de `10.5px` (`0.65rem`), `padding: 1px 5px` y bordes redondeados (`4px`), ocupando menos del $4\%$ del área total de la ventana para ceder el $96\%$ al espacio de trabajo efectivo.

#### Módulo 4: Dashboard, Objetivos, Revisión y Publicación (RF-DSH / RF-EXP)
* **RF-DSH-01**: Cálculo en tiempo real (en hilo secundario de Rust para cero latencia en UI) de palabras, caracteres (con y sin espacios), frases, párrafos, líneas, páginas estimadas y tiempo de lectura (lento: $150\text{ ppm}$, medio: $225\text{ ppm}$, rápido: $300\text{ ppm}$).
* **RF-DSH-02**: Anillos gráficos SVG de progreso de objetivos (*Writing Goals*) en la lista de hojas, biblioteca y editor, con registro de historial diario.
* **RF-DSH-03**: Modo Revisión (*Revision Mode*) con motor gramatical y estilístico local (reglas ortotipográficas + conector opcional a API de LanguageTool / LLM local vía Ollama o API compatible con OpenAI/Gemini).
* **RF-EXP-01**: Compilador completo de hojas de estilo **ULSS (`.ulss`)** para exportación a PDF y DOCX, y hojas CSS para HTML y ePub, con ventana de **Previsualización de Exportación en Vivo** (*Live Export Preview*).
* **RF-EXP-02**: Conectores de publicación directa a WordPress, Ghost, Medium, Micro.blog y función de copia formateada para Substack.

---

<a name="seccion-3"></a>
## 3. Investigación e Implementación del Motor de Estilos (ULSS) y Temas Visuales

De acuerdo con la documentación técnica de `https://styles.ulysses.app` y `https://styles.ulysses.app/learn`, Ulysses utiliza dos sistemas independientes de personalización estética que Odisea implementará de forma nativa y 100% compatible:

### 3.1. Temas del Editor (`.ultheme` / `.odiseatheme`)
Los Temas del Editor gobiernan los colores y estilos tipográficos dentro del lienzo de escritura:
1. **Doble Paleta Integrada (*Light & Dark Variants*)**: Cada archivo de tema contiene simultáneamente una definición para el modo claro y otra para el modo oscuro.
2. **Estructura de la Paleta**:
   * `background`: Color de fondo del lienzo.
   * `bodyText`: Color del texto principal.
   * `accents[0..10]`: Hasta 11 colores de acento reutilizables (con soporte de variaciones de luminosidad/opacidad automáticas).
3. **Matriz de Reglas por Etiqueta Markdown XL**: Para cada una de las 28 etiquetas de Markdown XL, el tema define 4 propiedades:
   * `tagColor`: Color de los caracteres de marcado (ej. los asteriscos `**` o almohadillas `#`). Puede igualarse al color de fondo o reducirse al $15\%$ de opacidad para lograr temas "Minimal / Barely There / Hidden Tags".
   * `textColor`: Color del contenido encerrado por la etiqueta.
   * `lineHighlight`: Color de resaltado de fondo de línea o bloque (ej. bloques de código, comentarios o citas).
   * `fontStyle`: Combinación de `normal`, `bold`, `italic`, `underline`, `strikethrough`.
   * `headingScale`: Tamaño relativo de los encabezados en el editor, seleccionable en 8 escalas: `Default (100%)`, `S`, `M`, `L`, `XL`, `2XL`, `3XL`, `4XL`.

### 3.2. Hojas de Estilo de Exportación: Ulysses Style Sheets (`.ulss`)
Para exportar a **PDF** y **DOCX**, Ulysses creó el lenguaje declarativo **ULSS** (similar a CSS/SASS pero diseñado específicamente para tipografía paginada y procesadores de texto). Odisea implementará un parser y compilador completo de `.ulss` en Rust.

#### Gramática y Estructura de un Fichero `.ulss` en Odisea
1. **Variables y Mixins**:
   * Declaración de variables con `$`: `$base-font = "Charter"`, `$accent-color = #268bd2`.
   * Declaración de mixins reutilizables: `@mixin serif-body { font-family: $base-font; font-size: 11pt; }`.
2. **Bloque `document-settings`**:
   Configura la geometría del documento paginado (incluyendo las mejoras de ULSS de mayo de 2026 como `baseline-grid` y `column-span`):
   ```css
   document-settings {
       page-size: a4;                  /* a4, a5, letter, custom */
       page-orientation: portrait;
       page-inset-top: 25mm;
       page-inset-bottom: 25mm;
       page-inset-inner: 22mm;
       page-inset-outer: 22mm;
       two-sided: yes;
       section-break: heading-1;
       hyphenation: yes;
       locale: "es-ES";
       column-count: 1;
       baseline-grid: 14pt;            /* Alineación de rejilla base (Release Mayo 2026) */
   }
   ```
3. **Selectores Jerárquicos y Condicionales de ULSS**:
   * **Base**: `defaults { ... }`
   * **Encabezados**: `heading-all`, `heading-1` a `heading-6` (con propiedades `font-family`, `font-size`, `font-weight`, `line-height`, `margin-top`, `margin-bottom`, `keep-with-following: yes`, `page-break-before: always`, `enumeration-format: "%p.%s"`).
   * **Párrafos y Relaciones Adyacentes**: `paragraph`, `paragraph + paragraph` (permite aplicar `first-line-indent: 15pt` solo a partir del segundo párrafo consecutivo tras un encabezado, siguiendo el estándar editorial clásico), `heading-all + paragraph { column-span: all; }`.
   * **Bloques Especiales**: `block-quote`, `block-code`, `block-comment`, `block-raw`, `paragraph-divider`, `paragraph-figure`.
   * **Listas y Tablas**: `list-all`, `list-ordered`, `list-unordered`, `table`, `table-cell`, `table-header`.
   * **Elementos Inline**: `inline-strong`, `inline-emphasis`, `inline-mark`, `inline-delete`, `inline-code`, `inline-comment`, `inline-annotation`, `inline-link`, `inline-footnote`, `ulysses-tag` (`visibility: hidden | visible`).
   * **Cabeceras, Pies de Página y Tabla de Contenidos**: `area-header`, `area-footer` (con soporte de `content: page-number`), ` area-footnotes`, `toc-heading-1`..`toc-heading-6`.

---

<a name="seccion-4"></a>
## 4. Configuración Paso a Paso de Google Antigravity IDE y REA (Morluto) vía MCP

### 4.1. ¿Qué son Google Antigravity IDE y REA de Morluto?
* **Google Antigravity IDE**: Es el entorno de desarrollo integrado *agent-first* de Google (basado en VS Code) que incorpora dos vistas principales: **Editor View** (edición asistida con barra lateral de agentes) y **Manager View** (centro de mando que permite orquestar **hasta 5 agentes autónomos en paralelo**, generación de *Artifacts* verificables y un **navegador Chrome integrado** para inspección y verificación visual en bucle cerrado).
* **REA (`morluto/rea` — Reverse Engineer Anything)**: Es el framework e infraestructura MCP creada por Morluto (`https://github.com/morluto/rea`, paquete npm `rea-agents`) que permite a los agentes de IA realizar ingeniería inversa basada en evidencias (*evidence-backed reverse engineering*) sobre binarios nativos (vía Ghidra/Hopper/IDA/Rizin), aplicaciones JavaScript/Electron, ensamblados y formatos de archivo estructurados (como paquetes `.ulyz`, hojas `.ulss` y temas `.ultheme`), reconstruyendo especificaciones exactas y verificando la paridad byte a byte o semántica.

### 4.2. Prerrequisitos del Sistema en Windows 11
Antes de iniciar Google Antigravity IDE, instala las herramientas base en una terminal de **PowerShell 7 (Administrador)**:

```powershell
# 1. Instalar Node.js 22 LTS o 24 LTS (REA requiere Node >= 22.19 o >= 24.11)
winget install OpenJS.NodeJS.LTS

# 2. Instalar Rust Toolchain (MSVC para Windows 11) y herramientas de compilación C++
winget install Rustlang.Rustup
winget install Microsoft.VisualStudio.2022.BuildTools --override "--wait --passive --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"

# 3. Instalar Ghidra y Rizin (opcionales pero recomendados como proveedores nativos para REA en Windows)
winget install NSA.Ghidra
winget install Rizin.Rizin

# 4. Instalar Tauri CLI v2 en Rust
cargo install tauri-cli --version "^2.0.0" --locked
```

### 4.3. Instalación y Configuración de REA (`rea-agents`)
1. Instala globalmente la suite `rea-agents` de Morluto para disponer tanto del servidor MCP como de la interfaz CLI de evidencia:
   ```powershell
   npm install --global rea-agents@latest
   rea --version
   ```
2. Crea el directorio raíz del proyecto **Odisea** e inicializa la configuración de agentes de REA:
   ```powershell
   mkdir C:\Proyectos\Odisea
   cd C:\Proyectos\Odisea
   npx rea-agents@latest setup
   ```
   *Durante el asistente interactivo de `npx rea-agents setup`, selecciona el perfil compatible con Gemini / Antigravity y aprueba la generación de las instrucciones de flujo de trabajo (`AGENTS.md` y `.agents/skills`).*

### 4.4. Conexión de REA MCP y Servidores Auxiliares en Google Antigravity IDE
Google Antigravity IDE y Antigravity 2.0 leen la configuración de servidores MCP desde dos niveles:
* **Nivel Global del Usuario**: `C:\Users\<TuUsuario>\.gemini\config\mcp_config.json`
* **Nivel Local del Proyecto (*Workspace*)**: `C:\Proyectos\Odisea\.agents\mcp_config.json`

#### Paso a Paso dentro de Google Antigravity IDE:
1. Abre **Google Antigravity IDE** e inicia sesión con tu cuenta de Google.
2. Abre la carpeta `C:\Proyectos\Odisea`.
3. En el panel lateral derecho del **Agent**, haz clic en el menú de tres puntos (`…`) situado en la esquina superior derecha $\rightarrow$ selecciona **MCP Servers** $\rightarrow$ **Manage MCP Servers** $\rightarrow$ **View raw config**.
4. Crea o actualiza el archivo `.agents/mcp_config.json` del proyecto con la siguiente configuración completa (que registra **REA de Morluto**, un servidor de **Sistema de Archivos**, **SQLite Inspector** para verificar la base de datos de Odisea y **Playwright/Chrome** para las pruebas visuales):

```json
{
  "mcpServers": {
    "rea-reverse-engineer": {
      "command": "npx",
      "args": [
        "-y",
        "rea-agents@latest",
        "mcp"
      ],
      "env": {
        "REA_WORKSPACE": "C:/Proyectos/Odisea",
        "REA_EVIDENCE_DIR": "C:/Proyectos/Odisea/.rea_evidence",
        "NODE_NO_WARNINGS": "1"
      }
    },
    "filesystem-odisea": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:/Proyectos/Odisea"
      ]
    },
    "sqlite-odisea": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-server-sqlite-npx",
        "C:/Proyectos/Odisea/odisea_data/library.odiseadb"
      ]
    }
  }
}
```

5. Configura los permisos de ejecución autónoma para que los agentes de Antigravity IDE puedan invocar las herramientas de REA sin bloqueos manuales en los bucles de verificación. Crea el archivo `.agents/settings.json`:

```json
{
  "agent": {
    "defaultModel": "gemini-3.1-pro",
    "maxParallelAgents": 5,
    "builtinBrowser": {
      "enabled": true,
      "headless": false,
      "captureArtifacts": true
    },
    "permissions": {
      "allow": [
        "mcp(rea-reverse-engineer/*)",
        "mcp(filesystem-odisea/*)",
        "mcp(sqlite-odisea/*)",
        "terminal(cargo *)",
        "terminal(npm *)",
        "terminal(npx vitest *)",
        "terminal(npx stryker *)"
      ]
    }
  }
}
```

6. Crea el archivo de reglas permanentes de ingeniería inversa en `.agents/rules/rea-odisea-rules.md` para que todos los agentes de Antigravity IDE sigan las directrices de Morluto:

```markdown
# Reglas Operativas REA + Odisea en Antigravity IDE
1. **Evidencia Antes de Implementación (Principio REA)**: Antes de implementar cualquier parser de formato de Ulysses (`.ulss`, `.ultheme`, `.ulyz`, Markdown XL), utiliza el servidor MCP `rea-reverse-engineer` sobre el directorio `/reference_samples/` para extraer la estructura exacta, tokens y casos límite, guardando el informe JSON en `.rea_evidence/`.
2. **Mandato de Portabilidad Windows 11**: Queda terminantemente prohibido usar rutas absolutas o escribir en `%APPDATA%` o en el Registro de Windows. Toda persistencia debe residir en `./odisea_data/` relativo al binario `Odisea.exe`.
3. **Mandato Micro-UI**: Ningún icono de interfaz puede superar los `16px` y ninguna etiqueta visual (`badge`/`keyword`) puede superar los `18px` de alto.
4. **Cero Código Incompleto**: Prohibido dejar bloques `// TODO`, `unimplemented!()` o mocks en producción.
```

7. Haz clic en **Refresh** dentro de **Settings > Customizations > Installed MCP Servers** en Antigravity IDE y verifica que `rea-reverse-engineer` aparece con indicador verde (**Connected**).

---

<a name="seccion-5"></a>
## 5. Catálogo Maestro de Prompts Secuenciales para Google Antigravity IDE

A continuación se presenta la secuencia exacta y exhaustiva de **12 Prompts de Ingeniería** diseñados para ejecutarse paso a paso en **Google Antigravity IDE**. Cada prompt construye de forma determinista una capa completa de **Odisea** apoyándose en **REA MCP**.

---

### FASE 0: Ingeniería Inversa de Formatos con REA y Scaffolding Portable

#### Prompt 1: Análisis Forense con REA MCP de Muestras `.ulss`, `.ultheme` y Markdown XL
> **Copia y pega este prompt en el Agente Principal de Antigravity IDE:**
```text
Actúa como Arquitecto Principal de Software e Ingeniero Inverso Especialista en REA (morluto/rea).
Vamos a iniciar el proyecto "Odisea" para Windows 11 (réplica exacta y extendida de Ulysses para macOS).

TAREA 1 (Recolección y Análisis con REA MCP):
1. Crea la carpeta `C:/Proyectos/Odisea/reference_samples` y descarga o genera muestras canónicas de referencia basadas en la especificación oficial de Ulysses (`styles.ulysses.app/reference` y `help.ulysses.app/en_US/dive-into-editing/markdown-xl`):
   - `sample_style.ulss`: Una hoja de estilo ULSS completa con `document-settings` (incluyendo `baseline-grid` y `column-count`), variables `$`, `@mixin`, selectores `defaults`, `heading-1`..`heading-6`, `paragraph + paragraph`, `block-quote`, `block-code`, `table`, `inline-strong`, `inline-annotation`, `inline-footnote`, `area-header`, `area-footer` y `toc-heading-1`.
   - `sample_theme.ultheme`: Un archivo de tema de editor con paleta Dual (Light/Dark), colores base, 11 acentos y definiciones para las 28 etiquetas de Markdown XL.
   - `sample_sheet_28_tags.mdxl`: Un documento que ejercite simultáneamente las 28 etiquetas de Markdown XL, casos anidados, tablas, ecuaciones LaTeX, notas al pie `(fn)`, anotaciones `{...}`, comentarios `++...++` y `%%`, tachado `||...||`, imágenes `(img)` y `(toc)`.
2. Invoca el servidor MCP `rea-reverse-engineer` para inspeccionar y trazar las estructuras formales de `reference_samples/`.
3. Genera en `.rea_evidence/ulysses_format_spec.json` y `.rea_evidence/markdown_xl_grammar.ebnf` la gramática formal EBNF sin ambigüedades de Markdown XL (28 etiquetas) y de ULSS, respaldada por evidencia.
```

#### Prompt 2: Creación de la Estructura del Proyecto Tauri v2 + Rust + React 19 (Portable `.exe`)
```text
Utilizando las especificaciones generadas en `.rea_evidence/`, inicializa la estructura completa del proyecto "Odisea" en `C:/Proyectos/Odisea` para Windows 11.

REQUISITOS DE ARQUITECTURA Y ESTRUCTURA DE CARPETAS:
1. Inicializa un proyecto híbrido **Tauri v2 (Rust 2024)** + **React 19 + TypeScript 5.8 + Vite + Tailwind CSS v4**.
2. Crea exactamente la siguiente estructura modular de directorios:
   - `/src-tauri/src/`
     - `main.rs` y `lib.rs` (Configuración de arranque portable y redirección de `WEBVIEW2_USER_DATA_FOLDER` a `./odisea_data/webview_profile`).
     - `portable/` (`mod.rs`, `paths.rs`, `config.rs` -> gestión de `./odisea_data/config.toml`, `./odisea_data/library.odiseadb`, `./odisea_data/themes/`, `./odisea_data/styles/`, `./odisea_data/backups/`).
     - `db/` (`schema.rs`, `projects.rs`, `groups.rs`, `sheets.rs`, `filters.rs`, `keywords.rs`, `backlinks.rs`, `fts.rs` -> SQLite con `rusqlite` bundled + FTS5).
     - `external_folders/` (`watcher.rs`, `sync.rs`, `ulyz_format.rs` -> monitor de archivos en vivo con crate `notify`).
     - `backups/` (`scheduler.rs`, `snapshot.rs`, `restore.rs` -> copias horarias, diarias y semanales comprimidas con Zstandard).
     - `ulss_engine/` (`lexer.rs`, `parser.rs`, `ast.rs`, `resolver.rs`, `pdf_typst.rs`, `docx_openxml.rs`, `epub_builder.rs`, `html_builder.rs`).
     - `publishers/` (`wordpress.rs`, `ghost.rs`, `medium.rs`, `microblog.rs`, `substack.rs`).
     - `revision/` (`grammar_engine.rs`, `style_check.rs`, `statistics.rs`).
   - `/src/` (Frontend React + TypeScript)
     - `components/library/` (Panel 1: LibraryTree, ProjectsSection, NotesSection, GlobalFilters, ExternalFolders, SmartFilterModal, GroupIconPicker).
     - `components/sheetlist/` (Panel 2: SheetList, SheetCard, GlueIndicator, GoalRingSVG, SearchFilterBar).
     - `components/editor/` (Panel 3: OdiseaEditor, CustomizableToolbar, ContextMarkupBar, QuickMarkupPopoverCmd9, TypewriterController, TableWidget, EquationWidget, FootnotePopover, AnnotationPopover, ImageSketchModal, LiveCounterBadge).
     - `components/dashboard/` (Panel 4: DashboardContainer, ProgressStatsPane, OutlinePane, OverviewPane, BacklinksPane, KeywordsAttachmentsPane, RevisionModePane).
     - `components/modals/` (ExportPreviewModal, ThemeStudioModal, BackupRestoreModal, SettingsModal, CommandPalette).
     - `parser/markdown_xl/` (Gramática Lezer, decoraciones CodeMirror 6 para las 28 etiquetas y dialectos Markdown, Minimark y Textil'd).
     - `themes/` (Motor de modos visuales y cargador de `.ultheme`).
     - `store/` (Estado global reactivo con Zustand conectado a comandos IPC de Tauri).
3. Configura `src-tauri/Cargo.toml` y `src-tauri/tauri.conf.json` con optimizaciones de compilación (`lto = "fat"`, `codegen-units = 1`, `strip = true`, `opt-level = "z"`) para producir un único ejecutable `Odisea.exe` ultraligero, rápido de arrancar y sin instalador obligatorio.
4. Ejecuta `cargo check` y `npm run build` desde la terminal integrada para verificar que el esqueleto compila con 0 errores.
```

---

### FASE 1: Persistencia Portable, Biblioteca, Proyectos y Carpetas Externas

#### Prompt 3: Implementación del Motor de Base de Datos Portable, Biblioteca y Proyectos
```text
Desarrolla al 100% los módulos de persistencia portable en `/src-tauri/src/portable/` y `/src-tauri/src/db/`.

ESPECIFICACIONES TÉCNICAS EXACTAS:
1. En `portable/paths.rs`, detecta el directorio donde reside `Odisea.exe`. Si no existe `./odisea_data/`, créalo automáticamente en el primer arranque junto con `config.toml`, la base de datos SQLite `library.odiseadb`, y vuelca los temas `.ultheme` y hojas `.ulss` por defecto en sus subcarpetas.
2. En `db/schema.rs`, diseña e inicializa el esquema relacional SQLite con soporte de claves foráneas y tabla virtual `FTS5` (`sheets_fts`) sincronizada mediante triggers:
   - Tabla `projects`: `id`, `name`, `icon`, `color`, `is_archived`, `export_style_id`, `export_format`, `sort_order`, `created_at`, `updated_at`.
   - Tabla `groups`: `id`, `project_id` (nullable para Notes), `parent_group_id`, `section_type` ('main', 'extras', 'templates', 'notes'), `name`, `icon`, `color`, `writing_goal_json`, `sort_order`.
   - Tabla `smart_filters`: `id`, `project_id`, `parent_group_id`, `name`, `icon`, `color`, `rules_json` (condiciones ALL/ANY/NONE por texto, keywords y fechas).
   - Tabla `sheets`: `id`, `group_id`, `title`, `content_mdxl`, `markup_dialect` ('markdown_xl', 'markdown', 'minimark', 'textild'), `is_favorite`, `is_material`, `glued_with_next` (booleano para Glue Sheets), `sort_order`, `writing_goal_json`, `publish_status_json`, `created_at` (editable por el usuario para Date Correction), `updated_at`, `deleted_at` (para Trash).
   - Tablas `keywords`, `sheet_keywords` (con restricción al Keyword Pool del proyecto activo), `attachments` (notas e imágenes adjuntas a la hoja), `internal_links` (origen, destino, línea y texto para cálculo instantáneo de Backlinks) y `writing_sessions` (fecha, group_id/project_id, palabras netas).
3. Implementa todos los comandos `#[tauri::command]` para CRUD de Proyectos (incluyendo Plantillas de Proyecto, Duplicar Proyecto, Archivar Proyecto y Exportar Proyecto como `.zip`), Grupos, Filtros Globales (All, Last 7 Days, Favorites, Trash), Filtros Inteligentes y Hojas (Split at Cursor, Merge Sheets, Glue/Unglue Sheets).
4. Escribe pruebas unitarias en Rust (`cargo test`) que validen todas las operaciones sobre una base de datos portable real.
```

#### Prompt 4: Carpetas Externas en Tiempo Real y Sistema de Backups Rotativos
```text
Desarrolla los módulos `/src-tauri/src/external_folders/` y `/src-tauri/src/backups/`.

ESPECIFICACIONES:
1. **Carpetas Externas (`external_folders/`)**:
   - Permite vincular cualquier directorio del sistema de archivos de Windows 11 o carpetas de Dropbox/OneDrive/Git.
   - Soporta dos modos por carpeta externa:
     a) Modo `.md` / `.txt` estándar: lee y escribe archivos Markdown en disco preservando frontmatter YAML si existe y comentarios HTML para metadatos no destructivos.
     b) Modo nativo `.ulyz` / `.odisea`: contenedor comprimido que almacena el texto Markdown XL completo, anotaciones, notas al pie, objetivos e imágenes adjuntas.
   - Implementa un watcher asíncrono con el crate `notify` que emita eventos Tauri al frontend en menos de 100 ms cuando un archivo externo se cree, modifique, renombre o elimine fuera de Odisea.
2. **Sistema de Backups (`backups/`)**:
   - Implementa el planificador automático de instantáneas en `./odisea_data/backups/` comprimidas con Zstandard (`.odiseabak.zst`):
     - Copias horarias para las últimas 12 horas de uso.
     - Copias diarias para los últimos 7 días.
     - Copias semanales permanentes.
   - Implementa el comando de inspección y restauración granular (permite previsualizar una copia histórica y restaurar una única hoja o toda la biblioteca).
```

---

### FASE 2: El Motor Markdown XL (28 Etiquetas) y el Editor WYSIWYM

#### Prompt 5: Parser Incremental de las 28 Etiquetas Markdown XL y Motor CodeMirror 6
```text
Desarrolla en `/src/parser/markdown_xl/` y `/src/components/editor/` el motor de edición WYSIWYM completo de Odisea basado en CodeMirror 6 y la gramática formal extraída en `.rea_evidence/markdown_xl_grammar.ebnf`.

REQUISITOS OBLIGATORIOS (LAS 28 ETIQUETAS Y COMPORTAMIENTO ULYSSES):
1. Implementa el parser y el sistema de `StateField` / `ViewPlugin` de CodeMirror 6 que reconozca y estilice en tiempo real las 28 etiquetas de Markdown XL separando siempre el token `ulysses-tag` (los caracteres de sintaxis como `#`, `**`, `_`, `::`, `||`, `++`, `{`, `}`, `%%`, `''`, `~~`) del contenido semántico:
   - Bloques: `#` a `######` (con indicadores compactos `H1`..`H6` en el margen izquierdo), listas `- ` / `* ` / `+ `, listas numeradas `1. ` con auto-renumeración inteligente (*Smart Lists*), checklists `- [ ]` / `- [x]` interactivos, citas `> ` (multinivel), bloque de verso `|" `, bloque de comentario `%%`, bloque de código `''` o ```` ``` ```` con selector de lenguaje y resaltado mediante Shiki/Highlight.js, bloque raw `~~` y divisor `----`.
   - Inline: Strong `**text**`, Emphasis `_text_`, Mark `::text::`, Delete/Redact `||text||`, Inline Comment `++text++`, Annotation `{text}`, Inline Code `` `code` ``, Inline Raw `~raw~`, Enlaces `[text]` y Enlaces Internos `[[Hoja#Encabezado]]`.
   - Objetos y Marcadores: Footnote `(fn)`, Image `(img)`, Video `(vid)`, Table `(tbl)` / sintaxis pipe `|`, Equation `$$...$$` y `$...$`, Table of Contents `(toc)`, salto de línea manual `\` (`Shift+Enter`) y espacio protegido `Alt+Space` (mostrado con un micro-punto sutil).
2. Implementa la conversión bidireccional entre dialectos (`Edit > Convert Markup`): Markdown XL <-> Markdown Estándar <-> Minimark <-> Textil'd.
3. Implementa los 5 métodos de inserción de etiquetas de Ulysses:
   - Escritura directa por teclado con cierre inteligente de pares.
   - **Customizable Toolbar** superior (reordenable mediante drag & drop).
   - **Markup Bar** inferior contextual (muestra las etiquetas más probables según la posición del cursor).
   - **Paleta Flotante `Ctrl + 9`** (abre selector rápido de las 28 etiquetas en la posición del cursor).
   - Atajos de teclado estándar y personalizables (`Ctrl+B`, `Ctrl+I`, `Ctrl+K`, `Ctrl+#`, `Ctrl+Shift+#`).
```

#### Prompt 6: Widgets Interactivos (Tablas, Ecuaciones LaTeX, Popovers y Lienzo Sketch)
```text
Desarrolla los widgets interactivos avanzados del editor en `/src/components/editor/`:

1. **TableWidget (`TableWidget.tsx`)**:
   - Editor de tablas visual integrado en el flujo del documento.
   - Permite añadir, eliminar y reordenar filas y columnas mediante drag & drop.
   - Permite configurar alineación por columna (izquierda, centro, derecha) y ancho proporcional.
   - Permite ordenar filas alfabética o numéricamente (ascendente/descendente).
   - Soporta pegar directamente rangos copiados desde Microsoft Excel, Google Sheets o CSV convirtiéndolos automáticamente en tabla de Odisea.
   - Soporta formato inline, enlaces, imágenes en miniatura y revisión ortográfica dentro de las celdas.
2. **EquationWidget (`EquationWidget.tsx`)**:
   - Al escribir `$$` o insertar `(eq)`, despliega un bloque matemático con edición LaTeX y previsualización renderizada en vivo mediante KaTeX, además de ecuaciones inline `$...$`.
3. **Popovers No Intrusivos (`FootnotePopover.tsx`, `AnnotationPopover.tsx`, `LinkPopover.tsx`)**:
   - Al teclear `(fn)`, `{texto}` o `[texto]`, o al hacer doble clic sobre su marcador en el editor, abre un popover compacto donde el usuario escribe la nota al pie, la anotación extensa o la URL/enlace interno sin perder la posición de lectura en el texto principal.
4. **ImageWidget y Lienzo de Bocetos (`ImageSketchModal.tsx`)**:
   - Muestra previsualización en línea (*Inline Image Preview*) de las imágenes en el editor.
   - Incluye un editor de bocetos y anotaciones gráficas (*Scribble & Sketch*) con pluma, resaltador, formas, texto y recorte sobre la imagen.
5. **Modos de Foco y Máquina de Escribir (`TypewriterController.tsx`)**:
   - Implementa *Typewriter Scrolling* (línea fija superior, central, inferior o banda variable) y *Focus Highlight* (resaltado de línea actual, frase actual o párrafo actual atenuando el resto del texto al 30% de opacidad).
```

---

### FASE 3: Modos Visuales, Micro-UI Compacta y Motor de Estilos ULSS

#### Prompt 7: Sistema de Modos Visuales (Minimalista, Oscuro, Solarizado, Sepia, Modernos y Configurable) y Micro-UI
```text
Desarrolla en `/src/themes/` y `/src/components/` el sistema completo de Modos Visuales, el cargador/editor de `.ultheme` y la arquitectura visual **Micro-UI de alta densidad**.

REQUISITOS ESTRICTOS DE DISEÑO VISUAL Y MODOS:
1. **Arquitectura Micro-UI (Ahorro Máximo de Espacio de Trabajo)**:
   - Todos los iconos de la interfaz (Biblioteca, Lista de Hojas, Toolbar, Dashboard) deben usar componentes vectoriales de `14px` a `16px` con trazo fino (`1.5px`).
   - Las etiquetas de palabras clave (*Keywords*), contadores flotantes, indicadores de publicación (icono de avión de papel) y marcadores de margen (`H1`..`H6`, `FN`, `IMG`, `TOC`) deben renderizarse como **Micro-Píldoras** (`height: 16px-18px`, `font-size: 10px`, `padding: 1px 5px`, `border-radius: 4px`), garantizando que las barras y adornos ocupen el mínimo espacio posible.
2. **Modos de Visualización Predefinidos (Conmutables en caliente sin recargar)**:
   - **Modo 1: Minimalista (Por Defecto)**: Inspirado fielmente en Ulysses macOS; paneles laterales limpios y lienzo blanco cálido `#FAFAFA` con texto `#27272B`.
   - **Modo 2: Modo Oscuro (Carbon & OLED)**: Fondo `#18181B` (y opción negro puro `#09090B`), paneles `#121214`, texto `#E4E4E7`.
   - **Modo 3: Modo Solarizado (Solarized Light & Solarized Dark)**: Paleta canónica exacta de Ethan Schoonover (`#FDF6E3` / `#002B36`, cuerpo `#657B83` / `#839496`, acentos `#268BD2`, `#2AA198`, `#859900`, `#B58900`, `#CB4B16`, `#D33682`).
   - **Modo 4: Modo Sepia (Pergamino Editorial)**: Fondo `#F4ECD8`, paneles `#EAE0C8`, texto tinta sepia `#433422`, acentos terracota `#A0522D` y salvia `#556B2F`.
   - **Modo 5: Modos Modernos Visuales**:
     - *Windows 11 Liquid Glass / Mica*: Superficies translúcidas con desenfoque acrílico en paneles laterales y micro-bordes luminosos.
     - *Nordic Frost*: Basado en la paleta Nord (`#2E3440`, `#3B4252`, `#88C0D0`, `#ECEFF4`).
     - *Monokai Editorial*: Fondo `#2D2A2E`, acentos `#FF6188`, `#A9DC76`, `#FFD866`, `#78DCE8`.
3. **Theme Studio Configurable por el Usuario (`ThemeStudioModal.tsx`)**:
   - Permite importar/exportar archivos `.ultheme` de `styles.ulysses.app` y crear temas propios desde cero.
   - Permite configurar en vivo: paleta Light y Dark, 11 colores de acento, escala de encabezados (`Default` y `S` a `4XL`), tipografía del editor (incluyendo cualquier fuente instalada en Windows 11), interlineado, ancho máximo de columna de texto y la matriz completa de las 28 etiquetas (Tag Color, Text Color, Line Highlight y Estilo Negrita/Cursiva/Subrayado/Tachado).
   - Incluye el preset **"Barely There / Sin Etiquetas"** donde los símbolos de sintaxis se atenúan casi por completo hasta que el cursor entra en la palabra.
```

#### Prompt 8: Compilador ULSS (`.ulss`) y Exportadores Nativos (PDF, DOCX, ePub, HTML, Texto)
```text
Desarrolla en `/src-tauri/src/ulss_engine/` y `/src/components/modals/ExportPreviewModal.tsx` el motor de compilación de Hojas de Estilo de Ulysses (`.ulss`) y los exportadores de documentos.

ESPECIFICACIONES TÉCNICAS:
1. **Lexer y Parser ULSS en Rust (`lexer.rs`, `parser.rs`, `resolver.rs`)**:
   - Parsea cualquier archivo `.ulss` estándar de `styles.ulysses.app`.
   - Resuelve variables (`$var`), `@mixin`, herencia de selectores (`defaults` -> `heading-all` -> `heading-1`), selectores adyacentes (`paragraph + paragraph`, `heading-all + paragraph`) y pseudo-clases (`:first`, `:left`, `:right`).
   - Soporta las propiedades introducidas hasta mayo de 2026: alineación a rejilla base (`baseline-grid`) y expansión de columnas (`column-span: all` en diseños multicolumna).
   - Incluye de serie en `./odisea_data/styles/` 8 estilos `.ulss` preinstalados: *Swiss Knife*, *Novel (Manuscript)*, *Academic Paper*, *Business Report*, *Two-Column Magazine*, *Minimalist Essay*, *Technical Docs* y *Revision* (este último muestra en el documento exportado los comentarios `++`, `%%`, anotaciones `{}` y tachados `||`).
2. **Motores de Renderizado de Exportación**:
   - **PDF (`pdf_typst.rs`)**: Traduce el AST de la hoja o grupo de hojas + las reglas `.ulss` resueltas a código Typst y compila un PDF vectorial perfecto con numeración de páginas, cabeceras/pies, notas al pie reales en la parte inferior de cada página, ecuaciones matemáticas vectoriales y tabla de contenidos generada donde aparezca `(toc)`.
   - **DOCX (`docx_openxml.rs`)**: Genera un archivo `.docx` nativo compatible con Microsoft Word 365 con estilos de párrafo reales, notas al pie nativas de Word, tablas editables e imágenes incrustadas.
   - **ePub (`epub_builder.rs`)**: Genera libros electrónicos EPUB 3 válidos con portada, metadatos (autor, título, idioma), división automática de capítulos por `heading-1` y hoja CSS.
   - **HTML y Texto Plano/Markdown**: Exportación a snippet HTML limpio, página HTML5 completa con CSS, Markdown estándar o Rich Text (RTF) con copia directa al portapapeles.
3. **Ventana de Previsualización de Exportación (`ExportPreviewModal.tsx`)**:
   - Permite cambiar en tiempo real el formato (PDF, DOCX, ePub, HTML, Texto) y la hoja de estilo `.ulss`/`.css`, previsualizando el documento renderizado e imprimiendo o guardando con un clic.
```

---

### FASE 4: Dashboard, Objetivos, Modo Revisión, Publicación y Navegación por Teclado

#### Prompt 9: Dashboard Completo, Objetivos de Escritura, Backlinks y Modo Revisión
```text
Desarrolla el Panel 4 (`DashboardContainer.tsx`) y sus motores de análisis en `/src-tauri/src/revision/`:

1. **Pestaña Progreso y Objetivos (`ProgressStatsPane.tsx`)**:
   - Contadores instantáneos: Palabras, Caracteres, Caracteres sin espacios, Oraciones, Párrafos, Líneas, Páginas y Tiempo de Lectura (Lento, Medio, Rápido).
   - Configuración y visualización de **Writing Goals** (anillos circulares SVG progresivos con código de color: naranja en inicio, azul en progreso, verde al alcanzar objetivo, rojo si supera el límite en modo "At most") con soporte de fecha límite, cuota diaria e historial gráfico de los últimos 30 días.
2. **Pestaña Esquema y Navegación (`OutlinePane.tsx`)**:
   - Árbol interactivo de encabezados `H1`..`H6` de la hoja o grupo pegado (*Glued Sheets*) para saltar instantáneamente a cualquier sección.
3. **Pestaña Vista General y Enlaces Entrantes (`OverviewPane.tsx` y `BacklinksPane.tsx`)**:
   - Lista filtrable de todos los Enlaces, Notas al pie, Anotaciones, Comentarios, Imágenes y Tareas pendientes (`- [ ]`) del documento.
   - Sección **Incoming Links (Backlinks)** que muestra todas las hojas de la biblioteca que enlazan a la hoja actual, permitiendo saltar directamente al párrafo exacto donde se cita.
4. **Pestaña Palabras Clave y Adjuntos (`KeywordsAttachmentsPane.tsx`)**:
   - Gestión de Keywords (con sugerencias del Keyword Pool del proyecto), notas de texto adjuntas a la hoja, imágenes de referencia adjuntas y selector de corrección de fecha de creación (*Date Correction*).
5. **Modo Revisión y Herramientas de Escritura (`RevisionModePane.tsx`)**:
   - Al activar el Modo Revisión, atenúa los colores del editor y resalta todas las anotaciones/comentarios del autor junto con las sugerencias del motor de revisión en 10 categorías: Ortografía, Gramática, Puntuación, Estilo, Redundancia, Tipografía (comillas tipográficas, guiones largos), Semántica, Mayúsculas, Repetición de palabras y Voz pasiva (incluyendo revisión dentro de celdas de tablas).
   - Incluye conector opcional para herramientas de reescritura/resumen mediante LLM local (Ollama) o API configurada por el usuario en `config.toml`.
```

#### Prompt 10: Conectores de Publicación Directa y Navegación Física por Teclado
```text
Finaliza las capacidades funcionales de Odisea implementando los conectores de publicación y la ergonomía de navegación total por teclado:

1. **Conectores de Publicación (`/src-tauri/src/publishers/`)**:
   - **WordPress (REST API v2)** y **Ghost (Admin API)**: Configuración segura de cuentas, publicación de nuevas entradas y **actualización de entradas ya publicadas** desde Odisea, selección de estado (Borrador, Publicado, Programado con fecha/hora), etiquetas, categorías e imagen destacada. Muestra el indicador de avión de papel en la lista de hojas y el widget de estado de publicación en el Dashboard.
   - **Medium** y **Micro.blog**: Publicación directa y actualización de entradas en Micro.blog.
   - **Copy for Substack**: Función dedicada que transforma la hoja Markdown XL en el formato exacto de portapapeles enriquecido que acepta el editor de Substack.
2. **Navegación por Teclado Físico y Command Palette (`CommandPalette.tsx`)**:
   - Implementa la navegación sin ratón idéntica a Ulysses: teclas de flecha para moverse entre Biblioteca y Lista de Hojas, `Return` para hacer drill-down (entrar en lista de hojas o enfocar el editor) y `Ctrl + Return` para hacer drill-up (volver de Editor a Lista de Hojas o de Lista de Hojas a Biblioteca).
   - Implementa el lanzador global de acciones rápidas (`Ctrl + Espacio` / `Ctrl + P`) equivalente al control por Spotlight de Ulysses para crear hojas, saltar a proyectos, cambiar modo visual o exportar sin tocar el ratón.
```

---

<a name="seccion-6"></a>
## 6. Arquitectura de Agentes Adversarios (Red Team / Blue Team) en Bucle Autónomo

Para garantizar que **Odisea** no contenga errores, regresiones, discrepancias respecto a Ulysses ni violaciones de portabilidad en Windows 11, aprovecharemos la capacidad estrella de **Google Antigravity IDE**: la ejecución de **5 Agentes Paralelos en la vista *Manager View*** combinada con el **Navegador Chrome Integrado** y el servidor **REA MCP**.

### 6.1. Topología del Escuadrón de 5 Agentes en Antigravity IDE
Configura las siguientes 5 definiciones de agentes en la carpeta `.agents/agents/` del proyecto:

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                  GOOGLE ANTIGRAVITY IDE (MANAGER VIEW)                     │
│                                                                            │
│  ┌─────────────────────────┐         ┌──────────────────────────────────┐  │
│  │ AGENTE 1: Orquestador   │◄───────►│ Servidor MCP: rea-reverse-eng    │  │
│  │ (Loop Master & Gatekeeper)│       │ Servidor MCP: sqlite-odisea      │  │
│  └───────────┬─────────────┘         └──────────────────────────────────┘  │
│              │                                                             │
│    ┌─────────┴──────────────────────┬───────────────────────┐              │
│    ▼                                ▼                       ▼              │
│  ┌──────────────────────┐ ┌──────────────────────┐ ┌────────────────────┐  │
│  │ AGENTE 2: RED TEAM   │ │ AGENTE 3: RED TEAM   │ │ AGENTE 4: RED TEAM │  │
│  │ Parser, ULSS & Fuzzer│ │ UI/UX, Modos & Chrome│ │ Windows Portability│  │
│  │ (Adversarial AST)    │ │ (Visual Inspector)   │ │ & Binary Auditor   │  │
│  └──────────┬───────────┘ └──────────┬───────────┘ └─────────┬──────────┘  │
│             └────────────────────────┼───────────────────────┘             │
│                                      ▼ (Informe de Defectos JSON)          │
│                         ┌────────────────────────┐                         │
│                         │ AGENTE 5: BLUE TEAM    │                         │
│                         │ (Auto-Fixer & Patcher) │                         │
│                         └────────────────────────┘                         │
└────────────────────────────────────────────────────────────────────────────┘
```

### 6.2. Definición de los Archivos de Agentes Adversarios (`.agents/agents/`)

#### 1. `.agents/agents/red-team-parser-ulss.md` (Agente Adversario de Gramática y Exportación)
```markdown
---
name: RedTeam-Parser-ULSS
role: Adversarial QA & Fuzzing Specialist for Markdown XL and ULSS
tools: ["mcp(rea-reverse-engineer/*)", "terminal(cargo *)", "terminal(npx vitest *)", "terminal(npx stryker *)"]
---
Tu único objetivo es **romper el parser de las 28 etiquetas de Markdown XL y el compilador de hojas de estilo ULSS** de Odisea.
En cada iteración del bucle:
1. Genera entradas extremas y maliciosas (Fuzzing): etiquetas anidadas profundamente (`**_{::||texto||::}_**`), tablas con pipes escapados y saltos de línea, ecuaciones LaTeX complejas dentro de citas, bloques `~~` y `''` sin cerrar, hojas `.ulss` con variables circulares, `baseline-grid` fraccionarios y documentos de 100.000 palabras con 500 notas al pie `(fn)`.
2. Ejecuta pruebas de mutación con Stryker y pruebas de propiedades en Rust.
3. Compara la salida con la especificación `.rea_evidence/ulysses_format_spec.json` mediante `rea-reverse-engineer`.
4. Si encuentras cualquier pánico, cuelgue, pérdida de caracteres o discrepancia con Ulysses, regístralo en `.rea_evidence/red_team_defects.json` con severidad `CRITICAL` o `HIGH` y un caso de reproducción exacto.
```

#### 2. `.agents/agents/red-team-ui-visual.md` (Agente Adversario de Interfaz y Modos Visuales)
```markdown
---
name: RedTeam-UI-Visual
role: Adversarial UI/UX, Visual Modes & Micro-UI Inspector
tools: ["builtin_browser", "mcp(filesystem-odisea/*)"]
---
Utilizas el **Navegador Chrome Integrado de Antigravity IDE** para auditar visual y funcionalmente Odisea en tiempo de ejecución.
En cada iteración del bucle:
1. Navega por los 4 paneles (Biblioteca, Lista de Hojas, Editor, Dashboard) usando exclusivamente eventos de teclado físico y ratón.
2. Verifica la existencia y el contraste WCAG de todos los modos visuales obligatorios: Minimalista, Oscuro (Carbon/OLED), Solarizado (Light/Dark), Sepia, Modernos (Mica/Nord/Monokai) y Configurable.
3. **Auditoría Micro-UI**: Ejecuta un script de inspección DOM sobre la aplicación activa (`getBoundingClientRect()`) para comprobar que NINGÚN icono mide más de `16px x 16px` y NINGUNA etiqueta/badge supera `18px` de altura.
4. Verifica que todas las funciones interactivas (Glue Sheets, Split at Cursor, Table sort, Equation render, Footnote/Annotation popovers, Backlinks, Writing Goals SVG rings, Export Preview) funcionan sin errores en consola.
5. Captura screenshots como Artifacts y registra cualquier fallo visual o de interacción en `.rea_evidence/red_team_defects.json`.
```

#### 3. `.agents/agents/red-team-portability-binary.md` (Agente Adversario de Binario y Portabilidad Windows 11)
```markdown
---
name: RedTeam-Portability-Binary
role: Windows 11 Native Binary & Forensic Portability Auditor
tools: ["mcp(rea-reverse-engineer/*)", "mcp(sqlite-odisea/*)", "terminal(*)"]
---
Auditas el binario compilado `Odisea.exe` en Windows 11 utilizando el servidor MCP `rea-reverse-engineer`.
En cada iteración del bucle:
1. Inspecciona la tabla de importaciones PE de `Odisea.exe` con REA para confirmar que no depende de DLLs no estándar de Windows 11.
2. Copia `Odisea.exe` a un directorio limpio temporal (`C:\Temp\Odisea_Sandbox\`), ejecútalo y monitoriza que NO se cree ni modifique ningún archivo en `%APPDATA%`, `%LOCALAPPDATA%` ni claves del Registro de Windows, y que toda la persistencia resida en `./odisea_data/`.
3. Mide el tiempo de arranque en frío: si supera los `250 ms` o si el binario supera los `18 MB`, regístralo como defecto en `.rea_evidence/red_team_defects.json`.
```

#### 4. `.agents/agents/blue-team-fixer.md` (Agente Ingeniero de Remediación)
```markdown
---
name: BlueTeam-AutoFixer
role: Principal Remediation Engineer (Rust + React + TypeScript)
tools: ["mcp(filesystem-odisea/*)", "terminal(cargo *)", "terminal(npm *)"]
---
Lees `.rea_evidence/red_team_defects.json`. Por cada defecto con estado `"OPEN"`:
1. Analizas la causa raíz en el código fuente Rust (`/src-tauri/src/`) o TypeScript (`/src/`).
2. Implementas la corrección definitiva sin introducir parches temporales ni desactivar tests.
3. Añades un test de regresión automatizado que cubra exactamente el vector de ataque descubierto por el Red Team.
4. Marcas el defecto como `"READY_FOR_RETEST"` para que el escuadrón Red Team lo vuelva a atacar en la siguiente iteración del bucle.
```

---

### 6.3. Prompts para Ejecutar el Bucle Adversario Autónomo hasta Defectos = 0

#### Prompt 11: Despliegue de la Suite de Verificación y Arranque del Bucle Adversario
```text
Actúa como el Agente 1 (Orquestador Maestro en Manager View de Google Antigravity IDE).
1. Crea los 4 perfiles de agentes definidos (`.agents/agents/red-team-parser-ulss.md`, `red-team-ui-visual.md`, `red-team-portability-binary.md` y `blue-team-fixer.md`).
2. Crea el archivo de estado `.rea_evidence/verification_matrix.json` que enumera los 115 puntos de control de paridad exacta con Ulysses (las 28 etiquetas de Markdown XL, las secciones de Biblioteca, Proyectos, Carpetas Externas, Backups, Glue/Split/Merge, los modos visuales Minimalista/Oscuro/Solarizado/Sepia/Modernos/Configurable, las restricciones Micro-UI de 16px/18px, el compilador ULSS de PDF/DOCX/ePub/HTML, Dashboard, Backlinks, Modo Revisión y Portabilidad del único `Odisea.exe`).
3. Inicia el **Bucle Adversario Interactivo Autónomo** siguiendo este protocolo estricto:
   - **Paso A (Ataque Red Team en Paralelo)**: Lanza simultáneamente a `RedTeam-Parser-ULSS`, `RedTeam-UI-Visual` (con el navegador Chrome integrado abierto sobre la app) y `RedTeam-Portability-Binary` contra la compilación actual de Odisea.
   - **Paso B (Evaluación de Evidencias)**: Consolida todos los fallos, carencias o discrepancias detectadas en `.rea_evidence/red_team_defects.json`.
   - **Paso C (Condición de Parada)**:
     $$\text{Defectos Críticos} + \text{Defectos Altos} + \text{Defectos Medios} + \text{Discrepancias de Paridad} = 0$$
     Si la suma es mayor que $0$, activa inmediatamente el **Paso D**.
   - **Paso D (Remediación Blue Team)**: Invoca a `BlueTeam-AutoFixer` para corregir todos los defectos abiertos, recompilar el código y añadir tests de regresión.
   - **Paso E (Re-verificación)**: Regresa automáticamente al **Paso A** y repite el ciclo hasta que los tres agentes del Red Team certifiquen 0 errores en dos iteraciones consecutivas completas.
```

#### Prompt 12: Empaquetado Final de Producción y Certificación de Entrega Portable (`Odisea.exe`)
```text
Una vez que el bucle adversario ha alcanzado 0 defectos y el 100% de la matriz `.rea_evidence/verification_matrix.json` está en estado `VERIFIED_PASS`:

1. Ejecuta la compilación final de lanzamiento para Windows 11 (`cargo tauri build --target x86_64-pc-windows-msvc`).
2. Crea la carpeta de distribución portable final `C:/Proyectos/Odisea/dist_portable/Odisea_Win11_Portable/` que contenga:
   - `Odisea.exe` (el ejecutable único optimizado y firmado localmente).
   - `odisea_data/` preconfigurado con las hojas de estilo `.ulss` predeterminadas, los temas `.ultheme` (Minimalista, Oscuro, Solarizado, Sepia, Mica, Nord, Monokai) y un proyecto de bienvenida interactivo en español ("Manual Interactivo de Odisea") que demuestre todas las funciones de la aplicación.
3. Utiliza `rea-reverse-engineer` por última vez sobre `C:/Proyectos/Odisea/dist_portable/Odisea_Win11_Portable/Odisea.exe` para generar el Certificado de Auditoría Binaria y de Funcionalidad en `CERTIFICADO_CALIDAD_ODISEA.md` (incluyendo hash SHA-256 del ejecutable, tamaño exacto en MB, tiempo de arranque medido en milisegundos y resultados de las suites de pruebas).
```

---

<a name="anexo-pdf"></a>
## 7. Anexo: Cómo Exportar esta Guía Markdown a un PDF Profesional

Esta guía ha sido maquetada siguiendo estándares compatibles con motores de publicación técnica. Puedes convertir este archivo `guia_desarrollo_odisea.md` a PDF en Windows 11 mediante cualquiera de estos tres métodos directos:

1. **Desde Google Antigravity IDE / VS Code**:
   * Instala la extensión **Markdown PDF** (`yzane.markdown-pdf`) o utiliza la función de exportación integrada del visor de documentos, haz clic derecho sobre el documento y selecciona **Export (pdf)**.
2. **Con Pandoc + Typst (Recomendado por su velocidad y soporte de fórmulas $\LaTeX$)**:
   ```powershell
   winget install JohnMacFarlane.Pandoc typst.typst
   pandoc guia_desarrollo_odisea.md -o Guia_Desarrollo_Odisea_Win11.pdf --pdf-engine=typst -V mainfont="Segoe UI" -V margin-top=20mm -V margin-bottom=20mm -V margin-left=20mm -V margin-right=20mm --toc
   ```
3. **Desde el Propio Odisea (Una vez compilado)**:
   * Importa `guia_desarrollo_odisea.md` en tu biblioteca de Odisea, selecciona el estilo **Technical Docs (`technical_docs.ulss`)** en la vista previa de exportación y pulsa **Exportar a PDF**.