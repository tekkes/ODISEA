use std::path::PathBuf;
use std::fs;
use std::sync::atomic::{AtomicBool, Ordering};

static INITIALIZED: AtomicBool = AtomicBool::new(false);

pub fn get_portable_root() -> PathBuf {
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(parent) = exe_path.parent() {
            // If running tests or cargo build inside target/..., check if we are in target
            let parent_str = parent.to_string_lossy();
            if !parent_str.contains("target\\debug") && !parent_str.contains("target/debug") 
                && !parent_str.contains("odisea_target") {
                return parent.to_path_buf();
            }
        }
    }
    let current = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
    if current.file_name().map(|n| n == "src-tauri").unwrap_or(false) {
        if let Some(parent) = current.parent() {
            return parent.to_path_buf();
        }
    }
    current
}

pub fn get_data_dir() -> PathBuf {
    let data_dir = get_portable_root().join("odisea_data");
    if !data_dir.exists() {
        let _ = fs::create_dir_all(&data_dir);
    }
    data_dir
}

pub fn get_webview_profile_dir() -> PathBuf {
    let profile_dir = get_data_dir().join("webview_profile");
    if !profile_dir.exists() {
        let _ = fs::create_dir_all(&profile_dir);
    }
    profile_dir
}

pub fn get_db_path() -> PathBuf {
    get_data_dir().join("library.odiseadb")
}

pub fn get_config_path() -> PathBuf {
    get_data_dir().join("config.toml")
}

pub fn get_themes_dir() -> PathBuf {
    let dir = get_data_dir().join("themes");
    if !dir.exists() {
        let _ = fs::create_dir_all(&dir);
    }
    dir
}

pub fn get_styles_dir() -> PathBuf {
    let dir = get_data_dir().join("styles");
    if !dir.exists() {
        let _ = fs::create_dir_all(&dir);
    }
    dir
}

pub fn get_backups_dir() -> PathBuf {
    let dir = get_data_dir().join("backups");
    if !dir.exists() {
        let _ = fs::create_dir_all(&dir);
    }
    let hourly = dir.join("hourly");
    let daily = dir.join("daily");
    let weekly = dir.join("weekly");
    let _ = fs::create_dir_all(&hourly);
    let _ = fs::create_dir_all(&daily);
    let _ = fs::create_dir_all(&weekly);
    dir
}

pub fn get_attachments_dir() -> PathBuf {
    let dir = get_data_dir().join("attachments");
    if !dir.exists() {
        let _ = fs::create_dir_all(&dir);
    }
    dir
}

pub fn get_exports_dir() -> PathBuf {
    let dir = get_data_dir().join("exports");
    if !dir.exists() {
        let _ = fs::create_dir_all(&dir);
    }
    dir
}

pub fn initialize_portable_environment() {
    let webview_dir = get_webview_profile_dir();
    std::env::set_var("WEBVIEW2_USER_DATA_FOLDER", &webview_dir);

    let themes_dir = get_themes_dir();
    let styles_dir = get_styles_dir();
    let _ = get_backups_dir();
    let _ = get_attachments_dir();
    let _ = get_exports_dir();

    // 1. Ensure config.toml exists
    let config_path = get_config_path();
    if !config_path.exists() {
        let default_config = crate::portable::config::OdiseaConfig::default();
        let _ = crate::portable::config::save_config(&default_config);
    }

    // 2. Dump default .ultheme files if missing
    let default_theme_path = themes_dir.join("default.ultheme");
    if !default_theme_path.exists() {
        let _ = fs::write(&default_theme_path, include_str!("../../../reference_samples/sample_theme.ultheme"));
    }
    let dual_pro_theme = themes_dir.join("odisea_dual_pro.ultheme");
    if !dual_pro_theme.exists() {
        let _ = fs::write(&dual_pro_theme, include_str!("../../../reference_samples/sample_theme.ultheme"));
    }

    // 3. Dump default .ulss stylesheet files if missing (8 canonical styles)
    ensure_default_styles(&styles_dir);

    // 4. Initialize database schema automatically
    if let Ok(conn) = crate::db::schema::open_connection() {
        let _ = crate::db::schema::initialize_database(&conn);
    }

    // 5. Ensure application icons (white background + bold blue capital O)
    ensure_app_icons();

    INITIALIZED.store(true, Ordering::SeqCst);
}

