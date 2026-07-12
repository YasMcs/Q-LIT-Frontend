# Especificación del Contrato de API (API Specification)

Este documento detalla exhaustivamente todos los endpoints REST expuestos por el servidor backend de **Q-LIT**, incluyendo requerimientos de seguridad, parámetros de entrada, estructuras JSON de salida y el manejo de códigos de estado HTTP.

---

## 1. Cabeceras de Autorización y Flujo BFF

El backend de Q-LIT no se expone al cliente directo para evitar ataques maliciosos o el robo de credenciales. Toda la comunicación pasa a través del proxy del Frontend (BFF). El BFF intercepta y valida la sesión y, tras verificarla, inyecta las siguientes cabeceras en cada solicitud dirigida al backend:

| Cabecera | Descripción | Requerido | Valor de Ejemplo |
| :--- | :--- | :--- | :--- |
| `x-api-key` | Llave secreta simétrica compartida entre el BFF y el Backend para autenticar el origen de confianza. | Sí (en endpoints protegidos) | `api-secret-key-12345` |
| `x-user-id` | Identificador único (UUID/CUID) del usuario autenticado en la base de datos. | Sí (en endpoints protegidos) | `cmrh4zl0z006fvx11iblybpnc` |
| `x-user-role` | Rol asignado al usuario. Controla los accesos administrativos del backend. | Sí (en endpoints protegidos) | `student` o `teacher` |

Si una petición no contiene el encabezado `x-api-key` correcto, el middleware `bffAuthMiddleware` rechazará la petición de inmediato con un código `401 Unauthorized`.

---

## 2. Endpoints del Sistema

### 2.1. Catálogos e Información General

#### `GET /api/catalogs`
* **Descripción**: Obtiene la lista de bases de datos de prueba disponibles para las prácticas en el editor SQL, incluyendo la descripción completa de las tablas, columnas, tipos de datos y llaves primarias.
* **Seguridad**: Público.
* **Respuesta Exitosa (200 OK)**:
  ```json
  [
    {
      "name": "clinica_medica",
      "tables": [
        {
          "name": "pacientes",
          "columns": [
            { "field": "id", "type": "INT", "key": "PRI" },
            { "field": "nombre", "type": "VARCHAR(100)", "key": "" },
            { "field": "fecha_nacimiento", "type": "DATE", "key": "" }
          ]
        },
        {
          "name": "citas",
          "columns": [
            { "field": "id", "type": "INT", "key": "PRI" },
            { "field": "paciente_id", "type": "INT", "key": "" },
            { "field": "fecha", "type": "DATETIME", "key": "" }
          ]
        }
      ]
    }
  ]
  ```

#### `GET /api/health`
* **Descripción**: Verifica el estado actual y disponibilidad de la API y de los servidores del backend.
* **Seguridad**: Público.
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "status": "up",
    "timestamp": "2026-07-12T14:18:00.000Z"
  }
  ```

---

### 2.2. Gestión de Usuarios

#### `PUT /api/users/:id/role`
* **Descripción**: Permite modificar el rol administrativo de un usuario específico.
* **Seguridad**: Público (Ruta administrativa protegida a nivel interno).
* **Parámetros de Ruta**:
  * `id`: ID único del usuario a modificar.
* **Cuerpo de Petición (JSON)**:
  ```json
  {
    "role": "teacher"
  }
  ```
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "id": "cmrh4zl0z006fvx11iblybpnc",
    "name": "Santos Enoch",
    "email": "student@uabcs.mx",
    "role": "teacher"
  }
  ```

---

### 2.3. Laboratorios y Aulas (Classrooms)

#### `POST /api/classrooms`
* **Descripción**: Crea una nueva aula o laboratorio docente. Genera automáticamente un código único de 6 caracteres alfanuméricos para la inscripción de estudiantes.
* **Seguridad**: BFF Protegido (Rol requerido: `teacher` en cabeceras).
* **Cuerpo de Petición (JSON)**:
  ```json
  {
    "name": "Bases de Datos Avanzadas",
    "group": "IDS-4A"
  }
  ```
* **Respuesta Exitosa (201 Created)**:
  ```json
  {
    "id": "cly12345abcde67890fghij",
    "name": "Bases de Datos Avanzadas",
    "group": "IDS-4A",
    "inviteCode": "BDX984",
    "teacherId": "cmrh4zl0z006fvx11iblybpnc"
  }
  ```

