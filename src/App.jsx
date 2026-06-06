import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ClipboardList, Settings as SettingsIcon, Plus, Moon, Sun, RefreshCw, Scan } from 'lucide-react';

import Dashboard from './components/Dashboard';
import InventoryList from './components/InventoryList';
import InventoryForm from './components/InventoryForm';
import Settings from './components/Settings';
import Scanner from './components/Scanner';

import { getItems, addItem, updateItem, deleteItem } from './services/db';
import { getSheetsConfig, fetchItemsFromSheets, addItemsToSheets, updateItemInSheets, deleteItemFromSheets } from './services/sheets';

function App() {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory'); // dashboard, inventory, settings
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [loading, setLoading] = useState(false);
  
  // Modals state
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showQuickScanner, setShowQuickScanner] = useState(false);
  
  // Feedback alerts
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Sync details
  const [syncConfig, setSyncConfig] = useState({ url: '', enabled: false });

  // Handle Theme switching
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Load inventory data
  const loadData = async (forceRefresh = false) => {
    setLoading(true);
    const config = getSheetsConfig();
    setSyncConfig(config);

    if (config.enabled && config.url) {
      try {
        // Fetch from sheets
        const sheetData = await fetchItemsFromSheets(config.url);
        setItems(sheetData);
        // Backup to local DB
        localStorage.setItem('inventario_react_items', JSON.stringify(sheetData));
        if (forceRefresh) {
          showToast('Datos sincronizados con Google Sheets', 'success');
        }
      } catch (err) {
        console.error('Failed to sync from Google Sheets:', err);
        // Fallback to local DB
        const localData = getItems();
        setItems(localData);
        showToast('Fallo al conectar. Mostrando datos locales (Offline).', 'warning');
      }
    } else {
      // Local storage load
      const localData = getItems();
      setItems(localData);
    }
    setLoading(false);
  };

  // Trigger load on mount
  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // CRUD Actions
  const handleSaveItem = async (savedItem) => {
    setLoading(true);
    const isEdit = items.some(item => item.sku === savedItem.sku);
    
    try {
      if (syncConfig.enabled && syncConfig.url) {
        if (isEdit) {
          await updateItemInSheets(syncConfig.url, savedItem);
        } else {
          await addItemsToSheets(syncConfig.url, savedItem);
        }
      }

      // Update local storage
      if (isEdit) {
        updateItem(savedItem);
        showToast('Artículo actualizado correctamente', 'success');
      } else {
        addItem(savedItem);
        showToast('Artículo agregado correctamente', 'success');
      }

      setEditingItem(null);
      setShowAddForm(false);
      loadData();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error al guardar los datos', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (sku) => {
    setLoading(true);
    try {
      if (syncConfig.enabled && syncConfig.url) {
        await deleteItemFromSheets(syncConfig.url, sku);
      }
      
      deleteItem(sku);
      showToast('Artículo eliminado del inventario', 'success');
      loadData();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error al eliminar el artículo', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Quick scanner action: scanning a code anywhere in the app
  const handleQuickScanResult = (code) => {
    setShowQuickScanner(false);
    const matchedItem = items.find(item => item.sku.toLowerCase() === code.toLowerCase());
    
    if (matchedItem) {
      // Edit matching item
      setEditingItem(matchedItem);
    } else {
      // Create new item with scanned code as SKU
      setEditingItem({
        sku: code,
        descripcion: '',
        cantidad: 0,
        faltantes: 0,
        ubicacion: '',
        imagen: ''
      });
      setShowAddForm(true);
    }
  };

  return (
    <div className="app-container">
      
      {/* Toast Alert Banner */}
      {toast.show && (
        <div 
          style={{ 
            position: 'fixed', 
            top: '5.5rem', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            zIndex: 9999,
            padding: '0.75rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: toast.type === 'success' ? 'var(--success-light)' : toast.type === 'warning' ? 'var(--warning-light)' : 'var(--danger-light)',
            color: toast.type === 'success' ? 'var(--success)' : toast.type === 'warning' ? 'var(--warning)' : 'var(--danger)',
            border: '1px solid currentColor',
            animation: 'slideUp 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Main sticky navigation header */}
      <header className="app-header">
        <a href="#" className="header-brand" onClick={(e) => { e.preventDefault(); setActiveTab('inventory'); }}>
          <div className="header-logo">
            <ClipboardList size={20} />
          </div>
          <span className="header-title">INVENTARIO</span>
        </a>

        <div className="header-actions">
          {syncConfig.enabled && (
            <button 
              className="btn btn-secondary btn-icon" 
              onClick={() => loadData(true)} 
              disabled={loading}
              title="Sincronizar"
            >
              <RefreshCw size={18} className={loading ? 'spin' : ''} style={{ animation: loading ? 'spin 1.5s linear infinite' : 'none' }} />
            </button>
          )}
          
          <button className="btn btn-secondary btn-icon" onClick={toggleTheme} title="Cambiar tema">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      {/* Main workspace container */}
      <main className="main-content">
        
        {/* Render Tab pages */}
        {activeTab === 'dashboard' && <Dashboard items={items} />}
        
        {activeTab === 'inventory' && (
          <InventoryList 
            items={items} 
            onEdit={(item) => { setEditingItem(item); setShowAddForm(true); }}
            onDelete={handleDeleteItem}
          />
        )}
        
        {activeTab === 'settings' && (
          <Settings 
            items={items} 
            onDataRefresh={loadData}
          />
        )}

      </main>

      {/* Floating Action Buttons (FAB) for mobile productivity */}
      {activeTab === 'inventory' && (
        <div style={{ position: 'fixed', bottom: '5.5rem', right: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', zIndex: 99 }}>
          
          {/* Scan Anywhere FAB */}
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowQuickScanner(true)}
            style={{ 
              borderRadius: 'var(--radius-full)', 
              width: '3.25rem', 
              height: '3.25rem', 
              boxShadow: 'var(--shadow-md)',
              padding: 0,
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              color: 'var(--primary)'
            }}
            title="Escanear Código"
          >
            <Scan size={20} />
          </button>

          {/* Add Item FAB */}
          <button 
            className="btn btn-primary" 
            onClick={() => { setEditingItem(null); setShowAddForm(true); }}
            style={{ 
              borderRadius: 'var(--radius-full)', 
              width: '3.5rem', 
              height: '3.5rem', 
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
              padding: 0
            }}
            title="Agregar Artículo"
          >
            <Plus size={24} />
          </button>

        </div>
      )}

      {/* Bottom Sticky Tab Navigation Bar */}
      <nav className="bottom-nav">
        <button 
          className={`bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard />
          <span>Dashboard</span>
        </button>

        <button 
          className={`bottom-nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <ClipboardList />
          <span>Inventario</span>
        </button>

        <button 
          className={`bottom-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <SettingsIcon />
          <span>Ajustes</span>
        </button>
      </nav>

      {/* Add / Edit Form Modal */}
      {showAddForm && (
        <InventoryForm
          item={editingItem}
          isEdit={!!editingItem?.sku && items.some(i => i.sku === editingItem.sku)}
          onSave={handleSaveItem}
          onClose={() => { setShowAddForm(false); setEditingItem(null); }}
        />
      )}

      {/* Quick Scanner Modal */}
      {showQuickScanner && (
        <Scanner
          onScanResult={handleQuickScanResult}
          onClose={() => setShowQuickScanner(false)}
        />
      )}

    </div>
  );
}

// Add simple CSS animation for spinning loading icons
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .spin {
    animation: spin 1.5s linear infinite;
  }
`;
document.head.appendChild(style);

export default App;
