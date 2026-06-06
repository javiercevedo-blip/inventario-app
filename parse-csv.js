import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function splitCSVLine(line) {
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
}

try {
  const csvPath = path.join(__dirname, 'datos.csv');
  const csvData = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvData.split(/\r?\n/);
  
  if (lines.length < 2) {
    console.error('El archivo CSV está vacío.');
    process.exit(1);
  }

  // Parse headers
  const headers = splitCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim().toUpperCase());
  console.log('Encabezados encontrados:', headers);
  
  const skuIdx = headers.indexOf('SKU');
  const descIdx = headers.indexOf('DESCRIPCION');
  const cantIdx = headers.indexOf('CANTIDAD');
  const faltIdx = headers.indexOf('FALTANTE');
  const modIdx = headers.indexOf('MODELOS');
  const imgIdx = headers.indexOf('IMAGEN');
  const ubiIdx = headers.indexOf('UBICADO EN');

  const items = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = splitCSVLine(line).map(v => v.replace(/^"|"$/g, '').trim());
    const sku = values[skuIdx] || '';
    if (!sku) continue;

    const descripcion = values[descIdx] || 'Sin descripción';
    
    // Parse quantity
    let cantidad = 0;
    if (values[cantIdx]) {
      const parsed = parseInt(values[cantIdx], 10);
      if (!isNaN(parsed)) cantidad = parsed;
    }

    // Parse shortfalls
    let faltantes = 0;
    if (values[faltIdx]) {
      const parsed = parseInt(values[faltIdx], 10);
      if (!isNaN(parsed)) faltantes = parsed;
    }

    const modelos = values[modIdx] || '';
    const imagen = values[imgIdx] || '';
    const ubicacion = values[ubiIdx] || '';

    items.push({
      sku,
      descripcion,
      cantidad,
      faltantes,
      modelos,
      imagen,
      ubicacion
    });
  }

  const outputPath = path.join(__dirname, 'src', 'services', 'realData.json');
  fs.writeFileSync(outputPath, JSON.stringify(items, null, 2), 'utf-8');
  console.log(`¡Éxito! Se analizaron ${items.length} filas y se escribieron en ${outputPath}`);

} catch (err) {
  console.error('Error al ejecutar el script:', err);
  process.exit(1);
}
