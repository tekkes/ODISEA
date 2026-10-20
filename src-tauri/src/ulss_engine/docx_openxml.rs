use crate::ulss_engine::ast::UlssStylesheet;
use crate::ulss_engine::resolver::UlssResolver;
use std::fs::File;
use std::io::Write;
use std::path::{Path, PathBuf};
use zip::write::SimpleFileOptions;
use zip::ZipWriter;

pub struct DocxOpenXmlExporter<'a> {
    resolver: UlssResolver<'a>,
    is_revision: bool,
}

impl<'a> DocxOpenXmlExporter<'a> {
    pub fn new(stylesheet: &'a UlssStylesheet, is_revision: bool) -> Self {
        Self {
            resolver: UlssResolver::new(stylesheet),
            is_revision,
        }
    }

    pub fn export_docx(
        &self,
        title: &str,
        mdxl_content: &str,
        output_dir: &Path,
    ) -> Result<PathBuf, String> {
        let safe_title = title.replace(|c: char| !c.is_alphanumeric() && c != '_' && c != '-', "_");
        let docx_path = output_dir.join(format!("{}.docx", safe_title));

        let file = File::create(&docx_path).map_err(|e| format!("Failed to create DOCX file: {}", e))?;
        let mut zip = ZipWriter::new(file);
        let options = SimpleFileOptions::default().compression_method(zip::CompressionMethod::Deflated);

        // 1. [Content_Types].xml
        zip.start_file("[Content_Types].xml", options).map_err(|e| e.to_string())?;
        zip.write_all(Self::content_types_xml().as_bytes()).map_err(|e| e.to_string())?;

        // 2. _rels/.rels
        zip.start_file("_rels/.rels", options).map_err(|e| e.to_string())?;
        zip.write_all(Self::root_rels_xml().as_bytes()).map_err(|e| e.to_string())?;

        // 3. word/_rels/document.xml.rels
        zip.start_file("word/_rels/document.xml.rels", options).map_err(|e| e.to_string())?;
        zip.write_all(Self::document_rels_xml().as_bytes()).map_err(|e| e.to_string())?;

        // 4. word/styles.xml
        let defaults = self.resolver.resolve_element_style("defaults", false, None);
        let font_body = defaults.font_family.unwrap_or_else(|| "Calibri".to_string());
        zip.start_file("word/styles.xml", options).map_err(|e| e.to_string())?;
        zip.write_all(Self::styles_xml(&font_body).as_bytes()).map_err(|e| e.to_string())?;

        // Collect footnotes during body generation
        let mut footnotes: Vec<(usize, String)> = Vec::new();

        // 5. word/document.xml
        let document_xml = self.build_document_xml(title, mdxl_content, &mut footnotes);
        zip.start_file("word/document.xml", options).map_err(|e| e.to_string())?;
        zip.write_all(document_xml.as_bytes()).map_err(|e| e.to_string())?;

        // 6. word/footnotes.xml
        let footnotes_xml = Self::build_footnotes_xml(&footnotes);
        zip.start_file("word/footnotes.xml", options).map_err(|e| e.to_string())?;
        zip.write_all(footnotes_xml.as_bytes()).map_err(|e| e.to_string())?;

        zip.finish().map_err(|e| format!("Failed to finalize DOCX zip: {}", e))?;

        Ok(docx_path)
    }

    fn content_types_xml() -> &'static str {
        r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/footnotes.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml"/>
</Types>"#
    }

    fn root_rels_xml() -> &'static str {
        r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"#
    }

    fn document_rels_xml() -> &'static str {
        r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footnotes" Target="footnotes.xml"/>
