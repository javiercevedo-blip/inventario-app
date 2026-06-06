/**
 * GOOGLE APPS SCRIPT FOR REACT INVENTORY APP (Soporte para 7 Columnas)
 * 
 * Instrucciones:
 * 1. En tu Google Sheet, ve a: Extensiones -> Apps Script.
 * 2. Borra cualquier código existente y pega este archivo.
 * 3. Haz clic en "Implementar" (Deploy) -> "Nueva implementación" (New deployment).
 * 4. Selecciona Tipo: "Aplicación web" (Web app).
 * 5. Configura:
 *    - Ejecutar como: "Yo" (Tu cuenta de Gmail).
 *    - Quién tiene acceso: "Cualquiera" (Anyone).
 * 6. Haz clic en "Implementar" y autoriza los permisos requeridos.
 * 7. Copia la "URL de la aplicación web" y pégala en la configuración de la App de Inventario React.
 */

const SHEET_NAME = 'INVENTARIO';

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Initialize headers matching your original Sheet
    sheet.appendRow(['SKU', 'DESCRIPCION', 'CANTIDAD', 'FALTANTE', 'MODELOS', 'IMAGEN', 'UBICADO EN']);
  }
  return sheet;
}

// Helper to return JSON responses with proper CORS headers
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Handle GET requests (Read & Ping)
function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'ping') {
    return ContentService.createTextOutput('pong');
  }
  
  if (action === 'read') {
    try {
      const sheet = getOrCreateSheet();
      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return jsonResponse([]);
      }
      
      const headers = data[0].map(h => String(h).trim().toUpperCase());
      
      const skuIdx = headers.indexOf('SKU');
      const descIdx = headers.indexOf('DESCRIPCION');
      const cantIdx = headers.indexOf('CANTIDAD');
      
      // Support 'FALTANTE' or 'FALTANTES'
      let faltIdx = headers.indexOf('FALTANTE');
      if (faltIdx === -1) faltIdx = headers.indexOf('FALTANTES');
      
      const modIdx = headers.indexOf('MODELOS');
      const imgIdx = headers.indexOf('IMAGEN');
      
      // Support 'UBICADO EN' or 'UBICACION'
      let ubiIdx = headers.indexOf('UBICADO EN');
      if (ubiIdx === -1) ubiIdx = headers.indexOf('UBICACION');
      
      const result = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[skuIdx]) continue; // Skip empty rows
        
        result.push({
          sku: row[skuIdx] ? String(row[skuIdx]).trim() : '',
          descripcion: descIdx !== -1 && row[descIdx] ? String(row[descIdx]).trim() : '',
          cantidad: cantIdx !== -1 && row[cantIdx] !== '' ? Number(row[cantIdx]) : 0,
          faltantes: faltIdx !== -1 && row[faltIdx] !== '' ? Number(row[faltIdx]) : 0,
          modelos: modIdx !== -1 && row[modIdx] ? String(row[modIdx]).trim() : '',
          imagen: imgIdx !== -1 && row[imgIdx] ? String(row[imgIdx]).trim() : '',
          ubicacion: ubiIdx !== -1 && row[ubiIdx] ? String(row[ubiIdx]).trim() : ''
        });
      }
      
      return jsonResponse(result);
    } catch (err) {
      return jsonResponse({ status: 'error', message: err.toString() });
    }
  }
  
  return jsonResponse({ status: 'error', message: 'Acción GET no válida' });
}

// Handle POST requests (Add, Update, Delete)
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    const item = postData.item;
    
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(h => String(h).trim().toUpperCase());
    
    const skuIdx = headers.indexOf('SKU');
    const descIdx = headers.indexOf('DESCRIPCION');
    const cantIdx = headers.indexOf('CANTIDAD');
    
    let faltIdx = headers.indexOf('FALTANTE');
    if (faltIdx === -1) faltIdx = headers.indexOf('FALTANTES');
    
    const modIdx = headers.indexOf('MODELOS');
    const imgIdx = headers.indexOf('IMAGEN');
    
    let ubiIdx = headers.indexOf('UBICADO EN');
    if (ubiIdx === -1) ubiIdx = headers.indexOf('UBICACION');
    
    if (skuIdx === -1) {
      return jsonResponse({ status: 'error', message: 'No se encontró la columna SKU en la hoja.' });
    }

    // Find row index by SKU (1-indexed for sheets)
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][skuIdx] && String(data[i][skuIdx]).trim().toLowerCase() === String(item.sku).trim().toLowerCase()) {
        rowIndex = i + 1;
        break;
      }
    }

    if (action === 'add') {
      if (rowIndex !== -1) {
        return jsonResponse({ status: 'error', message: 'El SKU ya existe en la hoja.' });
      }
      
      // Create new row
      const newRow = new Array(headers.length).fill('');
      newRow[skuIdx] = item.sku;
      if (descIdx !== -1) newRow[descIdx] = item.descripcion || '';
      if (cantIdx !== -1) newRow[cantIdx] = item.cantidad || 0;
      if (faltIdx !== -1) newRow[faltIdx] = item.faltantes || 0;
      if (modIdx !== -1) newRow[modIdx] = item.modelos || '';
      if (imgIdx !== -1) newRow[imgIdx] = item.imagen || '';
      if (ubiIdx !== -1) newRow[ubiIdx] = item.ubicacion || '';
      
      sheet.appendRow(newRow);
      return jsonResponse({ status: 'success' });
    }
    
    if (action === 'update') {
      if (rowIndex === -1) {
        return jsonResponse({ status: 'error', message: 'No se encontró el SKU para actualizar.' });
      }
      
      // Update cell values
      if (descIdx !== -1) sheet.getRange(rowIndex, descIdx + 1).setValue(item.descripcion || '');
      if (cantIdx !== -1) sheet.getRange(rowIndex, cantIdx + 1).setValue(item.cantidad || 0);
      if (faltIdx !== -1) sheet.getRange(rowIndex, faltIdx + 1).setValue(item.faltantes || 0);
      if (modIdx !== -1) sheet.getRange(rowIndex, modIdx + 1).setValue(item.modelos || '');
      if (imgIdx !== -1) sheet.getRange(rowIndex, imgIdx + 1).setValue(item.imagen || '');
      if (ubiIdx !== -1) sheet.getRange(rowIndex, ubiIdx + 1).setValue(item.ubicacion || '');
      
      return jsonResponse({ status: 'success' });
    }
    
    if (action === 'delete') {
      if (rowIndex === -1) {
        return jsonResponse({ status: 'error', message: 'No se encontró el SKU para eliminar.' });
      }
      
      sheet.deleteRow(rowIndex);
      return jsonResponse({ status: 'success' });
    }
    
    return jsonResponse({ status: 'error', message: 'Acción POST no válida.' });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}
