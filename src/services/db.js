// Local Storage Database Service for React Inventory App
import realData from './realData.json';

const DB_KEY = 'inventario_react_items';
const VERSION_KEY = 'inventario_data_version_real';
const CURRENT_VERSION = '1.0.2'; // Incrementing version to force-reset local storage cache once

export const getItems = () => {
  const storedVersion = localStorage.getItem(VERSION_KEY);
  const items = localStorage.getItem(DB_KEY);
  
  // If no items exist, or the stored version is outdated (e.g. they have mock data cached), force load realData
  if (!items || storedVersion !== CURRENT_VERSION) {
    localStorage.setItem(DB_KEY, JSON.stringify(realData));
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    return realData;
  }
  return JSON.parse(items);
};

export const saveItems = (items) => {
  localStorage.setItem(DB_KEY, JSON.stringify(items));
};

export const addItem = (newItem) => {
  const items = getItems();
  if (items.some(item => item.sku.toLowerCase() === newItem.sku.toLowerCase())) {
    throw new Error(`El SKU "${newItem.sku}" ya existe en el inventario.`);
  }
  const updatedItems = [newItem, ...items];
  saveItems(updatedItems);
  return updatedItems;
};

export const updateItem = (updatedItem) => {
  const items = getItems();
  const index = items.findIndex(item => item.sku === updatedItem.sku);
  if (index === -1) {
    throw new Error(`El artículo con SKU "${updatedItem.sku}" no existe.`);
  }
  items[index] = updatedItem;
  saveItems(items);
  return items;
};

export const deleteItem = (sku) => {
  const items = getItems();
  const updatedItems = items.filter(item => item.sku !== sku);
  saveItems(updatedItems);
  return updatedItems;
};

export const resetToMockData = () => {
  saveItems(realData);
  localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  return realData;
};

// CSV Import Helper (Supporting all 7 sheet columns)
export const importFromCSVText = (csvText) => {
  const lines = csvText.split('\n');
  if (lines.length < 2) throw new Error('El archivo CSV está vacío o es inválido.');

  // Helper to split line correctly handling quotes
  const splitCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  // Detect headers
  const headers = splitCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());
  
  // Find column indices matching Sheet headers
  const skuIdx = headers.indexOf('sku');
  const descIdx = headers.indexOf('descripcion') !== -1 ? headers.indexOf('descripcion') : headers.indexOf('descripción');
  const cantIdx = headers.indexOf('cantidad');
  
  let faltIdx = headers.indexOf('faltante');
  if (faltIdx === -1) faltIdx = headers.indexOf('faltantes');

  const modIdx = headers.indexOf('modelos');
  const imgIdx = headers.indexOf('imagen');
  
  let ubiIdx = headers.indexOf('ubicacion');
  if (ubiIdx === -1) ubiIdx = headers.indexOf('ubicación');
  if (ubiIdx === -1) ubiIdx = headers.indexOf('ubicado en');

  if (skuIdx === -1) {
    throw new Error('El archivo CSV debe contener al menos una columna llamada "sku" o "SKU".');
  }

  const parsedItems = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = splitCSVLine(line).map(v => v.replace(/^"|"$/g, '').trim());
    
    const sku = values[skuIdx] || '';
    if (!sku) continue;

    const descripcion = descIdx !== -1 && values[descIdx] ? values[descIdx] : 'Sin descripción';
    
    let cantidad = 0;
    if (cantIdx !== -1 && values[cantIdx]) {
      const parsedCant = parseInt(values[cantIdx], 10);
      if (!isNaN(parsedCant)) cantidad = parsedCant;
    }

    let faltantes = 0;
    if (faltIdx !== -1 && values[faltIdx]) {
      const parsedFalt = parseInt(values[faltIdx], 10);
      if (!isNaN(parsedFalt)) faltantes = parsedFalt;
    }

    const modelos = modIdx !== -1 && values[modIdx] ? values[modIdx] : '';
    const imagen = imgIdx !== -1 && values[imgIdx] ? values[imgIdx] : '';
    const ubicacion = ubiIdx !== -1 && values[ubiIdx] ? values[ubiIdx] : '';

    parsedItems.push({
      sku,
      descripcion,
      cantidad,
      faltantes,
      modelos,
      imagen,
      ubicacion
    });
  }

  if (parsedItems.length === 0) {
    throw new Error('No se pudieron importar filas válidas desde el archivo CSV.');
  }

  saveItems(parsedItems);
  localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  return parsedItems;
};

// CSV Export Helper (Matching original 7 Sheet headers)
export const exportToCSVText = (items) => {
  const headers = ['SKU', 'DESCRIPCION', 'CANTIDAD', 'FALTANTE', 'MODELOS', 'IMAGEN', 'UBICADO EN'];
  const csvRows = [headers.join(',')];

  items.forEach(item => {
    const row = [
      `"${(item.sku || '').replace(/"/g, '""')}"`,
      `"${(item.descripcion || '').replace(/"/g, '""')}"`,
      item.cantidad || 0,
      item.faltantes || 0,
      `"${(item.modelos || '').replace(/"/g, '""')}"`,
      `"${(item.imagen || '').replace(/"/g, '""')}"`,
      `"${(item.ubicacion || '').replace(/"/g, '""')}"`
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
};
