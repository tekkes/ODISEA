use serde::{Deserialize, Serialize};
use regex::Regex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RevisionIssue {
    pub id: String,
    pub category: String, // 10 categories
    pub message: String,
    pub context_snippet: String,
    pub line_number: usize,
    pub start_offset: usize,
    pub length: usize,
    pub severity: String, // "error", "warning", "style", "suggestion"
    pub replacements: Vec<String>,
}

pub struct StyleChecker;

impl StyleChecker {
    pub fn check_document(text: &str) -> Vec<RevisionIssue> {
        let mut issues = Vec::new();
        let mut global_offset = 0;

        let in_code_block = false;

        for (line_idx, line) in text.lines().enumerate() {
            let line_num = line_idx + 1;
            let trimmed = line.trim();

            if trimmed.starts_with("```") || trimmed.starts_with("''") {
                global_offset += line.len() + 1;
                continue;
            }

            if in_code_block {
                global_offset += line.len() + 1;
                continue;
            }

            // Check if this line is a Markdown table row
            if trimmed.starts_with('|') && trimmed.ends_with('|') {
                Self::check_table_row(line, line_num, global_offset, &mut issues);
            } else {
                Self::check_text_segment(line, line_num, global_offset, "Párrafo", &mut issues);
            }

            global_offset += line.len() + 1;
        }

        issues
    }

    fn check_table_row(
        line: &str,
        line_num: usize,
        line_offset: usize,
        issues: &mut Vec<RevisionIssue>,
    ) {
        // Skip table separator line |---|---|
        if line.contains("---") {
            return;
        }

        let cells: Vec<&str> = line.split('|').collect();
        let mut col_offset = 0;

        for (cell_idx, cell) in cells.iter().enumerate() {
            let cell_text = cell.trim();
            if !cell_text.is_empty() {
                let context = format!("Tabla (Fila {}, Columna {})", line_num, cell_idx);
                let start_in_line = line[col_offset..].find(cell_text).unwrap_or(0) + col_offset;
                Self::check_text_segment(
                    cell_text,
                    line_num,
                    line_offset + start_in_line,
                    &context,
                    issues,
                );
            }
            col_offset += cell.len() + 1;
        }
    }

