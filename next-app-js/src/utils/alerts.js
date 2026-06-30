import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

// Configuración base de SweetAlert2 con el tema visual de Q-LIT
const QLitSwal = Swal.mixin({
  background: "#0a0a0a", // Matches --bg-panel
  color: "#dbdee1",      // Matches --text-primary
  confirmButtonColor: "#6767ea", // Matches --accent-blue
  cancelButtonColor: "#da373c",  // Matches --danger-red
  customClass: {
    popup: "rounded-[24px] border border-[rgba(255,255,255,0.06)] shadow-2xl font-sans",
    title: "text-lg font-black text-white",
    htmlContainer: "text-sm text-muted font-medium",
    confirmButton: "px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all mx-2 cursor-pointer",
    cancelButton: "px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all mx-2 cursor-pointer",
    input: "bg-[#121212] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-2.5 text-[#dbdee1] text-sm focus:outline-none focus:border-[#6767ea] focus:ring-1 focus:ring-[#6767ea]",
  },
  buttonsStyling: true,
});

/**
 * Muestra una alerta informativa o de éxito/error.
 */
export async function showAlert(title, text = "", icon = "info") {
  await QLitSwal.fire({
    title,
    text,
    icon,
    confirmButtonText: "Entendido",
  });
}

/**
 * Muestra un diálogo de confirmación (Sí/No).
 * Retorna true si el usuario confirma, false en caso contrario.
 */
export async function showConfirm(title, text = "", confirmButtonText = "Aceptar", cancelButtonText = "Cancelar") {
  const result = await QLitSwal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
  });
  return result.isConfirmed;
}

/**
 * Muestra un diálogo de entrada de texto (Prompt).
 * Retorna el texto ingresado o null si se canceló.
 */
export async function showPrompt(title, text = "", defaultValue = "", placeholder = "") {
  const result = await QLitSwal.fire({
    title,
    text,
    input: "text",
    inputValue: defaultValue,
    inputPlaceholder: placeholder,
    showCancelButton: true,
    confirmButtonText: "Aceptar",
    cancelButtonText: "Cancelar",
  });
  
  if (result.isConfirmed) {
    return result.value;
  }
  return null;
}
