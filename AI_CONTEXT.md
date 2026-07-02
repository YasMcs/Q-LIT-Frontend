9i88# Contexto de Q-LIT (Guía para IAs)

Este documento contiene el contexto esencial sobre la arquitectura, estado actual y backlog del proyecto **Q-LIT**, diseñado para que cualquier IA que se incorpore al proyecto entienda rápidamente cómo está estructurado.

## 🏗️ Arquitectura y Tecnologías
- **Frontend**: Next.js 14+ (App Router), React, CSS puro (sin Tailwind por decisión de diseño).
- **Backend**: Node.js, Express.js.
- **Base de Datos**: MySQL gestionado con Prisma ORM.
- **Autenticación**: NextAuth.js (v4) con Google OAuth.
- **Despliegue**: Frontend en Vercel, Backend en Railway.

## 🔐 Modelo de Seguridad (BFF Proxy Pattern)
Para resolver problemas de CORS y proteger las rutas del backend, se implementó un patrón **BFF (Backend-For-Frontend)**:
1. **NextAuth** gestiona las sesiones (JWT) usando Google OAuth.
2. El Frontend hace peticiones a `/api/proxy/*` (Next.js API route en `src/app/api/proxy/[...path]/route.js`).
3. **El Proxy intercepta la petición**, lee la cookie de sesión de NextAuth (`__Secure-next-auth.session-token` en prod) y verifica el JWT usando `NEXTAUTH_SECRET`.
4. El Proxy reenvía la petición al servidor Express de Railway agregando los headers:
   - `x-api-key`: Llave secreta compartida entre Vercel y Railway (`API_SECRET_KEY`).
   - `x-user-id`: ID del usuario extraído del JWT validado.
   - `x-user-role`: Rol del usuario.
5. El **Backend Express** usa el middleware `bffAuthMiddleware` que simplemente verifica el `x-api-key` y confía en el `x-user-id` que el proxy verificó.

*Nota importante:* El backend en Railway **NO debe estar expuesto a peticiones directas del frontend**, todo debe pasar por el proxy en `/api/proxy/*`.

## 🛠️ Estado Actual (Backlog)
- ✅ Autenticación y Autorización implementadas.
- ✅ Creación y gestión de laboratorios (aulas).
- ✅ Creación y resolución de prácticas (compilador SQL con validación por IA/reglas).
- ✅ Dashboard del docente y visualización de métricas/estadísticas con análisis de temas críticos.
- ✅ Funcionalidades base (directorios, listados, UI).
- ✅ UI Responsiva en dashboards para diferentes tamaños de laptops y PCs.
- ⬜ Tareas pendientes o mejoras a futuro:
  - Posibles mejoras en el parseo y feedback enriquecido al alumno.
  - Implementación de notificaciones en tiempo real o correos automatizados si no está completo.
  - Mayor personalización o paginación masiva en caso de que crezcan los usuarios.

## 💡 Reglas de Trabajo
- Mantener los commits en español siguiendo convenciones (ej. `característica:`, `corrección:`).
- Evitar usar Emojis en el código UI/React.
- No hacer uso de `cat` o `grep` en la terminal sin justificación, preferir comandos internos de IDE.
- Al cambiar variables de entorno (como `API_SECRET_KEY`) en Railway, recordar que se necesita un **redeploy manual** de los servicios para que tomen efecto.
- Utilizar `console.log` para depuración pero limpiar antes de un push a producción.
