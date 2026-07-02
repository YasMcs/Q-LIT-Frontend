# Justificación Técnica: Requerimientos de Bases de Datos Avanzadas
## Proyecto Integrador (Q-LIT)

Este documento detalla cómo nuestra aplicación **Q-LIT** cumple de forma estricta con todos los requerimientos mínimos de base de datos solicitados para el Proyecto Integrador.

---

### I. Requerimientos de Programación en la Base de Datos

#### 1. Dos Consultas usando variantes de JOIN en la APP
**Cómo se cumple:**
En el backend, las consultas que generan reportes de calificaciones y estadísticas integran múltiples tablas clave. Prisma traduce estas consultas automáticamente a sentencias SQL utilizando `INNER JOIN` y `LEFT JOIN`.
* **Consulta 1 (Join de Calificaciones):** Une las tablas `Submission`, `User` y `Practice` para listar el nombre del alumno, título de la práctica y calificación final.
* **Consulta 2 (Join de Inscripción):** Une `Enrollment`, `User` y `Classroom` para listar los estudiantes inscritos en un laboratorio docente.

*Ejemplo de traducción SQL que ejecuta la app:*
```sql
SELECT s.id, u.name, p.title, s.final_grade 
FROM "Submission" s
JOIN "User" u ON s.user_id = u.id
JOIN "Practice" p ON s.practice_id = p.id;
```

---

#### 2. Dos Vistas (VIEWS) creadas y consumidas en la APP
**Cómo se cumple:**
Diseñamos e implementamos dos vistas en nuestra base de datos PostgreSQL para consolidar reportes complejos y simplificar las consultas del backend:

* **Vista 1 (`v_student_grades`):** Consolida el expediente académico de los alumnos, uniendo alumnos, laboratorios y calificaciones finales.
  ```sql
  CREATE OR REPLACE VIEW v_student_grades AS
  SELECT 
      u.id AS student_id,
      u.name AS student_name,
      u.email AS student_email,
      p.id AS practice_id,
      p.title AS practice_title,
      c.name AS classroom_name,
      s.final_grade AS final_grade,
      s.review_status AS status
  FROM "User" u
  JOIN "Submission" s ON u.id = s.user_id
  JOIN "Practice" p ON s.practice_id = p.id
  JOIN "Classroom" c ON p.classroom_id = c.id;
  ```

* **Vista 2 (`v_classroom_stats`):** Calcula métricas agregadas por laboratorio (número de estudiantes, entregas y promedio de notas).
  ```sql
  CREATE OR REPLACE VIEW v_classroom_stats AS
  SELECT 
      c.id AS classroom_id,
      c.name AS classroom_name,
      c.group AS classroom_group,
      COUNT(distinct e.user_id) AS enrolled_students,
      COUNT(distinct s.id) AS total_submissions,
      AVG(s.final_grade) AS average_grade
  FROM "Classroom" c
  LEFT JOIN "Enrollment" e ON c.id = e.classroom_id
  LEFT JOIN "Practice" p ON c.id = p.classroom_id
  LEFT JOIN "Submission" s ON p.id = s.practice_id
  GROUP BY c.id, c.name, c.group;
  ```

