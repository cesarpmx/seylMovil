import {getEmpresaConfiguracion} from '../configuracion/get-empresaConfiguracion';
import {
  AdjuntoBase64,
  enviarCorreoSMTP,
} from '../../config/mail/smtpClient';

export interface EnviarCorreoEmpresaParams {
  idEmpresa: string | number;
  destinatarios: string;           // "a@x.com, b@x.com"
  asunto: string;
  cuerpo: string;
  htmlBody?: boolean;
  adjuntos?: AdjuntoBase64[];
}

/**
 * Toma la configuración SMTP de la empresa y envía el correo usando
 * react-native-smtp-mailer. Equivalente RN del `enviarCorreo` del servlet Java.
 */
export const enviarCorreoEmpresa = async (
  params: EnviarCorreoEmpresaParams,
): Promise<string> => {
  const {idEmpresa, destinatarios, asunto, cuerpo, htmlBody, adjuntos} = params;

  const cfg = await getEmpresaConfiguracion(idEmpresa);
  if (!cfg) {
    throw new Error('No se encontró configuración SMTP para la empresa.');
  }

  const host = String(cfg.ecohost || '').trim();
  const port = cfg.ecoport ? String(cfg.ecoport) : undefined;
  const usuario = String(cfg.ecouser || '').trim();
  const password = String(cfg.ecopassword || '');
  const ssl = String(cfg.ecossl || '').toUpperCase() === 'S';

  return enviarCorreoSMTP({
    host,
    port,
    ssl,
    usuario,
    password,
    // Sin fromName → el remitente se muestra como el correo tal cual
    destinatarios,
    asunto,
    cuerpo,
    htmlBody,
    adjuntos,
  });
};
