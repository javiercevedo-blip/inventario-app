// Local Storage Database Service for React Inventory App

// Generates 210 realistic inventory items across categories
const generateMockData = () => {
  const categories = [
    { name: 'Electrónicos', prefix: 'EL', locations: ['Bodega A-1', 'Estantería 4-A', 'Vitrina 2'] },
    { name: 'Oficina', prefix: 'OF', locations: ['Bodega B-2', 'Cajón 3', 'Escritorio Central'] },
    { name: 'Herramientas', prefix: 'HE', locations: ['Taller 1', 'Mesa de Trabajo B', 'Estantería 7'] },
    { name: 'Mobiliario', prefix: 'MO', locations: ['Almacén Principal', 'Área de Espera', 'Pasillo C'] },
    { name: 'Seguridad', prefix: 'SE', locations: ['Bodega A-3', 'Estación de Emergencia', 'Estantería 1-B'] }
  ];

  const itemNames = {
    'Electrónicos': [
      'Cable HDMI 4K 2m', 'Adaptador USB-C a HDMI', 'Mouse Inalámbrico Ergonómico', 
      'Teclado Mecánico RGB', 'Monitor IPS 24" Full HD', 'Cargador Portátil 10000mAh',
      'Auriculares con Cancelación de Ruido', 'Memoria USB 64GB 3.0', 'Disco Duro Externo 1TB',
      'Cámara Web 1080p Pro', 'Multitoma Eléctrica 6 Salidas', 'Lámpara de Escritorio LED'
    ],
    'Oficina': [
      'Resma de Papel A4 80g', 'Bolígrafo Negro Retráctil x12', 'Engrapadora Metálica Heavy Duty',
      'Tijeras de Oficina 8"', 'Perforadora de 2 Orificios', 'Cinta Adhesiva Transparente x3',
      'Organizador de Escritorio Plástico', 'Carpeta Archivadora Azul', 'Notas Adhesivas 3x3" Amarillo',
      'Resaltadores de Colores x6', 'Clips Metálicos Medianos x100', 'Marcadores para Pizarra x4'
    ],
    'Herramientas': [
      'Destornillador Phillips PH2', 'Destornillador Plano 6mm', 'Martillo de Uña 16oz',
      'Pinza de Presión 10"', 'Llave Ajustable 8" (Inglesa)', 'Flexómetro de 5 metros Pro',
      'Juego de Llaves Allen x9', 'Cúter Profesional Retráctil', 'Cinta Aislante Negra 20m',
      'Nivel de Burbuja Magnético', 'Juego de Brocas para Metal x13', 'Taladro Inalámbrico 12V'
    ],
    'Mobiliario': [
      'Silla de Oficina Giratoria', 'Silla de Conferencia Plástica', 'Escritorio Rectangular 120x60',
      'Mueble Cajonero 3 Gavetas', 'Estantería Metálica 5 Baldas', 'Pizarra Blanca Magnética 90x60',
      'Cesto de Basura Metálico', 'Lámpara de Pie Moderna', 'Archivador Metálico Vertical 4 Gavetas',
      'Mesa de Reuniones Redonda', 'Ventilador de Torre Oscilante', 'Perchero de Pie Cromado'
    ],
    'Seguridad': [
      'Casco de Seguridad Amarillo', 'Gafas de Protección Anti-empañantes', 'Chaleco Reflectante Naranja L',
      'Guantes de Trabajo de Cuero G', 'Tapones Auditivos de Silicona', 'Mascarilla Respiratoria N95',
      'Extintor de Polvo ABC 4kg', 'Botiquín de Primeros Auxilios', 'Cinta de Señalización Peligro 100m',
      'Arnés de Seguridad Cuerpo Completo', 'Cono de Tráfico Naranja 45cm', 'Linterna LED Recargable Alta Potencia'
    ]
  };

  const data = [];
  let itemCounter = 100;

  categories.forEach(cat => {
    const names = itemNames[cat.name];
    // Create several items per category to reach > 200 total
    for (let i = 0; i < 42; i++) {
      const baseName = names[i % names.length];
      const countIndex = Math.floor(i / names.length);
      const suffix = countIndex > 0 ? ` Mod. ${countIndex + 1}` : '';
      const descripcion = `${baseName}${suffix} - Ideal para uso continuo y de alta durabilidad en entornos exigentes.`;
      
      const skuNumber = itemCounter++;
      const sku = `${cat.prefix}-${skuNumber}`;
      
      const cantidad = Math.floor(Math.random() * 85) + 3; // Quantity between 3 and 88
      const isShortfall = Math.random() < 0.15; // 15% chance of having missing items
      const faltantes = isShortfall ? Math.floor(Math.random() * 10) + 1 : 0;
      
      const location = cat.locations[Math.floor(Math.random() * cat.locations.length)];
      
      data.push({
        sku,
        descripcion,
        cantidad,
        faltantes,
        ubicacion: location,
        imagen: '' // Empty so it triggers the modern SVG placeholder initially
      });
    }
  });

  return data;
};

