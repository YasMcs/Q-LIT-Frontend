# Convenciones de Desarrollo, Uso de IA y Backlog del Proyecto

Este documento consolida la declaración de uso de Inteligencia Artificial para el desarrollo de la aplicación, el reglamento y la guía de commits para el equipo de desarrollo, los estándares de diseño de la interfaz y el backlog o plan de trabajo de **Q-LIT**.

---

## 1. Declaración de Uso de IA en el Desarrollo de la Aplicación

En cumplimiento con las políticas de honestidad académica y desarrollo de software del proyecto integrador, el equipo documenta formalmente el uso de **Inteligencia Artificial** como herramienta de soporte técnico durante la codificación del sistema:

* **Asistente de Pair Programming**: Se utilizaron herramientas basadas en modelos de lenguaje de gran tamaño (como Gemini y Antigravity) como copilotos de programación para acelerar la estructuración de la aplicación.
* **Componentes de Interfaz**: La IA asistió en la maquetación de la base de componentes de React (como modales de creación de clases, formularios, toggles de tema y selectores personalizados), los cuales posteriormente fueron adaptados y modificados en base al diseño visual nativo del equipo.
* **Consultas de Base de Datos**: Apoyó en la optimización de las sentencias del Prisma Client para interactuar con la base de datos relacional PostgreSQL, asegurando la inclusión correcta de relaciones y transacciones.
* **Módulos de Seguridad y Documentación**: Asistió en la configuración base de librerías de infraestructura como `helmet` y `express-rate-limit`, así como en la estructuración preliminar de los archivos Markdown de documentación del proyecto.

> [!NOTE]
> Toda la lógica de negocio final, el modelado relacional de las entidades, la integración de APIs, la experiencia de usuario y las pruebas del software fueron validadas, corregidas e implementadas por los estudiantes integrantes del equipo desarrollador, lo cual se ve respaldado en el historial completo de commits del proyecto.

---

## 2. Reglamento de Commits y Guía del Equipo de Desarrollo

Para mantener un historial de cambios (Git log) claro, legible y estandarizado, todos los desarrolladores deben seguir la convención de **Commits Semánticos en Español**. Cada commit debe comenzar con un prefijo que describa el tipo de cambio, seguido de dos puntos y una descripción clara y breve en minúsculas.

### Tabla de Equivalencia de Commits

| Tipo de Commit (Español) | Equivalente Conventional Commits | Cuándo Usarlo | Ejemplo |
| :--- | :--- | :--- | :--- |
| **`característica:`** | `feat` | Cuando se introduce una nueva funcionalidad al sistema (nuevo endpoint, nueva vista, componente reactivo). | `git commit -m "característica: agregar vista de historial de entregas para docentes"` |
| **`corrección:`** | `fix` | Para corregir un error de lógica, bug en el código, excepción en el servidor o mal comportamiento de la UI. | `git commit -m "corrección: ajustar cálculo de calificaciones para omitir submissions no entregadas"` |
| **`documentación:`** | `docs` | Cambios exclusivos en archivos de documentación del proyecto (README, archivos `.md` en `/docs`, comentarios extensos de JSDoc). | `git commit -m "documentación: crear guía de API y esquemas JSON"` |
| **`estilo:`** | `style` | Cambios que no alteran la lógica del código, relacionados con formateo (espaciado, comas, estilos CSS puros, layouts). | `git commit -m "estilo: ajustar scrollbar en modo oscuro y efectos de cristal en modales"` |
| **`refactorización:`** | `refactor` | Reestructuración de código existente para mejorar legibilidad o rendimiento, sin añadir funciones ni arreglar bugs. | `git commit -m "refactorización: simplificar lógica de conversión de esquemas en ai service"` |
| **`prueba:`** | `test` | Añadir o modificar scripts de pruebas automatizadas (tests unitarios, mocks o archivos de prueba locales). | `git commit -m "prueba: agregar script de simulación de consultas en sandbox"` |
| **`tarea:`** | `chore` | Actualizaciones en dependencias (npm installs), configuraciones del build, cambios en archivos `.gitignore` u otras herramientas auxiliares. | `git commit -m "tarea: actualizar prisma client a v5.22.0 y agregar helmet"` |

---

## 3. Reglamento de Diseño de Interfaz y UI

* **Prohibición de Emojis**: Con el objetivo de proyectar una plataforma académica e institucional sumamente limpia y profesional, se prohíbe terminantemente el uso de emojis dentro de los componentes React, textos informativos, botones y alertas de la UI.
* **Uso Exclusivo de Vanilla CSS**: No se permite el uso de TailwindCSS ni librerías de estilos prefabricadas en las nuevas vistas del cliente. Todo el diseño y las animaciones deben implementarse en los archivos CSS nativos utilizando variables y tokens CSS coherentes.
* **Estética Oscura Premium (Dark Mode)**: El diseño visual debe mantener colores de fondo oscuros profundos y colores neón elegantes para los acentos de la interfaz (morados, azules eléctricos, verdes menta para aciertos y rojos coral para errores).

---

## 4. Backlog y Plan de Trabajo (Roadmap)

### 4.1. Tareas Completadas (Done)
* [x] **Autenticación Social**: Implementación completa de NextAuth con Google Provider.
* [x] **Arquitectura BFF**: Creación del Proxy Interceptor de Next.js redirigiendo al servidor de Express.
* [x] **Seguridad de la API**: Configuración de cabeceras seguras con Helmet y limitadores de tasa por usuario (Rate Limiting).
* [x] **SQL Sandbox**: Ejecución de consultas de alumno en transacciones aisladas MySQL aplicando `connection.rollback()`.
* [x] **Prompt de Generación**: Actualización del prompt del evaluador en `gemini.service.js` para forzar la creación de exactamente 3 a 4 objetivos lógicos y coherentes.
* [x] **Alertas de Confirmación**: Integración de SweetAlert2 con desenfoque de fondo al entregar prácticas.
* [x] **Limpieza del Repositorio**: Eliminación de scripts temporales de desarrollo (`scratch/`).

### 4.2. Tareas Pendientes (ToDo)
* [ ] **Esquemas de Validación (Integridad de Datos)**: Incorporar validación estricta de esquemas (usando librerías como `Zod`) para comprobar las respuestas de las APIs y parámetros del backend antes de ser consumidos, aumentando la robustez ante la falta de tipado estático en JavaScript.
* [ ] **Control de Copiado (Prevención de Plagio)**: Bloquear el copiado y pegado (eventos `Ctrl+C`, `Ctrl+V`, `Cmd+V`) y deshabilitar el menú contextual (clic derecho) dentro de la consola del editor de código SQL de la práctica del estudiante.
* [ ] **Ruta Administrativa Global**: Desarrollar la vista `/admin` exclusiva para usuarios con rol `admin` para permitir el monitoreo de métricas analíticas del sistema y control general de perfiles de docentes.
* [ ] **Vista Post-Archivo**: Crear la redirección y vista del panel principal para alumnos una vez que su laboratorio de base de datos ha sido archivado por el docente.
* [ ] **Notificaciones Automáticas**: Implementación de envíos de alertas automatizadas o correos electrónicos si las entregas están próximas a vencer.
