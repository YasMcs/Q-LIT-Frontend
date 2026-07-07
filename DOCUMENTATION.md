# Documentacion General del Proyecto: Q-LIT

Este documento consolida la especificacion funcional, tecnica, de experiencia de usuario y de base de datos de **Q-LIT (Query Laboratory Interactive Tool)**, una plataforma educativa orientada a la ensenanza y aprendizaje interactivo de consultas SQL.

---

## 1. Documento de Requerimientos de Producto (PRD)

### 1.1. Vision General del Producto
Q-LIT es una plataforma web educativa diseñada bajo una arquitectura orientada a servicios (SOA) que busca revolucionar la ensenanza de SQL. Resuelve la falta de interactividad de los metodos tradicionales permitiendo a los alumnos escribir y ejecutar consultas reales en un entorno seguro (Sandbox) y recibir retroalimentacion automatica e inteligente guiada por Inteligencia Artificial y un traductor local de sintaxis en espanol.

### 1.2. Funcionalidades Exactas del Sistema

#### Modulo de Autenticacion y Seguridad
- **Inicio de Sesion Centralizado**: Autenticacion mediante Google OAuth 2.0.
- **Roles de Acceso**: Distincion estricta entre vistas y permisos de "Docente" y "Alumno".
- **BFF Proxy Interceptor**: Las peticiones del cliente pasan por una ruta proxy local que valida la sesion JWT e inyecta headers seguros antes de reenviarlas al backend.

#### Modulo del Estudiante
- **Catalogo de Laboratorios**: Listado visual de laboratorios activos en los que esta inscrito.
- **Inscripcion Dinamica**: Acceso a nuevos laboratorios ingresando un codigo de invitacion unico.
- **Espacio de Practica (Workspace)**:
  - **Consola de Codigo SQL**: Editor con resaltado de sintaxis.
  - **Diccionario de Entidades**: Panel lateral interactivo que muestra las tablas, columnas y tipos de datos del catalogo activo para ayudar al alumno a escribir sus consultas.
  - **Simulador (SQL Sandbox)**: Ejecucion interactiva de sentencias SELECT, INSERT, UPDATE y DELETE.
  - **Traductor de Errores**: Detector de fallas en espanol que indica la seccion aproximada cerca del error (ej. `near '...'`).
  - **Resolucion Paso a Paso**: Flujo secuencial de objetivos dinamicos que el alumno debe resolver en orden.
  - **Retroalimentacion de Lumi (IA)**: Evaluacion en tiempo real asistida por IA que guia al alumno sin darle la respuesta.

#### Modulo del Docente
- **Gestion de Laboratorios**: Creacion, edicion, eliminacion y archivado de aulas o grupos.
- **Diseño de Practicas**: Publicacion de practicas definiendo:
  - Titulo, descripcion y fecha limite de entrega.
  - Base de datos requerida del catalogo (ej. biblioteca, tienda_online, universidad).
  - Palabras clave y funciones obligatorias (ej. SELECT, WHERE, JOIN, GROUP BY).
- **Dashboard Analitico y Estadisticas**:
  - Graficos de promedio de notas generales y rendimiento grupal.
  - **Temas Criticos**: Listado estadistico de las clausulas y conceptos SQL donde el grupo comete mas errores.
  - **Rendimiento de Estudiantes**: Lista de alumnos inscritos con su promedio de calificaciones e historial de intentos.
- **Revision y Calificacion Hibrida**:
  - Visualizacion paso a paso de las consultas SQL enviadas por el estudiante.
  - Estadisticas de reincidencia de errores por paso.
  - Calificacion numerica libre (mayor a 0) asignada manualmente por el docente.

---

## 2. Documento de Requerimientos Tecnicos (TRD)

### 2.1. Arquitectura de Software
Q-LIT opera bajo un patron de arquitectura desacoplada en tres capas principales:
1. **Cliente / BFF (Next.js)**: Maneja la interfaz de usuario y actua como intermediario seguro (Backend-For-Frontend) para validar sesiones JWT antes de enviar solicitudes al backend, evitando la exposicion de credenciales y resolviendo problemas de CORS.
2. **Servidor API (Express.js)**: Expone endpoints rest protegidos por tokens, implementa rate limiters y se comunica con la base de datos principal y el sandbox.
3. **Motores de Datos e IA**: PostgreSQL para la persistencia del sistema, MySQL para simular y ejecutar consultas en el sandbox, y Google Gemini API para evaluar la logica SQL de los alumnos.

### 2.2. Stack Tecnologico y Librerias

#### Capa de Frontend
- **Framework**: Next.js 14+ (App Router).
- **Libreria Core**: React 18.
- **Autenticacion**: NextAuth.js (v4) configurado con Google Provider y estrategia de sesion JWT.
- **Estilos**: CSS3 Puro (Vanilla CSS). Sin TailwindCSS para garantizar control absoluto del diseño y animaciones.

