import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  return handleProxyRequest(req, params, "POST");
}

export async function GET(req, { params }) {
  return handleProxyRequest(req, params, "GET");
}

async function handleProxyRequest(req, params, method) {
  // 1. Validar sesión de usuario (Asegura que el frontend está logueado)
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { error: { message: "No autorizado. Inicia sesión primero." } },
      { status: 401 }
    );
  }

  // 2. Construir la ruta de destino (Backend Express)
  const url = new URL(req.url);
  const backendUrl = url.href.replace(url.origin + "/api/proxy", "http://localhost:4000/api");

  // 3. Preparar cabeceras y cuerpo
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("x-api-key", process.env.API_SECRET_KEY || "q-lit-internal-bff-secret-12345");
  headers.append("x-user-id", session.user.id);
  headers.append("x-user-role", session.user.role || "student");

  let body = null;
  if (method !== "GET" && method !== "HEAD") {
    body = await req.text(); // Leemos el cuerpo original
  }

  try {
    // 4. Hacer la petición al backend real con la llave secreta
    const response = await fetch(backendUrl, {
      method,
      headers,
      body,
    });

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error("El servidor devolvió un error inesperado (no es JSON): " + text.substring(0, 50));
    }

    // 5. Devolver la respuesta al cliente
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error en Proxy BFF:", error);
    return NextResponse.json(
      { error: { message: "Error de comunicación con el servidor interno: " + error.message } },
      { status: 500 }
    );
  }
}