fn adler32(data: &[u8]) -> u32 {
    let mut s1 = 1u32;
    let mut s2 = 0u32;
    for &b in data {
        s1 = (s1 + b as u32) % 65521;
        s2 = (s2 + s1) % 65521;
    }
    (s2 << 16) | s1
}

fn crc32(data: &[u8]) -> u32 {
    let mut c = 0xFFFFFFFFu32;
    for &b in data {
        c ^= b as u32;
        for _ in 0..8 {
            c = if (c & 1) != 0 { 0xEDB88320 ^ (c >> 1) } else { c >> 1 };
        }
    }
    c ^ 0xFFFFFFFF
}

fn create_png_chunk(chunk_type: &[u8; 4], data: &[u8]) -> Vec<u8> {
    let mut res = Vec::new();
    res.extend_from_slice(&(data.len() as u32).to_be_bytes());
    res.extend_from_slice(chunk_type);
    res.extend_from_slice(data);
    let mut crc_input = Vec::new();
    crc_input.extend_from_slice(chunk_type);
    crc_input.extend_from_slice(data);
    let crc = crc32(&crc_input);
    res.extend_from_slice(&crc.to_be_bytes());
    res
}

fn create_png(width: u32, height: u32, rgba_pixels: &[u8]) -> Vec<u8> {
    let mut png = Vec::new();
    png.extend_from_slice(&[137, 80, 78, 71, 13, 10, 26, 10]);

    let mut ihdr = Vec::new();
    ihdr.extend_from_slice(&width.to_be_bytes());
    ihdr.extend_from_slice(&height.to_be_bytes());
    ihdr.push(8);
    ihdr.push(6);
    ihdr.push(0);
    ihdr.push(0);
    ihdr.push(0);
    png.extend_from_slice(&create_png_chunk(b"IHDR", &ihdr));

    let row_len = (width * 4) as usize;
    let mut raw_scanlines = Vec::with_capacity((height as usize) * (1 + row_len));
    for y in 0..height as usize {
        raw_scanlines.push(0);
        let row_start = y * row_len;
        raw_scanlines.extend_from_slice(&rgba_pixels[row_start..row_start + row_len]);
    }

    let mut zlib_data = Vec::new();
    zlib_data.extend_from_slice(&[0x78, 0x01]);
    let chunks = raw_scanlines.chunks(65535);
    let num_chunks = chunks.len();
    for (i, chunk) in chunks.enumerate() {
        let is_last = i == num_chunks - 1;
        let bfinal = if is_last { 1u8 } else { 0u8 };
        zlib_data.push(bfinal);
        let len = chunk.len() as u16;
        let nlen = !len;
        zlib_data.extend_from_slice(&len.to_le_bytes());
        zlib_data.extend_from_slice(&nlen.to_le_bytes());
        zlib_data.extend_from_slice(chunk);
    }
    let adler = adler32(&raw_scanlines);
    zlib_data.extend_from_slice(&adler.to_be_bytes());
    png.extend_from_slice(&create_png_chunk(b"IDAT", &zlib_data));

    png.extend_from_slice(&create_png_chunk(b"IEND", &[]));
    png
}

