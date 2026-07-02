"use client";
import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import LoadingSpinner from "@/components/LoadingSpinner";
import { showAlert } from "@/utils/alerts";
import "./admin.css";

const COLORS = ["#a855f7", "#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#6366f1"];

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await fetch("/api/proxy/admin/metrics");
      const data = await res.json();

      if (res.ok && data.success) {
        setMetrics(data.data);
      } else {
        showAlert("Error", "No se pudieron cargar las métricas", "error");
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
      showAlert("Error de conexión", "No se pudo conectar al servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Cargando métricas de la plataforma..." />;
  }

  if (!metrics) {
    return (
      <div className="admin-dashboard-wrapper">
        <div className="admin-header">
          <h2>Métricas no disponibles</h2>
        </div>
      </div>
    );
  }

  const overallRate = metrics.overall?.reincidenceRate || 0;
  // If the hypothesis is that reincidence is reduced by 30%, lower is better. 
  // Let's assume less than 50% is a "good" badge just for visual feedback.
  
  // Format data for Recharts PieChart
  const pieData = (metrics.errorCategories || []).map(cat => ({
    name: cat.category,
    value: cat.count
  }));

  return (
    <div className="admin-dashboard-wrapper animate-fade-in">
      <div className="admin-header">
        <h2>Panel de Métricas</h2>
        <p>Validación de Hipótesis y Comportamiento de Usuarios</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">
            <i className="fa-solid fa-rotate-right"></i>
            Tasa de Reincidencia Global
          </div>
          <div className="kpi-value">
            {overallRate.toFixed(1)}%
          </div>
          <div className="kpi-desc">Porcentaje promedio de repetición del mismo error</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <i className="fa-solid fa-check-double"></i>
            Casos de Éxito Totales
          </div>
          <div className="kpi-value">
            {metrics.overall?.successCases || 0}
          </div>
          <div className="kpi-desc">Entregas evaluadas y aprobadas correctamente</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <i className="fa-solid fa-users"></i>
            Usuarios Analizados
          </div>
          <div className="kpi-value">
            {metrics.engagement?.reduce((acc, curr) => acc + (curr.usersCount || 0), 0) || 0}
          </div>
          <div className="kpi-desc">Alumnos que han interactuado con la consola interactiva</div>
        </div>
      </div>

      <div className="dashboard-content-grid">
        <div className="dashboard-section">
          <div className="section-header">
            <i className="fa-solid fa-chart-line"></i>
            Clasificación por Engagement (7 días)
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="engagement-table">
              <thead>
                <tr>
                  <th>Grupo (Uso)</th>
                  <th>Usuarios</th>
                  <th>Errores Únicos</th>
                  <th>Errores Totales</th>
                  <th>Tasa de Reincidencia</th>
                  <th>Casos de Éxito</th>
                </tr>
              </thead>
              <tbody>
                {metrics.engagement?.map((groupData, idx) => {
                  const rate = groupData.reincidenceRate || 0;
                  return (
                    <tr key={idx}>
                      <td>
                        {groupData.group}
                        {groupData.group.includes('>=') && (
                          <span className="badge good" style={{ marginLeft: '10px' }}>Constantes</span>
                        )}
                        {groupData.group.includes('<') && (
                          <span className="badge warning" style={{ marginLeft: '10px' }}>Ocasionales</span>
                        )}
                      </td>
                      <td>{groupData.usersCount}</td>
                      <td>{groupData.uniqueErrors}</td>
                      <td>{groupData.totalErrors}</td>
                      <td>
                        <span className={`badge ${rate < 30 ? 'good' : 'warning'}`}>
                          {rate.toFixed(1)}%
                        </span>
                      </td>
                      <td>{groupData.successCases}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <i className="fa-solid fa-chart-pie"></i>
            Top Categorías de Error
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(20, 20, 30, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                No hay datos suficientes
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
