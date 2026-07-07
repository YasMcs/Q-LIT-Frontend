# Arquitectura de Software, Seguridad y Justificacion del Stack Tecnologico

Este documento detalla la arquitectura orientada a servicios (SOA) de la plataforma **Q-LIT**, justificando la seleccion de tecnologias y explicando las medidas de seguridad implementadas a nivel de infraestructura, aplicacion y base de datos.

---

## 1. Stack Tecnologico y Justificacion de Librerias

La plataforma esta estructurada bajo una arquitectura desacoplada en dos capas principales:

### 1.1. Frontend (Next.js 14 - App Router)
- **React 18**: Permite una interfaz reactiva, modular y dinamica idonea para un editor de codigo interactivo en tiempo real.
- **CSS Puro (Vanilla CSS)**: Se selecciono CSS nativo para garantizar el maximo control de diseno, animaciones y transiciones personalizadas de la aplicacion, evitando la sobrecarga e inflado de clases utilitarias de Tailwind.
- **NextAuth.js (v4)**: Solucion estandar para la autenticacion social (Google OAuth 2.0). Facilita el manejo de sesiones en el servidor y cliente de forma segura utilizando JWT firmados.

### 1.2. Backend (Express.js)
- **Node.js y Express.js**: Ofrece una ejecucion asincrona de alto rendimiento, ideal para la API y el manejo de peticiones concurrentes de multiples alumnos ejecutando consultas SQL.
- **Prisma ORM**: ORM de tipado fuerte que proporciona consultas eficientes y mapeo exacto a las tablas relacionales. Facilita las transacciones de base de datos y la migracion de esquemas.
- **@google/genai**: SDK oficial de Google para interactuar con el modelo de lenguaje **Gemini 2.5 Flash**, lo que permite una evaluacion logica flexible y rapida de las consultas del alumno.

### 1.3. Bases de Datos y Almacenamiento
- **PostgreSQL (Neon)**: Base de datos principal de la plataforma, que almacena las aulas, usuarios, entregas y logs de errores. Se eligio PostgreSQL por su robustez, soporte de vistas, funciones y procedimientos almacenados avanzados.
- **MySQL (Aiven)**: Motor relacional utilizado como sandbox/simulador. Los alumnos ejecutan sus consultas en esta base de datos MySQL aislada, garantizando que practiquen sobre la sintaxis estandar de MySQL y DML/DQL.

---

## 2. Controles de Seguridad Implementados

Para cumplir con las politicas de seguridad en el desarrollo de software educativo, se aplicaron multiples capas de proteccion:

### 2.1. Patron BFF (Backend-For-Frontend) y Proxy Interceptor
Para evitar la exposicion directa del backend en la nube y resolver problemas de CORS:
1. El Frontend expone una ruta de API local `/api/proxy/[...path]/route.js`.
2. Esta ruta intercepta las peticiones, extrae y valida la sesion JWT del usuario de la cookie encriptada de NextAuth.
3. Tras la validacion exitosa de identidad, el BFF inyecta el header `x-user-id` y firma la peticion al Backend con una llave secreta compartida (`API_SECRET_KEY` en `x-api-key`).
4. El Backend valida mediante `bffAuthMiddleware` la presencia de la llave secreta, confiando plenamente en la identificacion del alumno realizada por el BFF.

### 2.2. Proteccion de la API y Cabeceras (Helmet.js)
El backend utiliza la libreria **Helmet** para asegurar la aplicacion Express mediante la configuracion automatica de varias cabeceras HTTP de seguridad:
- `X-Frame-Options` para evitar ataques de clickjacking.
- Desactivacion de la cabecera `X-Powered-By` para ocultar la tecnologia del servidor.
- `Content-Security-Policy` para prevenir inyecciones de script y XSS.

### 2.3. Limitacion de Peticiones (Rate Limiting)
Se implementaron dos limitadores con la libreria `express-rate-limit`:
1. **General Limiter**: Maximo 1000 peticiones cada 15 minutos por usuario (identificado mediante `x-user-id` con fallback a IP), garantizando que los alumnos trabajen sin interferencia incluso si comparten la misma red del laboratorio escolar.
2. **Evaluation Limiter**: Maximo 150 peticiones por hora por usuario en las rutas de evaluacion, previniendo el abuso de tokens en las llamadas a la API de Google Gemini.

### 2.4. Aislamiento y Transacciones en el Sandbox (SQL Sandbox)
Para evitar que un alumno corrompa los datos de prueba de otros alumnos o dane el catalogo general:
- Cada consulta de alumno se ejecuta en una **transaccion aislada** (`beginTransaction`).
- Se desactivan temporalmente las foreign keys (`SET FOREIGN_KEY_CHECKS = 0`) para limpiar los datos antes de inyectar el setup de la practica (`setupSql`).
- Se ejecuta la consulta del alumno en la conexion especifica de la transaccion.
- Se hace un **rollback completo** (`connection.rollback()`) al final de la ejecucion. Esto asegura que la base de datos MySQL permanezca en su estado original y que ninguna modificacion (INSERT, UPDATE, DELETE) sea persistida permanentemente en el servidor.
- Se bloquea el uso de sentencias DDL (CREATE, ALTER, DROP) lanzando un error preventivo antes de enviar la consulta al motor.