#### Capa de Backend
- **Framework**: Express.js corriendo en Node.js.
- **ORM**: Prisma ORM (v5.22.0) utilizando el cliente de Prisma.
- **Seguridad**:
  - `helmet`: Configuracion automatica de cabeceras HTTP seguras.
  - `cors`: Control de origenes permitidos (localhost, q-lit.online, www.q-lit.online).
  - `express-rate-limit`: Limite de 1000 peticiones cada 15 min por usuario (identificado por `x-user-id` y con fallback a IP), y limite de 150 evaluaciones/hora en rutas de evaluacion para proteger el consumo de la IA.
- **Comunicacion de Datos**: `mysql2/promise` para la comunicacion directa con el Sandbox.
- **IA**: `@google/genai` para instanciar el cliente del modelo `gemini-2.5-flash`.

---

## 3. Diseno UI/UX e Interfaz de Usuario

### 3.1. Apariencia y Estilo Visual
Q-LIT adopta una estética oscura premium ("Dark Mode") inspirada en consolas de programacion profesionales y entornos de aprendizaje interactivos modernos:
- **Colores de Fondo**: Tonos oscuros intensos (negros, grises carbon) que reducen la fatiga ocular durante sesiones largas de programacion.
- **Colores de Acento**: Tonos neones y degradados (morado brillante, azul electrico y detalles en verde menta para aciertos y rojo coral para advertencias).
- **Tipografia**: Uso de tipografias sans-serif modernas de Google Fonts (como Outfit e Inter) junto con fuentes monoespaciadas para los bloques de codigo SQL.
- **Sin Emojis**: De acuerdo con las guias de diseño del repositorio, toda la interfaz, mensajes del sistema y textos de evaluacion evitan el uso de emojis para proyectar un entorno profesional y limpio.

### 3.2. Pantallas Principales
1. **Login**: Pantalla minimalista con fondo degradado animado y boton central de acceso unico via Google Account.
2. **Dashboard Docente**:
   - **Vista de Laboratorios**: Tarjetas elegantes que muestran el nombre del laboratorio, grupo/seccion, codigo de acceso, numero de alumnos y entregas pendientes de calificar.
   - **Estadisticas**: Graficos analiticos interactivos de rendimiento y un panel lateral que destaca los conceptos criticos que requieren reforzamiento en clase.
   - **Feed de Laboratorio**: Muro del laboratorio con listado de practicas publicadas y listado de alumnos inscritos.
3. **Workspace de Alumno (Laboratorio Activo)**:
   - **Pantalla Dividida (Split View)**:
     - *Izquierda*: Panel del Diccionario de Entidades para consulta rapida del esquema de la BD.
     - *Centro*: Editor de codigo SQL interactivo con boton de ejecucion, y debajo la cuadricula (Grid) que muestra las columnas y registros retornados.
     - *Derecha*: Listado de objetivos del paso actual, la barra de progreso secuencial y el panel de retroalimentacion Lumi (IA) en color rojo/verde segun el resultado.

---

## 4. Flujo de la Aplicacion (User Journeys)

### 4.1. Flujo del Estudiante (Recorrido de Aprendizaje)
```text
[Inicio Sesión con Google] -> [Dashboard Principal (Ver Laboratorios)]
                                      |
         +----------------------------+----------------------------+
         |                                                         |
[Unirse a Laboratorio por Código]                       [Seleccionar Laboratorio Activo]
         |                                                         |
         +----------------------------+----------------------------+
                                      v
                      [Seleccionar Práctica Publicada]
                                      |
                                      v
                       [Paso 1: Leer Objetivo Narrativo]
                                      |
                                      v
                   [Escribir y Ejecutar SQL en Sandbox]
                                      |
                 +--------------------+--------------------+
                 |                                         |
         (Error de Sintaxis)                       (Ejecución Exitosa)
                 |                                         |
     [Ver Error Traducido]                       [Evaluar con IA/Local]
                 |                                         |
                 v                                  +------+------+
     [Corregir y Re-ejecutar]                       |             |
                                               (Incorrecto)   (Correcto)
                                                    |             |
                                        [Recibir Pistas]    [Avanzar a Paso 2]
                                                    |             |
                                                    v             v
                                             [Corregir SQL]  [Enviar Práctica]
```

### 4.2. Flujo del Docente (Recorrido del Administrador)
```text
[Inicio Sesión con Google] -> [Dashboard Principal (Mis Laboratorios)]
                                      |
         +----------------------------+----------------------------+
         |                                                         |
[Crear Nuevo Laboratorio]                             [Seleccionar Laboratorio Activo]
         |                                                         |
   (Genera Código de Acceso)                       +---------------+---------------+
                                                   |                               |
                                         [Crear Nueva Práctica]        [Ver Estadísticas y Alumnos]
                                                   |                               |
                                      (Define BD y Palabras Clave)     [Ver Temas Críticos del Grupo]
                                                   |                               |
                                                   v                               v
                                        [Publicar al Alumno]         [Calificar Entregas Manualmente]
```

