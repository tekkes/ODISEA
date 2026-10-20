pub struct HtmlBuilder;

impl HtmlBuilder {
    pub fn mdxl_to_html(title: &str, content: &str) -> String {
        let mut html = String::new();
        html.push_str("<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n  <meta charset=\"UTF-8\">\n");
        html.push_str(&format!("  <title>{}</title>\n", title));
        html.push_str("  <style>\n");
        html.push_str("    body { font-family: 'Charter', serif; max-width: 720px; margin: 40px auto; line-height: 1.6; color: #1d1d1f; }\n");
        html.push_str("    h1, h2, h3 { font-family: 'Avenir Next', sans-serif; }\n");
        html.push_str("    blockquote { border-left: 3px solid #007aff; margin: 1em 0; padding-left: 1em; color: #3a3a3c; font-style: italic; }\n");
        html.push_str("    code { font-family: 'JetBrains Mono', monospace; background: #f2f2f7; padding: 2px 4px; border-radius: 3px; }\n");
        html.push_str("    pre code { display: block; padding: 1em; overflow-x: auto; }\n");
        html.push_str("    .mark { background: #ffea79; }\n");
        html.push_str("    .delete { text-decoration: line-through; color: #ff3b30; }\n");
        html.push_str("  </style>\n</head>\n<body>\n");

        html.push_str(&format!("  <h1>{}</h1>\n", title));

        for line in content.lines() {
            let trimmed = line.trim();
            if trimmed.is_empty() {
                continue;
            }

            if let Some(rest) = trimmed.strip_prefix("# ") {
                html.push_str(&format!("  <h1>{}</h1>\n", rest));
            } else if let Some(rest) = trimmed.strip_prefix("## ") {
                html.push_str(&format!("  <h2>{}</h2>\n", rest));
            } else if let Some(rest) = trimmed.strip_prefix("### ") {
                html.push_str(&format!("  <h3>{}</h3>\n", rest));
            } else if let Some(rest) = trimmed.strip_prefix("> ") {
                html.push_str(&format!("  <blockquote><p>{}</p></blockquote>\n", rest));
            } else if trimmed.starts_with("%%") {
                // Comments excluded
                continue;
            } else if trimmed == "----" {
                html.push_str("  <hr/>\n");
            } else {
                html.push_str(&format!("  <p>{}</p>\n", trimmed));
            }
        }

        html.push_str("</body>\n</html>");
        html
    }
}
