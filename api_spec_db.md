# Contrato de API y Especificacion del Sistema (API Specification)

Este documento contiene la especificacion completa de los endpoints expuestos por el backend de Q-LIT, los contratos de datos, codigos de estado HTTP y la relacion con el modelo de base de datos.

---

## 1. Arquitectura de Seguridad y BFF (Backend-For-Frontend)

El backend de Q-LIT (alojado en Railway) no acepta peticiones directas de usuarios sin validar. En su lugar, utiliza el patron **BFF (Backend-For-Frontend)**:
1. El cliente (Next.js) realiza solicitudes a `/api/proxy/*`.
2. El Next.js BFF en el frontend valida la sesion y el JWT (NextAuth).
3. Si la sesion es valida, reenvia la solicitud al backend agregando los headers de confianza:
   - `x-api-key`: Llave secreta compartida (`API_SECRET_KEY`).
   - `x-user-id`: ID unico del usuario autenticado.
   - `x-user-role`: Rol del usuario (`docente` o `alumno`).

Todos los endpoints marcados con (BFF Protegido) consumen el middleware `bffAuthMiddleware` para validar la autenticidad del proxy y el usuario.

---

## 2. Endpoints del Sistema

### 2.1. Catalogo e Informacion General

#### GET /api/catalogs
- **Descripcion**: Obtiene la lista de bases de datos de prueba (catalogos) disponibles para las practicas, incluyendo sus tablas y campos.
- **Seguridad**: Publico
- **Respuesta Exitosa (200 OK)**:
  ```json
  [
    {
      "name": "punto_venta_db",
      "tables": [
        {
          "name": "productos",
          "columns": [
            { "field": "id", "type": "INT", "key": "PRI" },
            { "field": "nombre", "type": "VARCHAR(100)", "key": "" }
          ]
        }
      ]
    }
  ]
  ```

#### GET /api/health
- **Descripcion**: Verifica el estado y disponibilidad del servidor de la API.
- **Seguridad**: Publico
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "status": "up",
    "timestamp": "2026-07-03T18:21:10.000Z"
  }
  ```

---

### 2.2. Gestion de Usuarios

#### PUT /api/users/:id/role
- **Descripcion**: Modifica el rol de un usuario (alumno / docente).
- **Seguridad**: Publico (Administrativo)
- **Cuerpo (JSON)**:
  ```json
  {
    "role": "docente"
  }
  ```
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "id": "user_id_123",
    "name": "Nombre Usuario",
    "role": "docente"
  }
  ```

---

### 2.3. Aulas (Classrooms)

#### POST /api/classrooms/join (BFF Protegido)
- **Descripcion**: Permite a un estudiante inscribirse en un aula mediante un codigo de acceso.
- **Cuerpo (JSON)**:
  ```json
  {
    "accessCode": "CODIGO123"
  }
  ```
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "message": "Te has unido al laboratorio exitosamente.",
    "enrollment": {
      "id": "enrollment_id_abc",
      "classroomId": "classroom_id_xyz",
      "userId": "student_id_123"
    }
  }
  ```

#### GET /api/classrooms/student/status (BFF Protegido)
- **Descripcion**: Obtiene el estado de las inscripciones del estudiante autenticado.
- **Respuesta Exitosa (200 OK)**:
  ```json
  [
    {
      "classroomId": "classroom_id_123",
      "isArchived": false
    }
  ]
  ```

#### GET /api/classrooms/student (BFF Protegido)
- **Descripcion**: Lista todas las aulas activas en las que el alumno autenticado esta inscrito.
- **Respuesta Exitosa (200 OK)**:
  ```json
  [
    {
      "id": "classroom_id_123",
      "name": "Bases de Datos I",
      "group": "A",
      "teacher": { "name": "Nombre Docente" }
    }
  ]
  ```

#### POST /api/classrooms/:id/leave (BFF Protegido)
- **Descripcion**: Permite a un estudiante salirse de un laboratorio (aula). Esto archiva su inscripcion de forma logica.
- **Parametros de Ruta**:
  - `id`: ID del aula.
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "message": "Has abandonado el laboratorio."
  }
  ```

