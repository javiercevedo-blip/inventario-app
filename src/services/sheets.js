// Google Sheets Integration Service via Google Apps Script API

const SCRIPTS_URL_KEY = 'inventario_sheets_url';
const SYNC_ENABLED_KEY = 'inventario_sheets_sync_enabled';

export const getSheetsConfig = () => {
  return {
    url: localStorage.getItem(SCRIPTS_URL_KEY) || '',
    enabled: localStorage.getItem(SYNC_ENABLED_KEY) === 'true'
  };
};

export const saveSheetsConfig = (url, enabled) => {
  localStorage.setItem(SCRIPTS_URL_KEY, url);
  localStorage.setItem(SYNC_ENABLED_KEY, enabled ? 'true' : 'false');
};

// Test connection to the Apps Script endpoint
export const testSheetsConnection = async (url) => {
  if (!url) throw new Error('La URL del Script está vacía.');
  
  try {
    const targetUrl = `${url}?action=ping`;
    const response = await fetch(targetUrl, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }
    
    const text = await response.text();
    return text.includes('pong') || response.ok;
  } catch (error) {
    console.error('Connection test failed:', error);
    throw new Error('No se pudo conectar al Script. Verifica la URL y la configuración de CORS.');
  }
};

// Fetch items from Google Sheets (mapping the 7 sheet columns)
export const fetchItemsFromSheets = async (url) => {
  try {
    const response = await fetch(`${url}?action=read`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`Error al leer datos: ${response.status}`);
    }
    
    const data = await response.json();
    if (Array.isArray(data)) {
      return data.map(item => ({
        sku: String(item.sku || ''),
        descripcion: String(item.descripcion || ''),
        cantidad: Number(item.cantidad || 0),
        // Google Script will output mapped fields
        faltantes: Number(item.faltantes || 0),
        modelos: String(item.modelos || ''),
        imagen: String(item.imagen || ''),
        ubicacion: String(item.ubicacion || '')
      }));
    }
    throw new Error('El formato de datos devuelto no es un array válido.');
  } catch (error) {
    console.error('Fetch sheets items failed:', error);
    throw error;
  }
};

// Perform write action to Google Sheets (add/update/delete)
const writeToSheets = async (url, action, item) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ action, item })
    });
    
    if (!response.ok) {
      throw new Error(`Error al enviar datos: ${response.status}`);
    }
    
    const result = await response.json();
    if (result && result.status === 'success') {
      return true;
    }
    throw new Error(result?.message || 'Error desconocido al actualizar la hoja.');
  } catch (error) {
    console.error(`Sheets write action [${action}] failed:`, error);
    throw error;
  }
};

export const addItemsToSheets = (url, item) => writeToSheets(url, 'add', item);
export const updateItemInSheets = (url, item) => writeToSheets(url, 'update', item);
export const deleteItemFromSheets = (url, sku) => writeToSheets(url, 'delete', { sku });
