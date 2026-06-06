import React, { useState } from 'react';
import { Edit2, Trash2, MapPin, Eye, AlertCircle, Camera, Search, Filter } from 'lucide-react';
import Scanner from './Scanner';

const InventoryList = ({ items, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // all, out, low, faltantes
  const [sortBy, setSortBy] = useState('sku'); // sku, cantidad-asc, cantidad-desc, location
  const [showSearchScanner, setShowSearchScanner] = useState(false);

  // Filter and sort items
  const filteredItems = items
    .filter(item => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        (item.sku || '').toLowerCase().includes(term) ||
        (item.descripcion || '').toLowerCase().includes(term) ||
        (item.modelos || '').toLowerCase().includes(term) ||
        (item.ubicacion || '').toLowerCase().includes(term);
      
      if (!matchesSearch) return false;

      // Category / Stock filter
      if (filterMode === 'out') return (item.cantidad || 0) === 0;
      if (filterMode === 'low') return (item.cantidad || 0) > 0 && (item.cantidad || 0) < 10;
      if (filterMode === 'faltantes') return (item.faltantes || 0) > 0;
      
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'sku') {
        return (a.sku || '').localeCompare(b.sku || '');
      }
      if (sortBy === 'cantidad-asc') {
        return (a.cantidad || 0) - (b.cantidad || 0);
      }
      if (sortBy === 'cantidad-desc') {
        return (b.cantidad || 0) - (a.cantidad || 0);
      }
      if (sortBy === 'location') {
        return (a.ubicacion || '').localeCompare(b.ubicacion || '');
      }
      return 0;
    });

  const getStockBadge = (cantidad) => {
    if (cantidad === 0) return <span className="badge badge-danger">Agotado</span>;
    if (cantidad < 10) return <span className="badge badge-warning">Stock Bajo</span>;
    return <span className="badge badge-success">En Stock</span>;
  };

  const handleScanSearchResult = (code) => {
    setSearchTerm(code);
    setShowSearchScanner(false);
  };

  const getGradientBySku = (sku) => {
    const hash = sku.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
      'linear-gradient(135deg, #6366f1, #a855f7)',
      'linear-gradient(135deg, #10b981, #06b6d4)',
      'linear-gradient(135deg, #f59e0b, #e11d48)',
      'linear-gradient(135deg, #3b82f6, #6366f1)',
      'linear-gradient(135deg, #ec4899, #8b5cf6)'
    ];
    return gradients[hash % gradients.length];
  };

  return (
    <div>
      {/* Search and Filters Controls */}
      <div className="card controls-row" style={{ marginBottom: '1.5rem' }}>
        
        {/* Search Input with Scanner Button */}
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por SKU, descripción, modelo o ubicación..."
          />
          <button
            className="btn btn-secondary"
            onClick={() => setShowSearchScanner(true)}
            title="Escanear para buscar"
            style={{
              position: 'absolute',
              right: '0.35rem',
              top: '50%',
              transform: 'translateY(-50%)',
              height: '2.1rem',
              width: '2.1rem',
              padding: 0,
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <Camera size={16} />
          </button>
        </div>

        {/* Quick Filter Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <select 
            className="form-input form-select" 
            value={filterMode} 
            onChange={(e) => setFilterMode(e.target.value)}
            style={{ width: 'auto', padding: '0.5rem 2rem 0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <option value="all">Ver Todos</option>
            <option value="out">Sin Stock (Agotados)</option>
            <option value="low">Stock Bajo (&lt; 10)</option>
            <option value="faltantes">Con Faltantes</option>
          </select>

          <select 
            className="form-input form-select" 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: 'auto', padding: '0.5rem 2rem 0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <option value="sku">Ordenar por SKU</option>
            <option value="cantidad-asc">Stock: Menor a Mayor</option>
            <option value="cantidad-desc">Stock: Mayor a Menor</option>
            <option value="location">Ordenar por Ubicación</option>
          </select>
        </div>

      </div>

      {/* Statistics info banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <span>Mostrando <strong>{filteredItems.length}</strong> de {items.length} artículos</span>
        {searchTerm && (
          <button 
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => setSearchTerm('')}
          >
            Limpiar búsqueda
          </button>
        )}
      </div>

      {/* Grid of items */}
      {filteredItems.length === 0 ? (
        <div className="card empty-state">
          <AlertCircle className="empty-state-icon" />
          <h3>No se encontraron artículos</h3>
          <p>Prueba ajustando los filtros o realizando otra búsqueda.</p>
        </div>
      ) : (
        <div className="inventory-grid">
          {filteredItems.map((item) => (
            <div key={item.sku} className="card item-card">
              
              {/* Card Image Area */}
              <div className="item-image-container">
                {item.imagen ? (
                  <img src={item.imagen} alt={item.descripcion} className="item-image" />
                ) : (
                  <div className="item-image-placeholder" style={{ background: getGradientBySku(item.sku) }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'white', opacity: 0.85 }}>{item.sku.split('.').slice(-2, -1)[0] || item.sku.split('-')[0]}</span>
                    <span style={{ fontSize: '0.8rem', color: 'white', opacity: 0.75 }}>Sin Imagen</span>
                  </div>
                )}
                
                {/* Badges Overlay */}
                <div className="item-badge-row">
                  {getStockBadge(item.cantidad)}
                  {(item.faltantes || 0) > 0 && (
                    <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                      -{item.faltantes} Faltante
                    </span>
                  )}
                </div>
              </div>

              {/* Card Contents */}
              <div className="item-content">
                <div className="item-sku">{item.sku}</div>
                <h4 className="item-title" title={item.descripcion}>{item.descripcion}</h4>
                
                {/* Drone models list */}
                {item.modelos && (
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem', opacity: 0.9 }}>
                    Dron: {item.modelos}
                  </div>
                )}

                <div className="item-location">
                  <MapPin size={14} style={{ color: 'var(--primary)' }} />
                  <span>{item.ubicacion || 'Sin ubicación'}</span>
                </div>

                {/* Stock Stats box */}
                <div className="item-stats">
                  <div className="stat-box">
                    <span className="stat-label">Cantidad</span>
                    <span className="stat-value" style={{ color: item.cantidad === 0 ? 'var(--danger)' : 'inherit' }}>{item.cantidad}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Faltantes</span>
                    <span className="stat-value" style={{ color: item.faltantes > 0 ? 'var(--warning)' : 'inherit' }}>{item.faltantes}</span>
                  </div>
                </div>
              </div>

              {/* Actions Row */}
              <div className="item-actions">
                <button className="btn btn-secondary" onClick={() => onEdit(item)}>
                  <Edit2 size={14} /> Editar
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    if (window.confirm(`¿Estás seguro de que deseas eliminar el artículo ${item.sku}?`)) {
                      onDelete(item.sku);
                    }
                  }}
                  style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {showSearchScanner && (
        <Scanner
          onScanResult={handleScanSearchResult}
          onClose={() => setShowSearchScanner(false)}
        />
      )}
    </div>
  );
};

export default InventoryList;