#### `GET /api/classrooms`
* **Descripción**: Lista las aulas creadas por el docente solicitante (determinado por el header `x-user-id`).
* **Seguridad**: BFF Protegido (Rol: `teacher`).
* **Respuesta Exitosa (200 OK)**:
  ```json
  [
    {
      "id": "cly12345abcde67890fghij",
      "name": "Bases de Datos Avanzadas",
      "group": "IDS-4A",
      "inviteCode": "BDX984",
      "isArchived": false,
      "createdAt": "2026-07-01T12:00:00.000Z",
      "_count": {
        "enrollments": 24
      }
    }
  ]
  ```

#### `GET /api/classrooms/:id`
* **Descripción**: Obtiene el detalle de un aula, listando los estudiantes actualmente inscritos y las prácticas asignadas.
* **Seguridad**: BFF Protegido.
* **Parámetros de Ruta**:
  * `id`: ID único del aula.
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "id": "cly12345abcde67890fghij",
    "name": "Bases de Datos Avanzadas",
    "group": "IDS-4A",
    "inviteCode": "BDX984",
    "isArchived": false,
    "enrollments": [
      {
        "id": "enroll_123",
        "user": {
          "id": "student_99",
          "name": "Luis Pérez",
          "email": "luis@student.com"
        }
      }
    ],
    "practices": [
      {
        "id": "pract_88",
        "title": "Práctica 1: SELECT con condiciones",
        "deadline": "2026-07-20T23:59:59.000Z"
      }
    ]
  }
  ```

#### `PATCH /api/classrooms/:id`
* **Descripción**: Actualiza los metadatos de un aula (nombre o grupo).
* **Seguridad**: BFF Protegido (Rol: `teacher`).
* **Cuerpo de Petición (JSON)**:
  ```json
  {
    "name": "Bases de Datos II (Actualizado)",
    "group": "IDS-4B"
  }
  ```
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "id": "cly12345abcde67890fghij",
    "name": "Bases de Datos II (Actualizado)",
    "group": "IDS-4B"
  }
  ```

#### `DELETE /api/classrooms/:id`
* **Descripción**: Archiva de forma lógica una clase y todas sus inscripciones asociadas mediante la invocación del procedimiento almacenado `sp_archive_classroom`.
* **Seguridad**: BFF Protegido (Rol: `teacher`).
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "message": "Clase archivada correctamente."
  }
  ```

#### `POST /api/classrooms/join`
* **Descripción**: Inscribe al estudiante logueado a un aula mediante el código de acceso proporcionado por el docente.
* **Seguridad**: BFF Protegido (Rol: `student`).
* **Cuerpo de Petición (JSON)**:
  ```json
  {
    "inviteCode": "BDX984"
  }
  ```
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "message": "Te has unido al laboratorio exitosamente.",
    "enrollment": {
      "id": "enroll_123",
      "classroomId": "cly12345abcde67890fghij",
      "userId": "student_99"
    }
  }
  ```

#### `GET /api/classrooms/student`
* **Descripción**: Retorna la lista de laboratorios activos en los que el estudiante autenticado se encuentra inscrito.
* **Seguridad**: BFF Protegido (Rol: `student`).
* **Respuesta Exitosa (200 OK)**:
  ```json
  [
    {
      "id": "cly12345abcde67890fghij",
      "name": "Bases de Datos Avanzadas",
      "group": "IDS-4A",
      "teacher": {
        "name": "Santos Enoch"
      }
    }
  ]
  ```

---

### 2.4. Gestión de Prácticas (Practices)

#### `POST /api/practices`
* **Descripción**: Crea una nueva práctica de base de datos asociada a un aula.
* **Seguridad**: BFF Protegido (Rol: `teacher`).
* **Cuerpo de Petición (JSON)**:
  ```json
  {
    "title": "Práctica de Consultas Anidadas",
    "description": "Obtener los clientes con compras superiores al promedio general.",
    "classroomId": "cly12345abcde67890fghij",
    "totalPoints": 100,
    "deadline": "2026-08-01T12:00:00.000Z",
    "requiredFunctions": ["SELECT", "WHERE", "JOIN", "AVG"]
  }
  ```
* **Respuesta Exitosa (201 Created)**:
  ```json
  {
    "id": "practice_uuid_888",
    "title": "Práctica de Consultas Anidadas",
    "totalPoints": 100
  }
  ```

