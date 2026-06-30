"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import CustomSelect from "@/components/CustomSelect";
import EstadisticasSkeleton from "@/components/skeletons/EstadisticasSkeleton";
import "./estadisticas-docente.css";

export default function EstadisticasDocentePage() {
  const { data: session } = useSession();
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Obtener la lista de aulas/grupos del docente para llenar el dropdown dinámicamente
  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/proxy/classrooms?teacherId=${session.user.id}`)
        .then(res => res.json())
        .then(resData => {
          if (resData.data) {
            setClassrooms(resData.data);
          }
        })
        .catch(err => console.error("Error al cargar aulas:", err));
    }
  }, [session]);

  // 2. Obtener las estadísticas basadas en el grupo seleccionado (filtro)
  useEffect(() => {
    if (session?.user?.id) {
      setLoading(true);
      fetch(`/api/proxy/classrooms/teacher/statistics?teacherId=${session.user.id}&classroomId=${filter}`)
        .then(res => res.json())
        .then(resData => {
          setStats(resData);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error al cargar estadísticas:", err);
          setLoading(false);
        });
    }
  }, [session, filter]);

  // Mapear las opciones del filtro por grupo (ej. "Grupo A")
  const filterOptions = [
    { value: "all", label: "Todos los grupos" },
    ...classrooms.map(c => {
      const groupName = c.group || "";
      const label = groupName.toLowerCase().startsWith("grupo") ? groupName : `Grupo ${groupName}`;
      return { value: c.id, label };
    })
  ];

  if (loading || !stats) {
    return <EstadisticasSkeleton />;
  }

  const { globalStats, struggles, classStats } = stats;

  return (
    <>
      <main className="estadisticas-main">
        <header className="estadisticas-header">
          <div>
            <h1>Estadísticas Globales</h1>
            <p>Métricas de aprendizaje de todos tus grupos asignados.</p>
          </div>
          <div className="estadisticas-filters">
            <CustomSelect 
              options={filterOptions} 
              value={filter} 
              onChange={setFilter} 
              icon="fa-filter"
            />
          </div>
        </header>

        {/* KPIs */}
        <section className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon primary">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <div className="kpi-info">
              <h3>Aprendizaje Efectivo</h3>
              <div className="kpi-value">{globalStats?.learningPercentage || 0}%</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon success">
              <i className="fa-solid fa-check-double"></i>
            </div>
            <div className="kpi-info">
              <h3>Tasa de Entrega</h3>
              <div className="kpi-value">{globalStats?.deliveryRate || 0}%</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon warning">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div className="kpi-info">
              <h3>Alumnos en Riesgo</h3>
              <div className="kpi-value">{globalStats?.studentsAtRisk || 0}</div>
            </div>
          </div>
        </section>

        {/* Mejora */}
        <section className="kpi-grid mt-4" style={{ gridTemplateColumns: '1fr', maxWidth: '300px' }}>
          <div className="kpi-card" style={{ borderColor: '#8b5cf6' }}>
            <div className="kpi-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <div className="kpi-info">
              <h3>Índice de Mejora</h3>
              <div className="kpi-value" style={{ color: '#8b5cf6' }}>{globalStats?.improvementIndex ?? 100}%</div>
            </div>
          </div>
        </section>

        {/* Dashboard Widgets */}
        <div className="dashboard-widgets-grid">
          {/* Temas con Mayor Dificultad */}
          <section className="dashboard-widget struggles-section">
            <div className="widget-header">
              <h2><i className="fa-solid fa-fire"></i> Temas Críticos</h2>
              <span className="widget-subtitle">Mayor índice de error</span>
            </div>
            <div className="struggles-list">
              {(struggles || []).map((item, idx) => (
                <div key={idx} className="struggle-item">
                  <div className="struggle-header">
                    <span className="struggle-topic">{item.topic}</span>
                    <span className="struggle-stat">{item.failRate}% fallo</span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className={`progress-bar-fill ${item.level}`} 
                      style={{ width: `${item.failRate}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Desglose por Grupo */}
          <section className="dashboard-widget groups-section">
            <div className="widget-header">
              <h2><i className="fa-solid fa-users-viewfinder"></i> Rendimiento por Grupo</h2>
              <span className="widget-subtitle">Vista general de laboratorios</span>
            </div>
            <div className="table-responsive">
              <table className="groups-table">
                <thead>
                  <tr>
                    <th>Laboratorio</th>
                    <th>Grupo</th>
                    <th>Promedio</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {(classStats || []).map((cls) => (
                    <tr key={cls.id}>
                      <td className="font-semibold">{cls.name}</td>
                      <td>{cls.group}</td>
                      <td className="font-semibold">{cls.avgScore}/100</td>
                      <td>
                        <span className={`badge ${cls.status}`}>
                          {cls.status === 'good' ? 'Óptimo' : cls.status === 'average' ? 'Regular' : 'En Riesgo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
