---
trigger: always_on
---

# Reglas Operativas REA + Odisea en Antigravity IDE
1. **Evidencia Antes de Implementación (Principio REA)**: Antes de implementar cualquier parser de formato de Ulysses (`.ulss`, `.ultheme`, `.ulyz`, Markdown XL), utiliza el servidor MCP `rea-reverse-engineer` sobre el directorio `/reference_samples/` para extraer la estructura exacta, tokens y casos límite, guardando el informe JSON en `.rea_evidence/`.
2. **Mandato de Portabilidad Windows 11**: Queda terminantemente prohibido usar rutas absolutas o escribir en `%APPDATA%` o en el Registro de Windows. Toda persistencia debe residir en `./odisea_data/` relativo al binario `Odisea.exe`.
3. **Mandato Micro-UI**: Ningún icono de interfaz puede superar los `16px` y ninguna etiqueta visual (`badge`/`keyword`) puede superar los `18px` de alto.
4. **Cero Código Incompleto**: Prohibido dejar bloques `// TODO`, `unimplemented!()` o mocks en producción.