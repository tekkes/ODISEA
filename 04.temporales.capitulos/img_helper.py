import base64
from pathlib import Path
import html

SCREENSHOTS_DIR = Path(r"M:\01 DOCUMENTOS\ONEDRIVE ISDEFE\OneDrive - ISDEFE\02 DOCUMENTOS PERSONALES\63 PROYECTOS IA\17_ODISEA\04.temporales.capitulos\screenshots")

_CACHE = {}

def get_screenshot_b64(name: str) -> str:
    if name not in _CACHE:
        p = SCREENSHOTS_DIR / f"{name}.png"
        if not p.exists():
            p = SCREENSHOTS_DIR / name
        if not p.exists():
            raise FileNotFoundError(f"Screenshot not found: {p}")
        with open(p, "rb") as f:
            _CACHE[name] = base64.b64encode(f.read()).decode("utf-8")
    return _CACHE[name]

def screenshot_figure(name: str, caption: str, figure_number: str = "", max_height_mm: int = 105) -> str:
    b64 = get_screenshot_b64(name)
    fig_prefix = f"<strong>Figura {figure_number}.</strong> " if figure_number else ""
    return f"""
    <div class="figure-container" style="margin: 8px 0 12px 0;">
        <div class="figure-box" style="background: #0f172a; padding: 4px; border-radius: 8px; border: 1px solid #334155; text-align: center;">
            <img src="data:image/png;base64,{b64}" 
                 alt="{html.escape(caption)}" 
                 style="max-width: 100%; max-height: {max_height_mm}mm; width: auto; height: auto; border-radius: 6px; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.35);" />
        </div>
        <div class="figure-caption" style="font-size: 8.5pt; color: #475569; text-align: center; margin-top: 5px; line-height: 1.3;">
            {fig_prefix}{html.escape(caption)}
        </div>
    </div>
    """
