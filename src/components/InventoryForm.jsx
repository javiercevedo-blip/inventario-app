import React, { useState, useEffect } from 'react';
import { X, Save, Camera, Image, Trash2 } from 'lucide-react';
import Scanner from './Scanner';

const InventoryForm = ({ item, onSave, onClose, isEdit }) => {
  const [sku, setSku] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cantidad, setCantidad] = useState(0);
  const [faltantes, setFaltantes] = useState(0);
  const [modelos, setModelos] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [imagen, setImagen] = useState('');
  
  const [showScanner, setShowScanner] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Populate form fields if editing
  useEffect(() => {
    if (item) {
      setSku(item.sku || '');
      setDescripcion(item.descripcion || '');
      setCantidad(item.cantidad || 0);
      setFaltantes(item.faltantes || 0);
      setModelos(item.modelos || '');
      setUbicacion(item.ubicacion || '');
      setImagen(item.imagen || '');
    }
  }, [item]);

  // Image Upload handler (Base64)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg('La imagen supera el límite de 2MB. Selecciona otra.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagen(reader.result);
        setErrorMsg('');
      };
      reader.onerror = () => {
        setErrorMsg('Error al procesar la imagen.');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagen('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!sku.trim()) {
      setErrorMsg('El SKU es obligatorio.');
      return;
    }
    
    if (!descripcion.trim()) {
      setErrorMsg('La descripción es obligatoria.');
      return;
    }

    const savedItem = {
      sku: sku.trim(),
      descripcion: descripcion.trim(),
      cantidad: Math.max(0, parseInt(cantidad, 10) || 0),
      faltantes: Math.max(0, parseInt(faltantes, 10) || 0),
      modelos: modelos.trim(),
      ubicacion: ubicacion.trim() || 'Sin ubicación',
      imagen
    };

    try {
      onSave(savedItem);
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar el artículo.');
    }
  };

  const handleScanResult = (code) => {
    setSku(code);
    setShowScanner(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-wrapper">
        
        <div className="modal-header-row">
          <h3>{isEdit ? 'Editar Artículo' : 'Nuevo Artículo'}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body-content">
          <form onSubmit={handleSubmit}>
            {errorMsg && (
              <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
                {errorMsg}
              </div>
            )}

            {/* SKU Field */}
            <div className="form-group">
              <label className="form-label">SKU / Código de Barras *</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  disabled={isEdit}
                  placeholder="Ej. EL-101 o escanea un código"
                  required
                />
                {!isEdit && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowScanner(true)}
                    title="Escanear Código"
                    style={{ padding: '0 0.75rem' }}
                  >
                    <Camera size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Descripción *</label>
              <textarea
                className="form-input"
                rows="3"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Nombre del artículo y especificaciones"
                style={{ resize: 'vertical' }}
                required
              />
            </div>

            {/* Quantity and Shortfalls */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Cantidad Actual</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Faltantes</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  value={faltantes}
                  onChange={(e) => setFaltantes(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Models (Drones) */}
            <div className="form-group">
              <label className="form-label">Modelos Compatibles (Drones)</label>
              <input
                type="text"
                className="form-input"
                value={modelos}
                onChange={(e) => setModelos(e.target.value)}
                placeholder="Ej. M30 , M30T, AIR 3"
              />
            </div>

            {/* Location */}
            <div className="form-group">
              <label className="form-label">Ubicación</label>
              <input
                type="text"
                className="form-input"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                placeholder="Ej. Estantería A-2, Pasillo 1"
              />
            </div>

            {/* Image Upload Area */}
            <div className="form-group">
              <label className="form-label">Imagen del Artículo</label>
              {imagen ? (
                <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
                  <img src={imagen} alt="Preview" className="image-preview-thumbnail" style={{ margin: 0 }} />
                  <button
                    type="button"
                    onClick={removeImage}
                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justify: 'center', cursor: 'pointer', transition: 'var(--transition)' }}
                    title="Eliminar Imagen"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <label className="image-capture-wrapper">
                  <Image size={24} style={{ color: 'var(--text-tertiary)' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Toma una foto o selecciona un archivo</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Máx. 2MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>

            {/* Submit buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                <Save size={18} /> Guardar Cambios
              </button>
            </div>

          </form>
        </div>

      </div>

      {showScanner && (
        <Scanner
          onScanResult={handleScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default InventoryForm;