const DB_KEY = 'inventario_react_items';

export const getItems = () => {
  const items = localStorage.getItem(DB_KEY);
  if (!items) {
    const mockData = generateMockData();
    localStorage.setItem(DB_KEY, JSON.stringify(mockData));
    return mockData;
  }
  return JSON.parse(items);
};

export const saveItems = (items) => {
  localStorage.setItem(DB_KEY, JSON.stringify(items));
};

export const addItem = (newItem) => {
  const items = getItems();
  // Check if SKU already exists
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
  const mockData = generateMockData();
  saveItems(mockData);
  return mockData;
};

// CSV Import Helper
export const importFromCSVText = (csvText) => {
  const lines = csvText.split('\n');
  if (lines.length < 2) throw new Error('El archivo CSV está vacío o es inválido.');

  // Detect headers
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  // Find column indices
  const skuIdx = headers.indexOf('sku');
  const descIdx = headers.indexOf('descripcion') !== -1 ? headers.indexOf('descripcion') : headers.indexOf('descripción');
  const cantIdx = headers.indexOf('cantidad');
  const faltIdx = headers.indexOf('faltantes');
  const ubiIdx = headers.indexOf('ubicacion') !== -1 ? headers.indexOf('ubicacion') : headers.indexOf('ubicación');
  const imgIdx = headers.indexOf('imagen');

  if (skuIdx === -1) {
    throw new Error('El archivo CSV debe contener al menos una columna llamada "sku" o "SKU".');
  }

  const parsedItems = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple split that handles comma inside quotes if needed
    // For simplicity of local app, split by comma
    const values = line.split(',');
    
    const sku = values[skuIdx] ? values[skuIdx].replace(/['"]/g, '').trim() : '';
    if (!sku) continue;

    const descripcion = descIdx !== -1 && values[descIdx] ? values[descIdx].replace(/['"]/g, '').trim() : 'Sin descripción';
    
    let cantidad = 0;
    if (cantIdx !== -1 && values[cantIdx]) {
      const parsedCant = parseInt(values[cantIdx].replace(/['"]/g, '').trim(), 10);
      if (!isNaN(parsedCant)) cantidad = parsedCant;
    }

    let faltantes = 0;
    if (faltIdx !== -1 && values[faltIdx]) {
      const parsedFalt = parseInt(values[faltIdx].replace(/['"]/g, '').trim(), 10);
      if (!isNaN(parsedFalt)) faltantes = parsedFalt;
    }

    const ubicacion = ubiIdx !== -1 && values[ubiIdx] ? values[ubiIdx].replace(/['"]/g, '').trim() : 'Sin ubicación';
    const imagen = imgIdx !== -1 && values[imgIdx] ? values[imgIdx].replace(/['"]/g, '').trim() : '';

    parsedItems.push({
      sku,
      descripcion,
      cantidad,
      faltantes,
      ubicacion,
      imagen
    });
  }

  if (parsedItems.length === 0) {
    throw new Error('No se pudieron importar filas válidas desde el archivo CSV.');
  }

  // Merge or overwrite? We will overwrite for cleanliness
  saveItems(parsedItems);
  return parsedItems;
};

// CSV Export Helper
export const exportToCSVText = (items) => {
  const headers = ['sku', 'descripcion', 'cantidad', 'faltantes', 'ubicacion', 'imagen'];
  const csvRows = [headers.join(',')];

  items.forEach(item => {
    const row = [
      `"${item.sku.replace(/"/g, '""')}"`,
      `"${item.descripcion.replace(/"/g, '""')}"`,
      item.cantidad,
      item.faltantes,
      `"${item.ubicacion.replace(/"/g, '""')}"`,
      `"${item.imagen.replace(/"/g, '""')}"`
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
};
