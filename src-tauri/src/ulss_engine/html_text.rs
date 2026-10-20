use crate::ulss_engine::ast::UlssStylesheet;
use crate::ulss_engine::resolver::UlssResolver;

pub struct HtmlTextExporter<'a> {
    resolver: UlssResolver<'a>,
    is_revision: bool,
}

impl<'a> HtmlTextExporter<'a> {
    pub fn new(stylesheet: &'a UlssStylesheet, is_revision: bool) -> Self {
        Self {
            resolver: UlssResolver::new(stylesheet),
            is_revision,
        }
    }

    /// Generates a clean HTML snippet (without <html><head><body> wrapper)
    pub fn export_html_snippet(&self, title: &str, mdxl_content: &str) -> String {
        let mut html = String::new();
        html.push_str(&format!("<h1>{}</h1>\n", Self::escape_html(title)));

        for line in mdxl_content.lines() {
            let trimmed = line.trim();
            if trimmed.is_empty() {
                continue;
            }

            if let Some(rest) = trimmed.strip_prefix("# ") {
                html.push_str(&format!("<h1>{}</h1>\n", self.transform_inline(rest)));
            } else if let Some(rest) = trimmed.strip_prefix("## ") {
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
            } else if trimmed == "----" || trimmed == "---" {
                html.push_str("<hr/>\n");
            } else {
                html.push_str(&format!("<p>{}</p>\n", self.transform_inline(trimmed)));
            }
        }

        html
    }

    /// Generates a full, beautiful standalone HTML5 page with embedded CSS derived from the ULSS rules
    pub fn export_html_full(&self, title: &str, mdxl_content: &str) -> String {
        let defaults = self.resolver.resolve_element_style("defaults", false, None);
        let font_body = defaults.font_family.unwrap_or_else(|| "Charter, serif".to_string());
        let font_size = defaults.font_size_pt.unwrap_or(11.0);
        let font_color = defaults.font_color.unwrap_or_else(|| "#1d1d1f".to_string());

        let snippet = self.export_html_snippet(title, mdxl_content);

        format!(
            r#"<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <style>
    :root {{
      --font-body: {font_body};
      --font-color: {font_color};
      --font-size: {font_size:.1}pt;
    }}
    body {{
      font-family: var(--font-body), Georgia, serif;
      font-size: var(--font-size);
      line-height: 1.65;
      color: var(--font-color);
      max-width: 740px;
      margin: 48px auto;
      padding: 0 24px;
      background-color: #fafafa;
    }}
    h1, h2, h3, h4, h5, h6 {{
      font-family: "Avenir Next", "Segoe UI", sans-serif;
      font-weight: bold;
      color: #111827;
      margin-top: 1.8em;
      margin-bottom: 0.6em;
      line-height: 1.3;
    }}
    h1 {{ font-size: 2.2em; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3em; }}
    h2 {{ font-size: 1.6em; }}
    h3 {{ font-size: 1.3em; }}
    p {{
      margin-top: 0;
      margin-bottom: 1em;
      text-align: justify;
    }}
    blockquote {{
      border-left: 3px solid #0071e3;
      margin: 1.5em 0;
      padding: 0.5em 1em;
      color: #4b5563;
      background-color: #f8fafc;
      font-style: italic;
    }}
    code {{
      font-family: "JetBrains Mono", Consolas, monospace;
      font-size: 0.9em;
      background-color: #f3f4f6;
      padding: 2px 5px;
      border-radius: 4px;
    }}
    pre code {{
      display: block;
      padding: 1em;
      overflow-x: auto;
      background-color: #1f2937;
      color: #f9fafb;
    }}
    mark {{
      background-color: #fef08a;
      padding: 1px 3px;
      border-radius: 2px;
    }}
    del {{
      text-decoration: line-through;
      color: #dc2626;
    }}
    .comment {{
      background-color: #fef3c7;
      color: #92400e;
      border-left: 3px solid #f59e0b;
      padding: 6px 12px;
      font-size: 0.9em;
      border-radius: 4px;
    }}
    .annotation {{
      background-color: #dbeafe;
      color: #1e40af;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 0.9em;
    }}
    hr {{
      border: 0;
      border-top: 1px solid #e5e7eb;
      margin: 2em 0;
    }}
  </style>
</head>
<body>
  {body}
</body>
</html>"#,
            title = Self::escape_html(title),
            font_body = font_body,
            font_color = font_color,
            font_size = font_size,
            body = snippet
        )
    }

    /// Exports standard CommonMark from Ulysses Markdown XL
    pub fn export_standard_markdown(&self, content: &str) -> String {
        let mut out = String::new();
        let mut fn_counter = 1;

        for line in content.lines() {
            let mut processed = line.to_string();

            // Footnotes (fn: ...) -> [^1]
            while let Some(start) = processed.find("(fn:") {
                if let Some(end) = processed[start..].find(')') {
                    let tag = format!("[^{}]", fn_counter);
                    processed.replace_range(start..=start + end, &tag);
                    fn_counter += 1;
                } else {
                    break;
                }
            }

            // Strikethrough ||text|| -> ~~text~~
            processed = processed.replace("||", "~~");

            // Highlights ::text:: -> ==text==
            processed = processed.replace("::", "==");

            // Comments %%
            if processed.trim().starts_with("%%") {
                if !self.is_revision {
                    continue;
                }
            }

            out.push_str(&processed);
            out.push('\n');
        }

        out
    }

