"use client";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import CustomSelect from "@/components/CustomSelect";
import { showAlert } from "@/utils/alerts";
import "./admin.css";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");

  useEffect(() => {
    fetchTeachers();
    fetchMetrics();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await fetch("/api/proxy/admin/teachers");
      if (res.ok) {
        const result = await res.json();
        setTeachers(result.data || []);
      }
    } catch (error) {
      console.error("No se pudieron cargar los docentes", error);
    }
  };

  const fetchMetrics = async (teacherId = "") => {
    setLoading(true);
    try {
      const url = teacherId ? `/api/proxy/admin/metrics?teacherId=${teacherId}` : "/api/proxy/admin/metrics";
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok && data.status === 'success') {
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

  const handleTeacherChange = (e) => {
    const value = e.target.value;
    setSelectedTeacher(value);
    fetchMetrics(value);
  };

  if (loading && !metrics) {
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

  return (
    <div className="admin-dashboard-wrapper animate-fade-in">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Panel de Métricas</h2>
          <p>Validación de Hipótesis y Comportamiento de Usuarios</p>
        </div>
        
        <div className="filter-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Filtrar por Docente:
          </label>
          <CustomSelect
            icon="fa-chalkboard-user"
            value={selectedTeacher}
            onChange={(val) => { setSelectedTeacher(val); fetchMetrics(val); }}
            options={[
              { value: "", label: "Global (Todos los docentes)" },
              ...teachers.map(t => ({ value: t.id, label: t.name || t.email }))
            ]}
          />
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">
            <i className="fa-solid fa-rotate-right"></i>
            Tasa de Reincidencia Global
          </div>
          <div className="kpi-value">
            {parseFloat(overallRate).toFixed(1)}%
          </div>
          <div className="kpi-desc">Porcentaje promedio de repetición del mismo error</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <i className="fa-solid fa-arrow-trend-up"></i>
            Tasa de Resolución Autónoma
          </div>
          <div className="kpi-value">
            {metrics.autonomy?.autonomyRate || "0.00%"}
          </div>
          <div className="kpi-desc">Alumnos que logran el éxito tras equivocarse</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <i className="fa-solid fa-users"></i>
            Usuarios Analizados
          </div>
          <div className="kpi-value">
            {metrics.overall?.totalUsersEvaluated || 0}
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
                </tr>
              </thead>
              <tbody>
                {metrics.engagement && Object.entries(metrics.engagement).map(([key, groupData], idx) => {
                  const rate = parseFloat(groupData.reincidenceRate || 0);
                  const isConstant = key === 'constantUsers';
                  return (
                    <tr key={idx}>
                      <td>
                        {groupData.description}
                        {isConstant && (
                          <span className="badge good" style={{ marginLeft: '10px' }}>Constantes</span>
                        )}
                        {!isConstant && (
                          <span className="badge warning" style={{ marginLeft: '10px' }}>Ocasionales</span>
                        )}
                      </td>
                      <td>{groupData.userCount}</td>
                      <td>{groupData.uniqueErrors}</td>
                      <td>{groupData.totalErrors}</td>
                      <td>
                        <span className={`badge ${rate < 30 ? 'good' : 'warning'}`}>
                          {rate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <i className="fa-solid fa-bolt"></i>
            Evolución de Aprendizaje (Impacto)
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: 'var(--text-secondary)' }}>Errores 1ra Práctica</h3>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--error-color)' }}>
                  {metrics.evolution?.firstInteractionAvgErrors || "0"}
                </p>
                <small style={{ color: 'var(--text-muted)' }}>Promedio por alumno</small>
              </div>
              <i className="fa-solid fa-arrow-right" style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}></i>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: 'var(--text-secondary)' }}>Errores Última Práctica</h3>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
                  {metrics.evolution?.lastInteractionAvgErrors || "0"}
                </p>
                <small style={{ color: 'var(--text-muted)' }}>Promedio por alumno</small>
              </div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#10b981', fontSize: '1.1rem' }}>Mejora Global Demostrada</h3>
              <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', color: '#10b981' }}>
                {metrics.evolution?.improvementPercentage || "0%"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
