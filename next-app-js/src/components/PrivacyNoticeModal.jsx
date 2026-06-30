"use client";
import React from "react";

export default function PrivacyNoticeModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-panel border border-border rounded-3xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden max-h-[85vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <i className="fa-solid fa-shield-halved text-indigo-500"></i>
            Aviso de Privacidad Q-LIT
          </h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-muted hover:text-foreground hover:bg-input transition-colors"
            title="Cerrar"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-sm text-muted leading-relaxed custom-scrollbar">
          <p className="text-sm font-medium">
            De conformidad con lo establecido en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (en adelante, la "Ley"), ponemos a su disposición el presente Aviso de Privacidad aplicable a la plataforma educativa Q-LIT.
          </p>

          <section>
            <h3 className="text-base font-extrabold text-foreground mb-2">1. Identidad y Domicilio del Responsable</h3>
            <p>
              La empresa Starcode, representada legalmente por Yasleb Belen Macias Sanchez (en adelante, el "Responsable"), con domicilio ubicado en las instalaciones de la Universidad Politécnica de Chiapas, en el municipio de Suchiapa, Chiapas, México, es la responsable del uso y protección de sus datos personales.
            </p>
          </section>

          <section>
            <h3 className="text-base font-extrabold text-foreground mb-2">2. Datos Personales Sometidos a Tratamiento</h3>
            <p className="mb-3">
              Para llevar a cabo las finalidades descritas en el presente Aviso de Privacidad, recabaremos y utilizaremos los siguientes datos personales, los cuales se obtienen principalmente al iniciar sesión mediante nuestro proveedor de identidad (Google) y a través del uso de la plataforma:
            </p>
            
            <h4 className="font-bold text-foreground mb-1">Datos personales de identificación y contacto:</h4>
            <ul className="list-disc pl-5 mb-3 space-y-1">
              <li>Nombre completo.</li>
              <li>Dirección de correo electrónico.</li>
              <li>Fotografía de perfil (Avatar proporcionado por Google).</li>
              <li>Rol dentro de la plataforma (Docente o Estudiante).</li>
            </ul>

            <h4 className="font-bold text-foreground mb-1">Datos académicos y de uso de la plataforma:</h4>
            <ul className="list-disc pl-5 mb-3 space-y-1">
              <li>Información sobre aulas (Laboratorios) creadas o a las que se ha unido.</li>
              <li>Código SQL enviado en las prácticas (Submissions).</li>
              <li>Calificaciones, evaluaciones y retroalimentación en las prácticas (Checklist Evaluations).</li>
              <li>Identificadores de sesión y tokens de acceso necesarios para mantener su cuenta activa y segura.</li>
            </ul>
            
            <h4 className="font-bold text-foreground mb-1">Datos personales sensibles:</h4>
            <p>
              Le informamos que para el funcionamiento de Q-LIT <strong>NO recabamos ni tratamos datos personales sensibles</strong> (como origen racial, estado de salud, creencias religiosas, datos financieros o patrimoniales).
            </p>
          </section>

          <section>
            <h3 className="text-base font-extrabold text-foreground mb-2">3. Finalidad del Tratamiento de los Datos Personales</h3>
            <p className="mb-2">
              Los datos personales que recabamos de usted los utilizaremos para las siguientes finalidades principales y necesarias para brindarle el servicio:
            </p>
            <ul className="list-decimal pl-5 space-y-2">
              <li><strong>Gestión de Cuentas:</strong> Crear y administrar su perfil de usuario (Docente o Estudiante) utilizando la autenticación segura de Google.</li>
              <li><strong>Gestión Educativa:</strong> Permitir la creación de aulas virtuales, la inscripción de estudiantes mediante códigos de invitación y la asignación de prácticas.</li>
              <li><strong>Evaluación y Retroalimentación con Inteligencia Artificial:</strong> Recibir, almacenar y analizar el código SQL enviado por los estudiantes. Nota importante: El código SQL enviado y las instrucciones generadas son procesados mediante Inteligencia Artificial para asistir a los docentes en la evaluación.</li>
              <li><strong>Mantenimiento del Sistema:</strong> Asegurar el correcto funcionamiento de las sesiones y la seguridad de la plataforma.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-base font-extrabold text-foreground mb-2">4. Transferencia de Datos Personales</h3>
            <p className="mb-3">
              Para poder operar la plataforma Q-LIT y brindarle el servicio, dependemos de infraestructura tecnológica de terceros. Le informamos que sus datos personales son compartidos y almacenados con los siguientes proveedores de servicios, quienes actúan bajo nuestras instrucciones y políticas de privacidad:
            </p>
            <ul className="list-disc pl-5 mb-3 space-y-1">
              <li><strong>Google (OAuth / NextAuth):</strong> Utilizado para el proceso de inicio de sesión, validación de identidad y generación de tokens de seguridad.</li>
              <li><strong>Neon (Neon.tech):</strong> Proveedor de bases de datos PostgreSQL en la nube, donde se almacena de forma segura toda la información de usuarios, aulas, prácticas y entregas.</li>
              <li><strong>Servicios de Inteligencia Artificial:</strong> Proveedores de modelos de lenguaje utilizados exclusivamente para procesar las entregas (código SQL) y generar evaluaciones automáticas.</li>
            </ul>
            <p>
              Al utilizar Q-LIT, usted acepta que su información sea procesada a través de esta infraestructura en la nube.
            </p>
          </section>

          <section>
            <h3 className="text-base font-extrabold text-foreground mb-2">5. Opciones y Medios para Limitar el Uso o Divulgación de sus Datos</h3>
            <p className="mb-2">
              Q-LIT es una plataforma estrictamente educativa. Sus datos personales no serán utilizados para fines mercadotécnicos, publicitarios, ni serán vendidos a terceros.
            </p>
            <p>
              Si desea eliminar su cuenta y borrar toda su información (aulas creadas, prácticas, código enviado y evaluaciones), puede solicitarlo en cualquier momento enviando un correo a: <strong>y.macias1802@gmail.com</strong>
            </p>
          </section>

          <section>
            <h3 className="text-base font-extrabold text-foreground mb-2">6. Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)</h3>
            <p className="mb-3">
              Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada (Rectificación); que la eliminemos de nuestros registros (Cancelación); así como oponerse al uso de sus datos personales para fines específicos (Oposición).
            </p>
            <p className="mb-3">
              Para el ejercicio de cualquiera de los derechos ARCO, usted deberá presentar la solicitud respectiva enviando un correo electrónico a: <strong>y.macias1802@gmail.com</strong>
            </p>
            <p>
              Responderemos a su solicitud en un plazo máximo de 20 días hábiles, informándole sobre la procedencia de la misma.
            </p>
          </section>

          <section>
            <h3 className="text-base font-extrabold text-foreground mb-2">7. Uso de Tecnologías de Rastreo (Cookies)</h3>
            <p>
              Le informamos que en Q-LIT utilizamos cookies de sesión e identificadores de seguridad (gestionados por NextAuth) que son estrictamente necesarios para mantener su sesión activa de forma segura. No utilizamos cookies para rastreo publicitario ni compartimos su comportamiento de navegación con redes de anuncios.
            </p>
          </section>

          <section className="border-t border-border pt-4">
            <h3 className="text-base font-extrabold text-foreground mb-2">8. Cambios al Aviso de Privacidad</h3>
            <p className="mb-3">
              El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos requerimientos legales o de mejoras en Q-LIT implementadas por Starcode. Nos comprometemos a mantenerlo informado sobre los cambios que pueda sufrir el presente aviso a través de una notificación visible dentro de la plataforma o mediante un correo electrónico.
            </p>
            <p className="italic text-xs font-semibold mt-4">
              Última actualización: 22 de Junio de 2026.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-end bg-input/40">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-indigo-600/20"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
