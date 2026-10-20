import sys
import os
import json
from pathlib import Path

# Setup paths to skill components
SKILL_ROOT = Path(r"C:\Users\IsaNet\.gemini\config\skills\technical-book-pdf")
sys.path.insert(0, str(SKILL_ROOT / "scripts"))

from components import EditorialComponents as EC
from generate_diagram import TechnicalDiagrams as TD

def build_full_manual_json() -> dict:
    book = {
        "title": "ODISEA PARA WINDOWS 11",
        "subtitle": "Manual de Usuario, Arquitectura de Software y Guía de Referencia Técnica Integral de la Suite de Escritura Inmersiva",
        "author": "Equipo de Arquitectura Odisea & Antigravity IDE",
        "keywords": "Odisea, Windows 11, Markdown XL, ULSS, Ulysses, Escritura, Portabilidad, Rust, Tauri, SQLite",
        "cover": {
            "kicker": "MANUAL OFICIAL DE INSTRUCCIONES · SERIE ARQUITECTURA DE SOFTWARE",
            "stats": [
                {"number": "8", "label": "CAPÍTULOS TÉCNICOS"},
                {"number": "28", "label": "ETIQUETAS MARKDOWN XL"},
                {"number": "11", "label": "ESTILOS EDITORIALES ULSS"},
                {"number": "100%", "label": "PORTABLE & WINDOWS 11"}
            ],
            "badge": "DISTRIBUCIÓN OFICIAL · VERSIÓN 1.0.0 RELEASE",
            "footer_note": "Odisea Desktop Suite · Edición Técnica Octubre 2026"
        },
        "frontmatter": {
            "tag": "EDICIÓN TÉCNICA OFICIAL",
            "title": "Odisea para Windows 11: Manual Integral del Entorno de Prosa Pura",
            "paragraphs": [
                "Este manual constituye la documentación oficial de referencia y guía exhaustiva de usuario para Odisea, la suite de redacción inmersiva diseñada desde sus cimientos para Windows 11, combinando la legendaria experiencia de Ulysses para macOS con la robustez y portabilidad del ecosistema de Microsoft.",
                "El documento aborda desde los fundamentos ergonómicos de la interfaz de 3+1 paneles y el teclado sin ratón, hasta las especificaciones formales de la gramática Markdown XL (sus 28 etiquetas semánticas), los widgets interactivos de alta densidad, el compilador de hojas de estilo ULSS y los conectores de publicación web en la nube.",
                "Diseñado para escritores profesionales, novelistas, periodistas, investigadores académicos y creadores de contenido técnico que demandan un entorno sin distracciones, con preservación absoluta de la soberanía de sus datos y cero dependencias de instalación o registro en el sistema operativo."
            ],
            "legal_notice": "Odisea es una marca de software libre y portable. Ulysses® es una marca registrada de Ulysses GmbH & Co. KG. Se cita en este documento con fines pedagógicos y de compatibilidad técnica. Windows 11® y Fluent Design® son marcas de Microsoft Corporation.",
            "disclaimer": "Prohibida la alteración no autorizada de esta obra técnica. Todas las marcas citadas pertenecen a sus respectivos titulares."
        },
        "toc": {
            "blocks": [
                {
                    "title": "BLOQUE I — FUNDAMENTOS Y ERGONOMÍA DE ESCRITURA",
                    "chapters": [
                        {"title": "Capítulo 1 — Filosofía, Ergonomía y Arquitectura del Sistema", "page": "6"},
                        {"title": "Capítulo 2 — La Interfaz Fluida de 3+1 Paneles y Navegación sin Ratón", "page": "12"}
                    ]
                },
                {
                    "title": "BLOQUE II — EL MOTOR DE EDICIÓN Y MARKDOWN XL",
                    "chapters": [
                        {"title": "Capítulo 3 — La Sintaxis Markdown XL: Las 28 Etiquetas Semánticas", "page": "18"},
                        {"title": "Capítulo 4 — Widgets Interactivos: Tablas, Fórmulas KaTeX y Medios", "page": "24"}
                    ]
                },
                {
                    "title": "BLOQUE III — ORGANIZACIÓN Y PRODUCTIVIDAD",
                    "chapters": [
                        {"title": "Capítulo 5 — Gestión Documental, Hojas Pegadas y Carpetas Externas", "page": "30"},
                        {"title": "Capítulo 6 — Dashboard de Escritura, Métricas y Objetivos (Goals)", "page": "36"}
                    ]
                },
                {
                    "title": "BLOQUE IV — MAQUETACIÓN EDITORIAL Y PUBLICACIÓN",
                    "chapters": [
                        {"title": "Capítulo 7 — Motor de Estilos ULSS y Exportación Multi-Formato", "page": "42"},
                        {"title": "Capítulo 8 — Conectores de Publicación Web y Mantenimiento Portable", "page": "48"}
                    ]
                }
            ]
        },
        "chapters": []
    }
    return book

if __name__ == "__main__":
    b = build_full_manual_json()
    print(f"Base manual initialized with title: {b['title']}")