</Relationships>"#
    }

    fn styles_xml(font: &str) -> String {
        format!(
            r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="{font}" w:hAnsi="{font}"/>
        <w:sz w:val="22"/>
        <w:color w:val="1D1D1F"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:line="280" w:lineRule="auto" w:after="160"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:jc w:val="center"/><w:spacing w:before="240" w:after="360"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="48"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:keepNext/><w:spacing w:before="360" w:after="140"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="36"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:keepNext/><w:spacing w:before="280" w:after="100"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="28"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:keepNext/><w:spacing w:before="200" w:after="80"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="24"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Quote">
    <w:name w:val="Quote"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:ind w:left="400" w:right="400"/><w:spacing w:before="140" w:after="140"/></w:pPr>
    <w:rPr><w:i/><w:color w:val="4A4A4F"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="FootnoteText">
    <w:name w:val="footnote text"/>
    <w:basedOn w:val="Normal"/>
    <w:rPr><w:sz w:val="18"/></w:rPr>
  </w:style>
  <w:style w:type="character" w:styleId="FootnoteReference">
    <w:name w:val="footnote reference"/>
    <w:rPr><w:vertAlign w:val="superscript"/></w:rPr>
  </w:style>
</w:styles>"#,
            font = font
        )
    }

    fn build_footnotes_xml(footnotes: &[(usize, String)]) -> String {
        let mut xml = String::new();
        xml.push_str(r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:footnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:footnote w:type="separator" w:id="-1">
    <w:p><w:r><w:separator/></w:r></w:p>
  </w:footnote>
  <w:footnote w:type="continuationSeparator" w:id="0">
    <w:p><w:r><w:continuationSeparator/></w:r></w:p>
  </w:footnote>
"#);

        for (id, text) in footnotes {
            xml.push_str(&format!(
                r#"  <w:footnote w:id="{}">
    <w:p>
      <w:pPr><w:pStyle w:val="FootnoteText"/></w:pPr>
      <w:r>
        <w:rPr><w:rStyle w:val="FootnoteReference"/></w:rPr>
        <w:footnoteRef/>
      </w:r>
      <w:r><w:t xml:space="preserve"> {}</w:t></w:r>
    </w:p>
  </w:footnote>
"#,
                id,
                Self::escape_xml(text)
            ));
        }

        xml.push_str("</w:footnotes>");
        xml
    }

    fn build_document_xml(
        &self,
        title: &str,
        content: &str,
        footnotes: &mut Vec<(usize, String)>,
    ) -> String {
        let mut xml = String::new();
        xml.push_str(r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
"#);

        // Title
        xml.push_str(&format!(
            "    <w:p><w:pPr><w:pStyle w:val=\"Title\"/></w:pPr><w:r><w:t>{}</w:t></w:r></w:p>\n",
            Self::escape_xml(title)
        ));

        let mut in_code_block = false;
        let mut in_table = false;
        let mut table_rows: Vec<Vec<String>> = Vec::new();

        for line in content.lines() {
            let trimmed = line.trim();

            if trimmed.starts_with("```") || trimmed.starts_with("''") {
                in_code_block = !in_code_block;
                continue;
            }

            if in_code_block {
                xml.push_str(&format!(
                    "    <w:p><w:pPr><w:shd w:fill=\"F2F2F7\"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii=\"Consolas\"/></w:rPr><w:t xml:space=\"preserve\">{}</w:t></w:r></w:p>\n",
                    Self::escape_xml(line)
                ));
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
                self.emit_docx_table(&mut xml, &table_rows, footnotes);
                table_rows.clear();
                in_table = false;
            }

            if trimmed.is_empty() {
                continue;
            }

            if let Some(rest) = trimmed.strip_prefix("# ") {
                xml.push_str(&format!(
                    "    <w:p><w:pPr><w:pStyle w:val=\"Heading1\"/></w:pPr>{}</w:p>\n",
                    self.format_docx_runs(rest, footnotes)
                ));
            } else if let Some(rest) = trimmed.strip_prefix("## ") {
                xml.push_str(&format!(
                    "    <w:p><w:pPr><w:pStyle w:val=\"Heading2\"/></w:pPr>{}</w:p>\n",
                    self.format_docx_runs(rest, footnotes)
                ));
            } else if let Some(rest) = trimmed.strip_prefix("### ") {
                xml.push_str(&format!(
                    "    <w:p><w:pPr><w:pStyle w:val=\"Heading3\"/></w:pPr>{}</w:p>\n",
                    self.format_docx_runs(rest, footnotes)
                ));
            } else if let Some(rest) = trimmed.strip_prefix("> ") {
                xml.push_str(&format!(
                    "    <w:p><w:pPr><w:pStyle w:val=\"Quote\"/></w:pPr>{}</w:p>\n",
                    self.format_docx_runs(rest, footnotes)
                ));
            } else if trimmed.starts_with("%%") {
                if self.is_revision {
                    let comment = trimmed.trim_start_matches('%').trim();
                    xml.push_str(&format!(
                        "    <w:p><w:pPr><w:shd w:fill=\"FFF3CD\"/></w:pPr><w:r><w:rPr><w:i/><w:color w:val=\"856404\"/></w:rPr><w:t xml:space=\"preserve\">[Comentario: {}]</w:t></w:r></w:p>\n",
                        Self::escape_xml(comment)
                    ));
                }
            } else {
                xml.push_str(&format!(
                    "    <w:p>{}</w:p>\n",
                    self.format_docx_runs(trimmed, footnotes)
                ));
            }
        }

        if in_table {
            self.emit_docx_table(&mut xml, &table_rows, footnotes);
        }

        xml.push_str("  </w:body>\n</w:document>");
        xml
    }

    fn emit_docx_table(
        &self,
        xml: &mut String,
        rows: &[Vec<String>],
        footnotes: &mut Vec<(usize, String)>,
    ) {
        if rows.is_empty() {
            return;
        }

        xml.push_str("    <w:tbl>\n      <w:tblPr><w:tblBorders><w:top w:val=\"single\" w:sz=\"4\" w:space=\"0\" w:color=\"D2D2D7\"/><w:left w:val=\"none\"/><w:bottom w:val=\"single\" w:sz=\"4\" w:space=\"0\" w:color=\"D2D2D7\"/><w:right w:val=\"none\"/><w:insideH w:val=\"single\" w:sz=\"4\" w:space=\"0\" w:color=\"E5E5EA\"/><w:insideV w:val=\"none\"/></w:tblBorders></w:tblPr>\n");

        for (row_idx, row) in rows.iter().enumerate() {
            xml.push_str("      <w:tr>\n");
            for cell in row {
                let is_header = row_idx == 0;
                let bg_xml = if is_header { "<w:tcPr><w:shd w:fill=\"F5F5F7\"/></w:tcPr>" } else { "" };
                xml.push_str(&format!(
                    "        <w:tc>{}<w:p>{}</w:p></w:tc>\n",
                    bg_xml,
                    self.format_docx_runs(cell, footnotes)
                ));
            }
            xml.push_str("      </w:tr>\n");
        }

        xml.push_str("    </w:tbl>\n");
    }

    fn format_docx_runs(&self, text: &str, footnotes: &mut Vec<(usize, String)>) -> String {
        let mut runs = String::new();
        let chars: Vec<char> = text.chars().collect();
        let mut i = 0;

        while i < chars.len() {
            // Footnote (fn: text)
            if chars[i] == '(' && text[i..].starts_with("(fn:") {
                if let Some(end_idx) = text[i..].find(')') {
                    let fn_body = text[i + 4..i + end_idx].trim().to_string();
                    let fn_id = footnotes.len() + 1;
                    footnotes.push((fn_id, fn_body));

                    runs.push_str(&format!(
                        "<w:r><w:rPr><w:rStyle w:val=\"FootnoteReference\"/></w:rPr><w:footnoteReference w:id=\"{}\"/></w:r>",
                        fn_id
                    ));
                    i += end_idx + 1;
                    continue;
                }
            }

            // Bold **
            if chars[i] == '*' && i + 1 < chars.len() && chars[i + 1] == '*' {
                let mut found_end = None;
                for j in (i + 2)..chars.len() {
                    if chars[j] == '*' && j + 1 < chars.len() && chars[j + 1] == '*' {
                        found_end = Some(j);
                        break;
                    }
                }
                if let Some(end) = found_end {
                    let bold: String = chars[i + 2..end].iter().collect();
                    runs.push_str(&format!("<w:r><w:rPr><w:b/></w:rPr><w:t xml:space=\"preserve\">{}</w:t></w:r>", Self::escape_xml(&bold)));
                    i = end + 2;
                    continue;
                }
            }

            // Strikethrough ||
            if chars[i] == '|' && i + 1 < chars.len() && chars[i + 1] == '|' {
                let mut found_end = None;
                for j in (i + 2)..chars.len() {
                    if chars[j] == '|' && j + 1 < chars.len() && chars[j + 1] == '|' {
                        found_end = Some(j);
                        break;
                    }
                }
                if let Some(end) = found_end {
                    let strike: String = chars[i + 2..end].iter().collect();
                    let color_xml = if self.is_revision { "<w:color w:val=\"D70015\"/>" } else { "" };
                    runs.push_str(&format!("<w:r><w:rPr><w:strike/>{}</w:rPr><w:t xml:space=\"preserve\">{}</w:t></w:r>", color_xml, Self::escape_xml(&strike)));
                    i = end + 2;
                    continue;
                }
            }

            // Highlight ::
            if chars[i] == ':' && i + 1 < chars.len() && chars[i + 1] == ':' {
                let mut found_end = None;
                for j in (i + 2)..chars.len() {
                    if chars[j] == ':' && j + 1 < chars.len() && chars[j + 1] == ':' {
                        found_end = Some(j);
                        break;
                    }
                }
                if let Some(end) = found_end {
                    let mark: String = chars[i + 2..end].iter().collect();
                    runs.push_str(&format!("<w:r><w:rPr><w:highlight w:val=\"yellow\"/></w:rPr><w:t xml:space=\"preserve\">{}</w:t></w:r>", Self::escape_xml(&mark)));
                    i = end + 2;
                    continue;
                }
            }

            // Annotation {text}
            if chars[i] == '{' {
                let mut found_end = None;
                for j in (i + 1)..chars.len() {
                    if chars[j] == '}' {
                        found_end = Some(j);
                        break;
                    }
                }
                if let Some(end) = found_end {
                    let annot: String = chars[i + 1..end].iter().collect();
                    if self.is_revision {
                        runs.push_str(&format!("<w:r><w:rPr><w:highlight w:val=\"cyan\"/><w:color w:val=\"004085\"/></w:rPr><w:t xml:space=\"preserve\">[Anotación: {}]</w:t></w:r>", Self::escape_xml(&annot)));
                    } else {
                        runs.push_str(&format!("<w:r><w:t xml:space=\"preserve\">{}</w:t></w:r>", Self::escape_xml(&annot)));
                    }
                    i = end + 1;
                    continue;
                }
            }

            runs.push_str(&format!("<w:r><w:t xml:space=\"preserve\">{}</w:t></w:r>", Self::escape_xml(&chars[i].to_string())));
            i += 1;
        }

        runs
    }

    fn escape_xml(s: &str) -> String {
        s.replace('&', "&amp;")
            .replace('<', "&lt;")
            .replace('>', "&gt;")
            .replace('"', "&quot;")
            .replace('\'', "&apos;")
    }
}
