pub mod ast;
pub mod lexer;
pub mod parser;
pub mod resolver;
pub mod pdf_typst;
pub mod docx_openxml;
pub mod epub_builder;
pub mod html_text;

pub use ast::*;
pub use lexer::*;
pub use parser::*;
pub use resolver::*;
pub use pdf_typst::*;
pub use docx_openxml::*;
pub use epub_builder::*;
pub use html_text::*;

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportResult {
    pub file_path: String,
    pub format: String,
    pub preview_html: String,
}

pub fn export_document_to_format(
    format: &str,
    title: &str,
    content: &str,
    style_path: &Path,
    output_dir: &Path,
) -> Result<ExportResult, String> {
    // 1. Read and parse ULSS stylesheet
    let ulss_content = if style_path.exists() {
        fs::read_to_string(style_path).unwrap_or_else(|_| include_str!("../../../reference_samples/sample_style.ulss").to_string())
    } else {
        include_str!("../../../reference_samples/sample_style.ulss").to_string()
    };

    let stylesheet = UlssParser::parse_stylesheet(&ulss_content)?;
    let is_revision = style_path.to_string_lossy().to_lowercase().contains("revision");

    let safe_title = title.replace(|c: char| !c.is_alphanumeric() && c != '_' && c != '-', "_");

    match format.to_lowercase().as_str() {
        "pdf" => {
            let exporter = PdfTypstExporter::new(&stylesheet, is_revision);
            let path = exporter.export_pdf(title, content, output_dir)?;
            let html_exporter = HtmlTextExporter::new(&stylesheet, is_revision);
            let preview = html_exporter.export_html_snippet(title, content);

            Ok(ExportResult {
                file_path: path.to_string_lossy().to_string(),
                format: "pdf".to_string(),
                preview_html: preview,
            })
        }
        "docx" => {
            let exporter = DocxOpenXmlExporter::new(&stylesheet, is_revision);
            let path = exporter.export_docx(title, content, output_dir)?;
            let html_exporter = HtmlTextExporter::new(&stylesheet, is_revision);
            let preview = html_exporter.export_html_snippet(title, content);

            Ok(ExportResult {
                file_path: path.to_string_lossy().to_string(),
                format: "docx".to_string(),
                preview_html: preview,
            })
        }
        "epub" => {
            let exporter = EpubBuilder::new(&stylesheet, is_revision);
            let path = exporter.export_epub(title, "Odisea Author", content, output_dir)?;
            let html_exporter = HtmlTextExporter::new(&stylesheet, is_revision);
            let preview = html_exporter.export_html_snippet(title, content);

            Ok(ExportResult {
                file_path: path.to_string_lossy().to_string(),
                format: "epub".to_string(),
                preview_html: preview,
            })
        }
        "html" => {
            let exporter = HtmlTextExporter::new(&stylesheet, is_revision);
            let full_html = exporter.export_html_full(title, content);
            let html_path = output_dir.join(format!("{}.html", safe_title));
            fs::write(&html_path, &full_html).map_err(|e| e.to_string())?;

            Ok(ExportResult {
                file_path: html_path.to_string_lossy().to_string(),
                format: "html".to_string(),
                preview_html: exporter.export_html_snippet(title, content),
            })
        }
        "markdown" | "md" => {
            let exporter = HtmlTextExporter::new(&stylesheet, is_revision);
            let md = exporter.export_standard_markdown(content);
            let md_path = output_dir.join(format!("{}.md", safe_title));
            fs::write(&md_path, &md).map_err(|e| e.to_string())?;

            Ok(ExportResult {
                file_path: md_path.to_string_lossy().to_string(),
                format: "markdown".to_string(),
                preview_html: exporter.export_html_snippet(title, content),
            })
        }
        "rtf" => {
            let exporter = HtmlTextExporter::new(&stylesheet, is_revision);
            let rtf = exporter.export_rtf(title, content);
            let rtf_path = output_dir.join(format!("{}.rtf", safe_title));
            fs::write(&rtf_path, &rtf).map_err(|e| e.to_string())?;

            Ok(ExportResult {
                file_path: rtf_path.to_string_lossy().to_string(),
                format: "rtf".to_string(),
                preview_html: exporter.export_html_snippet(title, content),
            })
        }
        other => Err(format!("Formato de exportación no soportado: {}", other)),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE_ULSS: &str = r#"
$font-body = "Charter"
$base-line = 16pt

@shared-heading {
    font-weight: bold
    keep-with-next: yes
}

document-settings {
    page-size: "A4"
    column-count: 2
    column-spacing-width: 6mm
    baseline-grid: $base-line
}

defaults {
    font-family: $font-body
    font-size: 11pt
    line-height: $base-line
    text-alignment: justified
}

heading-all : @shared-heading {
    font-color: #111111
}

heading-1 : @shared-heading {
    font-size: 24pt
    column-span: all
    page-break: before
}

paragraph {
    margin-bottom: 8pt
}

paragraph + paragraph {
    first-line-indent: 14pt
    margin-bottom: 0pt
}
"#;

    #[test]
    fn test_ulss_lexer_and_parser() {
        let stylesheet = UlssParser::parse_stylesheet(SAMPLE_ULSS).expect("Failed to parse stylesheet");
        assert!(stylesheet.variables.contains_key("font-body"));
        assert!(stylesheet.variables.contains_key("base-line"));
        assert!(stylesheet.mixins.contains_key("shared-heading"));
        assert!(!stylesheet.rules.is_empty());
    }

    #[test]
    fn test_ulss_resolver_and_inheritance() {
        let stylesheet = UlssParser::parse_stylesheet(SAMPLE_ULSS).expect("Failed to parse");
        let resolver = UlssResolver::new(&stylesheet);

        // Document settings
        let doc = resolver.resolve_document_settings();
        assert_eq!(doc.page_size, "A4");
        assert_eq!(doc.column_count, 2);
        assert!((doc.baseline_grid_pt - 16.0).abs() < 1e-3);

        // Heading-1 inherits from defaults, heading-all, and shared-heading
        let h1_style = resolver.resolve_element_style("heading-1", false, None);
        assert_eq!(h1_style.font_family.as_deref(), Some("Charter"));
        assert_eq!(h1_style.font_size_pt, Some(24.0));
        assert_eq!(h1_style.font_weight.as_deref(), Some("bold"));
        assert!(h1_style.column_span_all);
        assert!(h1_style.page_break_before);

        // Paragraph adjacent selector
        let p1 = resolver.resolve_element_style("paragraph", false, None);
        assert_eq!(p1.margin_bottom_pt, Some(8.0));
        assert_eq!(p1.first_line_indent_pt.unwrap_or(0.0), 0.0);

        let p2 = resolver.resolve_element_style("paragraph", true, None);
        assert_eq!(p2.margin_bottom_pt, Some(0.0));
        assert_eq!(p2.first_line_indent_pt, Some(14.0));
    }

    #[test]
    fn test_pdf_typst_output() {
        let stylesheet = UlssParser::parse_stylesheet(SAMPLE_ULSS).expect("Failed to parse");
        let exporter = PdfTypstExporter::new(&stylesheet, false);
        let mdxl = "# Capítulo Uno\n\nTexto con **negrita** y (fn: Nota explicativa).\n\n(toc)\n\n$$E = mc^2$$";
        let typst = exporter.compile_to_typst("Documento Odisea", mdxl);

        assert!(typst.contains("= Capítulo Uno"));
        assert!(typst.contains("*negrita*"));
        assert!(typst.contains("#footnote[Nota explicativa]"));
        assert!(typst.contains("#outline"));
        assert!(typst.contains("$ E = mc^2 $"));
    }

    #[test]
    fn test_docx_export() {
        let temp_dir = std::env::temp_dir().join(format!("odisea_docx_test_{}", uuid::Uuid::new_v4()));
        let _ = fs::create_dir_all(&temp_dir);

        let stylesheet = UlssParser::parse_stylesheet(SAMPLE_ULSS).expect("Failed to parse");
        let exporter = DocxOpenXmlExporter::new(&stylesheet, false);
        let mdxl = "# Título Docx\n\nUn párrafo con **negrita** y (fn: Primera nota).\n\n| Col1 | Col2 |\n|---|---|\n| A | B |";
        let docx_path = exporter.export_docx("Prueba Docx", mdxl, &temp_dir).expect("Failed docx export");

        assert!(docx_path.exists());
        assert!(docx_path.extension().unwrap() == "docx");

        // Verify it is a valid zip archive with document.xml and footnotes.xml
        let file = fs::File::open(&docx_path).unwrap();
        let mut archive = zip::ZipArchive::new(file).unwrap();
        assert!(archive.by_name("word/document.xml").is_ok());
        assert!(archive.by_name("word/footnotes.xml").is_ok());
        assert!(archive.by_name("word/styles.xml").is_ok());

        let _ = fs::remove_dir_all(temp_dir);
    }

    #[test]
    fn test_epub_export() {
        let temp_dir = std::env::temp_dir().join(format!("odisea_epub_test_{}", uuid::Uuid::new_v4()));
        let _ = fs::create_dir_all(&temp_dir);

        let stylesheet = UlssParser::parse_stylesheet(SAMPLE_ULSS).expect("Failed to parse");
        let exporter = EpubBuilder::new(&stylesheet, false);
        let mdxl = "# Capítulo 1\n\nTexto del primer capítulo.\n\n# Capítulo 2\n\nTexto del segundo capítulo.";
        let epub_path = exporter.export_epub("Mi Libro", "Autor", mdxl, &temp_dir).expect("Failed epub export");

        assert!(epub_path.exists());
        assert!(epub_path.extension().unwrap() == "epub");

        let file = fs::File::open(&epub_path).unwrap();
        let mut archive = zip::ZipArchive::new(file).unwrap();
        assert!(archive.by_name("mimetype").is_ok());
        assert!(archive.by_name("META-INF/container.xml").is_ok());
        assert!(archive.by_name("OEBPS/content.opf").is_ok());
        assert!(archive.by_name("OEBPS/nav.xhtml").is_ok());
        assert!(archive.by_name("OEBPS/chapter_1.xhtml").is_ok());
        assert!(archive.by_name("OEBPS/chapter_2.xhtml").is_ok());

        let _ = fs::remove_dir_all(temp_dir);
    }

    #[test]
    fn test_html_and_markdown_exports() {
        let stylesheet = UlssParser::parse_stylesheet(SAMPLE_ULSS).expect("Failed to parse");
        let exporter = HtmlTextExporter::new(&stylesheet, true);

        let mdxl = "# Título\n\nTexto con ::marca:: y ||borrado|| y %%comentario%%\n\n(fn: nota)";
        let snippet = exporter.export_html_snippet("Prueba", mdxl);
        assert!(snippet.contains("<mark>marca</mark>"));
        assert!(snippet.contains("<del>borrado</del>"));
        assert!(snippet.contains("[Comentario: comentario]"));

        let standard_md = exporter.export_standard_markdown(mdxl);
        assert!(standard_md.contains("~~borrado~~"));
        assert!(standard_md.contains("==marca=="));
        assert!(standard_md.contains("[^1]"));

        let rtf = exporter.export_rtf("Prueba RTF", mdxl);
        assert!(rtf.starts_with("{\\rtf1"));
        assert!(rtf.contains("Prueba RTF"));
    }

    #[test]
    fn test_red_team_adversarial_fuzzing() {
        // 1. Extreme nested tags
        let chaotic_mdxl = "**_++::||{anotacion|nota}(fn:pie)[link](https://test.com)`codigo`||::++_** %%comentario sin cerrar\n\n\
                            | Col 1 | Col 2 | Col 3 |\n|---|:---:|---:|\n| a | b | c |\n| d | e | f |\n\n\
                            > Cita nivel 1\n>> Cita nivel 2\n>>> Cita nivel 3\n\n\
                            $$E = \\frac{m c^2}{\\sqrt{1 - v^2/c^2}}$$\n\n\
                            ''rust\nfn main() { println!(\"fuzz\"); }\n''";

        let stylesheet = UlssParser::parse_stylesheet(SAMPLE_ULSS).expect("Failed to parse standard ULSS");
        let html_exporter = HtmlTextExporter::new(&stylesheet, false);
        let snippet = html_exporter.export_html_snippet("Fuzzing Payload", chaotic_mdxl);
        assert!(!snippet.is_empty());

        let std_md = html_exporter.export_standard_markdown(chaotic_mdxl);
        assert!(!std_md.is_empty());

        // 2. Heavy payload: 500 footnotes and thousands of paragraphs
        let mut heavy_payload = String::with_capacity(200_000);
        for i in 0..500 {
            heavy_payload.push_str(&format!("# Sección {}\n\nEste es el párrafo {} con una nota(fn: Nota número {}) y **negrita**.\n\n", i, i, i));
        }

        let heavy_html = html_exporter.export_html_snippet("Heavy Doc", &heavy_payload);
        assert!(heavy_html.contains("Sección 499"));
        assert!(heavy_html.contains("<sup>[Nota número 499]</sup>"));

        // 3. Adversarial ULSS with fractional baseline-grid and multiple mixins
        let adversarial_ulss = "
            $base: 13.333pt
            $col_count: 3
            @mixin shadow {
                text-shadow: 1pt 1pt #888888
            }
            defaults {
                font-family: 'Segoe UI Variable'
                baseline-grid: $base
                column-count: $col_count
            }
            heading-1 {
                column-span: all
                @include shadow
            }
            paragraph + paragraph {
                first-line-indent: 14pt
            }
        ";

        let adv_style = UlssParser::parse_stylesheet(adversarial_ulss).expect("Adversarial ULSS parsing failed");
        assert_eq!(adv_style.rules.len(), 3);
    }
}
