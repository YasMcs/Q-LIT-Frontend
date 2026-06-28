import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import '../welcome.css'; 

export default function AvisoPrivacidad() {
  return (
    <div className="home-page-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ flex: 1, padding: '140px 20px 80px', maxWidth: '900px', margin: '0 auto', color: 'var(--text-main)', width: '100%' }}>
        
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '60px 80px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          
          <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#fff', textAlign: 'left', fontWeight: '800' }}>
            AVISO DE PRIVACIDAD <span style={{ color: '#6366f1' }}>Q-LIT</span>
          </h1>
          
          <p style={{ color: '#b5bac1', lineHeight: '1.7', marginBottom: '40px', textAlign: 'left', fontSize: '1.05rem' }}>
            De conformidad con lo establecido en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (en adelante, la "Ley"), ponemos a su disposición el presente Aviso de Privacidad aplicable a la plataforma educativa Q-LIT.
          </p>

          <section style={{ marginBottom: '35px' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#6366f1', marginBottom: '15px', fontWeight: '700' }}>1. Identidad y Domicilio del Responsable</h2>
            <p style={{ color: '#b5bac1', lineHeight: '1.6' }}>
              La empresa Starcode, representada legalmente por Yasleb Belen Macias Sanchez (en adelante, el "Responsable"), con domicilio ubicado en las instalaciones de la Universidad Politécnica de Chiapas, en el municipio de Suchiapa, Chiapas, México, es la responsable del uso y protección de sus datos personales.
            </p>
          </section>

          <section style={{ marginBottom: '35px' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#6366f1', marginBottom: '15px', fontWeight: '700' }}>2. Datos Personales Sometidos a Tratamiento</h2>
            <p style={{ color: '#b5bac1', lineHeight: '1.6', marginBottom: '15px' }}>
              Para llevar a cabo las finalidades descritas en el presente Aviso de Privacidad, recabaremos y utilizaremos los siguientes datos personales, los cuales se obtienen principalmente al iniciar sesión mediante nuestro proveedor de identidad (Google) y a través del uso de la plataforma:
            </p>
            
            <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '10px' }}>Datos personales de identificación y contacto:</h3>
            <ul style={{ color: '#b5bac1', lineHeight: '1.6', marginBottom: '20px', paddingLeft: '20px' }}>
              <li>Nombre completo.</li>
              <li>Dirección de correo electrónico.</li>
              <li>Fotografía de perfil (Avatar proporcionado por Google).</li>
              <li>Rol dentro de la plataforma (Docente o Estudiante).</li>
            </ul>

            <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '10px' }}>Datos académicos y de uso de la plataforma:</h3>
            <ul style={{ color: '#b5bac1', lineHeight: '1.6', marginBottom: '20px', paddingLeft: '20px' }}>
              <li>Información sobre aulas (Laboratorios) creadas o a las que se ha unido.</li>
              <li>Código SQL enviado en las prácticas (Submissions).</li>
              <li>Calificaciones, evaluaciones y retroalimentación en las prácticas (Checklist Evaluations).</li>
              <li>Identificadores de sesión y tokens de acceso necesarios para mantener su cuenta activa y segura.</li>
            </ul>
            
            <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '10px' }}>Datos personales sensibles:</h3>
            <p style={{ color: '#b5bac1', lineHeight: '1.6' }}>
              Le informamos que para el funcionamiento de Q-LIT <strong>NO recabamos ni tratamos datos personales sensibles</strong> (como origen racial, estado de salud, creencias religiosas, datos financieros o patrimoniales).
            </p>
          </section>

          <section style={{ marginBottom: '35px' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#6366f1', marginBottom: '15px', fontWeight: '700' }}>3. Finalidad del Tratamiento de los Datos Personales</h2>
            <p style={{ color: '#b5bac1', lineHeight: '1.6', marginBottom: '15px' }}>
              Los datos personales que recabamos de usted los utilizaremos para las siguientes finalidades principales y necesarias para brindarle el servicio:
            </p>
            <ul style={{ color: '#b5bac1', lineHeight: '1.6', paddingLeft: '20px' }}>
              <li style={{ marginBottom: '10px' }}><strong>Gestión de Cuentas:</strong> Crear y administrar su perfil de usuario (Docente o Estudiante) utilizando la autenticación segura de Google.</li>
              <li style={{ marginBottom: '10px' }}><strong>Gestión Educativa:</strong> Permitir la creación de aulas virtuales, la inscripción de estudiantes mediante códigos de invitación y la asignación de prácticas.</li>
              <li style={{ marginBottom: '10px' }}><strong>Evaluación y Retroalimentación con Inteligencia Artificial:</strong> Recibir, almacenar y analizar el código SQL enviado por los estudiantes. Nota importante: El código SQL enviado y las instrucciones generadas son procesados mediante Inteligencia Artificial para asistir a los docentes en la evaluación.</li>
              <li style={{ marginBottom: '10px' }}><strong>Mantenimiento del Sistema:</strong> Asegurar el correcto funcionamiento de las sesiones y la seguridad de la plataforma.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '35px' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#6366f1', marginBottom: '15px', fontWeight: '700' }}>4. Transferencia de Datos Personales</h2>
            <p style={{ color: '#b5bac1', lineHeight: '1.6', marginBottom: '15px' }}>
              Para poder operar la plataforma Q-LIT y brindarle el servicio, dependemos de infraestructura tecnológica de terceros. Le informamos que sus datos personales son compartidos y almacenados con los siguientes proveedores de servicios, quienes actúan bajo nuestras instrucciones y políticas de privacidad:
            </p>
            <ul style={{ color: '#b5bac1', lineHeight: '1.6', paddingLeft: '20px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '10px' }}><strong>Google (OAuth / NextAuth):</strong> Utilizado para el proceso de inicio de sesión, validación de identidad y generación de tokens de seguridad.</li>
              <li style={{ marginBottom: '10px' }}><strong>Neon (Neon.tech):</strong> Proveedor de bases de datos PostgreSQL en la nube, donde se almacena de forma segura toda la información de usuarios, aulas, prácticas y entregas.</li>
              <li style={{ marginBottom: '10px' }}><strong>Servicios de Inteligencia Artificial:</strong> Proveedores de modelos de lenguaje utilizados exclusivamente para procesar las entregas (código SQL) y generar evaluaciones automáticas.</li>
            </ul>
            <p style={{ color: '#b5bac1', lineHeight: '1.6' }}>
              Al utilizar Q-LIT, usted acepta que su información sea procesada a través de esta infraestructura en la nube.
            </p>
          </section>

          <section style={{ marginBottom: '35px' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#6366f1', marginBottom: '15px', fontWeight: '700' }}>5. Opciones y Medios para Limitar el Uso o Divulgación de sus Datos</h2>
            <p style={{ color: '#b5bac1', lineHeight: '1.6', marginBottom: '15px' }}>
              Q-LIT es una plataforma estrictamente educativa. Sus datos personales no serán utilizados para fines mercadotécnicos, publicitarios, ni serán vendidos a terceros.
            </p>
            <p style={{ color: '#b5bac1', lineHeight: '1.6' }}>
              Si desea eliminar su cuenta y borrar toda su información (aulas creadas, prácticas, código enviado y evaluaciones), puede solicitarlo en cualquier momento enviando un correo a: <strong>y.macias1802@gmail.com</strong>
            </p>
          </section>

          <section style={{ marginBottom: '35px' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#6366f1', marginBottom: '15px', fontWeight: '700' }}>6. Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)</h2>
            <p style={{ color: '#b5bac1', lineHeight: '1.6', marginBottom: '15px' }}>
              Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada (Rectificación); que la eliminemos de nuestros registros (Cancelación); así como oponerse al uso de sus datos personales para fines específicos (Oposición).
            </p>
            <p style={{ color: '#b5bac1', lineHeight: '1.6', marginBottom: '15px' }}>
              Para el ejercicio de cualquiera de los derechos ARCO, usted deberá presentar la solicitud respectiva enviando un correo electrónico a: <strong>y.macias1802@gmail.com</strong>
            </p>
            <p style={{ color: '#b5bac1', lineHeight: '1.6' }}>
              Responderemos a su solicitud en un plazo máximo de 20 días hábiles, informándole sobre la procedencia de la misma.
            </p>
          </section>

          <section id="cookies" style={{ marginBottom: '35px' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#6366f1', marginBottom: '15px', fontWeight: '700' }}>7. Uso de Tecnologías de Rastreo (Cookies)</h2>
            <p style={{ color: '#b5bac1', lineHeight: '1.6' }}>
              Le informamos que en Q-LIT utilizamos cookies de sesión e identificadores de seguridad (gestionados por NextAuth) que son estrictamente necesarios para mantener su sesión activa de forma segura. No utilizamos cookies para rastreo publicitario ni compartimos su comportamiento de navegación con redes de anuncios.
            </p>
          </section>

          <section style={{ marginBottom: '15px' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#6366f1', marginBottom: '15px', fontWeight: '700' }}>8. Cambios al Aviso de Privacidad</h2>
            <p style={{ color: '#b5bac1', lineHeight: '1.6', marginBottom: '15px' }}>
              El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos requerimientos legales o de mejoras en Q-LIT implementadas por Starcode. Nos comprometemos a mantenerlo informado sobre los cambios que pueda sufrir el presente aviso a través de una notificación visible dentro de la plataforma o mediante un correo electrónico.
            </p>
            <p style={{ color: '#b5bac1', lineHeight: '1.6', fontStyle: 'italic', marginTop: '30px' }}>
              Última actualización: 22 de Junio de 2026.
            </p>
          </section>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