fn render_thick_o_pixels(size: u32) -> Vec<u8> {
    let mut pixels = Vec::with_capacity((size * size * 4) as usize);
    let cx = size as f64 / 2.0;
    let cy = size as f64 / 2.0;
    let r_out = size as f64 * 0.38;
    let r_in = size as f64 * 0.19;
    let corner_radius = size as f64 * 0.19;

    let samples = 4;
    let step = 1.0 / samples as f64;

    for y in 0..size {
        let t = y as f64 / size as f64;
        let r_blue = (10.0 * (1.0 - t) + 0.0 * t).round();
        let g_blue = (132.0 * (1.0 - t) + 102.0 * t).round();
        let b_blue = (255.0 * (1.0 - t) + 230.0 * t).round();

        for x in 0..size {
            let mut hits_o = 0;
            let mut hits_card = 0;

            for sy in 0..samples {
                let py = y as f64 + (sy as f64 + 0.5) * step;
                let dy = py - cy;
                for sx in 0..samples {
                    let px = x as f64 + (sx as f64 + 0.5) * step;
                    let dx = px - cx;

                    let qx = dx.abs() - (size as f64 / 2.0 - corner_radius);
                    let qy = dy.abs() - (size as f64 / 2.0 - corner_radius);
                    let dist_card = qx.max(qy).min(0.0) + qx.max(0.0).hypot(qy.max(0.0)) - corner_radius;
                    if dist_card <= 0.0 {
                        hits_card += 1;
                    }

                    let dist_center = dx.hypot(dy);
                    if dist_center <= r_out && dist_center >= r_in {
                        hits_o += 1;
                    }
                }
            }

            if hits_card > 0 {
                let card_alpha = hits_card as f64 / (samples * samples) as f64;
                let o_coverage = hits_o as f64 / (samples * samples) as f64;

                let r_pix = (255.0 * (1.0 - o_coverage) + r_blue * o_coverage).round() as u8;
                let g_pix = (255.0 * (1.0 - o_coverage) + g_blue * o_coverage).round() as u8;
                let b_pix = (255.0 * (1.0 - o_coverage) + b_blue * o_coverage).round() as u8;
                let a_pix = (card_alpha * 255.0).round() as u8;

                pixels.push(r_pix);
                pixels.push(g_pix);
                pixels.push(b_pix);
                pixels.push(a_pix);
            } else {
                pixels.push(0);
                pixels.push(0);
                pixels.push(0);
                pixels.push(0);
            }
        }
    }
    pixels
}

