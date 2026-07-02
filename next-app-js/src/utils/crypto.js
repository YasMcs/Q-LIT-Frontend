const SECRET_SALT = 0x5F; // Llave simple para codificación XOR

export function encodeId(id) {
  if (!id) return '';
  try {
    // Aplicar XOR simple a nivel de caracteres
    const xorred = id.split('').map(char => String.fromCharCode(char.charCodeAt(0) ^ SECRET_SALT)).join('');
    // Convertir a Base64 URL-safe (reemplazando +, / y =)
    return btoa(unescape(encodeURIComponent(xorred)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (e) {
    return id;
  }
}

export function decodeId(encoded) {
  if (!encoded) return '';
  try {
    // Revertir Base64 URL-safe a Base64 estándar
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const decoded = decodeURIComponent(escape(atob(base64)));
    // Deshacer XOR
    const original = decoded.split('').map(char => String.fromCharCode(char.charCodeAt(0) ^ SECRET_SALT)).join('');
    return original;
  } catch (e) {
    // Fallback: si falla el parseo, asumimos que es un ID crudo heredado
    return encoded;
  }
}
