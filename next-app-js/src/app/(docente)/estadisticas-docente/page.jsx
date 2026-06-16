"use client";
import React, { useState } from "react";
import CustomSelect from "@/components/CustomSelect";
import "./estadisticas-docente.css";

import mockData from "@/app/api/mocks/teacher/estadisticas.json";

const globalStats = mockData.globalStats;
const struggles = mockData.struggles;
const classStats = mockData.classStats;

export default function EstadisticasDocentePage() {
  const [filter, setFilter] = useState("all");

  const filterOptions = [
    { value: "all", label: "Todos los grupos" },
    { value: "1", label: "Grupo A" },
    { value: "2", label: "Grupo B" }
  ];

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
              <div className="kpi-value">{globalStats.learningPercentage}%</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon success">
              <i className="fa-solid fa-check-double"></i>
            </div>
            <div className="kpi-info">
              <h3>Tasa de Entrega</h3>
              <div className="kpi-value">{globalStats.deliveryRate}%</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon warning">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div className="kpi-info">
              <h3>Alumnos en Riesgo</h3>
              <div className="kpi-value">{globalStats.studentsAtRisk}</div>
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
              {struggles.map((item, idx) => (
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
                  {classStats.map((cls) => (
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
