# Control de Inventario Premium (React + Vite)

Esta es una aplicación web moderna, rápida y responsiva para el control de inventario físico, optimizada para su uso en dispositivos móviles y computadoras.

## Características

*   **Diseño Premium:** Interfaz adaptable con variables CSS, transiciones suaves y soporte para Modo Oscuro.
*   **Base de Datos Híbrida:** 
    *   **Modo Local:** Almacenamiento local automático offline en el navegador (`localStorage`) precargado con 291 artículos.
    *   **Sincronización:** Integración con Google Sheets para leer y escribir datos en tiempo real.
*   **Escáner Integrado:** Lector de códigos de barras y QR utilizando la cámara del dispositivo móvil.
*   **Carga de Imágenes:** Permite capturar fotos desde el celular y guardarlas localmente como cadenas de texto Base64.
*   **Filtros & Búsquedas:** Buscador por SKU, descripción, ubicación y modelos compatibles de drones.

---

## Estructura de Archivos Principal

*   `src/App.jsx` - Controlador central y enrutador.
*   `src/index.css` - Sistema de diseño y estilos premium.
*   `src/components/` - Dashboard, lista de artículos, formulario y cámara escáner.
*   `src/services/db.js` - Control del almacenamiento local e importaciones CSV.
*   `src/services/sheets.js` - Servicio de red para sincronizar con Google Sheets.
*   `google-apps-script/Code.gs` - Código backend para pegar en tu Apps Script.

---

## Comandos Útiles

Navega a la carpeta de tu proyecto y ejecuta en tu terminal:

### Levantar Servidor de Desarrollo
*   **En CMD (Recomendado):**
    ```bash
    npm run dev
    ```
*   **En PowerShell (Evitando restricciones de scripts):**
    ```powershell
    cmd /c npm run dev
    ```

### Compilar para Producción
```bash
npm run build
```

---

## Configuración con Google Sheets

1. Abre tu Google Sheet con una pestaña llamada **INVENTARIO** y las siguientes columnas:
   `SKU, DESCRIPCION, CANTIDAD, FALTANTE, MODELOS, IMAGEN, UBICADO EN`
2. Ve a **Extensiones &rarr; Apps Script**.
3. Pega el contenido de `google-apps-script/Code.gs`.
4. Haz clic en **Implementar &rarr; Nueva implementación** como *Aplicación Web*, ejecutada por *Ti* con acceso para *Cualquiera*.
5. Copia la URL generada y pégala en la pestaña **Ajustes** de esta aplicación.
