/**
 * ParraDibiei - Utilitário Seguro de Área de Transferência (Clipboard)
 * Funciona de forma resiliente mesmo dentro de iFrames restritos do Google AI Studio
 */

export async function copyToClipboard(text: string): Promise<boolean> {
  // 1. Tenta a API moderna navigator.clipboard
  if (typeof window !== 'undefined' && navigator && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('[ParraDibiei Clipboard] navigator.clipboard falhou ou foi bloqueado pelo iFrame, usando fallback execCommand:', err);
    }
  }

  // 2. Fallback resiliente usando textarea temporário + document.execCommand('copy')
  try {
    if (typeof document === 'undefined') return false;
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('[ParraDibiei Clipboard] Falha completa ao copiar texto:', err);
    return false;
  }
}