    fn check_text_segment(
        text: &str,
        line_num: usize,
        base_offset: usize,
        context_prefix: &str,
        issues: &mut Vec<RevisionIssue>,
    ) {
        if text.trim().is_empty() {
            return;
        }

        // 1. Ortografía (Common spelling mistakes in Spanish)
        let spelling_rules = [
            ("tambien", "también", "Falta tilde en adverbio 'también'."),
            ("ademas", "además", "Falta tilde en 'además'."),
            ("facil", "fácil", "Falta tilde en 'fácil'."),
            ("dificil", "difícil", "Falta tilde en 'difícil'."),
            ("accion", "acción", "Falta tilde en palabra aguda terminada en n: 'acción'."),
            ("cancion", "canción", "Falta tilde en palabra aguda terminada en n: 'canción'."),
            ("pagina", "página", "Palabra esdrújula: 'página' lleva tilde en la antepenúltima sílaba."),
            ("ultimamente", "últimamente", "Falta tilde en 'últimamente'."),
            ("quiza", "quizá", "Usa la forma acentuada 'quizá' o 'quizás'."),
        ];

        for (wrong, correct, msg) in spelling_rules {
            let pattern = format!(r"(?i)\b{}\b", wrong);
            if let Ok(re) = Regex::new(&pattern) {
                for mat in re.find_iter(text) {
                    issues.push(RevisionIssue {
                        id: format!("SPEL-{}", wrong.to_uppercase()),
                        category: "Ortografía".to_string(),
                        message: msg.to_string(),
                        context_snippet: format!("{}: \"{}\"", context_prefix, &text[mat.start()..mat.end()]),
                        line_number: line_num,
                        start_offset: base_offset + mat.start(),
                        length: mat.end() - mat.start(),
                        severity: "error".to_string(),
                        replacements: vec![correct.to_string()],
                    });
                }
            }
        }

        // 2. Gramática (Agreement & incorrect prepositions)
        let grammar_rules = [
            (r"(?i)\ben base a\b", "a base de", "Locución preposicional incorrecta 'en base a'. Usa 'a base de' o 'sobre la base de'."),
            (r"(?i)\bde acuerdo a\b", "de acuerdo con", "En español culto se prefiere 'de acuerdo con'."),
            (r"(?i)\bbajo el punto de vista\b", "desde el punto de vista", "Usa 'desde el punto de vista' en lugar de 'bajo'."),
            (r"(?i)\blas problema\b", "los problemas", "Discordancia de género: 'problema' es masculino."),
            (r"(?i)\bel agua fria\b", "el agua fría", "Falta tilde en 'fría'."),
        ];

        for (pattern, correct, msg) in grammar_rules {
            if let Ok(re) = Regex::new(pattern) {
                for mat in re.find_iter(text) {
                    issues.push(RevisionIssue {
                        id: "GRAM-PREP".to_string(),
                        category: "Gramática".to_string(),
                        message: msg.to_string(),
                        context_snippet: format!("{}: \"{}\"", context_prefix, &text[mat.start()..mat.end()]),
                        line_number: line_num,
                        start_offset: base_offset + mat.start(),
                        length: mat.end() - mat.start(),
                        severity: "warning".to_string(),
                        replacements: vec![correct.to_string()],
                    });
                }
            }
        }

        // 3. Puntuación (Missing space after punctuation, space before punctuation, missing opening question/exclamation)
        if let Ok(re_comma) = Regex::new(r"([a-zA-ZáéíóúÁÉÍÓÚñÑ]),([a-zA-ZáéíóúÁÉÍÓÚñÑ])") {
            for cap in re_comma.captures_iter(text) {
                if let Some(mat) = cap.get(0) {
                    let first = &cap[1];
                    let second = &cap[2];
                    issues.push(RevisionIssue {
                        id: "PUNC-SPACE-AFTER-COMMA".to_string(),
                        category: "Puntuación".to_string(),
                        message: "Falta un espacio después de la coma.".to_string(),
                        context_snippet: format!("{}: \"{}\"", context_prefix, mat.as_str()),
                        line_number: line_num,
                        start_offset: base_offset + mat.start(),
                        length: mat.end() - mat.start(),
                        severity: "warning".to_string(),
                        replacements: vec![format!("{}, {}", first, second)],
                    });
                }
            }
        }

        if let Ok(re_space_before) = Regex::new(r"\s+([,.;:!?])") {
            for cap in re_space_before.captures_iter(text) {
                if let Some(mat) = cap.get(0) {
                    let punct = &cap[1];
                    issues.push(RevisionIssue {
                        id: "PUNC-SPACE-BEFORE".to_string(),
                        category: "Puntuación".to_string(),
                        message: "Espacio sobrante antes del signo de puntuación.".to_string(),
                        context_snippet: format!("{}: \"{}\"", context_prefix, mat.as_str()),
                        line_number: line_num,
                        start_offset: base_offset + mat.start(),
                        length: mat.end() - mat.start(),
                        severity: "warning".to_string(),
                        replacements: vec![punct.to_string()],
                    });
                }
            }
        }

        // 4. Estilo (Clichés, filler words, overly complex expressions)
        let style_rules = [
            (r"(?i)\ba día de hoy\b", "hoy en día", "Frase de relleno o cliché periodístico. Considera usar 'hoy' o 'en la actualidad'."),
            (r"(?i)\bes por ello que\b", "por tanto", "Giro recargado. Considera sustituirlo por 'por tanto', 'por ello' o 'así'."),
            (r"(?i)\ba nivel de\b", "en el ámbito de", "Uso indiscriminado de 'a nivel de'. Precisa el término."),
            (r"(?i)\bde alguna manera\b", "", "Muletilla imprecisa que debilita el impacto del texto."),
            (r"(?i)\bbásicamente\b", "", "Adverbio comodín frecuentemente innecesario."),
        ];

        for (pattern, rep, msg) in style_rules {
            if let Ok(re) = Regex::new(pattern) {
                for mat in re.find_iter(text) {
                    let reps = if rep.is_empty() { vec![] } else { vec![rep.to_string()] };
                    issues.push(RevisionIssue {
                        id: "STYLE-FILLER".to_string(),
                        category: "Estilo".to_string(),
                        message: msg.to_string(),
                        context_snippet: format!("{}: \"{}\"", context_prefix, mat.as_str()),
                        line_number: line_num,
                        start_offset: base_offset + mat.start(),
                        length: mat.end() - mat.start(),
                        severity: "style".to_string(),
                        replacements: reps,
                    });
                }
            }
        }

        // 5. Redundancia (Pleonasms)
        let pleonasms = [
            (r"(?i)\bsubir arriba\b", "subir", "Pleonasmo redundante."),
            (r"(?i)\bbajar abajo\b", "bajar", "Pleonasmo redundante."),
            (r"(?i)\bentrar adentro\b", "entrar", "Pleonasmo redundante."),
            (r"(?i)\bsalir afuera\b", "salir", "Pleonasmo redundante."),
            (r"(?i)\blapso de tiempo\b", "lapso", "'Lapso' ya implica una duración de tiempo."),
            (r"(?i)\bresumen breve\b", "resumen", "Un resumen es por definición breve."),
            (r"(?i)\bprotagonista principal\b", "protagonista", "El protagonista es por definición principal."),
            (r"(?i)\btotalmente gratis\b", "gratis", "'Gratis' ya es absoluto."),
        ];

        for (pattern, rep, msg) in pleonasms {
            if let Ok(re) = Regex::new(pattern) {
                for mat in re.find_iter(text) {
                    issues.push(RevisionIssue {
                        id: "REDUN-PLEONASM".to_string(),
                        category: "Redundancia".to_string(),
                        message: msg.to_string(),
                        context_snippet: format!("{}: \"{}\"", context_prefix, mat.as_str()),
                        line_number: line_num,
                        start_offset: base_offset + mat.start(),
                        length: mat.end() - mat.start(),
                        severity: "suggestion".to_string(),
                        replacements: vec![rep.to_string()],
                    });
                }
            }
        }

        // 6. Tipografía (Typographic quotes, em dashes, ellipsis)
        if text.contains("...") {
            if let Some(pos) = text.find("...") {
                issues.push(RevisionIssue {
                    id: "TYPO-ELLIPSIS".to_string(),
                    category: "Tipografía".to_string(),
                    message: "Usa el carácter de elipsis tipográfica '…' en lugar de tres puntos simples.".to_string(),
                    context_snippet: format!("{}: \"...\"", context_prefix),
                    line_number: line_num,
                    start_offset: base_offset + pos,
                    length: 3,
                    severity: "style".to_string(),
                    replacements: vec!["…".to_string()],
                });
            }
        }

        if text.contains("--") {
            if let Some(pos) = text.find("--") {
                issues.push(RevisionIssue {
                    id: "TYPO-EMDASH".to_string(),
                    category: "Tipografía".to_string(),
                    message: "Sustituye el doble guión '--' por una raya o guión largo tipográfico '—'.".to_string(),
                    context_snippet: format!("{}: \"--\"", context_prefix),
                    line_number: line_num,
                    start_offset: base_offset + pos,
                    length: 2,
                    severity: "style".to_string(),
                    replacements: vec!["—".to_string()],
                });
            }
        }

        // Check straight double quotes "quote"
        if let Ok(re_quotes) = Regex::new(r#""([^"]+)""#) {
            for cap in re_quotes.captures_iter(text) {
                if let Some(mat) = cap.get(0) {
                    let inner = &cap[1];
                    issues.push(RevisionIssue {
                        id: "TYPO-CURLY-QUOTES".to_string(),
                        category: "Tipografía".to_string(),
                        message: "Comillas rectas detectadas. Se aconseja usar comillas tipográficas « » o “ ”.".to_string(),
                        context_snippet: format!("{}: \"{}\"", context_prefix, mat.as_str()),
                        line_number: line_num,
                        start_offset: base_offset + mat.start(),
                        length: mat.end() - mat.start(),
                        severity: "style".to_string(),
                        replacements: vec![format!("«{}»", inner), format!("“{}”", inner)],
                    });
                }
            }
        }

        // 7. Semántica (Frequently confused words & homophones)
        let semantic_rules = [
            (r"(?i)\ba ver si\b", "a ver si", ""), // correct
            (r"(?i)\bhaber si\b", "a ver si", "Confusión entre 'haber' (verbo) y 'a ver' (mirar o expectación)."),
            (r"(?i)\bhecho de menos\b", "echo de menos", "De 'echar de menos' (sin hache)."),
            (r"(?i)\bha echo\b", "ha hecho", "Del verbo 'hacer' (con hache)."),
            (r"(?i)\btubo que\b", "tuvo que", "Del verbo 'tener': 'tuvo' se escribe con uve ('tubo' es una pieza hueca)."),
            (r"(?i)\bhaber que\b", "hay que", "Usa la forma impersonal 'hay que'."),
        ];

        for (pattern, rep, msg) in semantic_rules {
            if msg.is_empty() {
                continue;
            }
            if let Ok(re) = Regex::new(pattern) {
                for mat in re.find_iter(text) {
                    issues.push(RevisionIssue {
                        id: "SEM-CONFUSION".to_string(),
                        category: "Semántica".to_string(),
                        message: msg.to_string(),
                        context_snippet: format!("{}: \"{}\"", context_prefix, mat.as_str()),
                        line_number: line_num,
                        start_offset: base_offset + mat.start(),
                        length: mat.end() - mat.start(),
                        severity: "error".to_string(),
                        replacements: vec![rep.to_string()],
                    });
                }
            }
        }

        // 8. Mayúsculas (Lowercase after period, capitalized months/days in Spanish)
        let months_days = [
            ("Lunes", "lunes"), ("Martes", "martes"), ("Miércoles", "miércoles"),
            ("Jueves", "jueves"), ("Viernes", "viernes"), ("Sábado", "sábado"), ("Domingo", "domingo"),
            ("Enero", "enero"), ("Febrero", "febrero"), ("Marzo", "marzo"),
            ("Abril", "abril"), ("Mayo", "mayo"), ("Junio", "junio"),
            ("Julio", "julio"), ("Agosto", "agosto"), ("Septiembre", "septiembre"),
            ("Octubre", "octubre"), ("Noviembre", "noviembre"), ("Diciembre", "diciembre"),
        ];

        for (cap, low) in months_days {
            let pattern = format!(r"\b{}\b", cap);
            if let Ok(re) = Regex::new(&pattern) {
                for mat in re.find_iter(text) {
                    let preceding = text[..mat.start()].trim_end();
                    let is_sentence_start = preceding.is_empty()
                        || preceding.ends_with('.')
                        || preceding.ends_with('!')
                        || preceding.ends_with('?')
                        || preceding.ends_with('¿')
                        || preceding.ends_with('¡');

                    if !is_sentence_start {
                        issues.push(RevisionIssue {
                            id: "CAP-MONTH-DAY".to_string(),
                            category: "Mayúsculas".to_string(),
                            message: format!("En español, los días y meses se escriben en minúscula: '{}'.", low),
                            context_snippet: format!("{}: \"{}\"", context_prefix, mat.as_str()),
                            line_number: line_num,
                            start_offset: base_offset + mat.start(),
                            length: mat.end() - mat.start(),
                            severity: "style".to_string(),
                            replacements: vec![low.to_string()],
                        });
                    }
                }
            }
        }

        // 9. Repetición de palabras consecutivas ("el el", "de de", etc.)
        if let Ok(re_word) = Regex::new(r"\b[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+\b") {
            let matches: Vec<_> = re_word.find_iter(text).collect();
            for i in 0..matches.len().saturating_sub(1) {
                let m1 = matches[i];
                let m2 = matches[i + 1];
                let between = &text[m1.end()..m2.start()];
                if between.trim().is_empty() && m1.as_str().to_lowercase() == m2.as_str().to_lowercase() {
                    issues.push(RevisionIssue {
                        id: "REP-CONSECUTIVE".to_string(),
                        category: "Repetición".to_string(),
                        message: format!("Palabra repetida de forma consecutiva: '{}'.", m1.as_str()),
                        context_snippet: format!("{}: \"{} {}\"", context_prefix, m1.as_str(), m2.as_str()),
                        line_number: line_num,
                        start_offset: base_offset + m1.start(),
                        length: m2.end() - m1.start(),
                        severity: "warning".to_string(),
                        replacements: vec![m1.as_str().to_string()],
                    });
                }
            }
        }


        // 10. Voz pasiva ("fue escrito por", "ha sido realizado por")
        let passive_patterns = [
            (r"(?i)\bfue\s+([a-záéíóúñ]+[ai]d[oa]s?)\s+por\b", "Voz pasiva con 'fue ... por'. Considera transformar a voz activa."),
            (r"(?i)\bha\s+sido\s+([a-záéíóúñ]+[ai]d[oa]s?)\s+por\b", "Voz pasiva con 'ha sido ... por'. Considera transformar a voz activa."),
            (r"(?i)\bfueron\s+([a-záéíóúñ]+[ai]d[oa]s?)\s+por\b", "Voz pasiva con 'fueron ... por'. Considera transformar a voz activa."),
            (r"(?i)\bhan\s+sido\s+([a-záéíóúñ]+[ai]d[oa]s?)\s+por\b", "Voz pasiva con 'han sido ... por'. Considera transformar a voz activa."),
        ];

        for (pattern, msg) in passive_patterns {
            if let Ok(re) = Regex::new(pattern) {
                for mat in re.find_iter(text) {
                    issues.push(RevisionIssue {
                        id: "PASSIVE-VOICE".to_string(),
                        category: "Voz pasiva".to_string(),
                        message: msg.to_string(),
                        context_snippet: format!("{}: \"{}\"", context_prefix, mat.as_str()),
                        line_number: line_num,
                        start_offset: base_offset + mat.start(),
                        length: mat.end() - mat.start(),
                        severity: "suggestion".to_string(),
                        replacements: vec![],
                    });
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_all_10_categories_and_table_cells() {
        let sample = "\
# Documento de Prueba

El autor tubo que subir arriba para buscar el el libro de accion.
Fue escrito por el autor en base a sus notas del mes de Mayo.
Dice que \"hola\" ... viene de acuerdo a la ley.

| Producto | Estado | Observación |
| --- | --- | --- |
| Artículo A | facil | lapso de tiempo fue evaluado por el comité |
";
        let issues = StyleChecker::check_document(sample);
        assert!(!issues.is_empty());

        let categories: std::collections::HashSet<String> = issues.iter().map(|i| i.category.clone()).collect();

        assert!(categories.contains("Ortografía"), "Missing Ortografía");
        assert!(categories.contains("Semántica"), "Missing Semántica");
        assert!(categories.contains("Redundancia"), "Missing Redundancia");
        assert!(categories.contains("Repetición"), "Missing Repetición");
        assert!(categories.contains("Gramática"), "Missing Gramática");
        assert!(categories.contains("Voz pasiva"), "Missing Voz pasiva");
        assert!(categories.contains("Mayúsculas"), "Missing Mayúsculas");
        assert!(categories.contains("Tipografía"), "Missing Tipografía");

        // Verify table cell issue was detected
        let table_issues: Vec<&RevisionIssue> = issues.iter().filter(|i| i.context_snippet.contains("Tabla")).collect();
        assert!(!table_issues.is_empty(), "Table cells must be analyzed");
    }
}
