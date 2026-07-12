# Motor de Inteligencia Artificial (Lumi) y Estrategia de Prompting

Este documento describe la integración y el funcionamiento de **Lumi**, el motor de inteligencia artificial de la plataforma **Q-LIT**, detallando el uso de OpenAI como proveedor exclusivo, la estructura de prompts del sistema y los mecanismos de contingencia local.

---

## 1. OpenAI como Motor Principal

La plataforma Q-LIT utiliza de manera exclusiva la API de **OpenAI** con el modelo **`gpt-4o-mini`** para todas las tareas de generación de enunciados y evaluación de código SQL. Este modelo fue seleccionado por su alta velocidad de respuesta, bajo costo de tokens y su soporte nativo para **Structured Outputs** (Respuestas Estructuradas), lo que asegura que las respuestas del modelo cumplan estrictamente con el formato JSON requerido sin riesgo de errores de parseo.

La lógica centralizada en [ai.service.js](file:///c:/Users/yasbe/OneDrive/Escritorio/Q-LIT/backend-api/src/services/ai.service.js) opera de la siguiente manera:
1. Al iniciar una solicitud de IA, el sistema verifica la existencia de la variable `OPENAI_API_KEY` en el entorno.
2. Si está configurada, el backend utiliza el cliente de OpenAI y procesa la petición enviando un formato estricto de esquema JSON.
3. Si la clave de OpenAI por algún motivo no estuviera presente o fallara en producción, la plataforma de forma alternativa puede recurrir a una lista rotativa de llaves de Gemini como respaldo secundario.

---

## 2. Generación Dinámica de Enunciados y Prompting

Cuando un estudiante inicia una práctica, el sistema no le presenta un enunciado estático. En su lugar, el backend llama al servicio de generación en [gemini.service.js](file:///c:/Users/yasbe/OneDrive/Escritorio/Q-LIT/backend-api/src/services/gemini.service.js) enviando el objetivo pedagógico del docente (`description`), el esquema físico de la base de datos simulada y las cláusulas obligatorias.

El prompt maestro está diseñado con instrucciones de alta especificidad y condicionamientos de comportamiento para el modelo:

### 2.1. Reglas del Prompt Maestro
* **Restricción de Pasos (3 a 4 objetivos)**: Se instruye de forma explícita al modelo a dividir el problema en un flujo secuencial y lógico de **exactamente entre 3 y 4 objetivos (pasos)** que el estudiante debe resolver en orden.
* **Concordancia y Coherencia Directa**: Se exige al modelo que todos los objetivos generados tengan total concordancia y coherencia lógica con el objetivo del docente y las funciones obligatorias especificadas, evitando la creación de pasos irrelevantes o inconexos.
* **Datos Concretos y Valores Reales**: Se prohíben enunciados abstractos como "el ID especificado" o "el nombre buscado". La IA debe generar valores de datos reales y precisos (ej. "doctor 'Arturo López'", "carrera 'Ingeniería de Software'") que coincidan exactamente con las filas del setup SQL.
* **Sentido Común Realista**: Los enunciados y cambios solicitados deben representar tareas de negocio y de mantenimiento lógicas en el mundo real, previniendo incoherencias semánticas o erratas arbitrarias.
* **Generación de Setup DML**: El modelo debe retornar un script SQL válido con sentencias `INSERT INTO` conteniendo los datos de prueba específicos requeridos para realizar la simulación del problema.

---

## 3. Respuestas Estructuradas (Structured Outputs)

Para garantizar la estabilidad en la comunicación entre la IA y el backend, se implementa la definición de esquemas JSON (JSON Schemas) en el código. Esto le indica al modelo de OpenAI la estructura de datos exacta que debe retornar de forma mandatoria.

### Esquema de Salida para Creación de Prácticas
```json
{
  "type": "object",
  "properties": {
    "historia": {
      "type": "string",
      "description": "El escenario narrativo de la práctica (máx 2 oraciones)."
    },
    "pasos": {
      "type": "array",
      "description": "La lista de pasos/objetivos a resolver. Debe contener exactamente entre 3 y 4 pasos lógicos que tengan total concordancia con el problema planteado.",
      "items": {
        "type": "object",
        "properties": {
          "step": { "type": "integer" },
          "instruction": { "type": "string" },
          "expectedConcept": { "type": "string" }
        },
        "required": ["step", "instruction", "expectedConcept"]
      }
    },
    "setup_sql": {
      "type": "string",
      "description": "Las sentencias SQL (DML) de tipo INSERT para preparar la base de datos."
    }
  },
  "required": ["historia", "pasos", "setup_sql"],
  "additionalProperties": false
}
```

El backend cuenta con una función traductora `convertSchema` en [ai.service.js](file:///c:/Users/yasbe/OneDrive/Escritorio/Q-LIT/backend-api/src/services/ai.service.js#L6) que traduce automáticamente la sintaxis del esquema del formato de Google GenAI al formato JSON Schema compatible con OpenAI (`strict: true`), activando los beneficios de Structured Outputs en la API de OpenAI.

---

## 4. Mecanismo de Fallback Local (IA Offline)

Si la llamada a la API de OpenAI falla debido a problemas de red, cuota de saldo agotada o caída del proveedor externo, el backend implementa una estrategia de **contingencia y tolerancia a fallos** para evitar bloquear el aprendizaje del estudiante.

La lógica de evaluación de pasos del alumno en [evaluation.controller.js](file:///c:/Users/yasbe/OneDrive/Escritorio/Q-LIT/backend-api/src/controllers/evaluation.controller.js) realiza una captura del error (`try-catch`) y activa el validador local alternativo:

1. **Detección de Caída de la IA**: Si la promesa de la IA se rechaza, el sistema captura el error y registra una advertencia en la consola del servidor.
2. **Evaluación Basada en Concepto Esperado**:
   * El sistema extrae el `expectedConcept` almacenado en la base de datos para el paso actual (ej. `WHERE`, `JOIN`, `GROUP BY`, `ORDER BY`).
   * Convierte la consulta escrita por el estudiante a mayúsculas y realiza una búsqueda de concordancia básica mediante expresiones regulares para verificar si el estudiante incluyó la palabra clave esperada.
3. **Respuesta Informativa**: El backend responde exitosamente al cliente (`200 OK`) indicando al estudiante que la IA se encuentra temporalmente fuera de línea y ofreciendo una pista sintáctica local en español basada en el concepto esperado:
   ```json
   {
     "status": "success",
     "data": {
       "isCorrect": false,
       "feedback": "Lumi (IA) no está respondiendo en este momento (el servicio está temporalmente fuera de línea). Detectamos localmente que tu consulta no incluye el concepto esperado: 'WHERE'.\n\nSugerencia: WHERE se usa para filtrar registros aplicando condiciones antes de agrupar o mostrar resultados."
     }
   }
   ```
4. **Experiencia de Usuario**: El estudiante no percibe una caída crítica de la aplicación (no hay errores 500) y puede continuar depurando su código SQL orientándose con la retroalimentación de respaldo.
