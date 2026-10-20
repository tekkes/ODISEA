import os
import sys
import time
import subprocess
import urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright

WORKSPACE_DIR = Path(r"M:\01 DOCUMENTOS\ONEDRIVE ISDEFE\OneDrive - ISDEFE\02 DOCUMENTOS PERSONALES\63 PROYECTOS IA\17_ODISEA")
SCREENSHOTS_DIR = WORKSPACE_DIR / "04.temporales.capitulos" / "screenshots"
SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not os.path.exists(EDGE_PATH):
    EDGE_PATH = r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"

def wait_for_server(url, timeout=30):
    start = time.time()
    while time.time() - start < timeout:
        try:
            with urllib.request.urlopen(url, timeout=1) as resp:
                if resp.status == 200:
                    return True
        except Exception:
            time.sleep(0.5)
    return False

def main():
    print("[1/5] Starting Vite Dev Server...")
    proc = subprocess.Popen(
        ["cmd", "/c", "npm", "run", "dev"],
        cwd=str(WORKSPACE_DIR),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    url = "http://localhost:1420"
    print(f"[2/5] Waiting for {url} to be ready...")
    if not wait_for_server(url, timeout=35):
        proc.terminate()
        print("[ERROR] Vite server failed to respond within timeout.")
        sys.exit(1)

    print("[3/5] Launching Playwright with Microsoft Edge...")
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=EDGE_PATH,
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--font-render-hinting=max",
                "--enable-font-antialiasing",
                "--window-size=1600,1000"
            ]
        )
        context = browser.new_context(
            viewport={"width": 1600, "height": 1000},
            device_scale_factor=2 # Retina / HiDPI for crystal clear screenshots
        )
        page = context.new_page()
        page.on("console", lambda msg: print(f"[CONSOLE {msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: print(f"[PAGE ERROR] {err}"))

        print(f"[4/5] Navigating to {url}...")
        page.goto(url, wait_until="networkidle")
        page.wait_for_timeout(3000)

        root_html = page.inner_html("#root")
        print(f"[DEBUG ROOT HTML length={len(root_html)}]: {root_html[:300]}")

        # 1. Main View (Dark Mode)
        print("  -> Capturing: 01_interfaz_principal_oscura.png")
        page.screenshot(path=str(SCREENSHOTS_DIR / "01_interfaz_principal_oscura.png"))

        # 2. Main View (Light Mode)
        print("  -> Toggling to Light Mode...")
        # Check if there is a theme toggle button or set in localStorage
        page.evaluate("""() => {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
            localStorage.setItem('odisea_theme_mode', 'light');
        }""")
        page.wait_for_timeout(1000)
        print("  -> Capturing: 02_interfaz_principal_clara.png")
        page.screenshot(path=str(SCREENSHOTS_DIR / "02_interfaz_principal_clara.png"))

        # Revert to dark for subsequent screenshots
        page.evaluate("""() => {
            document.documentElement.classList.remove('light');
            document.documentElement.classList.add('dark');
            localStorage.setItem('odisea_theme_mode', 'dark');
        }""")
        page.wait_for_timeout(500)

        # 3. History Modal (Ctrl+H)
        print("  -> Triggering History Modal (Ctrl+H)...")
        page.keyboard.press("Control+h")
        page.wait_for_timeout(1000)
        print("  -> Capturing: 03_modal_historial_navegacion.png")
        page.screenshot(path=str(SCREENSHOTS_DIR / "03_modal_historial_navegacion.png"))
        page.keyboard.press("Escape")
        page.wait_for_timeout(500)

        # 4. Command Palette (Ctrl+P)
        print("  -> Triggering Command Palette (Ctrl+P)...")
        page.keyboard.press("Control+p")
        page.wait_for_timeout(1000)
        print("  -> Capturing: 04_paleta_comandos.png")
        page.screenshot(path=str(SCREENSHOTS_DIR / "04_paleta_comandos.png"))
        page.keyboard.press("Escape")
        page.wait_for_timeout(500)

        # 5. Inspector Panel (Statistics & Goals)
        print("  -> Capturing Inspector Panel...")
        # Try to click on the statistics / goal icon or trigger 4th panel
        inspector_btn = page.query_selector("button[title*='Estadísticas'], button[title*='Objetivos'], button[title*='Dashboard'], button[title*='Inspector']")
        if inspector_btn:
            inspector_btn.click()
            page.wait_for_timeout(1000)
        print("  -> Capturing: 05_panel_inspector_metricas.png")
        page.screenshot(path=str(SCREENSHOTS_DIR / "05_panel_inspector_metricas.png"))

        # 6. Revision Panel
        print("  -> Capturing Revision Assistant...")
        revision_btn = page.query_selector("button[title*='Revisión'], button[title*='Estilo'], button[title*='Ortografía']")
        if revision_btn:
            revision_btn.click()
            page.wait_for_timeout(1000)
        print("  -> Capturing: 06_asistente_revision_estilo.png")
        page.screenshot(path=str(SCREENSHOTS_DIR / "06_asistente_revision_estilo.png"))

        # 7. Export & Publication Preview
        print("  -> Triggering Export / Publish Modal (Ctrl+Shift+E or button)...")
        page.keyboard.press("Control+Shift+e")
        page.wait_for_timeout(1500)
        print("  -> Capturing: 07_modal_exportacion_publicacion.png")
        page.screenshot(path=str(SCREENSHOTS_DIR / "07_modal_exportacion_publicacion.png"))
        page.keyboard.press("Escape")
        page.wait_for_timeout(500)

        # 8. Close-up of Editor with Prosa
        print("  -> Capturing Editor Close-up...")
        editor_el = page.query_selector(".cm-editor, main, .editor-container")
        if editor_el:
            editor_el.screenshot(path=str(SCREENSHOTS_DIR / "08_editor_prosa_markdown_xl.png"))
        else:
            page.screenshot(path=str(SCREENSHOTS_DIR / "08_editor_prosa_markdown_xl.png"))

        browser.close()

    print("[5/5] Shutting down Vite server...")
    proc.terminate()
    try:
        proc.wait(timeout=5)
    except Exception:
        proc.kill()

    print(f"\n[SUCCESS] All screenshots saved in: {SCREENSHOTS_DIR}")
    for f in sorted(SCREENSHOTS_DIR.glob("*.png")):
        print(f"  - {f.name} ({f.stat().st_size:,} bytes)")

if __name__ == "__main__":
    main()
