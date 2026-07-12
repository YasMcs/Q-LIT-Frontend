"use client";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import CustomSelect from "@/components/CustomSelect";
import { showAlert, showConfirm, showPrompt } from "@/utils/alerts";
import Swal from "sweetalert2";
import "./admin.css";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");

  // Estados para el directorio de usuarios y grupos
  const [activeTab, setActiveTab] = useState("metrics"); // "metrics", "teachers", "students"
  const [directory, setDirectory] = useState(null);
  const [loadingDirectory, setLoadingDirectory] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    fetchTeachers();
    fetchMetrics();
  }, []);

  // Cargar directorio cuando se cambie a pestañas de directorio
  useEffect(() => {
    if ((activeTab === "teachers" || activeTab === "students") && !directory) {
      fetchDirectory();
    }
  }, [activeTab, directory]);

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

  const fetchDirectory = async () => {
    setLoadingDirectory(true);
    try {
      const res = await fetch("/api/proxy/admin/users-directory");
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setDirectory(data.data);
      } else {
        showAlert("Error", "No se pudo cargar el directorio de usuarios", "error");
      }
    } catch (error) {
      console.error("Error fetching directory:", error);
      showAlert("Error de conexión", "No se pudo conectar al servidor", "error");
    } finally {
      setLoadingDirectory(false);
    }
  };

  const toggleGroupExpand = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Modificar rol de DB
  const changeUserRole = async (userId, targetRole, userName) => {
    const confirmed = await showConfirm(
      "Cambiar Rol de Usuario",
      `¿Estás seguro de que deseas cambiar el rol de "${userName || 'este usuario'}" a ${targetRole === 'teacher' ? 'Docente' : 'Estudiante'}?`
    );
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/proxy/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        await showAlert("Éxito", "Rol actualizado correctamente.", "success");
        fetchDirectory();
        fetchTeachers(); // Actualizar listado del filtro superior
      } else {
        await showAlert("Error", data.error?.message || "No se pudo actualizar el rol", "error");
      }
    } catch (error) {
      console.error("Error al actualizar el rol:", error);
      await showAlert("Error", "Error de conexión al servidor", "error");
    }
  };

  // Inscribir por correo en un grupo
  const handleEnrollUser = async (classroomId, classroomName) => {
    const email = await showPrompt(
      "Inscribir Usuario",
      `Introduce el correo electrónico del usuario para inscribirlo en "${classroomName}":`,
      "",
      "ejemplo@correo.com"
    );
    if (email === null) return;
    if (email.trim() === "") {
      await showAlert("Falta Correo", "Por favor ingresa un correo electrónico válido.", "warning");
      return;
    }

    try {
      const res = await fetch("/api/proxy/admin/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), classroomId })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        await showAlert("Éxito", "Usuario inscrito exitosamente.", "success");
        fetchDirectory();
      } else {
        await showAlert("Error", data.error?.message || "No se pudo inscribir al usuario", "error");
      }
    } catch (error) {
      console.error("Error al inscribir usuario:", error);
      await showAlert("Error", "Error de conexión al servidor", "error");
    }
  };

  // Desvincular de un grupo
  const handleRemoveEnrollment = async (enrollmentId, userName, classroomName) => {
    const confirmed = await showConfirm(
      "Desvincular Usuario",
      `¿Estás seguro de que deseas eliminar la inscripción de "${userName}" en "${classroomName}"?`
    );
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/proxy/admin/enrollments/${enrollmentId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await showAlert("Éxito", "Usuario desvinculado exitosamente.", "success");
        fetchDirectory();
      } else {
        const data = await res.json();
        await showAlert("Error", data.error?.message || "No se pudo desvincular al usuario", "error");
      }
    } catch (error) {
      console.error("Error al desvincular usuario:", error);
      await showAlert("Error", "Error de conexión al servidor", "error");
    }
  };

  // Asignar estudiante sin grupo a un grupo mediante selección
  const handleEnrollUnassignedStudent = async (studentId, studentName) => {
    if (!directory?.classrooms || directory.classrooms.length === 0) {
      await showAlert("Sin laboratorios", "No hay laboratorios creados para asignar.", "warning");
      return;
    }

    const classroomOptions = {};
    directory.classrooms.forEach(c => {
      classroomOptions[c.id] = `${c.name} (${c.group || 'Sin grupo'}) - Docente: ${c.teacher?.name || c.teacher?.email || 'Desconocido'}`;
    });

    const QLitSwal = Swal.mixin({
      background: "#0a0a0a",
      color: "#dbdee1",
      confirmButtonColor: "#6767ea",
      cancelButtonColor: "#64748b",
      customClass: {
        popup: "rounded-[24px] border border-[rgba(255,255,255,0.06)] shadow-2xl font-sans",
        title: "text-lg font-black text-white",
        htmlContainer: "text-sm text-muted font-medium",
        confirmButton: "px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all mx-2 cursor-pointer",
        cancelButton: "px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all mx-2 cursor-pointer",
        input: "bg-[#121212] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-2.5 text-[#dbdee1] text-sm focus:outline-none focus:border-[#6767ea] focus:ring-1 focus:ring-[#6767ea]",
        select: "bg-[#121212] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-2.5 text-[#dbdee1] text-sm focus:outline-none focus:border-[#6767ea] focus:ring-1 focus:ring-[#6767ea] w-full mt-3"
      }
    });

    const { value: classroomId } = await QLitSwal.fire({
      title: "Asignar Estudiante a Grupo",
      text: `Selecciona el laboratorio para inscribir a "${studentName}":`,
      input: "select",
      inputOptions: classroomOptions,
      inputPlaceholder: "Selecciona un laboratorio",
      showCancelButton: true,
      confirmButtonText: "Inscribir",
      cancelButtonText: "Cancelar"
    });

    if (classroomId) {
      try {
        const res = await fetch("/api/proxy/admin/enrollments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: studentId, classroomId })
        });
        const data = await res.json();
        if (res.ok && data.status === 'success') {
          await showAlert("Éxito", "Estudiante inscrito exitosamente.", "success");
          fetchDirectory();
        } else {
          await showAlert("Error", data.error?.message || "No se pudo inscribir al estudiante", "error");
        }
      } catch (error) {
        console.error("Error al inscribir estudiante:", error);
        await showAlert("Error", "Error de conexión al servidor", "error");
      }
    }
  };

  if (loading && !metrics) {
    return <LoadingSpinner text="Cargando panel de administración..." />;
  }

  const overallRate = metrics?.overall?.reincidenceRate || 0;

  return (
    <div className="admin-dashboard-wrapper animate-fade-in">
      {/* Cabecera */}
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>
            {activeTab === "metrics" && "Panel de Métricas"}
            {activeTab === "teachers" && "Directorio de Docentes"}
            {activeTab === "students" && "Estudiantes por Grupo"}
          </h2>
          <p>
            {activeTab === "metrics" && "Validación de Hipótesis y Comportamiento de Usuarios"}
            {activeTab === "teachers" && "Listado y auditoría de docentes en la plataforma"}
            {activeTab === "students" && "Gestión de laboratorios, alumnos y accesos"}
          </p>
        </div>

        {activeTab === "metrics" && (
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
        )}
      </div>

      {/* Pestañas de Navegación */}
      <div className="tab-container">
        <button 
          className={`tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          <i className="fa-solid fa-chart-simple"></i>
          Métricas
        </button>
        <button 
          className={`tab-btn ${activeTab === 'teachers' ? 'active' : ''}`}
          onClick={() => setActiveTab('teachers')}
        >
          <i className="fa-solid fa-chalkboard-user"></i>
          Directorio Docentes
        </button>
        <button 
          className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <i className="fa-solid fa-user-graduate"></i>
          Estudiantes por Grupo
        </button>
      </div>

      {/* PESTAÑA 1: MÉTRICAS */}
      {activeTab === "metrics" && (
        <>
          {/* KPI Grid */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-title">
                <i className="fa-solid fa-users"></i>
                Usuarios Analizados
              </div>
              <div className="kpi-value">
                {metrics?.overall?.totalUsersEvaluated || 0}
              </div>
              <div className="kpi-desc">Alumnos que han interactuado con la consola interactiva</div>
            </div>

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
                {metrics?.autonomy?.autonomyRate || "0.00%"}
              </div>
              <div className="kpi-desc">Alumnos que logran el éxito tras equivocarse</div>
            </div>
          </div>

          {/* Gráficos / Secciones de métricas */}
          <div className="dashboard-content-grid">
            {/* COLUMNA 1 (2fr): Evolución de Aprendizaje (Impacto de Reincidencia) */}
            <div className="dashboard-section">
              <div className="section-header">
                <i className="fa-solid fa-bolt"></i>
                Evolución de Aprendizaje (Impacto)
              </div>
              <div style={{ padding: '15px 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Secciones de Impacto e Historial Lado a Lado */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  
                  {/* Bloque 1: Promedio de Errores */}
                  <div>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Promedio de Errores por Alumno
                    </h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 3px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Errores 1ra Práctica</h3>
                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--error-color)' }}>
                          {metrics?.evolution?.firstInteractionAvgErrors || "0"}
                        </p>
                      </div>
                      <i className="fa-solid fa-arrow-right" style={{ fontSize: '1rem', color: 'var(--text-muted)' }}></i>
                      <div style={{ textAlign: 'right' }}>
                        <h3 style={{ margin: '0 0 3px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Errores Última Práctica</h3>
                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
                          {metrics?.evolution?.lastInteractionAvgErrors || "0"}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px' }}>
                      <h3 style={{ margin: '0 0 2px 0', color: '#10b981', fontSize: '0.85rem', fontWeight: '600' }}>Mejora Global Demostrada</h3>
                      <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: '900', color: '#10b981' }}>
                        {metrics?.evolution?.improvementPercentage || "0%"}
                      </p>
                    </div>
                  </div>

                  {/* Bloque 2: Tasa de Reincidencia */}
                  <div>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Impacto en Tasa de Reincidencia (Meta: Reducción 30%)
                    </h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 3px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reincidencia 1ra Práctica</h3>
                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--error-color)' }}>
                          {metrics?.evolution?.firstPracticeReincidenceRate || "0.0%"}
                        </p>
                      </div>
                      <i className="fa-solid fa-arrow-right" style={{ fontSize: '1rem', color: 'var(--text-muted)' }}></i>
                      <div style={{ textAlign: 'right' }}>
                        <h3 style={{ margin: '0 0 3px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reincidencia Última</h3>
                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
                          {metrics?.evolution?.lastPracticeReincidenceRate || "0.0%"}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '10px', 
                      background: parseFloat(metrics?.evolution?.reincidenceRelativeReduction || '0') >= 30.0 
                        ? 'rgba(168, 85, 247, 0.08)' 
                        : 'rgba(234, 179, 8, 0.08)', 
                      border: parseFloat(metrics?.evolution?.reincidenceRelativeReduction || '0') >= 30.0 
                        ? '1px solid rgba(168, 85, 247, 0.2)' 
                        : '1px solid rgba(234, 179, 8, 0.2)', 
                      borderRadius: '12px' 
                    }}>
                      <h3 style={{ 
                        margin: '0 0 2px 0', 
                        color: parseFloat(metrics?.evolution?.reincidenceRelativeReduction || '0') >= 30.0 ? '#c084fc' : '#facc15', 
                        fontSize: '0.85rem',
                        fontWeight: '600'
                      }}>
                        {parseFloat(metrics?.evolution?.reincidenceRelativeReduction || '0') >= 30.0 
                          ? 'Hipótesis Validada: Meta Lograda' 
                          : 'Reducción de Reincidencia'}
                      </h3>
                      <p style={{ 
                        margin: 0, 
                        fontSize: '1.6rem', 
                        fontWeight: '900', 
                        color: parseFloat(metrics?.evolution?.reincidenceRelativeReduction || '0') >= 30.0 ? '#c084fc' : '#facc15' 
                      }}>
                        -{metrics?.evolution?.reincidenceRelativeReduction || "0.0%"}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Desglose por Categorías de Error */}
                <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '15px' }}>
                  <h5 style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Desglose de Reincidencia por Tipo de Error
                  </h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {/* Categoría Sintaxis */}
                    <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#fff', fontWeight: '600', marginBottom: '4px' }}>Sintaxis SQL</div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <span>{metrics?.evolution?.byCategory?.sintaxis?.firstPracticeReincidenceRate || "0.0%"}</span>
                        <i className="fa-solid fa-arrow-right text-[8px] text-muted"></i>
                        <span style={{ fontWeight: 'bold', color: 'var(--success-color)' }}>{metrics?.evolution?.byCategory?.sintaxis?.lastPracticeReincidenceRate || "0.0%"}</span>
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '950', color: '#c084fc', marginTop: '6px' }}>
                        -{metrics?.evolution?.byCategory?.sintaxis?.reincidenceRelativeReduction || "0.0%"}
                      </div>
                    </div>

                    {/* Categoría Esquema */}
                    <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#fff', fontWeight: '600', marginBottom: '4px' }}>Identificadores (Esquema)</div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <span>{metrics?.evolution?.byCategory?.esquema?.firstPracticeReincidenceRate || "0.0%"}</span>
                        <i className="fa-solid fa-arrow-right text-[8px] text-muted"></i>
                        <span style={{ fontWeight: 'bold', color: 'var(--success-color)' }}>{metrics?.evolution?.byCategory?.esquema?.lastPracticeReincidenceRate || "0.0%"}</span>
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '950', color: '#c084fc', marginTop: '6px' }}>
                        -{metrics?.evolution?.byCategory?.esquema?.reincidenceRelativeReduction || "0.0%"}
                      </div>
                    </div>

                    {/* Categoría Lógica */}
                    <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#fff', fontWeight: '600', marginBottom: '4px' }}>Lógica y Restricciones</div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <span>{metrics?.evolution?.byCategory?.logica?.firstPracticeReincidenceRate || "0.0%"}</span>
                        <i className="fa-solid fa-arrow-right text-[8px] text-muted"></i>
                        <span style={{ fontWeight: 'bold', color: 'var(--success-color)' }}>{metrics?.evolution?.byCategory?.logica?.lastPracticeReincidenceRate || "0.0%"}</span>
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '950', color: '#c084fc', marginTop: '6px' }}>
                        -{metrics?.evolution?.byCategory?.logica?.reincidenceRelativeReduction || "0.0%"}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* COLUMNA 2 (1fr): Clasificación por Uso Frecuente (Engagement) */}
            <div className="dashboard-section">
              <div className="section-header">
                <i className="fa-solid fa-chart-line"></i>
                Uso Frecuente (Engagement)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                {metrics?.engagement && Object.entries(metrics.engagement).map(([key, groupData], idx) => {
                  const rate = parseFloat(groupData.reincidenceRate || 0);
                  const isConstant = key === 'constantUsers';
                  return (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#fff' }}>
                          {isConstant ? 'Alumnos Constantes' : 'Alumnos Ocasionales'}
                        </span>
                        <span className={`badge ${isConstant ? 'good' : 'warning'}`}>
                          {isConstant ? '>= 7 días' : '< 7 días'}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {groupData.description}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', fontSize: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px' }}>
                        <div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>Alumnos</div>
                          <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>{groupData.userCount}</div>
                        </div>
                        <div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>Err. Totales</div>
                          <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>{groupData.totalErrors}</div>
                        </div>
                        <div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>Reincidencia</div>
                          <div style={{ fontWeight: 'bold', color: rate < 30 ? 'var(--success-color)' : 'var(--error-color)', fontSize: '1rem' }}>{rate.toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* PESTAÑA 2: DIRECTORIO DOCENTES */}
      {activeTab === "teachers" && (
        <div className="dashboard-section animate-fade-in" style={{ width: '100%' }}>
          <div className="section-header">
            <i className="fa-solid fa-chalkboard-user"></i>
            Listado de Docentes ({directory?.teachers?.length || 0})
          </div>
          
          {loadingDirectory ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Cargando docentes...
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="directory-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol DB</th>
                    <th>Aulas Creadas / Apoyo</th>
                  </tr>
                </thead>
                <tbody>
                  {directory?.teachers?.map((t) => {
                    const initials = t.name ? t.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'DOC';
                    return (
                      <tr key={t.id}>
                        <td>
                          <div className="user-name-cell">
                            <div className="user-avatar-mini">{initials}</div>
                            <div>
                              <div style={{ fontWeight: 'bold', color: '#fff' }}>{t.name || "Sin nombre"}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className={`role-badge ${t.role || 'teacher'}`}>
                              {t.role === 'teacher' ? 'Docente' : t.role === 'student' ? 'Estudiante' : t.role || 'Docente'}
                            </span>
                            <button 
                              onClick={() => changeUserRole(t.id, t.role === 'teacher' ? 'student' : 'teacher', t.name || t.email)}
                              title="Cambiar rol en DB"
                              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 8px', borderRadius: '8px', color: '#c084fc', cursor: 'pointer', fontSize: '0.85rem' }}
                            >
                              <i className="fa-solid fa-user-gear"></i>
                            </button>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                            {/* Aulas Creadas */}
                            {t.classroomsCreated && t.classroomsCreated.length > 0 && (
                              <div>
                                <span style={{ color: '#c084fc', fontWeight: 'bold', marginRight: '6px' }}>Propietario:</span>
                                <span style={{ color: 'var(--text-secondary)' }}>
                                  {t.classroomsCreated.map(c => `${c.name} (${c.group || 'Sin grupo'})`).join(', ')}
                                </span>
                              </div>
                            )}

                            {/* Aulas de Apoyo */}
                            {t.enrollments && t.enrollments.length > 0 && (
                              <div>
                                <span style={{ color: '#60a5fa', fontWeight: 'bold', marginRight: '6px' }}>Apoyo:</span>
                                <span style={{ color: 'var(--text-secondary)' }}>
                                  {t.enrollments.map(e => `${e.classroom.name} (${e.classroom.group || 'Sin grupo'})`).join(', ')}
                                </span>
                              </div>
                            )}

                            {(!t.classroomsCreated || t.classroomsCreated.length === 0) && (!t.enrollments || t.enrollments.length === 0) && (
                              <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Ninguno</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 3: ESTUDIANTES POR GRUPO */}
      {activeTab === "students" && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }} className="animate-fade-in">
          <div className="section-header" style={{ marginBottom: 0 }}>
            <i className="fa-solid fa-user-graduate"></i>
            Estudiantes por Grupo / Laboratorio
          </div>

          {loadingDirectory ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Cargando grupos y estudiantes...
            </div>
          ) : (
            <>
              {/* Listado de laboratorios */}
              {directory?.classrooms?.map((cls) => {
                const isExpanded = expandedGroups[cls.id];
                const activeEnrollments = cls.enrollments || [];
                
                // Clasificar estudiantes vs docentes de apoyo
                const supportTeachers = activeEnrollments.filter(e => e.role === 'co_teacher' || e.user?.role === 'teacher');
                const actualStudents = activeEnrollments.filter(e => e.role !== 'co_teacher' && e.user?.role !== 'teacher');
                
                return (
                  <div key={cls.id} className="group-card">
                    <div 
                      className="group-card-header" 
                      onClick={() => toggleGroupExpand(cls.id)}
                    >
                      <div className="group-card-title">
                        <i className={`fa-solid ${isExpanded ? 'fa-chevron-down' : 'fa-chevron-right'} text-muted-foreground`} style={{ fontSize: '0.8rem' }}></i>
                        <div>
                          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {cls.name}
                            {cls.isArchived && <span className="badge warning">Archivado</span>}
                          </h3>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Docente titular: <strong>{cls.teacher?.name || cls.teacher?.email || 'Desconocido'}</strong>
                          </span>
                        </div>
                      </div>
                      <div className="group-card-meta">
                        <span>Grupo: <strong>{cls.group || 'N/A'}</strong></span>
                        <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                          Código: {cls.inviteCode}
                        </span>
                        
                        <span className="badge good">
                          {actualStudents.length} {actualStudents.length === 1 ? 'alumno' : 'alumnos'}
                        </span>
                        
                        {supportTeachers.length > 0 && (
                          <span className="badge warning">
                            {supportTeachers.length} apoyo
                          </span>
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // evitar expandir/colapsar card
                            handleEnrollUser(cls.id, cls.name);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border-none"
                        >
                          <i className="fa-solid fa-user-plus"></i> Inscribir
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="group-card-content">
                        {activeEnrollments.length === 0 ? (
                          <div style={{ padding: '20px 0', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                            No hay alumnos ni docentes inscritos en este laboratorio.
                          </div>
                        ) : (
                          <table className="directory-table">
                            <thead>
                              <tr>
                                <th>Miembro</th>
                                <th>Rol DB</th>
                                <th>Tipo de Acceso</th>
                                <th>Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeEnrollments.map((e) => {
                                const initials = e.user.name ? e.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AL';
                                const isCoTeacher = e.role === 'co_teacher' || e.user.role === 'teacher';
                                
                                // Si está en la lista de alumnos pero su rol de DB es teacher, hay una discrepancia
                                const hasRoleDiscrepancy = e.role === 'student' && e.user.role === 'teacher';
                                
                                return (
                                  <tr key={e.id} style={hasRoleDiscrepancy ? { background: 'rgba(239,68,68,0.03)' } : {}}>
                                    <td>
                                      <div className="user-name-cell">
                                        <div 
                                          className="user-avatar-mini" 
                                          style={{ background: isCoTeacher ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'linear-gradient(135deg, #10b981, #3b82f6)' }}
                                        >
                                          {initials}
                                        </div>
                                        <div>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                                            {e.user.name || "Sin nombre"}
                                            {hasRoleDiscrepancy && (
                                              <span className="badge warning" style={{ padding: '2px 6px', fontSize: '0.65rem' }} title="Es docente en DB pero está inscrito como estudiante">
                                                Discrepancia
                                              </span>
                                            )}
                                          </div>
                                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{e.user.email}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className={`role-badge ${e.user.role || 'student'}`}>
                                          {e.user.role === 'teacher' ? 'Docente' : e.user.role === 'student' ? 'Estudiante' : e.user.role || 'Estudiante'}
                                        </span>
                                        <button 
                                          onClick={() => changeUserRole(e.user.id, e.user.role === 'teacher' ? 'student' : 'teacher', e.user.name || e.user.email)}
                                          title="Cambiar rol en DB"
                                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 6px', borderRadius: '6px', color: '#c084fc', cursor: 'pointer', fontSize: '0.75rem' }}
                                        >
                                          <i className="fa-solid fa-user-gear"></i>
                                        </button>
                                      </div>
                                    </td>
                                    <td>
                                      <span style={{ fontSize: '0.85rem', fontWeight: isCoTeacher ? 'bold' : 'normal', color: isCoTeacher ? '#c084fc' : 'var(--text-secondary)' }}>
                                        {e.role === 'co_teacher' ? 'Docente de Apoyo' : 'Estudiante'}
                                      </span>
                                    </td>
                                    <td>
                                      <button 
                                        onClick={() => handleRemoveEnrollment(e.id, e.user?.name || e.user?.email, cls.name)}
                                        title="Desvincular del laboratorio"
                                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', padding: '6px 12px', borderRadius: '8px', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem' }}
                                      >
                                        <i className="fa-solid fa-user-minus"></i> Desvincular
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Alumnos sin grupo asignado */}
              <div className="group-card" style={{ borderColor: 'rgba(234, 179, 8, 0.3)' }}>
                <div 
                  className="group-card-header" 
                  onClick={() => toggleGroupExpand('unassigned')}
                  style={{ background: 'rgba(234, 179, 8, 0.03)' }}
                >
                  <div className="group-card-title">
                    <i className={`fa-solid ${expandedGroups['unassigned'] ? 'fa-chevron-down' : 'fa-chevron-right'} text-amber-500`} style={{ fontSize: '0.8rem' }}></i>
                    <div>
                      <h3 style={{ color: '#facc15' }}>Estudiantes sin grupo asignado</h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Registrados en la plataforma pero no inscritos en ningún laboratorio
                      </span>
                    </div>
                  </div>
                  <div className="group-card-meta">
                    <span className="badge warning">
                      {directory?.unassignedStudents?.length || 0} alumnos
                    </span>
                  </div>
                </div>

                {expandedGroups['unassigned'] && (
                  <div className="group-card-content">
                    {(!directory?.unassignedStudents || directory.unassignedStudents.length === 0) ? (
                      <div style={{ padding: '20px 0', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                        Todos los estudiantes tienen al menos un grupo asignado.
                      </div>
                    ) : (
                      <table className="directory-table">
                        <thead>
                          <tr>
                            <th>Usuario</th>
                            <th>Rol DB</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {directory.unassignedStudents.map((u) => {
                            const initials = u.name ? u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AL';
                            return (
                              <tr key={u.id}>
                                <td>
                                  <div className="user-name-cell">
                                    <div className="user-avatar-mini" style={{ background: 'linear-gradient(135deg, #facc15, #f97316)' }}>{initials}</div>
                                    <div>
                                      <div style={{ fontWeight: 'bold', color: '#fff' }}>{u.name || "Sin nombre"}</div>
                                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className={`role-badge ${u.role || 'student'}`}>
                                      {u.role === 'teacher' ? 'Docente' : u.role === 'student' ? 'Estudiante' : u.role || 'Estudiante'}
                                    </span>
                                    <button 
                                      onClick={() => changeUserRole(u.id, u.role === 'teacher' ? 'student' : 'teacher', u.name || u.email)}
                                      title="Cambiar rol en DB"
                                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 6px', borderRadius: '6px', color: '#c084fc', cursor: 'pointer', fontSize: '0.75rem' }}
                                    >
                                      <i className="fa-solid fa-user-gear"></i>
                                    </button>
                                  </div>
                                </td>
                                <td>
                                  <button
                                    onClick={() => handleEnrollUnassignedStudent(u.id, u.name || u.email)}
                                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border-none"
                                  >
                                    <i className="fa-solid fa-user-plus"></i> Asignar a Grupo
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
