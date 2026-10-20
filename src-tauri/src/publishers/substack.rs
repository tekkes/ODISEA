use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubstackCopyResult {
    pub html_for_clipboard: String,
    pub markdown_clean: String,
}

pub struct SubstackFormatter;

impl SubstackFormatter {
    pub fn format_for_substack(title: &str, mdxl_content: &str) -> SubstackCopyResult {
        let mut html = String::new();
        let mut clean_md = String::new();

        // 1. Title as H1
        html.push_str(&format!("<h1>{}</h1>\n\n", Self::escape_html(title)));
        clean_md.push_str(&format!("# {}\n\n", title));

        let lines: Vec<&str> = mdxl_content.lines().collect();
        let mut in_code_block = false;
        let mut code_buffer = String::new();

        for line in lines {
            let trimmed = line.trim();

            // Code block handling
            if trimmed.starts_with("```") || trimmed.starts_with("''") {
                if in_code_block {
                    html.push_str(&format!("<pre><code>{}</code></pre>\n", Self::escape_html(&code_buffer)));
                    clean_md.push_str("```\n");
                    code_buffer.clear();
                    in_code_block = false;
                } else {
                    in_code_block = true;
                    clean_md.push_str("```\n");
                }
                continue;
            }

            if in_code_block {
                code_buffer.push_str(line);
                code_buffer.push('\n');
                clean_md.push_str(line);
                clean_md.push('\n');
                continue;
            }

            // Skip author private comments
            if trimmed.starts_with("%%") || trimmed.starts_with("//") {
                continue;
            }

            // Headers H1..H6
            if let Some(rest) = trimmed.strip_prefix("###### ") {
                html.push_str(&format!("<h6>{}</h6>\n", Self::format_inline(rest)));
                clean_md.push_str(&format!("###### {}\n", rest));
            } else if let Some(rest) = trimmed.strip_prefix("##### ") {
                html.push_str(&format!("<h5>{}</h5>\n", Self::format_inline(rest)));
                clean_md.push_str(&format!("##### {}\n", rest));
            } else if let Some(rest) = trimmed.strip_prefix("#### ") {
                html.push_str(&format!("<h4>{}</h4>\n", Self::format_inline(rest)));
                clean_md.push_str(&format!("#### {}\n", rest));
            } else if let Some(rest) = trimmed.strip_prefix("### ") {
                html.push_str(&format!("<h3>{}</h3>\n", Self::format_inline(rest)));
                clean_md.push_str(&format!("### {}\n", rest));
            } else if let Some(rest) = trimmed.strip_prefix("## ") {
                html.push_str(&format!("<h2>{}</h2>\n", Self::format_inline(rest)));
                clean_md.push_str(&format!("## {}\n", rest));
            } else if let Some(rest) = trimmed.strip_prefix("# ") {
                html.push_str(&format!("<h1>{}</h1>\n", Self::format_inline(rest)));
                clean_md.push_str(&format!("# {}\n", rest));
            } else if let Some(rest) = trimmed.strip_prefix("> ") {
                // Blockquote
                html.push_str(&format!("<blockquote><p>{}</p></blockquote>\n", Self::format_inline(rest)));
                clean_md.push_str(&format!("> {}\n", rest));
            } else if trimmed.starts_with("- ") || trimmed.starts_with("* ") {
                // List item
                let item_text = &trimmed[2..];
                html.push_str(&format!("<ul><li>{}</li></ul>\n", Self::format_inline(item_text)));
                clean_md.push_str(&format!("- {}\n", item_text));
            } else if trimmed == "---" || trimmed == "***" {
                // Horizontal divider
                html.push_str("<hr />\n");
                clean_md.push_str("---\n");
            } else if trimmed.is_empty() {
                html.push('\n');
                clean_md.push('\n');
            } else {
                // Standard paragraph
                let inline_html = Self::format_inline(trimmed);
                html.push_str(&format!("<p>{}</p>\n", inline_html));
                clean_md.push_str(trimmed);
                clean_md.push('\n');
            }
        }

        SubstackCopyResult {
            html_for_clipboard: html,
            markdown_clean: clean_md,
        }
    }

    fn format_inline(text: &str) -> String {
        let mut s = Self::escape_html(text);

        // Bold: **text** or __text__
        s = s.replace("**", "<strong>");
        s = Self::close_paired_tags(s, "<strong>", "</strong>");

        // Italic: _text_ or *text*
        s = s.replace("_", "<em>");
        s = Self::close_paired_tags(s, "<em>", "</em>");

        // Strikethrough: ||text|| or ~~text~~
        s = s.replace("||", "<del>");
        s = s.replace("~~", "<del>");
        s = Self::close_paired_tags(s, "<del>", "</del>");

        // Inline Code: `text`
        s = s.replace("`", "<code>");
        s = Self::close_paired_tags(s, "<code>", "</code>");

        // Footnotes: (fn: note) -> <sup>[note]</sup>
        let re_fn = regex::Regex::new(r"\(fn(?::\s*([^)]*))?\)").unwrap();
        s = re_fn.replace_all(&s, "<sup>[$1]</sup>").to_string();

        s
    }

    fn close_paired_tags(text: String, open_tag: &str, close_tag: &str) -> String {
        let mut count = 0;
        let mut result = String::new();
        let parts: Vec<&str> = text.split(open_tag).collect();
        for (idx, part) in parts.iter().enumerate() {
            if idx > 0 {
                if count % 2 == 0 {
                    result.push_str(open_tag);
                } else {
                    result.push_str(close_tag);
                }
                count += 1;
            }
            result.push_str(part);
        }
        result
    }

    fn escape_html(input: &str) -> String {
        input
            .replace('&', "&amp;")
            .replace('<', "&lt;")
            .replace('>', "&gt;")
            .replace('"', "&quot;")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_substack_format_conversion() {
        let title = "Mi Ensayo Semanal";
        let mdxl = "\
# Introducción

Este es un párrafo con **negrita** y _cursiva_.
%% Comentario privado de autor que no debe aparecer %%
> Una cita memorable.

- Punto uno
- Punto dos
";
        let res = SubstackFormatter::format_for_substack(title, mdxl);
        assert!(res.html_for_clipboard.contains("<h1>Mi Ensayo Semanal</h1>"));
        assert!(res.html_for_clipboard.contains("<strong>negrita</strong>"));
        assert!(res.html_for_clipboard.contains("<em>cursiva</em>"));
        assert!(!res.html_for_clipboard.contains("Comentario privado"));
        assert!(res.html_for_clipboard.contains("<blockquote><p>Una cita memorable.</p></blockquote>"));
    }
}
