use crate::ulss_engine::ast::*;
use std::collections::HashMap;

#[derive(Debug, Clone, Default)]
pub struct ResolvedElementStyle {
    pub font_family: Option<String>,
    pub font_size_pt: Option<f64>,
    pub line_height_pt: Option<f64>,
    pub font_color: Option<String>,
    pub font_weight: Option<String>,
    pub font_slant: Option<String>,
    pub text_alignment: Option<String>,
    pub first_line_indent_pt: Option<f64>,
    pub margin_top_pt: Option<f64>,
    pub margin_bottom_pt: Option<f64>,
    pub margin_left_pt: Option<f64>,
    pub margin_right_pt: Option<f64>,
    pub padding_top_pt: Option<f64>,
    pub padding_bottom_pt: Option<f64>,
    pub padding_left_pt: Option<f64>,
    pub padding_right_pt: Option<f64>,
    pub background_color: Option<String>,
    pub border_color: Option<String>,
    pub border_width_pt: Option<f64>,
    pub border_radius_pt: Option<f64>,
    pub border_left_width_pt: Option<f64>,
    pub border_left_color: Option<String>,
    pub keep_with_next: bool,
    pub page_break_before: bool,
    pub page_break_after: bool,
    pub hyphenation: bool,
    pub strikethrough: bool,
    pub strikethrough_color: Option<String>,
    pub underline: bool,
    pub baseline_grid: Option<f64>,
    pub column_span_all: bool,
    pub raw_properties: HashMap<String, Value>,
}

#[derive(Debug, Clone)]
pub struct ResolvedDocumentSettings {
    pub page_size: String,
    pub page_width_mm: f64,
    pub page_height_mm: f64,
    pub margin_top_mm: f64,
    pub margin_bottom_mm: f64,
    pub margin_left_mm: f64,
    pub margin_right_mm: f64,
    pub baseline_grid_pt: f64,
    pub column_count: usize,
    pub column_spacing_width_mm: f64,
    pub two_sided: bool,
    pub footnote_enumeration: String,
    pub footnote_placement: String,
    pub footnote_style: String,
}

impl Default for ResolvedDocumentSettings {
    fn default() -> Self {
        Self {
            page_size: "A4".to_string(),
            page_width_mm: 210.0,
            page_height_mm: 297.0,
            margin_top_mm: 25.0,
            margin_bottom_mm: 25.0,
            margin_left_mm: 20.0,
            margin_right_mm: 20.0,
            baseline_grid_pt: 16.0,
            column_count: 1,
            column_spacing_width_mm: 6.0,
            two_sided: false,
            footnote_enumeration: "continuous".to_string(),
            footnote_placement: "end-of-page".to_string(),
            footnote_style: "decimal".to_string(),
        }
    }
}

pub struct UlssResolver<'a> {
    stylesheet: &'a UlssStylesheet,
    resolved_variables: HashMap<String, Value>,
}

impl<'a> UlssResolver<'a> {
    pub fn new(stylesheet: &'a UlssStylesheet) -> Self {
        let mut resolver = Self {
            stylesheet,
            resolved_variables: HashMap::new(),
        };
        resolver.resolve_all_variables();
        resolver
    }

    fn resolve_all_variables(&mut self) {
        for (name, expr) in &self.stylesheet.variables {
            if let Ok(val) = self.eval_expression(expr) {
                self.resolved_variables.insert(name.clone(), val);
            }
        }
    }

    pub fn eval_expression(&self, expr: &Expression) -> Result<Value, String> {
        match expr {
            Expression::Literal(v) => Ok(v.clone()),
            Expression::Variable(name) => self
                .resolved_variables
                .get(name)
                .cloned()
                .or_else(|| {
                    if let Some(raw_expr) = self.stylesheet.variables.get(name) {
                        self.eval_expression(raw_expr).ok()
                    } else {
                        None
                    }
                })
                .ok_or_else(|| format!("Undefined variable: ${}", name)),
            Expression::BinaryOp { op, left, right } => {
                let l_val = self.eval_expression(left)?;
                let r_val = self.eval_expression(right)?;

                match (l_val, r_val) {
                    (Value::Number(a), Value::Number(b)) => match op {
                        '+' => Ok(Value::Number(a + b)),
                        '-' => Ok(Value::Number(a - b)),
                        '*' => Ok(Value::Number(a * b)),
                        '/' => Ok(Value::Number(if b != 0.0 { a / b } else { 0.0 })),
                        _ => Err(format!("Unsupported operator for numbers: {}", op)),
                    },
                    (Value::Length(a, u), Value::Number(b)) => match op {
                        '*' => Ok(Value::Length(a * b, u)),
                        '/' => Ok(Value::Length(if b != 0.0 { a / b } else { 0.0 }, u)),
                        _ => Err("Invalid operation on length and number".to_string()),
                    },
                    (Value::Length(a, u1), Value::Length(b, _u2)) => match op {
                        '+' => Ok(Value::Length(a + b, u1)),
                        '-' => Ok(Value::Length(a - b, u1)),
                        _ => Err("Invalid operation between lengths".to_string()),
                    },
                    _ => Err("Type mismatch in expression evaluation".to_string()),
                }
            }
        }
    }