#### `POST /api/practices/:practiceId/start`
* **Descripción**: Inicializa la práctica para el alumno. Llama a la IA para generar el escenario narrativo (historia), los 3 a 4 objetivos de resolución lógica y el script de inserción DML (`setupSql`) correspondiente. Si la submission ya existe, simplemente retorna el estado actual de la misma.
* **Seguridad**: BFF Protegido (Rol: `student`).
* **Parámetros de Ruta**:
  * `practiceId`: ID único de la práctica a iniciar.
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "id": "sub_987",
    "currentStep": 0,
    "reviewStatus": "en_progreso",
    "generatedStatement": "{\"historia\":\"El hospital general requiere una auditoría...\",\"pasos\":[{\"step\":1,\"instruction\":\"Consulta los datos del médico llamado 'Arturo López'.\",\"expectedConcept\":\"SELECT\"},{\"step\":2,\"instruction\":\"Lista las citas registradas de dicho médico filtrando las del mes actual.\",\"expectedConcept\":\"WHERE\"},{\"step\":3,\"instruction\":\"Une ambas tablas para obtener el nombre del médico y de su paciente.\",\"expectedConcept\":\"JOIN\"}]}"
  }
  ```

#### `POST /api/practices/:practiceId/execute`
* **Descripción**: Ejecuta de forma transaccional una consulta SQL escrita por el alumno dentro de la base de datos sandbox limpia MySQL, aplicando rollback automático al finalizar.
* **Seguridad**: BFF Protegido (Rol: `student`).
* **Cuerpo de Petición (JSON)**:
  ```json
  {
    "sqlQuery": "SELECT * FROM medicos WHERE nombre = 'Arturo López';",
    "activeDb": "clinica_medica"
  }
  ```
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "success": true,
    "type": "DQL",
    "message": "Consulta de lectura exitosa.",
    "columns": ["id", "nombre", "especialidad"],
    "rows": [
      { "id": 5, "nombre": "Arturo López", "especialidad": "Pediatría" }
    ]
  }
  ```
* **Respuesta de Error de Sintaxis (400 Bad Request)**:
  ```json
  {
    "status": "error",
    "error": {
      "message": "Tienes un error de sintaxis en tu consulta SQL cerca de 'WHER nombre = 'Arturo López''.\n\nSugerencia: Revisa que las palabras clave de filtrado estén correctamente escritas.",
      "isAiGenerated": false
    }
  }
  ```

---

### 2.5. Evaluaciones y Calificaciones

#### `POST /api/evaluations/step`
* **Descripción**: Evalúa de manera progresiva si la consulta SQL escrita por el alumno cumple con las restricciones y el objetivo planteado en el paso actual del enunciado. Si se supera el paso, avanza el progreso. Utiliza el motor de OpenAI y cuenta con un validador local de fallback.
* **Seguridad**: BFF Protegido (Rol: `student`).
* **Cuerpo de Petición (JSON)**:
  ```json
  {
    "submissionId": "sub_987",
    "stepIndex": 0,
    "studentSqlCode": "SELECT * FROM medicos WHERE nombre = 'Arturo López';",
    "activeDb": "clinica_medica"
  }
  ```
* **Respuesta Exitosa (200 OK - Aprobado)**:
  ```json
  {
    "status": "success",
    "data": {
      "isCorrect": true,
      "feedback": "¡Excelente! Has obtenido la información correcta del médico Arturo López.",
      "executionResult": {
        "columns": ["id", "nombre", "especialidad"],
        "rows": [{ "id": 5, "nombre": "Arturo López", "especialidad": "Pediatría" }]
      }
    }
  }
  ```

#### `POST /api/evaluations`
* **Descripción**: Finaliza y entrega la práctica para su revisión formal y asignación de nota por parte del docente. Bloquea el editor para el alumno.
* **Seguridad**: BFF Protegido (Rol: `student`).
* **Cuerpo de Petición (JSON)**:
  ```json
  {
    "submissionId": "sub_987",
    "studentSqlCode": "SELECT * FROM medicos JOIN citas ON medicos.id = citas.medico_id WHERE medicos.nombre = 'Arturo López';",
    "executionResult": { "columns": ["medico", "paciente"], "rows": [] }
  }
  ```
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "message": "Práctica entregada con éxito."
  }
  ```

#### `POST /api/evaluations/teacher-grade`
* **Descripción**: Permite al docente calificar manualmente una entrega, asignando una puntuación libre (mayor a 0).
* **Seguridad**: BFF Protegido (Rol: `teacher`).
* **Cuerpo de Petición (JSON)**:
  ```json
  {
    "submissionId": "sub_987",
    "manualGrade": 90.0
  }
  ```
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "message": "Calificación asignada correctamente.",
    "submission": {
      "id": "sub_987",
      "finalGrade": 90.0,
      "reviewStatus": "calificada"
    }
  }
  ```
