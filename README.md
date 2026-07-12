# Q-LIT: Query Laboratory Interactive Tool

Bienvenido a **Q-LIT**, una plataforma educativa orientada a servicios (SOA) diseñada para revolucionar la enseñanza y el aprendizaje interactivo del lenguaje estructurado de consultas (SQL). 

La plataforma está estructurada en un Frontend (Next.js) y un Backend (Express.js), garantizando alta cohesión y bajo acoplamiento para el despliegue y mantenimiento de los servicios.

---

## 📚 Documentación Técnica Completa

Para facilitar el entendimiento, mantenimiento y evaluación del sistema, la documentación técnica detallada se ha organizado y modularizado en la carpeta `/docs`:

1. **[01. Arquitectura de Software y Seguridad](file:///c:/Users/yasbe/OneDrive/Escritorio/Q-LIT/docs/01_ARCHITECTURE_AND_STACK.md)**: Explicación del Stack Tecnológico, justificación del diseño, patrón BFF (Backend-For-Frontend), protección con Helmet, rate limiting y aislamiento transaccional del SQL Sandbox (MySQL).
2. **[02. Especificación de la API (API Specification)](file:///c:/Users/yasbe/OneDrive/Escritorio/Q-LIT/docs/02_API_SPECIFICATION.md)**: Detalle exhaustivo de endpoints, cabeceras de autorización requeridas por el BFF, payloads de petición y esquemas de respuesta JSON para éxito y error.
3. **[03. Estructura de Base de Datos y SQL Avanzado](file:///c:/Users/yasbe/OneDrive/Escritorio/Q-LIT/docs/03_DATABASE_AND_SQL_ADVANCED.md)**: Modelado físico de datos en Prisma (PostgreSQL) y la justificación técnica de la programación en base de datos avanzadas (JOINs, vistas, índices, funciones y procedimientos almacenados transaccionales).
4. **[04. Motor de Inteligencia Artificial (Lumi)](file:///c:/Users/yasbe/OneDrive/Escritorio/Q-LIT/docs/04_AI_ENGINE_AND_PROMPTING.md)**: Integración de OpenAI (`gpt-4o-mini`), prompting de generación (3 a 4 pasos lógicos), Structured Outputs y el mecanismo de fallback local ante caídas de la IA.
5. **[05. Estándares de Diseño y Backlog](file:///c:/Users/yasbe/OneDrive/Escritorio/Q-LIT/docs/05_DEVELOPMENT_AND_BACKLOG.md)**: Reglamento de diseño (sin emojis, Tailwind CSS v4) y el roadmap/backlog actual del proyecto.

---

## 🛠️ Guía de Instalación y Ejecución Local

Sigue estos pasos para levantar el entorno completo de desarrollo en tu máquina local:

### 1. Prerrequisitos
* **Node.js** (v18 o superior)
* **NPM** o Yarn
* Una instancia activa de PostgreSQL (Neon Cloud o local) para persistencia y MySQL (Aiven Cloud o local) para el sandbox.

### 2. Configuración y Ejecución del Backend (`/backend-api`)
1. Navega al directorio del backend:
   ```bash
   cd backend-api
   ```
2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` en la raíz de `backend-api` basado en `.env.example` con las siguientes variables:
   ```env
   PORT=4000
   DATABASE_URL="postgresql://usuario:password@host/neondb?sslmode=require"
   MYSQL_URL="mysql://usuario:password@host:port/defaultdb"
   OPENAI_API_KEY="tu-api-key-de-openai"
   FRONTEND_URL="http://localhost:3000"
   API_SECRET_KEY="super-secret-api-key-123"
   ```
4. Sincroniza y genera los modelos de la base de datos (Prisma):
   ```bash
   npx prisma db push
   ```
5. Ejecuta el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```

### 3. Configuración y Ejecución del Frontend (`/next-app-js`)
1. Navega al directorio del frontend:
   ```bash
   cd ../next-app-js
   ```
2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` en la raíz de `next-app-js` con las variables de autenticación social y comunicación con el BFF:
   ```env
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="tu-secreto-de-next-auth"
   GOOGLE_CLIENT_ID="tu-google-client-id"
   GOOGLE_CLIENT_SECRET="tu-google-client-secret"
   BACKEND_API_URL="http://localhost:4000"
   BACKEND_API_KEY="super-secret-api-key-123"
   ```
4. Levanta el entorno de desarrollo:
   ```bash
   npm run dev
   ```

Abre tu navegador en [http://localhost:3000](http://localhost:3000) para acceder a la aplicación.

---

## Declaración de Uso de IA y Recursos Externos

En cumplimiento estricto con las políticas de evaluación de este proyecto integrador, el equipo declara de manera transparente lo siguiente:

1. **Uso de Asistencia por IA en el Desarrollo**: Se utilizó inteligencia artificial (Gemini/Antigravity) como herramienta de *Pair Programming* para acelerar la maquetación de componentes React, optimizar las consultas complejas de Prisma ORM, refinar la estructura de seguridad (helmet, express-rate-limit) y estructurar los archivos Markdown de documentación. Todo el código generado por IA fue adaptado, revisado y estructurado según la arquitectura SOA y lógica de negocio definida exclusivamente por el equipo estudiantil.
2. **Motor de IA Integrado (Feature del Sistema)**: La plataforma consume activamente la API oficial de **OpenAI** para la evaluación en tiempo real de sentencias SQL escritas por los estudiantes. Esto no es código autogenerado para construir el proyecto, sino una característica funcional (feature) del sistema evaluador.
3. **Plantillas y Librerías Externas**: La interfaz fue construida con componentes estándar de HTML/CSS/Tailwind. No se utilizaron plantillas pre-fabricadas de terceros. Las únicas librerías de terceros empleadas son de infraestructura tecnológica (Next.js, Express, Prisma, NextAuth, Helmet, CORS), debidamente justificadas en la documentación arquitectónica.

> Toda la autoría lógica, el diseño de la base de datos, los casos de uso, la integración de servicios y el esfuerzo colaborativo (evidenciado en el historial de Git) corresponden 100% al equipo desarrollador.