    pub fn resolve_rule_properties(&self, selector: &str) -> HashMap<String, Value> {
        let mut props = HashMap::new();

        for rule in &self.stylesheet.rules {
            let matches = rule.selectors.iter().any(|s| {
                s == selector
                    || s.replace(' ', "") == selector.replace(' ', "")
                    || s.trim() == selector.trim()
            });

            if matches {
                // Apply mixins first
                for mixin_name in &rule.mixins {
                    if let Some(mixin_decls) = self.stylesheet.mixins.get(mixin_name) {
                        for (k, v_expr) in mixin_decls {
                            if let Ok(val) = self.eval_expression(v_expr) {
                                props.insert(k.clone(), val);
                            }
                        }
                    }
                }

                // Apply direct rule declarations
                for (k, v_expr) in &rule.declarations {
                    if let Ok(val) = self.eval_expression(v_expr) {
                        props.insert(k.clone(), val);
                    }
                }
            }
        }

        props
    }

    pub fn resolve_document_settings(&self) -> ResolvedDocumentSettings {
        let raw = self.resolve_rule_properties("document-settings");
        let mut settings = ResolvedDocumentSettings::default();

        if let Some(v) = raw.get("page-size") {
            settings.page_size = v.as_str().replace('"', "");
        }
        if let Some(v) = raw.get("page-width") {
            settings.page_width_mm = v.to_pt() / 2.83465;
        }
        if let Some(v) = raw.get("page-height") {
            settings.page_height_mm = v.to_pt() / 2.83465;
        }
        if let Some(v) = raw.get("margin-top") {
            settings.margin_top_mm = v.to_pt() / 2.83465;
        }
        if let Some(v) = raw.get("margin-bottom") {
            settings.margin_bottom_mm = v.to_pt() / 2.83465;
        }
        if let Some(v) = raw.get("margin-left") {
            settings.margin_left_mm = v.to_pt() / 2.83465;
        }
        if let Some(v) = raw.get("margin-right") {
            settings.margin_right_mm = v.to_pt() / 2.83465;
        }
        if let Some(v) = raw.get("baseline-grid").or_else(|| raw.get("baseline-grid-size")) {
            settings.baseline_grid_pt = v.to_pt();
        }
        if let Some(v) = raw.get("column-count") {
            if let Value::Number(n) = v {
                settings.column_count = *n as usize;
            }
        }
        if let Some(v) = raw.get("column-spacing-width") {
            settings.column_spacing_width_mm = v.to_pt() / 2.83465;
        }
        if let Some(v) = raw.get("two-sided") {
            settings.two_sided = v.as_bool().unwrap_or(false);
        }
        if let Some(v) = raw.get("footnote-enumeration") {
            settings.footnote_enumeration = v.as_str().to_string();
        }
        if let Some(v) = raw.get("footnote-placement") {
            settings.footnote_placement = v.as_str().to_string();
        }
        if let Some(v) = raw.get("footnote-style") {
            settings.footnote_style = v.as_str().to_string();
        }

        settings
    }