pub fn generate_thick_o_ico(path: &std::path::Path) {
    let sizes: [u32; 6] = [16, 32, 48, 64, 128, 256];
    let num_images = sizes.len() as u16;
    let mut images_data: Vec<Vec<u8>> = Vec::new();

    for &size in &sizes {
        let mut img_bytes = Vec::new();
        let bi_size: u32 = 40;
        let bi_width: i32 = size as i32;
        let bi_height: i32 = (size * 2) as i32;
        let bi_planes: u16 = 1;
        let bi_bit_count: u16 = 32;
        let bi_compression: u32 = 0;
        let bi_size_image: u32 = size * size * 4;

        img_bytes.extend_from_slice(&bi_size.to_le_bytes());
        img_bytes.extend_from_slice(&bi_width.to_le_bytes());
        img_bytes.extend_from_slice(&bi_height.to_le_bytes());
        img_bytes.extend_from_slice(&bi_planes.to_le_bytes());
        img_bytes.extend_from_slice(&bi_bit_count.to_le_bytes());
        img_bytes.extend_from_slice(&bi_compression.to_le_bytes());
        img_bytes.extend_from_slice(&bi_size_image.to_le_bytes());
        img_bytes.extend_from_slice(&0i32.to_le_bytes());
        img_bytes.extend_from_slice(&0i32.to_le_bytes());
        img_bytes.extend_from_slice(&0u32.to_le_bytes());
        img_bytes.extend_from_slice(&0u32.to_le_bytes());

        let cx = size as f64 / 2.0;
        let cy = size as f64 / 2.0;
        let r_out = size as f64 * 0.38;
        let r_in = size as f64 * 0.19;
        let corner_radius = size as f64 * 0.19;

        let samples = 4;
        let step = 1.0 / samples as f64;

        for y in 0..size {
            let visual_y = size - 1 - y;
            let t = visual_y as f64 / size as f64;
            let r_col = (10.0 * (1.0 - t) + 0.0 * t).round() as u8;
            let g_col = (132.0 * (1.0 - t) + 102.0 * t).round() as u8;
            let b_col = (255.0 * (1.0 - t) + 230.0 * t).round() as u8;

            for x in 0..size {
                let mut hits_o = 0;
                let mut hits_card = 0;

                for sy in 0..samples {
                    let py = visual_y as f64 + (sy as f64 + 0.5) * step;
                    let dy = py - cy;
                    for sx in 0..samples {
                        let px = x as f64 + (sx as f64 + 0.5) * step;
                        let dx = px - cx;

                        let qx = dx.abs() - (size as f64 / 2.0 - corner_radius);
                        let qy = dy.abs() - (size as f64 / 2.0 - corner_radius);
                        let dist_card = qx.max(qy).min(0.0) + qx.max(0.0).hypot(qy.max(0.0)) - corner_radius;
                        if dist_card <= 0.0 {
                            hits_card += 1;
                        }

                        let dist_center = dx.hypot(dy);
                        if dist_center <= r_out && dist_center >= r_in {
                            hits_o += 1;
                        }
                    }
                }

                if hits_card > 0 {
                    let card_alpha = hits_card as f64 / (samples * samples) as f64;
                    let o_coverage = hits_o as f64 / (samples * samples) as f64;

                    let r_pix = (255.0 * (1.0 - o_coverage) + (r_col as f64) * o_coverage).round() as u8;
                    let g_pix = (255.0 * (1.0 - o_coverage) + (g_col as f64) * o_coverage).round() as u8;
                    let b_pix = (255.0 * (1.0 - o_coverage) + (b_col as f64) * o_coverage).round() as u8;
                    let a_pix = (card_alpha * 255.0).round() as u8;

                    img_bytes.push(b_pix);
                    img_bytes.push(g_pix);
                    img_bytes.push(r_pix);
                    img_bytes.push(a_pix);
                } else {
                    img_bytes.push(0);
                    img_bytes.push(0);
                    img_bytes.push(0);
                    img_bytes.push(0);
                }
            }
        }

        let row_mask_bytes = ((size + 31) / 32) * 4;
        let and_mask = vec![0u8; (row_mask_bytes * size) as usize];
        img_bytes.extend_from_slice(&and_mask);

        images_data.push(img_bytes);
    }

    let mut ico = Vec::new();
    ico.extend_from_slice(&0u16.to_le_bytes());
    ico.extend_from_slice(&1u16.to_le_bytes());
    ico.extend_from_slice(&num_images.to_le_bytes());

    let mut current_offset = 6 + (num_images as usize) * 16;
    for (i, &size) in sizes.iter().enumerate() {
        let data_len = images_data[i].len() as u32;
        let w_byte = if size >= 256 { 0u8 } else { size as u8 };
        let h_byte = if size >= 256 { 0u8 } else { size as u8 };

        ico.push(w_byte);
        ico.push(h_byte);
        ico.push(0);
        ico.push(0);
        ico.extend_from_slice(&1u16.to_le_bytes());
        ico.extend_from_slice(&32u16.to_le_bytes());
        ico.extend_from_slice(&data_len.to_le_bytes());
        ico.extend_from_slice(&(current_offset as u32).to_le_bytes());

        current_offset += data_len as usize;
    }

    for img in images_data {
        ico.extend_from_slice(&img);
    }

    let _ = fs::write(path, ico);
}

pub fn ensure_app_icons() {
    let candidate_dirs = [
        get_portable_root().join("src-tauri").join("icons"),
        get_portable_root().join("icons"),
        PathBuf::from("src-tauri/icons"),
        PathBuf::from("icons"),
    ];

    for dir in &candidate_dirs {
        if dir.exists() {
            let _ = fs::write(dir.join("32x32.png"), create_png(32, 32, &render_thick_o_pixels(32)));
            let _ = fs::write(dir.join("128x128.png"), create_png(128, 128, &render_thick_o_pixels(128)));
            let _ = fs::write(dir.join("128x128@2x.png"), create_png(256, 256, &render_thick_o_pixels(256)));
            let _ = fs::write(dir.join("icon.png"), create_png(512, 512, &render_thick_o_pixels(512)));
            generate_thick_o_ico(&dir.join("icon.ico"));
        }
    }
}

