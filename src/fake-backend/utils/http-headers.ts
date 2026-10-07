/**
 * Utilidades para generar headers HTTP en MSW
 */

import { HttpCustomHeader } from '@shared/enums/http-custom-headers.enum';

/**
 * Genera headers para respuesta de descarga de documentos
 * @param filename - Nombre del archivo
 * @param mimeType - Tipo MIME del archivo
 * @param disposition - inline o attachment (por defecto attachment)
 * @returns Objeto con los headers necesarios para descarga
 */
export function getDocumentHeaders(
  filename: string,
  mimeType: string,
  disposition: 'inline' | 'attachment' = 'attachment',
): Record<string, string> {
  return {
    'Content-Type': mimeType,
    'Content-Disposition': `${disposition}; filename="${filename}"`,
    'Access-Control-Expose-Headers': 'Content-Disposition',
  };
}

/**
 * Genera headers para respuestas con mensajes de warning
 * @param warningMessage - Mensaje de warning personalizado
 * @param additionalHeaders - Headers adicionales opcionales
 * @returns Objeto con los headers de warning
 */
export function getWarningHeaders(
  warningMessage: string,
  additionalHeaders: Record<string, string> = {},
): Record<string, string> {
  return {
    'Access-Control-Expose-Headers': HttpCustomHeader.CUSTOM_WARNING_MESSAGE,
    [HttpCustomHeader.CUSTOM_WARNING_MESSAGE]: warningMessage,
    'Cache-Control': 'no-store',
    ...additionalHeaders,
  };
}

/**
 * Genera headers para respuestas de éxito con mensaje personalizado
 * @param successMessage - Mensaje de éxito personalizado
 * @param additionalHeaders - Headers adicionales opcionales
 * @returns Objeto con los headers de éxito
 */
export function getSuccessHeaders(
  successMessage: string,
  additionalHeaders: Record<string, string> = {},
): Record<string, string> {
  return {
    'Access-Control-Expose-Headers': HttpCustomHeader.CUSTOM_SUCCESS_MESSAGE,
    [HttpCustomHeader.CUSTOM_SUCCESS_MESSAGE]: successMessage,
    'Cache-Control': 'no-store',
    ...additionalHeaders,
  };
}

/**
 * Genera headers básicos para respuestas API
 * @param additionalHeaders - Headers adicionales opcionales
 * @returns Objeto con headers básicos
 */
export function getBasicHeaders(
  additionalHeaders: Record<string, string> = {},
): Record<string, string> {
  return {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };
}
