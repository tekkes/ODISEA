use crate::ulss_engine::ast::UlssStylesheet;
use crate::ulss_engine::resolver::UlssResolver;
use chrono::Utc;
use std::fs::File;
use std::io::Write;
use std::path::{Path, PathBuf};
use uuid::Uuid;
use zip::write::SimpleFileOptions;
use zip::ZipWriter;

pub struct EpubBuilder<'a> {
    resolver: UlssResolver<'a>,
    is_revision: bool,
}

struct Chapter {
    title: String,
    content_html: String,
}

impl<'a> EpubBuilder<'a> {
    pub fn new(stylesheet: &'a UlssStylesheet, is_revision: bool) -> Self {
        Self {
            resolver: UlssResolver::new(stylesheet),
            is_revision,
        }
    }

    pub fn export_epub(
        &self,
        book_title: &str,
        author: &str,
        mdxl_content: &str,
        output_dir: &Path,
    ) -> Result<PathBuf, String> {
        let safe_title = book_title.replace(|c: char| !c.is_alphanumeric() && c != '_' && c != '-', "_");
        let epub_path = output_dir.join(format!("{}.epub", safe_title));

        let file = File::create(&epub_path).map_err(|e| format!("Failed to create EPUB file: {}", e))?;
        let mut zip = ZipWriter::new(file);

        // 1. mimetype (MUST be first and uncompressed / stored)
        let stored_options = SimpleFileOptions::default().compression_method(zip::CompressionMethod::Stored);
        zip.start_file("mimetype", stored_options).map_err(|e| e.to_string())?;
        zip.write_all(b"application/epub+zip").map_err(|e| e.to_string())?;

        let deflated_options = SimpleFileOptions::default().compression_method(zip::CompressionMethod::Deflated);

        // 2. META-INF/container.xml
        zip.start_file("META-INF/container.xml", deflated_options).map_err(|e| e.to_string())?;
        zip.write_all(Self::container_xml().as_bytes()).map_err(|e| e.to_string())?;

        // 3. OEBPS/style.css
        let css = self.compile_css();
        zip.start_file("OEBPS/style.css", deflated_options).map_err(|e| e.to_string())?;
        zip.write_all(css.as_bytes()).map_err(|e| e.to_string())?;

        // 4. Split chapters by heading-1
        let chapters = self.split_chapters(book_title, mdxl_content);

        // 5. Write each chapter XHTML
        for (idx, chap) in chapters.iter().enumerate() {
            let filename = format!("OEBPS/chapter_{}.xhtml", idx + 1);
            zip.start_file(&filename, deflated_options).map_err(|e| e.to_string())?;
            let xhtml = Self::build_chapter_xhtml(&chap.title, &chap.content_html);
            zip.write_all(xhtml.as_bytes()).map_err(|e| e.to_string())?;
        }

        // 6. OEBPS/nav.xhtml
        let nav_xhtml = Self::build_nav_xhtml(book_title, &chapters);
        zip.start_file("OEBPS/nav.xhtml", deflated_options).map_err(|e| e.to_string())?;
        zip.write_all(nav_xhtml.as_bytes()).map_err(|e| e.to_string())?;

        // 7. OEBPS/content.opf
        let book_uuid = Uuid::new_v4().to_string();
        let content_opf = Self::build_content_opf(book_title, author, &book_uuid, chapters.len());
        zip.start_file("OEBPS/content.opf", deflated_options).map_err(|e| e.to_string())?;
        zip.write_all(content_opf.as_bytes()).map_err(|e| e.to_string())?;

        zip.finish().map_err(|e| format!("Failed to finalize EPUB zip: {}", e))?;

        Ok(epub_path)
    }