---

## 5. Esquema de Base de Datos y Requerimientos de Proyecto Integrador

La base de datos principal de Q-LIT esta modelada en Prisma ORM y se ejecuta en PostgreSQL. Adicionalmente, cuenta con objetos avanzados en la base de datos para cumplir con los requerimientos exigidos en la materia de Base de Datos.

### 5.1. Modelado Fisico de Datos (Prisma Models)
* **`User`**: Almacena credenciales de usuario, nombre, email, imagen de perfil de Google y su rol en la plataforma (`student` o `teacher`).
* **`Classroom`**: Estructura del laboratorio, incluye titulo, grupo, codigo de acceso e indexacion por `teacherId` e `isArchived`.
* **`Enrollment`**: Registra la asociacion de alumnos y docentes de apoyo a las aulas, con un indice unico para prevenir duplicaciones.
* **`Practice`**: Almacena los parametros de la practica (titulo, descripcion, puntaje, fecha limite y configuraciones JSON de palabras clave y base de datos simulada).
* **`ChecklistItem`**: Criterios de evaluacion definidos para la calificacion de la practica.
* **`Submission`**: Controla el estado general del intento del alumno, la fecha de envio, la calificacion asignada por el docente y almacena el enunciado y setup SQL unico generado para el alumno.
* **`SubmissionStep`**: Registra el progreso paso a paso de la resolucion de la practica por parte del alumno, incluyendo el codigo final de exito y el JSON de logs de errores cometidos en el paso.
* **`PracticeErrorLog`**: Registro individual de cada error cometido por el alumno en la consola SQL, utilizado para el desglose analitico de Temas Criticos.

---

### 5.2. Cumplimiento de los Requerimientos del Proyecto Integrador (SQL Avanzado)

#### 1. Dos Consultas usando variantes de JOIN en la APP
- **Consulta 1 (Join de Calificaciones)**: Une `Submission`, `User` y `Practice` para listar el expediente de calificaciones del docente.
- **Consulta 2 (Join de Inscripcion)**: Une `Enrollment`, `User` y `Classroom` para listar los estudiantes de un laboratorio especifico.

#### 2. Dos Vistas (VIEWS) creadas y consumidas en la APP
- **Vista 1 (`v_student_grades`)**: Consolida la informacion academica del estudiante, uniendo alumnos, laboratorios y calificaciones finales.
- **Vista 2 (`v_classroom_stats`)**: Calcula metricas agregadas por laboratorio (estudiantes inscritos, total de entregas y nota promedio).
- *Consumo*: Ejecutado dinamicamente desde Express utilizando `prisma.$queryRawUnsafe("SELECT * FROM v_student_grades")`.

#### 3. Dos Indices creados para busquedas y ordenamiento
- **Indice 1 (`Classroom_teacherId_idx` / `Classroom_isArchived_idx`)**: Optimiza la busqueda de aulas activas e inactivas de un docente.
- **Indice 2 (`PracticeErrorLog_userId_idx` / `PracticeErrorLog_practiceId_idx`)**: Optimiza el agrupamiento y analisis estadistico del historial de errores del alumno.

#### 4. Dos Funciones Almacenadas (STORED FUNCTIONS)
- **Funcion 1 (`fn_get_student_average`)**: Recibe el UUID del alumno y calcula su calificacion promedio ponderada general de entregas.
- **Funcion 2 (`fn_get_error_count`)**: Recibe el UUID del alumno y cuenta el numero total de errores registrados en sus intentos.
- *Consumo*: Consumido mediante `prisma.$queryRaw` SELECT fn_get_student_average(${id})`.

#### 5. Dos Procedimientos Almacenados (STORED PROCEDURES)
- **Procedimiento 1 (`sp_archive_classroom`)**: Realiza una transaccion masiva para archivar el laboratorio y todas las inscripciones asociadas a el de forma automatica en una sola operacion.
- **Procedimiento 2 (`sp_clean_old_error_logs`)**: Procedimiento administrativo para eliminar logs de errores mas antiguos a N dias.
- *Consumo*: Ejecutado mediante `prisma.$queryRaw` CALL sp_archive_classroom(${classId})`.

#### 6. Seguridad y Administracion de Base de Datos
- **Conexion de Usuario Dueno**: El backend de Q-LIT se conecta a PostgreSQL y MySQL con credenciales de usuario propietario con privilegios especificos en lugar de utilizar el superusuario administrador `root`.
- **Roles y Privilegios**: Se configuran los roles `rol_docente` (privilegios SELECT, INSERT, UPDATE, DELETE sobre laboratorios y calificaciones) y `rol_alumno` (SELECT limitado en practicas, INSERT/UPDATE sobre entregas y logs de errores).
