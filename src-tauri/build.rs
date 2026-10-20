use std::fs;
use std::path::Path;

fn generate_thick_o_ico(path: &Path) {
    let sizes: [u32; 6] = [16, 32, 48, 64, 128, 256];
    let num_images = sizes.len() as u16;

    let mut images_data: Vec<Vec<u8>> = Vec::new();

    for &size in &sizes {
        let mut img_bytes = Vec::new();
        // 1. BITMAPINFOHEADER (40 bytes)
        let bi_size: u32 = 40;
        let bi_width: i32 = size as i32;
        let bi_height: i32 = (size * 2) as i32; // height * 2 for ICO
        let bi_planes: u16 = 1;
        let bi_bit_count: u16 = 32;
        let bi_compression: u32 = 0; // BI_RGB
        let bi_size_image: u32 = size * size * 4;
        let bi_x_pels: i32 = 0;
        let bi_y_pels: i32 = 0;
        let bi_clr_used: u32 = 0;
        let bi_clr_important: u32 = 0;

        img_bytes.extend_from_slice(&bi_size.to_le_bytes());
        img_bytes.extend_from_slice(&bi_width.to_le_bytes());
        img_bytes.extend_from_slice(&bi_height.to_le_bytes());
        img_bytes.extend_from_slice(&bi_planes.to_le_bytes());
        img_bytes.extend_from_slice(&bi_bit_count.to_le_bytes());
        img_bytes.extend_from_slice(&bi_compression.to_le_bytes());
        img_bytes.extend_from_slice(&bi_size_image.to_le_bytes());
        img_bytes.extend_from_slice(&bi_x_pels.to_le_bytes());
        img_bytes.extend_from_slice(&bi_y_pels.to_le_bytes());
        img_bytes.extend_from_slice(&bi_clr_used.to_le_bytes());
        img_bytes.extend_from_slice(&bi_clr_important.to_le_bytes());

        // 2. Pixel data (Bottom-up: y from 0 to size-1 corresponds to bottom to top)
        let cx = size as f64 / 2.0;
        let cy = size as f64 / 2.0;
        let r_out = size as f64 * 0.38;
        let r_in = size as f64 * 0.19;
        let corner_radius = size as f64 * 0.19;

        let samples = 4;
        let step = 1.0 / samples as f64;

        for y in 0..size {
            // In BMP, row 0 is bottom, row size-1 is top.
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

                        // Check rounded card (white background)
                        let qx = dx.abs() - (size as f64 / 2.0 - corner_radius);
                        let qy = dy.abs() - (size as f64 / 2.0 - corner_radius);
                        let dist_card = qx.max(qy).min(0.0) + qx.max(0.0).hypot(qy.max(0.0)) - corner_radius;
                        if dist_card <= 0.0 {
                            hits_card += 1;
                        }

                        // Check circle ring "O"
                        let dist_center = dx.hypot(dy);
                        if dist_center <= r_out && dist_center >= r_in {
                            hits_o += 1;
                        }
                    }
                }

                if hits_card > 0 {
                    let card_alpha = hits_card as f64 / (samples * samples) as f64;
                    let o_coverage = hits_o as f64 / (samples * samples) as f64;

                    // Blend white background (#ffffff) with blue "O"
                    let r_pix = (255.0 * (1.0 - o_coverage) + (r_col as f64) * o_coverage).round() as u8;
                    let g_pix = (255.0 * (1.0 - o_coverage) + (g_col as f64) * o_coverage).round() as u8;
                    let b_pix = (255.0 * (1.0 - o_coverage) + (b_col as f64) * o_coverage).round() as u8;
                    let a_pix = (card_alpha * 255.0).round() as u8;

                    // BGRA format
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

        // 3. AND mask: 1 bit per pixel, rows padded to 32 bits (4 bytes)
        let row_mask_bytes = ((size + 31) / 32) * 4;
        let and_mask = vec![0u8; (row_mask_bytes * size) as usize];
        img_bytes.extend_from_slice(&and_mask);

        images_data.push(img_bytes);
    }

    // Assemble full ICO
    let mut ico = Vec::new();
    ico.extend_from_slice(&0u16.to_le_bytes()); // idReserved
    ico.extend_from_slice(&1u16.to_le_bytes()); // idType = 1 (icon)
    ico.extend_from_slice(&num_images.to_le_bytes()); // idCount

    let mut current_offset = 6 + (num_images as usize) * 16;
    for (i, &size) in sizes.iter().enumerate() {
        let data_len = images_data[i].len() as u32;
        let w_byte = if size >= 256 { 0u8 } else { size as u8 };
        let h_byte = if size >= 256 { 0u8 } else { size as u8 };

        ico.push(w_byte); // bWidth
        ico.push(h_byte); // bHeight
        ico.push(0); // bColorCount
        ico.push(0); // bReserved
        ico.extend_from_slice(&1u16.to_le_bytes()); // wPlanes
        ico.extend_from_slice(&32u16.to_le_bytes()); // wBitCount
        ico.extend_from_slice(&data_len.to_le_bytes()); // dwBytesInRes
        ico.extend_from_slice(&(current_offset as u32).to_le_bytes()); // dwImageOffset

        current_offset += data_len as usize;
    }

    for img in images_data {
        ico.extend_from_slice(&img);
    }

    let _ = fs::write(path, ico);
}

fn main() {
    let icons_dir = Path::new("icons");
    if !icons_dir.exists() {
        let _ = fs::create_dir_all(icons_dir);
    }
    generate_thick_o_ico(&icons_dir.join("icon.ico"));

    tauri_build::build()
}