#### PATCH /api/classrooms/:id/unarchive-student (BFF Protegido)
- **Descripcion**: Reactiva y desarchiva la inscripcion de un alumno en un laboratorio.
- **Parametros de Ruta**:
  - `id`: ID del aula.
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "message": "Inscripcion reactivada con exito."
  }
  ```

#### GET /api/classrooms (Docente)
- **Descripcion**: Lista las aulas creadas por el docente solicitante.
- **Respuesta Exitosa (200 OK)**:
  ```json
  [
    {
      "id": "classroom_id_123",
      "name": "Bases de Datos II",
      "group": "B",
      "isArchived": false,
      "_count": { "enrollments": 15 }
    }
  ]
  ```

#### GET /api/classrooms/teacher/statistics (Docente)
- **Descripcion**: Retorna las estadisticas agregadas de rendimiento e inscripciones para todos los laboratorios del docente.
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "totalStudents": 45,
    "activeClassrooms": 3,
    "submissionsPendingReview": 5
  }
  ```

#### GET /api/classrooms/teacher/students (Docente)
- **Descripcion**: Obtiene el listado completo de estudiantes inscritos en los laboratorios del docente con su rendimiento promedio.
- **Respuesta Exitosa (200 OK)**:
  ```json
  [
    {
      "id": "student_id_123",
      "name": "Alumno Ejemplo",
      "email": "student@test.com",
      "averageGrade": 85.5
    }
  ]
  ```

#### GET /api/classrooms/:id (Docente/BFF)
- **Descripcion**: Obtiene los detalles de un aula especifica, incluyendo estudiantes inscritos y practicas publicadas.
- **Parametros de Ruta**:
  - `id`: ID del aula.
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "id": "classroom_id_123",
    "name": "Bases de Datos I",
    "group": "A",
    "practices": [],
    "enrollments": []
  }
  ```

#### POST /api/classrooms (Docente)
- **Descripcion**: Crea una nueva aula o laboratorio.
- **Cuerpo (JSON)**:
  ```json
  {
    "name": "Bases de Datos I",
    "group": "A"
  }
  ```
- **Respuesta Exitosa (201 Created)**:
  ```json
  {
    "id": "classroom_id_123",
    "name": "Bases de Datos I",
    "group": "A",
    "accessCode": "XYZ123"
  }
  ```

#### DELETE /api/classrooms/:id (Docente)
- **Descripcion**: Archiva de manera logica un aula (y de forma integrada sus inscripciones mediante stored procedure).
- **Parametros de Ruta**:
  - `id`: ID del aula.
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "message": "Clase archivada correctamente."
  }
  ```

#### PATCH /api/classrooms/:id (Docente)
- **Descripcion**: Actualiza el nombre o grupo de un aula.
- **Parametros de Ruta**:
  - `id`: ID del aula.
- **Cuerpo (JSON)**:
  ```json
  {
    "name": "Nuevo Nombre",
    "group": "Nuevo Grupo"
  }
  ```
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "id": "classroom_id_123",
    "name": "Nuevo Nombre",
    "group": "Nuevo Grupo"
  }
  ```

---

### 2.4. Practicas (Practices)

#### POST /api/practices (BFF Protegido - Docente)
- **Descripcion**: Crea una nueva practica en un aula especifica.
- **Cuerpo (JSON)**:
  ```json
  {
    "title": "Practica 1: SELECT",
    "description": "Aprender a seleccionar datos.",
    "classroomId": "classroom_id_123",
    "totalPoints": 100,
    "deadline": "2026-07-15T23:59:59.000Z",
    "requiredFunctions": { "keywords": ["SELECT", "FROM"], "db": "punto_venta_db" }
  }
  ```

#### GET /api/practices/classroom/:classroomId (BFF Protegido)
- **Descripcion**: Obtiene todas las practicas asociadas a un aula.
- **Parametros de Ruta**:
  - `classroomId`: ID del aula.
- **Respuesta Exitosa (200 OK)**:
  ```json
  [
    {
      "id": "practice_id_123",
      "title": "Practica 1",
      "deadline": "2026-07-15T23:59:59.000Z"
    }
  ]
  ```

#### GET /api/practices/:id (BFF Protegido)
- **Descripcion**: Obtiene el detalle de una practica especifica.
- **Parametros de Ruta**:
  - `id`: ID de la practica.

#### PUT /api/practices/:id (BFF Protegido - Docente)
- **Descripcion**: Actualiza los detalles de una practica.

#### DELETE /api/practices/:id (BFF Protegido - Docente)
- **Descripcion**: Elimina una practica del aula.

#### GET /api/practices/:id/submissions (BFF Protegido - Docente)
- **Descripcion**: Obtiene el listado de entregas realizadas por los estudiantes para esa practica.

#### POST /api/practices/:practiceId/start (BFF Protegido - Estudiante)
- **Descripcion**: Genera de forma dinamica y unica el enunciado y datos (insert) para que el estudiante comience la practica utilizando la IA (Gemini).
- **Parametros de Ruta**:
  - `practiceId`: ID de la practica.
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "data": {
      "id": "submission_id_123",
      "generatedStatement": "{\"historia\":\"Escenario...\",\"pasos\":[{\"step\":1,\"instruction\":\"Selecciona...\",\"expectedConcept\":\"SELECT\"}]}",
      "reviewStatus": "en_progreso"
    }
  }
  ```

