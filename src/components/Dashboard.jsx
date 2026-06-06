import React from 'react';
import { Package, AlertTriangle, Archive, HelpCircle } from 'lucide-react';

const Dashboard = ({ items }) => {
  // Calculate statistics
  const totalSku = items.length;
  
  const totalQuantity = items.reduce((acc, curr) => acc + (curr.cantidad || 0), 0);
  
  const outOfStock = items.filter(item => (item.cantidad || 0) === 0).length;
  
  const totalFaltantes = items.reduce((acc, curr) => acc + (curr.faltantes || 0), 0);
  const itemsWithFaltantes = items.filter(item => (item.faltantes || 0) > 0).length;

  return (
    <div className="dashboard-wrapper">
      <div className="metrics-grid">
        
        {/* Metric Card: Total unique items */}
        <div className="card metric-card">
          <div className="metric-header">
            <span className="metric-title">Ítems Únicos</span>
            <div className="metric-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Package size={20} />
            </div>
          </div>
          <span className="metric-value">{totalSku}</span>
        </div>

        {/* Metric Card: Total units */}
        <div className="card metric-card">
          <div className="metric-header">
            <span className="metric-title">Unidades Totales</span>
            <div className="metric-icon" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
              <Archive size={20} />
            </div>
          </div>
          <span className="metric-value">{totalQuantity}</span>
        </div>

        {/* Metric Card: Out of stock */}
        <div className="card metric-card">
          <div className="metric-header">
            <span className="metric-title">Sin Stock (Agotado)</span>
            <div className="metric-icon" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <span className="metric-value">{outOfStock}</span>
        </div>

        {/* Metric Card: Items with shortfalls */}
        <div className="card metric-card">
          <div className="metric-header">
            <span className="metric-title">Faltantes Totales</span>
            <div className="metric-icon" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }}>
              <HelpCircle size={20} />
            </div>
          </div>
          <span className="metric-value">{totalFaltantes} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>({itemsWithFaltantes} ref)</span></span>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