    /// Resolves an element with complete selector inheritance:
    /// defaults -> heading-all (if heading) -> element -> adjacent -> pseudo
    pub fn resolve_element_style(
        &self,
        element: &str,
        is_adjacent: bool,
        pseudo: Option<&str>,
    ) -> ResolvedElementStyle {
        let mut merged = HashMap::new();

        // 1. Base inheritance: defaults
        for (k, v) in self.resolve_rule_properties("defaults") {
            merged.insert(k, v);
        }

        // 2. Heading-all inheritance for headings
        if element.starts_with("heading-") {
            for (k, v) in self.resolve_rule_properties("heading-all") {
                merged.insert(k, v);
            }
        }

        // 3. Element specific properties
        for (k, v) in self.resolve_rule_properties(element) {
            merged.insert(k, v);
        }

        // 4. Adjacent selector if applicable
        if is_adjacent {
            let adjacent_selector = format!("{} + {}", element, element);
            for (k, v) in self.resolve_rule_properties(&adjacent_selector) {
                merged.insert(k, v);
            }
            if element == "paragraph" {
                for (k, v) in self.resolve_rule_properties("heading-all + paragraph") {
                    merged.insert(k, v);
                }
            }
        }

        // 5. Pseudo-class if specified
        if let Some(p) = pseudo {
            let pseudo_selector = format!("{}:{}", element, p);
            for (k, v) in self.resolve_rule_properties(&pseudo_selector) {
                merged.insert(k, v);
            }
            let space_pseudo = format!("{} :{}", element, p);
            for (k, v) in self.resolve_rule_properties(&space_pseudo) {
                merged.insert(k, v);
            }
        }

        let mut style = ResolvedElementStyle {
            raw_properties: merged.clone(),
            ..Default::default()
        };

        if let Some(v) = merged.get("font-family") {
            style.font_family = Some(v.as_str().replace('"', ""));
        }
        if let Some(v) = merged.get("font-size") {
            style.font_size_pt = Some(v.to_pt());
        }
        if let Some(v) = merged.get("line-height") {
            style.line_height_pt = Some(v.to_pt());
        }
        if let Some(v) = merged.get("font-color") {
            style.font_color = Some(v.as_str().to_string());
        }
        if let Some(v) = merged.get("font-weight") {
            style.font_weight = Some(v.as_str().to_string());
        }
        if let Some(v) = merged.get("font-slant") {
            style.font_slant = Some(v.as_str().to_string());
        }
        if let Some(v) = merged.get("text-alignment") {
            style.text_alignment = Some(v.as_str().to_string());
        }
        if let Some(v) = merged.get("first-line-indent") {
            style.first_line_indent_pt = Some(v.to_pt());
        }
        if let Some(v) = merged.get("margin-top") {
            style.margin_top_pt = Some(v.to_pt());
        }
        if let Some(v) = merged.get("margin-bottom") {
            style.margin_bottom_pt = Some(v.to_pt());
        }
        if let Some(v) = merged.get("margin-left") {
            style.margin_left_pt = Some(v.to_pt());
        }
        if let Some(v) = merged.get("margin-right") {
            style.margin_right_pt = Some(v.to_pt());
        }
        if let Some(v) = merged.get("padding-left") {
            style.padding_left_pt = Some(v.to_pt());
        }
        if let Some(v) = merged.get("padding-right") {
            style.padding_right_pt = Some(v.to_pt());
        }
        if let Some(v) = merged.get("background-color") {
            style.background_color = Some(v.as_str().to_string());
        }
        if let Some(v) = merged.get("border-color") {
            style.border_color = Some(v.as_str().to_string());
        }
        if let Some(v) = merged.get("border-width") {
            style.border_width_pt = Some(v.to_pt());
        }
        if let Some(v) = merged.get("border-radius") {
            style.border_radius_pt = Some(v.to_pt());
        }
        if let Some(v) = merged.get("border-left-width") {
            style.border_left_width_pt = Some(v.to_pt());
        }
        if let Some(v) = merged.get("border-left-color") {
            style.border_left_color = Some(v.as_str().to_string());
        }
        if let Some(v) = merged.get("keep-with-next") {
            style.keep_with_next = v.as_bool().unwrap_or(false);
        }
        if let Some(v) = merged.get("page-break") {
            let s = v.as_str();
            if s == "before" {
                style.page_break_before = true;
            } else if s == "after" {
                style.page_break_after = true;
            }
        }
        if let Some(v) = merged.get("hyphenation") {
            style.hyphenation = v.as_bool().unwrap_or(false);
        }
        if let Some(v) = merged.get("strikethrough") {
            style.strikethrough = v.as_bool().unwrap_or(false);
        }
        if let Some(v) = merged.get("strikethrough-color") {
            style.strikethrough_color = Some(v.as_str().to_string());
        }
        if let Some(v) = merged.get("underline") {
            style.underline = v.as_bool().unwrap_or(false);
        }
        if let Some(v) = merged.get("baseline-grid") {
            style.baseline_grid = Some(v.to_pt());
        }
        if let Some(v) = merged.get("column-span") {
            if v.as_str() == "all" {
                style.column_span_all = true;
            }
        }

        style
    }
}