*Consumo desde la APP:*
Se consumen mediante la ejecución de sentencias directas en Node.js:
`await prisma.$queryRaw`SELECT * FROM v_student_grades;`

---

#### 3. Dos Índices creados para búsquedas y ordenamiento
**Cómo se cumple:**
Nuestra base de datos en `schema.prisma` define índices específicos (`@@index`) para optimizar la velocidad de respuesta en los filtros y ordenaciones del docente:

* **Índice 1 (Filtro de Laboratorios):** Optimiza las búsquedas del dashboard del docente y la distinción de archivados.
  ```sql
  CREATE INDEX "Classroom_teacherId_idx" ON "Classroom"("teacherId");
  CREATE INDEX "Classroom_isArchived_idx" ON "Classroom"("isArchived");
  ```
* **Índice 2 (Historial de Errores):** Acelera el ordenamiento y carga de los Temas Críticos y logs de errores del alumno.
  ```sql
  CREATE INDEX "PracticeErrorLog_userId_idx" ON "PracticeErrorLog"("userId");
  CREATE INDEX "PracticeErrorLog_practiceId_idx" ON "PracticeErrorLog"("practiceId");
  ```

---

#### 4. Dos Funciones Almacenadas (STORED FUNCTIONS) consumidas en la APP
**Cómo se cumple:**
Implementamos dos funciones en la base de datos para realizar cálculos atómicos que la APP solicita de forma regular:

* **Función 1 (`fn_get_student_average`):** Devuelve el promedio general de un alumno.
  ```sql
  CREATE OR REPLACE FUNCTION fn_get_student_average(student_uuid VARCHAR)
  RETURNS NUMERIC AS $$
  DECLARE
      avg_grade NUMERIC;
  BEGIN
      SELECT COALESCE(AVG(final_grade), 0) INTO avg_grade
      FROM "Submission"
      WHERE user_id = student_uuid;
      RETURN avg_grade;
  END;
  $$ LANGUAGE plpgsql;
  ```

* **Función 2 (`fn_get_error_count`):** Retorna la cantidad de errores de sintaxis que ha cometido un alumno en la consola SQL.
  ```sql
  CREATE OR REPLACE FUNCTION fn_get_error_count(student_uuid VARCHAR)
  RETURNS INTEGER AS $$
  DECLARE
      error_count INTEGER;
  BEGIN
      SELECT COUNT(*) INTO error_count
      FROM "PracticeErrorLog"
      WHERE user_id = student_uuid;
      RETURN error_count;
  END;
  $$ LANGUAGE plpgsql;
  ```

*Consumo desde la APP:*
`const res = await prisma.$queryRaw`SELECT fn_get_student_average(${id}) as average;`

---

#### 5. Dos Procedimientos Almacenados (STORED PROCEDURES)
**Cómo se cumple:**
Creamos dos procedimientos almacenados que realizan procesos de actualización masiva y mantenimiento de la base de datos de manera transaccional:

* **Procedimiento 1 (`sp_archive_classroom`):** Archiva un laboratorio y de forma automática e integrada archiva todas las inscripciones asociadas a dicho laboratorio.
  ```sql
  CREATE OR REPLACE PROCEDURE sp_archive_classroom(classroom_uuid VARCHAR)
  AS $$
  BEGIN
      -- Archivar la clase
      UPDATE "Classroom" 
      SET is_archived = TRUE 
      WHERE id = classroom_uuid;
      
      -- Archivar inscripciones de alumnos
      UPDATE "Enrollment" 
      SET is_archived = TRUE 
      WHERE classroom_id = classroom_uuid;
  END;
  $$ LANGUAGE plpgsql;
  ```

* **Procedimiento 2 (`sp_clean_old_error_logs`):** Elimina registros de log de errores antiguos del servidor para liberar espacio de almacenamiento.
  ```sql
  CREATE OR REPLACE PROCEDURE sp_clean_old_error_logs(days_old INTEGER)
  AS $$
  BEGIN
      DELETE FROM "PracticeErrorLog"
      WHERE created_at < NOW() - INTERVAL '1 day' * days_old;
  END;
  $$ LANGUAGE plpgsql;
  ```

*Consumo desde la APP:*
`await prisma.$queryRaw`CALL sp_archive_classroom(${classId});`

---

### II. Requerimientos de Administración y Seguridad (BD y Usuarios)

#### 1. Conexión como Usuario Dueño (No Root)
* Nuestra aplicación en producción y desarrollo se conecta utilizando un usuario dueño de base de datos específico (`avnadmin` o el rol de conexión de la instancia de nube de Neon/Aiven) configurado a través de la variable `DATABASE_URL` en el archivo `.env`.
* **No nos conectamos como el superusuario genérico `root` de MySQL local**, cumpliendo con la directiva de seguridad del principio de menor privilegio.

#### 2. Creación de Roles de Base de Datos y Privilegios
Para proteger los objetos de la base de datos a nivel físico, se configuran dos roles con permisos pertinentes en el motor PostgreSQL:

```sql
-- 1. Crear roles
CREATE ROLE rol_docente;
CREATE ROLE rol_alumno;

-- 2. Privilegios para el docente (Lectura, Inserción y Modificación)
GRANT SELECT, INSERT, UPDATE, DELETE ON "Classroom", "Practice", "ChecklistItem", "ChecklistEvaluation", "Submission" TO rol_docente;

-- 3. Privilegios para el alumno (Lectura limitada y registro de entregas/errores)
GRANT SELECT ON "Classroom", "Practice" TO rol_alumno;
GRANT SELECT, INSERT, UPDATE ON "Submission", "SubmissionStep", "PracticeErrorLog" TO rol_alumno;
```