    fn container_xml() -> &'static str {
        r#"<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>"#
    }

    fn compile_css(&self) -> String {
        let defaults = self.resolver.resolve_element_style("defaults", false, None);
        let font_body = defaults.font_family.unwrap_or_else(|| "serif".to_string());
        let font_color = defaults.font_color.unwrap_or_else(|| "#1d1d1f".to_string());
        let font_size = defaults.font_size_pt.unwrap_or(11.0);

        format!(
            r#"@charset "UTF-8";
body {{
    font-family: "{font_body}", Georgia, serif;
    font-size: {font_size:.1}pt;
    line-height: 1.6;
    color: {font_color};
    margin: 5% 8%;
    text-align: justify;
}}
h1, h2, h3, h4, h5, h6 {{
    font-family: "Avenir Next", "Segoe UI", sans-serif;
    font-weight: bold;
    text-align: left;
    page-break-after: avoid;
}}
h1 {{ font-size: 1.8em; margin-top: 1.5em; margin-bottom: 0.5em; }}
h2 {{ font-size: 1.4em; margin-top: 1.2em; margin-bottom: 0.4em; }}
h3 {{ font-size: 1.2em; margin-top: 1.0em; margin-bottom: 0.3em; }}
p {{ margin-top: 0; margin-bottom: 0.8em; text-indent: 1.2em; }}
p:first-of-type {{ text-indent: 0; }}
blockquote {{
    margin: 1.2em 1.5em;
    padding-left: 1em;
    border-left: 3px solid #0071e3;
    font-style: italic;
    color: #433422;
}}
code {{
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 0.9em;
    background-color: #f2f2f7;
    padding: 2px 4px;
    border-radius: 3px;
}}
pre {{
    background-color: #f2f2f7;
    padding: 1em;
    border-radius: 5px;
    overflow-x: auto;
}}
table {{
    width: 100%;
    border-collapse: collapse;
    margin: 1.5em 0;
}}
th, td {{
    border: 1px solid #d2d2d7;
    padding: 6px 10px;
    text-align: left;
}}
th {{ background-color: #f5f5f7; font-weight: bold; }}
.footnote {{
    font-size: 0.85em;
    color: #6e6e73;
    border-top: 1px solid #d2d2d7;
    padding-top: 0.5em;
    margin-top: 1.5em;
}}
.mark {{ background-color: #fff3a8; }}
.delete {{ text-decoration: line-through; color: #d70015; }}
.comment {{ background-color: #fff3cd; color: #856404; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }}
.annotation {{ background-color: #e8f2ff; color: #004085; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }}
"#,
            font_body = font_body,
            font_size = font_size,
            font_color = font_color
        )
    }

    fn split_chapters(&self, book_title: &str, mdxl_content: &str) -> Vec<Chapter> {
        let mut chapters = Vec::new();
        let mut current_title = book_title.to_string();
        let mut current_lines = Vec::new();

        for line in mdxl_content.lines() {
            if line.trim().starts_with("# ") {
                if !current_lines.is_empty() {
                    chapters.push(Chapter {
                        title: current_title.clone(),
                        content_html: self.convert_lines_to_html(&current_lines),
                    });
                    current_lines.clear();
                }
                current_title = line.trim().strip_prefix("# ").unwrap_or("Capítulo").to_string();
            } else {
                current_lines.push(line);
            }
        }

        if !current_lines.is_empty() || chapters.is_empty() {
            chapters.push(Chapter {
                title: current_title,
                content_html: self.convert_lines_to_html(&current_lines),
            });
        }

        chapters
    }

    fn convert_lines_to_html(&self, lines: &[&str]) -> String {
        let mut html = String::new();
        let mut in_code = false;
        let mut in_table = false;
        let mut table_rows: Vec<Vec<String>> = Vec::new();

        for line in lines {
            let trimmed = line.trim();

            if trimmed.starts_with("```") || trimmed.starts_with("''") {
                if in_code {
                    html.push_str("</pre>\n");
                    in_code = false;
                } else {
                    html.push_str("<pre><code>");
                    in_code = true;
                }
                continue;
            }

            if in_code {
                html.push_str(&Self::escape_html(line));
                html.push('\n');
                continue;
            }

            // Tables
            if trimmed.starts_with('|') && trimmed.ends_with('|') {
                if trimmed.contains("---") {
                    continue;
                }
                in_table = true;
                let cells: Vec<String> = trimmed
                    .split('|')
                    .filter(|s| !s.is_empty())
                    .map(|s| s.trim().to_string())
                    .collect();
                table_rows.push(cells);
                continue;
            } else if in_table {
                self.emit_html_table(&mut html, &table_rows);
                table_rows.clear();
                in_table = false;
            }

            if trimmed.is_empty() {
                continue;
            }

            if let Some(rest) = trimmed.strip_prefix("## ") {
                html.push_str(&format!("<h2>{}</h2>\n", self.transform_inline(rest)));
            } else if let Some(rest) = trimmed.strip_prefix("### ") {
                html.push_str(&format!("<h3>{}</h3>\n", self.transform_inline(rest)));
            } else if let Some(rest) = trimmed.strip_prefix("> ") {
                html.push_str(&format!("<blockquote><p>{}</p></blockquote>\n", self.transform_inline(rest)));
            } else if trimmed.starts_with("%%") {
                if self.is_revision {
                    let comment = trimmed.trim_start_matches('%').trim();
                    html.push_str(&format!("<p class=\"comment\">[Comentario: {}]</p>\n", Self::escape_html(comment)));
                }
            } else {
                html.push_str(&format!("<p>{}</p>\n", self.transform_inline(trimmed)));
            }
        }

        if in_table {
            self.emit_html_table(&mut html, &table_rows);
        }

        html
    }

    fn emit_html_table(&self, html: &mut String, rows: &[Vec<String>]) {
        if rows.is_empty() {
            return;
        }
        html.push_str("<table>\n");
        for (r_idx, row) in rows.iter().enumerate() {
            html.push_str("  <tr>\n");
            for cell in row {
                let tag = if r_idx == 0 { "th" } else { "td" };
                html.push_str(&format!("    <{}>{}</{}>\n", tag, self.transform_inline(cell), tag));
            }
            html.push_str("  </tr>\n");
        }
        html.push_str("</table>\n");
    }

    fn transform_inline(&self, text: &str) -> String {
        let mut out = String::new();
        let mut chars = text.chars().peekable();

        while let Some(ch) = chars.next() {
            // Bold **
            if ch == '*' && chars.peek() == Some(&'*') {
                chars.next();
                let mut b = String::new();
                while let Some(nc) = chars.next() {
                    if nc == '*' && chars.peek() == Some(&'*') {
                        chars.next();
                        break;
                    }
                    b.push(nc);
                }
                out.push_str(&format!("<strong>{}</strong>", Self::escape_html(&b)));
                continue;
            }

            // Strikethrough ||
            if ch == '|' && chars.peek() == Some(&'|') {
                chars.next();
                let mut s = String::new();
                while let Some(nc) = chars.next() {
                    if nc == '|' && chars.peek() == Some(&'|') {
                        chars.next();
                        break;
                    }
                    s.push(nc);
                }
                out.push_str(&format!("<span class=\"delete\">{}</span>", Self::escape_html(&s)));
                continue;
            }

            // Highlight ::
            if ch == ':' && chars.peek() == Some(&':') {
                chars.next();
                let mut m = String::new();
                while let Some(nc) = chars.next() {
                    if nc == ':' && chars.peek() == Some(&':') {
                        chars.next();
                        break;
                    }
                    m.push(nc);
                }
                out.push_str(&format!("<mark class=\"mark\">{}</mark>", Self::escape_html(&m)));
                continue;
            }

            // Annotation {text}
            if ch == '{' {
                let mut a = String::new();
                let mut found = false;
                while let Some(nc) = chars.next() {
                    if nc == '}' {
                        found = true;
                        break;
                    }
                    a.push(nc);
                }
                if found && self.is_revision {
                    out.push_str(&format!("<span class=\"annotation\">[Anotación: {}]</span>", Self::escape_html(&a)));
                } else if found {
                    out.push_str(&Self::escape_html(&a));
                } else {
                    out.push('{');
                    out.push_str(&Self::escape_html(&a));
                }
                continue;
            }

            // Code `text`
            if ch == '`' {
                let mut c = String::new();
                while let Some(nc) = chars.next() {
                    if nc == '`' {
                        break;
                    }
                    c.push(nc);
                }
                out.push_str(&format!("<code>{}</code>", Self::escape_html(&c)));
                continue;
            }

            out.push(ch);
        }

        out
    }

    fn build_chapter_xhtml(title: &str, body_html: &str) -> String {
        format!(
            r#"<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="es">
<head>
  <meta charset="utf-8"/>
  <title>{}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <h1>{}</h1>
  {}
</body>
</html>"#,
            Self::escape_html(title),
            Self::escape_html(title),
            body_html
        )
    }

    fn build_nav_xhtml(book_title: &str, chapters: &[Chapter]) -> String {
        let mut list_items = String::new();
        for (idx, chap) in chapters.iter().enumerate() {
            list_items.push_str(&format!(
                "      <li><a href=\"chapter_{}.xhtml\">{}</a></li>\n",
                idx + 1,
                Self::escape_html(&chap.title)
            ));
        }

        format!(
            r#"<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="es">
<head>
  <meta charset="utf-8"/>
  <title>Tabla de Contenidos</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>{}</h1>
    <ol>
{}    </ol>
  </nav>
</body>
</html>"#,
            Self::escape_html(book_title),
            list_items
        )
    }

    fn build_content_opf(
        book_title: &str,
        author: &str,
        uuid: &str,
        chapter_count: usize,
    ) -> String {
        let iso_now = Utc::now().format("%Y-%m-%dT%H:%M:%SZ").to_string();

        let mut manifest_items = String::new();
        let mut spine_items = String::new();

        for idx in 1..=chapter_count {
            manifest_items.push_str(&format!(
                "    <item id=\"chap_{}\" href=\"chapter_{}.xhtml\" media-type=\"application/xhtml+xml\"/>\n",
                idx, idx
            ));
            spine_items.push_str(&format!("    <itemref idref=\"chap_{}\"/>\n", idx));
        }

        format!(
            r#"<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>{title}</dc:title>
    <dc:creator>{author}</dc:creator>
    <dc:language>es</dc:language>
    <dc:identifier id="BookId">urn:uuid:{uuid}</dc:identifier>
    <meta property="dcterms:modified">{date}</meta>
  </metadata>
  <manifest>
    <item id="css" href="style.css" media-type="text/css"/>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
{manifest}  </manifest>
  <spine>
{spine}  </spine>
</package>"#,
            title = Self::escape_html(book_title),
            author = Self::escape_html(author),
            uuid = uuid,
            date = iso_now,
            manifest = manifest_items,
            spine = spine_items
        )
    }

    fn escape_html(s: &str) -> String {
        s.replace('&', "&amp;")
            .replace('<', "&lt;")
            .replace('>', "&gt;")
            .replace('"', "&quot;")
            .replace('\'', "&apos;")
    }
}