pub fn ensure_default_styles(styles_dir: &std::path::Path) {
    // 1. Swiss Knife
    let swiss = styles_dir.join("Swiss Knife.ulss");
    if !swiss.exists() {
        let _ = fs::write(&swiss, include_str!("../../../reference_samples/sample_style.ulss"));
    }

    // 2. Novel (Manuscript)
    let novel = styles_dir.join("Novel (Manuscript).ulss");
    if !novel.exists() {
        let content = r#"// Novel (Manuscript) Standard Submission (.ulss)
$font-body = "Courier New"
$font-title = "Courier New"

document-settings {
    page-size: "Letter"
    margin-top: 1in
    margin-bottom: 1in
    margin-left: 1in
    margin-right: 1in
    two-sided: no
}

defaults {
    font-family: $font-body
    font-size: 12pt
    line-height: 24pt
    text-alignment: left
}

heading-1 {
    font-family: $font-title
    font-size: 14pt
    font-weight: bold
    text-alignment: center
    page-break: before
    margin-top: 2in
    margin-bottom: 1in
}

paragraph {
    margin-top: 0
    margin-bottom: 0
    first-line-indent: 0
}

paragraph + paragraph {
    first-line-indent: 0.5in
}

area-header {
    font-family: $font-body
    font-size: 10pt
    text-alignment: right
    content: "AUTHOR / TITLE / {page-number}"
}
"#;
        let _ = fs::write(&novel, content);
    }

    // 3. Academic Paper
    let academic = styles_dir.join("Academic Paper.ulss");
    if !academic.exists() {
        let content = r#"// Academic Paper Style (.ulss)
$font-serif = "Times New Roman"
$color-dark = #111111

document-settings {
    page-size: "A4"
    margin-top: 25mm
    margin-bottom: 25mm
    margin-left: 25mm
    margin-right: 25mm
    footnote-enumeration: continuous
    footnote-placement: end-of-page
    footnote-style: decimal
}

defaults {
    font-family: $font-serif
    font-size: 10.5pt
    line-height: 15pt
    text-alignment: justified
    hyphenation: yes
}

heading-1 {
    font-family: $font-serif
    font-size: 16pt
    font-weight: bold
    margin-top: 20pt
    margin-bottom: 10pt
    page-break: before
}

heading-2 {
    font-family: $font-serif
    font-size: 13pt
    font-weight: bold
    margin-top: 14pt
    margin-bottom: 6pt
}

block-quote {
    font-size: 9.5pt
    line-height: 14pt
    margin-left: 20pt
    margin-right: 20pt
    font-slant: italic
}

inline-footnote :anchor {
    font-size: 8pt
    baseline-shift: superscript
}
"#;
        let _ = fs::write(&academic, content);
    }

    // 4. Business Report
    let business = styles_dir.join("Business Report.ulss");
    if !business.exists() {
        let content = r#"// Business Report Modern (.ulss)
$font-sans = "Segoe UI"
$color-corp = #0067c0
$color-text = #1f2937

document-settings {
    page-size: "A4"
    margin-top: 22mm
    margin-bottom: 22mm
    margin-left: 20mm
    margin-right: 20mm
}

defaults {
    font-family: $font-sans
    font-size: 10pt
    line-height: 15pt
    font-color: $color-text
    text-alignment: left
}

heading-1 {
    font-family: $font-sans
    font-size: 20pt
    font-weight: bold
    font-color: $color-corp
    margin-top: 24pt
    margin-bottom: 12pt
    border-bottom-width: 1.5pt
    border-bottom-color: $color-corp
}

heading-2 {
    font-family: $font-sans
    font-size: 14pt
    font-weight: semibold
    font-color: $color-corp
    margin-top: 16pt
    margin-bottom: 8pt
}

table {
    border-width: 0.75pt
    border-color: #d1d5db
    cell-padding: 6pt
}

table-cell :header {
    background-color: #f3f4f6
    font-weight: bold
}
"#;
        let _ = fs::write(&business, content);
    }

    // 5. Two-Column Magazine
    let magazine = styles_dir.join("Two-Column Magazine.ulss");
    if !magazine.exists() {
        let content = r#"// Two-Column Magazine Layout (.ulss)
$font-body = "Charter"
$font-title = "Avenir Next"
$grid-unit = 14pt

document-settings {
    page-size: "A4"
    margin-top: 20mm
    margin-bottom: 20mm
    margin-left: 18mm
    margin-right: 18mm
    column-count: 2
    column-spacing-width: 6mm
    baseline-grid: $grid-unit
}

defaults {
    font-family: $font-body
    font-size: 9.5pt
    line-height: $grid-unit
    text-alignment: justified
    hyphenation: yes
}

heading-1 {
    font-family: $font-title
    font-size: 28pt
    line-height: 32pt
    font-weight: bold
    margin-top: 18pt
    margin-bottom: 14pt
    column-span: all
}

heading-2 {
    font-family: $font-title
    font-size: 13pt
    font-weight: bold
    margin-top: 12pt
    margin-bottom: 4pt
}

paragraph + paragraph {
    first-line-indent: 12pt
}
"#;
        let _ = fs::write(&magazine, content);
    }

    // 6. Minimalist Essay
    let essay = styles_dir.join("Minimalist Essay.ulss");
    if !essay.exists() {
        let content = r#"// Minimalist Essay (.ulss)
$font-essay = "Georgia"

document-settings {
    page-size: "A4"
    margin-top: 32mm
    margin-bottom: 32mm
    margin-left: 36mm
    margin-right: 36mm
}

defaults {
    font-family: $font-essay
    font-size: 11pt
    line-height: 18pt
    font-color: #27272b
    text-alignment: left
}

heading-1 {
    font-family: $font-essay
    font-size: 18pt
    font-weight: normal
    margin-top: 36pt
    margin-bottom: 18pt
}

paragraph {
    margin-bottom: 12pt
}
"#;
        let _ = fs::write(&essay, content);
    }

    // 7. Technical Docs
    let tech = styles_dir.join("Technical Docs.ulss");
    if !tech.exists() {
        let content = r#"// Technical Documentation Style (.ulss)
$font-tech = "Segoe UI"
$font-mono = "Cascadia Code"

document-settings {
    page-size: "A4"
    margin-top: 20mm
    margin-bottom: 20mm
    margin-left: 20mm
    margin-right: 20mm
}

defaults {
    font-family: $font-tech
    font-size: 10pt
    line-height: 15pt
    color: #1f2937
}

heading-1 {
    font-family: $font-tech
    font-size: 18pt
    font-weight: bold
    border-bottom-width: 1pt
    border-bottom-color: #e5e7eb
    padding-bottom: 4pt
    margin-top: 20pt
    margin-bottom: 10pt
}

block-code {
    font-family: $font-mono
    font-size: 9pt
    background-color: #f3f4f6
    border-width: 1pt
    border-color: #e5e7eb
    border-radius: 4pt
    padding: 8pt
}

inline-code {
    font-family: $font-mono
    font-size: 9pt
    background-color: #f3f4f6
    border-radius: 2pt
    padding-left: 2pt
    padding-right: 2pt
}
"#;
        let _ = fs::write(&tech, content);
    }

    // 8. Revision (shows ++, %%, {}, ||)
    let revision = styles_dir.join("Revision.ulss");
    if !revision.exists() {
        let content = r#"// Editorial Revision Style (.ulss)
// Explicitly displays inline additions (++), comments (%%), annotations ({}), and deleted text (||)
$font-rev = "Charter"

defaults {
    font-family: $font-rev
    font-size: 10.5pt
    line-height: 16pt
}

inline-delete {
    strikethrough: yes
    strikethrough-color: #d70015
    font-color: #6e6e73
}

inline-mark {
    background-color: #fff3a8
    font-color: #1d1d1f
}

inline-annotation {
    background-color: #e8f2ff
    font-color: #004085
}

block-comment {
    background-color: #fff3cd
    font-color: #856404
    border-left-width: 3pt
    border-left-color: #ffc107
    padding: 6pt
}
"#;
        let _ = fs::write(&revision, content);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_portable_paths_initialization() {
        initialize_portable_environment();
        assert!(get_data_dir().exists());
        assert!(get_webview_profile_dir().exists());
        assert!(get_themes_dir().exists());
        assert!(get_styles_dir().exists());
        assert!(get_backups_dir().exists());
        assert!(get_config_path().exists());
        assert!(get_db_path().exists());
    }
}