    /// Exports Rich Text Format (RTF) string compatible with Windows clipboard & WordPad
    pub fn export_rtf(&self, title: &str, mdxl_content: &str) -> String {
        let mut rtf = String::new();
        rtf.push_str("{\\rtf1\\ansi\\deff0\n");
        rtf.push_str("{\\fonttbl{\\f0\\froman\\fcharset0 Charter;}{\\f1\\fswiss\\fcharset0 Arial;}}\n");
        rtf.push_str("{\\colortbl ;\\red29\\green29\\blue31;\\red0\\green113\\blue227;\\red215\\green0\\blue21;}\n");
        rtf.push_str("\\viewkind4\\uc1\\pard\\cf1\\lang1034\\f0\\fs22\n");

        // Title
        rtf.push_str(&format!(
            "\\pard\\qc\\b\\fs36 {}\\b0\\fs22\\par\\par\n",
            Self::escape_rtf(title)
        ));

        for line in mdxl_content.lines() {
            let trimmed = line.trim();
            if trimmed.is_empty() {
                rtf.push_str("\\par\n");
                continue;
            }

            if let Some(rest) = trimmed.strip_prefix("# ") {
                rtf.push_str(&format!("\\pard\\b\\fs32 {}\\b0\\fs22\\par\n", Self::escape_rtf(rest)));
            } else if let Some(rest) = trimmed.strip_prefix("## ") {
                rtf.push_str(&format!("\\pard\\b\\fs28 {}\\b0\\fs22\\par\n", Self::escape_rtf(rest)));
            } else if let Some(rest) = trimmed.strip_prefix("### ") {
                rtf.push_str(&format!("\\pard\\b\\fs24 {}\\b0\\fs22\\par\n", Self::escape_rtf(rest)));
            } else if let Some(rest) = trimmed.strip_prefix("> ") {
                rtf.push_str(&format!("\\pard\\li400\\i {}\\i0\\par\n", Self::escape_rtf(rest)));
            } else if trimmed.starts_with("%%") {
                if self.is_revision {
                    let comment = trimmed.trim_start_matches('%').trim();
                    rtf.push_str(&format!("\\pard\\cf2\\i [Comentario: {}]\\i0\\cf1\\par\n", Self::escape_rtf(comment)));
                }
            } else {
                rtf.push_str(&format!("\\pard {}\\par\n", Self::escape_rtf(trimmed)));
            }
        }

        rtf.push_str("}\n");
        rtf
    }

    fn transform_inline(&self, text: &str) -> String {
        let mut out = String::new();
        let mut chars = text.chars().peekable();

        while let Some(ch) = chars.next() {
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
                out.push_str(&format!("<del>{}</del>", Self::escape_html(&s)));
                continue;
            }

            if ch == '%' && chars.peek() == Some(&'%') {
                chars.next();
                let mut comm = String::new();
                while let Some(nc) = chars.next() {
                    if nc == '%' && chars.peek() == Some(&'%') {
                        chars.next();
                        break;
                    }
                    comm.push(nc);
                }
                if self.is_revision {
                    out.push_str(&format!("<span class=\"comment\">[Comentario: {}]</span>", Self::escape_html(&comm)));
                }
                continue;
            }

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
                out.push_str(&format!("<mark>{}</mark>", Self::escape_html(&m)));
                continue;
            }

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

            if ch == '+' && chars.peek() == Some(&'+') {
                chars.next();
                let mut u = String::new();
                while let Some(nc) = chars.next() {
                    if nc == '+' && chars.peek() == Some(&'+') {
                        chars.next();
                        break;
                    }
                    u.push(nc);
                }
                out.push_str(&format!("<u>{}</u>", Self::escape_html(&u)));
                continue;
            }

            if ch == '(' && (chars.peek() == Some(&'f') || chars.peek() == Some(&'F')) {
                let mut fn_content = String::new();
                let mut closed = false;
                while let Some(nc) = chars.next() {
                    if nc == ')' {
                        closed = true;
                        break;
                    }
                    fn_content.push(nc);
                }
                if closed && (fn_content.starts_with("fn:") || fn_content.starts_with("fn") || fn_content.starts_with("FN:")) {
                    let note = if let Some(rest) = fn_content.strip_prefix("fn:") {
                        rest.trim()
                    } else if let Some(rest) = fn_content.strip_prefix("FN:") {
                        rest.trim()
                    } else {
                        fn_content.trim()
                    };
                    out.push_str(&format!("<sup>[{}]</sup>", Self::escape_html(note)));
                    continue;
                } else {
                    out.push('(');
                    out.push_str(&Self::escape_html(&fn_content));
                    if closed {
                        out.push(')');
                    }
                    continue;
                }
            }

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

    fn escape_html(s: &str) -> String {
        s.replace('&', "&amp;")
            .replace('<', "&lt;")
            .replace('>', "&gt;")
            .replace('"', "&quot;")
            .replace('\'', "&apos;")
    }

    fn escape_rtf(s: &str) -> String {
        s.replace('\\', "\\\\")
            .replace('{', "\\{")
            .replace('}', "\\}")
    }
}
