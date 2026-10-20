import sys
import os
import json
import shutil
from pathlib import Path

# Paths
WORKSPACE_DIR = Path(r"M:\01 DOCUMENTOS\ONEDRIVE ISDEFE\OneDrive - ISDEFE\02 DOCUMENTOS PERSONALES\63 PROYECTOS IA\17_ODISEA")
TEMP_DIR = WORKSPACE_DIR / "04.temporales.capitulos"
FINAL_DIR = WORKSPACE_DIR / "05.capitulos.v.final"
SKILL_ROOT = Path(r"C:\Users\IsaNet\.gemini\config\skills\technical-book-pdf")

sys.path.insert(0, str(SKILL_ROOT / "scripts"))
sys.path.insert(0, str(TEMP_DIR))

from book_compiler import BookCompiler
from verify_pdf import verify_pdf
from build_manual_dataset import build_full_manual_json
from chapters_block1 import get_chapter_1, get_chapter_2
from chapters_block2 import get_chapter_3, get_chapter_4
from chapters_block3 import get_chapter_5, get_chapter_6
from chapters_block4 import get_chapter_7, get_chapter_8

def main():
    print("============================================================")
    print("ASSEMBLING FULL TECHNICAL INSTRUCTION MANUAL FOR ODISEA")
    print("============================================================")

    book = build_full_manual_json()

    # Append all 8 chapters
    book["chapters"].append(get_chapter_1())
    book["chapters"].append(get_chapter_2())
    book["chapters"].append(get_chapter_3())
    book["chapters"].append(get_chapter_4())
    book["chapters"].append(get_chapter_5())
    book["chapters"].append(get_chapter_6())
    book["chapters"].append(get_chapter_7())
    book["chapters"].append(get_chapter_8())

    # Pre-calculate TOC page numbers for accuracy in the printed table of contents
    # Cover = 1, Frontmatter = 2, TOC = 3
    current_page = 4
    ch_idx = 0
    for block in book["toc"]["blocks"]:
        for item in block["chapters"]:
            item["page"] = str(current_page)
            if ch_idx < len(book["chapters"]):
                ch = book["chapters"][ch_idx]
                ch_pages = 1 + len(ch.get("pages", []))
                if ch.get("summary"):
                    ch_pages += 1
                if ch.get("questionnaire"):
                    ch_pages += 1
                if ch.get("solutions"):
                    ch_pages += 1
                current_page += ch_pages
            else:
                current_page += 8
            ch_idx += 1

    json_path = TEMP_DIR / "manual_odisea_completo.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(book, f, indent=2, ensure_ascii=False)
    print(f"[OK] Full book dataset saved to: {json_path}")
    print(f"[INFO] Chapters compiled: {len(book['chapters'])}")

    # Compile with BookCompiler
    FINAL_DIR.mkdir(parents=True, exist_ok=True)
    out_pdf = FINAL_DIR / "Manual_Usuario_Odisea_Win11.pdf"

    print(f"\n[COMPILING] Rendering editorial PDF with Headless Chromium...")
    compiler = BookCompiler(skill_root=SKILL_ROOT)
    result_path = compiler.compile(book, str(out_pdf))
    print(f"[OK] PDF compiled successfully at: {result_path}")

    # Copy to target distribution locations
    targets = [
        WORKSPACE_DIR / "Manual_de_Instrucciones_Odisea.pdf",
        Path(r"C:\Proyectos\Odisea\dist_portable\Odisea_Win11_Portable\Manual_de_Instrucciones_Odisea.pdf"),
        WORKSPACE_DIR / "dist_portable" / "Odisea_Win11_Portable" / "Manual_de_Instrucciones_Odisea.pdf"
    ]

    for t in targets:
        t.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(out_pdf, t)
        print(f"[DISTRIBUTION] Copied manual to: {t}")

    # Verify and audit compiled PDF
    print("\n------------------------------------------------------------")
    print("EXECUTING QUALITY AUDIT ON COMPILED MANUAL")
    print("------------------------------------------------------------")
    audit_ok = verify_pdf(str(out_pdf))
    if audit_ok:
        print("[SUCCESS] PDF passed all quality and editorial audits!")
    else:
        print("[WARNING] Audit reported warnings or notices.")

if __name__ == "__main__":
    main()