#### POST /api/practices/:practiceId/execute (BFF Protegido - Estudiante)
- **Descripcion**: Ejecuta de forma segura en un sandbox MySQL la consulta SQL escrita por el alumno, aislando su impacto y retornando el resultado o error traducido al espanol.
- **Parametros de Ruta**:
  - `practiceId`: ID de la practica.
- **Cuerpo (JSON)**:
  ```json
  {
    "sqlQuery": "SELECT * FROM libros;",
    "activeDb": "libreria_db"
  }
  ```
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "success": true,
      "type": "DQL",
      "message": "Consulta de lectura exitosa.",
      "columns": ["id", "titulo"],
      "rows": [ { "id": 1, "titulo": "Cien anos de soledad" } ]
    }
  }
  ```
- **Respuesta de Error (400 Bad Request)**:
  ```json
  {
    "status": "error",
    "error": {
      "message": "Tienes un error de sintaxis en tu consulta SQL cerca de 'FROMM'.\n\nSugerencia: Revisa que las palabras clave estén bien escritas.",
      "mensaje": "Tienes un error de sintaxis en tu consulta SQL cerca de 'FROMM'.",
      "suggestion": "Revisa que las palabras clave (SELECT, FROM, JOIN, ON, WHERE) estén bien escritas y en el orden correcto.",
      "isAiGenerated": false
    }
  }
  ```

---

### 2.5. Evaluacion y Calificacion

#### POST /api/evaluations (BFF Protegido - Estudiante)
- **Descripcion**: Realiza el envio de la consulta final para revision manual por parte del docente.
- **Cuerpo (JSON)**:
  ```json
  {
    "studentSqlCode": "SELECT * FROM libros;",
    "executionResult": { "rows": [] },
    "submissionId": "submission_id_123"
  }
  ```

#### POST /api/evaluations/step (BFF Protegido - Estudiante)
- **Descripcion**: Evalua el paso actual de la practica usando la IA o el validador local de fallback.
- **Cuerpo (JSON)**:
  ```json
  {
    "submissionId": "submission_id_123",
    "stepIndex": 0,
    "studentSqlCode": "SELECT * FROM libros;",
    "activeDb": "libreria_db"
  }
  ```
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "isCorrect": true,
      "feedback": "¡Excelente, objetivo logrado!",
      "executionResult": { "columns": ["id", "titulo"], "rows": [] }
    }
  }
  ```
- **Respuesta con Fallback Local (IA Offline - 200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "isCorrect": false,
      "feedback": "Lumi (IA) no está respondiendo en este momento (el servicio de Google está temporalmente fuera de línea). Detectamos localmente que tu consulta no incluye el concepto esperado: 'WHERE'.\n\nSugerencia: WHERE se usa para filtrar los registros aplicando condiciones antes de agrupar o mostrar.",
      "executionResult": { "columns": ["id", "titulo"], "rows": [] }
    }
  }
  ```

#### POST /api/evaluations/teacher-grade (Docente)
- **Descripcion**: Confirma la nota asignada manualmente por el docente a una entrega.
- **Cuerpo (JSON)**:
  ```json
  {
    "submissionId": "submission_id_123",
    "manualGrade": 85
  }
  ```

#### POST /api/evaluations/assign-zero (Docente)
- **Descripcion**: Asigna una calificacion de cero (0) de forma automatica a entregas que no cumplieron las condiciones minimas.

---

### 2.6. Admin

#### GET /api/admin/metrics (BFF Protegido)
- **Descripcion**: Retorna las estadisticas globales del sistema.

#### GET /api/admin/teachers (BFF Protegido)
- **Descripcion**: Retorna la lista de docentes registrados en el sistema.
