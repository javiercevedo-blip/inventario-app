import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, Upload, Download, RotateCcw, HelpCircle, Check, AlertTriangle } from 'lucide-react';
import { getSheetsConfig, saveSheetsConfig, testSheetsConnection } from '../services/sheets';
import { exportToCSVText, importFromCSVText, resetToMockData } from '../services/db';

const Settings = ({ items, onDataRefresh }) => {
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [scriptUrl, setScriptUrl] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null); // null, success, error
  const [connectionMsg, setConnectionMsg] = useState('');
  
  const [csvError, setCsvError] = useState('');
  const [csvSuccess, setCsvSuccess] = useState('');

  // Load configuration on mount
  useEffect(() => {
    const config = getSheetsConfig();
    setScriptUrl(config.url);
    setSyncEnabled(config.enabled);
  }, []);

  const handleSaveSyncSettings = async (e) => {
    e.preventDefault();
    setConnectionStatus(null);
    setConnectionMsg('');

    if (syncEnabled && !scriptUrl.trim()) {
      setConnectionStatus('error');
      setConnectionMsg('Debes ingresar la URL del Script si la sincronización está activa.');
      return;
    }

    if (syncEnabled) {
      setTestingConnection(true);
      try {
        const connected = await testSheetsConnection(scriptUrl.trim());
        if (connected) {
          saveSheetsConfig(scriptUrl.trim(), true);
          setConnectionStatus('success');
          setConnectionMsg('¡Conexión exitosa y configuración guardada!');
          onDataRefresh(); // Refresh parent view data
        }
      } catch (err) {
        setConnectionStatus('error');
        setConnectionMsg(err.message || 'Error de conexión. Revisa la URL.');
      } finally {
        setTestingConnection(false);
      }
    } else {
      saveSheetsConfig(scriptUrl.trim(), false);
      setConnectionStatus('success');
      setConnectionMsg('Configuración guardada (Sincronización apagada).');
      onDataRefresh();
    }
  };

  const handleTestConnectionOnly = async () => {
    if (!scriptUrl.trim()) {
      setConnectionStatus('error');
      setConnectionMsg('Ingresa una URL primero.');
      return;
    }
    setTestingConnection(true);
    setConnectionStatus(null);
    setConnectionMsg('');
    try {
      const connected = await testSheetsConnection(scriptUrl.trim());
      if (connected) {
        setConnectionStatus('success');
        setConnectionMsg('¡Conexión exitosa! El script está respondiendo correctamente.');
      }
    } catch (err) {
      setConnectionStatus('error');
      setConnectionMsg(err.message || 'Error al conectar con el Script.');
    } finally {
      setTestingConnection(false);
    }
  };

  // CSV Export Trigger
  const handleExportCSV = () => {
    try {
      const csvContent = exportToCSVText(items);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `inventario_export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Error al exportar CSV: ' + err.message);
    }
  };

  // CSV Import Trigger
  const handleImportCSV = (e) => {
    setCsvError('');
    setCsvSuccess('');
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsedData = importFromCSVText(event.target.result);
          setCsvSuccess(`¡Importación exitosa! Se cargaron ${parsedData.length} artículos.`);
          onDataRefresh(); // refresh data in parent
        } catch (err) {
          setCsvError(err.message || 'Error al analizar el archivo CSV.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetData = () => {
    if (window.confirm('¿Estás seguro de restablecer el inventario? Se borrarán todos los cambios actuales y se cargarán más de 200 artículos de prueba.')) {
      const reseted = resetToMockData();
      onDataRefresh();
      setCsvSuccess('Base de datos restablecida a valores de demostración.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Google Sheets Sync Card */}
      <div className="card">
        <h3 className="settings-title">
          <Cloud size={20} /> Sincronización con Google Sheets
        </h3>
        
        <div className="status-indicator-bar">
          <span>Estado del enlace a la Nube:</span>
          <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            <span 
              className="status-dot" 
              style={{ backgroundColor: syncEnabled ? 'var(--success)' : 'var(--text-tertiary)' }}
            ></span>
            {syncEnabled ? 'Activo (En la Nube)' : 'Inactivo (Local)'}
          </span>
        </div>

        <form onSubmit={handleSaveSyncSettings}>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <input
              type="checkbox"
              id="sync-enabled-chk"
              checked={syncEnabled}
              onChange={(e) => setSyncEnabled(e.target.checked)}
              style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <label htmlFor="sync-enabled-chk" style={{ fontWeight: 600, cursor: 'pointer' }}>
              Activar sincronización en la nube (Google Sheets)
            </label>
          </div>

          {syncEnabled && (
            <div className="form-group">
              <label className="form-label">URL del Google Apps Script (Web App)</label>
              <input
                type="url"
                className="form-input"
                value={scriptUrl}
                onChange={(e) => setScriptUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                required={syncEnabled}
              />
            </div>
          )}

          {connectionMsg && (
            <div 
              style={{ 
                padding: '0.75rem 1rem', 
                borderRadius: 'var(--radius-sm)', 
                marginBottom: '1.25rem', 
                fontSize: '0.85rem', 
                fontWeight: 600,
                backgroundColor: connectionStatus === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
                color: connectionStatus === 'success' ? 'var(--success)' : 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {connectionStatus === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
              {connectionMsg}
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={testingConnection}
              style={{ flexGrow: 1 }}
            >
              {testingConnection ? <RefreshCw className="spin" size={18} /> : null}
              Guardar Configuración
            </button>
            
            {syncEnabled && (
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleTestConnectionOnly}
                disabled={testingConnection}
              >
                Probar Conexión
              </button>
            )}
          </div>
        </form>
      </div>

      {/* CSV Import/Export Card */}
      <div className="card">
        <h3 className="settings-title">
          <Upload size={20} /> Importar / Exportar Datos (CSV)
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Puedes importar datos desde cualquier archivo CSV (delimitado por comas) que contenga la columna <strong>sku</strong>. Las columnas soportadas son: <em>sku, descripcion, cantidad, faltantes, ubicacion, imagen</em>.
        </p>

        {csvError && (
          <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
            {csvError}
          </div>
        )}

        {csvSuccess && (
          <div style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
            {csvSuccess}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <label className="btn btn-secondary" style={{ flexGrow: 1, margin: 0 }}>
            <Upload size={18} /> Importar desde CSV
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleImportCSV} 
              style={{ display: 'none' }} 
            />
          </label>

          <button className="btn btn-secondary" onClick={handleExportCSV} style={{ flexGrow: 1 }}>
            <Download size={18} /> Exportar como CSV
          </button>
        </div>
      </div>

      {/* Reset Data & Dev Tools */}
      <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
        <h3 className="settings-title" style={{ color: 'var(--danger)' }}>
          <RotateCcw size={20} /> Restablecer Base de Datos
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          ¿Quieres restaurar la app al estado inicial? Esto cargará <strong>más de 200 artículos ficticios de prueba</strong> distribuidos por categorías y ubicaciones, ideal para testear el rendimiento y navegación.
        </p>
        <button className="btn btn-danger" onClick={handleResetData}>
          Restablecer a Datos Demo
        </button>
      </div>

      {/* Tutorial Card */}
      <div className="card">
        <h3 className="settings-title" style={{ color: 'var(--text-primary)' }}>
          <HelpCircle size={20} /> ¿Cómo crear el Google Apps Script?
        </h3>
        <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li>Abre tu hoja de cálculo de Google.</li>
          <li>Crea o asegúrate de tener una pestaña llamada <strong>INVENTARIO</strong> con los encabezados: <code>sku</code>, <code>descripcion</code>, <code>cantidad</code>, <code>faltantes</code>, <code>ubicacion</code>, <code>imagen</code>.</li>
          <li>Ve a <strong>Extensiones &rarr; Apps Script</strong> en el menú superior.</li>
          <li>Copia el archivo de ayuda <code>Code.gs</code> que creamos en tu directorio del proyecto y pégalo ahí.</li>
          <li>Haz clic en <strong>Implementar &rarr; Nueva implementación</strong>.</li>
          <li>Selecciona tipo <strong>Aplicación web</strong>, ejecuta como <strong>Tú</strong> (tu cuenta), y da acceso a <strong>Cualquiera</strong>.</li>
          <li>Implementa, otorga permisos y copia la URL resultante para pegarla en esta pantalla.</li>
        </ol>
      </div>

    </div>
  );
};

export default Settings;
