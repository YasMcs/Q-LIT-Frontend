# Estándares de Diseño y Backlog del Proyecto

Este documento consolida los estándares de diseño de la interfaz de usuario de **Q-LIT** y el backlog o plan de trabajo con el estado actual del desarrollo.

---

## 1. Reglamento de Diseño de Interfaz y UI

* **Prohibición de Emojis**: Con el objetivo de proyectar una plataforma académica e institucional limpia y profesional, se prohíbe el uso de emojis dentro de los componentes React, textos informativos, botones y alertas de la interfaz de usuario.
* **Uso de Tailwind CSS (v4)**: Se utiliza Tailwind CSS (v4) como el framework principal de estilos para estructurar y dar formato a las vistas. Las clases utilitarias deben emplearse de forma coherente para mantener un diseño responsivo, modular y limpio en todo el cliente.
* **Estética Oscura Premium (Dark Mode)**: El diseño visual de la interfaz adopta una paleta de colores oscura y moderna para reducir la fatiga visual. Se emplean tonos negros y grises profundos como fondo, con acentos en colores neón (morados, azules eléctricos, verde menta para confirmaciones y rojo coral para alertas o errores).

---

## 2. Backlog y Plan de Trabajo (Roadmap)

### 2.1. Tareas Completadas (Done)
* [x] **Autenticación Social**: Implementación completa de NextAuth con Google Provider.
* [x] **Arquitectura BFF**: Creación del Proxy Interceptor de Next.js redirigiendo al servidor de Express.
* [x] **Seguridad de la API**: Configuración de cabeceras seguras con Helmet y limitadores de tasa por usuario (Rate Limiting).
* [x] **SQL Sandbox**: Ejecución de consultas de alumno en transacciones aisladas MySQL aplicando `connection.rollback()`.
* [x] **Prompt de Generación**: Actualización del prompt del evaluador en `gemini.service.js` para forzar la creación de exactamente 3 a 4 objetivos lógicos y coherentes.
* [x] **Alertas de Confirmación**: Integración de SweetAlert2 con desenfoque de fondo al entregar prácticas.
* [x] **Limpieza del Repositorio**: Eliminación de scripts temporales de desarrollo (`scratch/`).

### 2.2. Tareas Pendientes (ToDo)
* [ ] **Esquemas de Validación (Integridad de Datos)**: Incorporar validación estricta de esquemas (usando librerías como `Zod`) para comprobar las respuestas de las APIs y parámetros del backend antes de ser consumidos, aumentando la robustez ante la falta de tipado estático en JavaScript.
* [ ] **Control de Copiado (Prevención de Plagio)**: Bloquear el copiado y pegado (eventos `Ctrl+C`, `Ctrl+V`, `Cmd+V`) y deshabilitar el menú contextual (clic derecho) dentro de la consola del editor de código SQL de la práctica del estudiante.
* [ ] **Ruta Administrativa Global**: Desarrollar la vista `/admin` exclusiva para usuarios con rol `admin` para permitir el monitoreo de métricas analíticas del sistema y control general de perfiles de docentes.
* [ ] **Vista Post-Archivo**: Crear la redirección y vista del panel principal para alumnos una vez que su laboratorio de base de datos ha sido archivado por el docente.
* [ ] **Notificaciones Automáticas**: Implementación de envíos de alertas automatizadas o correos electrónicos si las entregas están próximas a vencer.
