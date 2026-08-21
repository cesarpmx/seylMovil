import TcpSocket from 'react-native-tcp-socket';

// ---------------------------------------------------------------------------
// Cliente SMTP puro en JavaScript sobre react-native-tcp-socket.
// Versión mínima: solo lo esencial para autenticarse y enviar.
// ---------------------------------------------------------------------------

export interface AdjuntoBase64 {
  nombre: string;
  mimeType: string;
  base64: string;
}

export interface EnvioCorreoParams {
  host: string;
  port?: string | number;
  ssl?: boolean;
  usuario: string;
  password: string;
  fromName?: string;
  destinatarios: string;
  asunto: string;
  cuerpo: string;
  htmlBody?: boolean;
  adjuntos?: AdjuntoBase64[];
}

const CRLF = '\r\n';

const stripBase64Prefix = (b64: string): string =>
  b64.includes(',') ? b64.split(',')[1] : b64;

const b64encode = (input: string): string => {
  try {
    // eslint-disable-next-line no-undef
    return btoa(unescape(encodeURIComponent(input)));
  } catch {
    return input;
  }
};

const parseRecipients = (rcps: string): string[] =>
  rcps
    .split(/[,;]/)
    .map(s => s.trim())
    .filter(Boolean);

const chunkBase64 = (b64: string, lineLen = 76): string => {
  const clean = stripBase64Prefix(b64).replace(/\r?\n/g, '');
  const out: string[] = [];
  for (let i = 0; i < clean.length; i += lineLen) {
    out.push(clean.slice(i, i + lineLen));
  }
  return out.join(CRLF);
};

// Codifica un header (Subject / From name) según RFC 2047 si trae no-ASCII.
const encodeHeader = (s: string): string =>
  // eslint-disable-next-line no-control-regex
  /^[\x00-\x7F]*$/.test(s) ? s : `=?UTF-8?B?${b64encode(s)}?=`;

const genMessageId = (usuario: string): string => {
  const domain = usuario.split('@')[1] || 'localhost';
  const rand = Math.random().toString(36).slice(2, 12);
  return `<${Date.now()}.${rand}@${domain}>`;
};

const buildMessage = (
  params: EnvioCorreoParams,
  destinatarios: string[],
): string => {
  const {usuario, asunto, cuerpo, htmlBody, adjuntos = []} = params;

  // Boundary único por correo (dentro de la función, no a nivel de módulo).
  const boundary = `----=_SeylWMS_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const headersBase: string[] = [
    `From: ${usuario}`,
    `To: ${destinatarios.join(', ')}`,
    `Subject: ${encodeHeader(asunto)}`,
    `Date: ${new Date().toUTCString().replace('GMT', '+0000')}`,
    `Message-ID: ${genMessageId(usuario)}`,
    `MIME-Version: 1.0`,
  ];

  // Cuerpo en base64 para garantizar entrega correcta de acentos/UTF-8.
  const cuerpoB64 = chunkBase64(b64encode(cuerpo));

  if (adjuntos.length === 0) {
    headersBase.push(
      `Content-Type: ${htmlBody ? 'text/html' : 'text/plain'}; charset=UTF-8`,
      `Content-Transfer-Encoding: base64`,
    );
    return headersBase.join(CRLF) + CRLF + CRLF + cuerpoB64;
  }

  headersBase.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);

  const parts: string[] = [
    `--${boundary}`,
    `Content-Type: ${htmlBody ? 'text/html' : 'text/plain'}; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    '',
    cuerpoB64,
  ];

  for (const a of adjuntos) {
    parts.push(
      `--${boundary}`,
      `Content-Type: ${a.mimeType}; name="${a.nombre}"`,
      `Content-Transfer-Encoding: base64`,
      `Content-Disposition: attachment; filename="${a.nombre}"`,
      '',
      chunkBase64(a.base64),
    );
  }

  parts.push(`--${boundary}--`, '');

  return headersBase.join(CRLF) + CRLF + CRLF + parts.join(CRLF);
};

// ---------- Conexión SMTP con cola de comandos ----------

interface Pending {
  resolve: (raw: string) => void;
  reject: (err: Error) => void;
  timer: any;
}

class SmtpConnection {
  private socket: any = null;
  private buffer = '';
  private pending: Pending[] = [];
  private closed = false;

  constructor(
    private host: string,
    private port: number,
    private ssl: boolean,
  ) {}

  connect(): Promise<string> {
    return new Promise((resolve, reject) => {
      const opts: any = {host: this.host, port: this.port};
      const onConnect = () => {};
      const onError = (err: any) =>
        reject(new Error(`SMTP connect error: ${err?.message || err}`));

      this.pending.push({
        resolve,
        reject,
        timer: setTimeout(() => reject(new Error('SMTP connect timeout')), 20000),
      });

      const socket = this.ssl
        ? TcpSocket.connectTLS({...opts, tlsCheckValidity: false} as any, onConnect)
        : TcpSocket.createConnection(opts as any, onConnect);

      socket.on('data', (data: any) => this.handleData(data));
      socket.on('error', onError);
      socket.on('close', () => {
        this.closed = true;
      });

      this.socket = socket;
    });
  }

  private handleData(data: any) {
    const text = typeof data === 'string' ? data : data.toString('utf-8');
    this.buffer += text;

    while (true) {
      const end = this.findResponseEnd();
      if (end === -1) break;
      const chunk = this.buffer.slice(0, end);
      this.buffer = this.buffer.slice(end);
      const waiter = this.pending.shift();
      if (!waiter) continue;
      clearTimeout(waiter.timer);
      const code = parseInt(chunk.slice(0, 3), 10);
      if (code >= 400) {
        waiter.reject(new Error(`SMTP ${code}: ${chunk.trim()}`));
      } else {
        waiter.resolve(chunk);
      }
    }
  }

  private findResponseEnd(): number {
    const lines = this.buffer.split(/\r?\n/);
    let bytes = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nextNL = this.buffer.indexOf('\n', bytes);
      if (nextNL === -1) return -1;
      bytes = nextNL + 1;
      if (/^\d{3} /.test(line)) {
        return bytes;
      }
    }
    return -1;
  }

  send(cmd: string, timeoutMs = 20000): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.closed) return reject(new Error('SMTP socket cerrado'));
      const timer = setTimeout(
        () => reject(new Error(`SMTP timeout esperando respuesta a: ${cmd.slice(0, 40)}`)),
        timeoutMs,
      );
      this.pending.push({resolve, reject, timer});
      this.socket.write(cmd + CRLF);
    });
  }

  // Actualiza el socket plano a TLS después de un STARTTLS exitoso.
  // Usa la API de react-native-tcp-socket: existing socket → wrap TLS.
  upgradeToTLS(host: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // API v6.x: TcpSocket tiene un método para envolver un socket existente.
        // Si no está disponible, algunos providers también aceptan reconectar TLS al mismo puerto,
        // pero para SMTP estándar el STARTTLS es en la MISMA conexión.
        const anySocket: any = this.socket;
        // Limpiamos el buffer antes del handshake
        this.buffer = '';

        // Intento 1: método startTLS() del socket (algunas versiones)
        if (typeof anySocket.startTLS === 'function') {
          anySocket.startTLS(
            {host, tlsCheckValidity: false},
            (err: any) => {
              if (err) return reject(new Error(`STARTTLS handshake error: ${err.message || err}`));
              resolve();
            },
          );
          return;
        }

        // Intento 2: helper del módulo (algunas versiones exponen TcpSocket.startTLS)
        const anyTcp: any = TcpSocket as any;
        if (typeof anyTcp.startTLS === 'function') {
          const tlsSocket = anyTcp.startTLS(this.socket, {host, tlsCheckValidity: false}, () => resolve());
          tlsSocket.on('data', (data: any) => this.handleData(data));
          tlsSocket.on('error', (err: any) => console.error('[smtp] TLS socket error:', err));
          tlsSocket.on('close', () => (this.closed = true));
          this.socket = tlsSocket;
          return;
        }

        reject(new Error('react-native-tcp-socket no expone startTLS() en esta versión.'));
      } catch (e: any) {
        reject(new Error(`upgradeToTLS falló: ${e?.message || e}`));
      }
    });
  }

  sendRaw(data: string, timeoutMs = 60000): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.closed) return reject(new Error('SMTP socket cerrado'));
      const timer = setTimeout(
        () => reject(new Error('SMTP timeout esperando respuesta a DATA')),
        timeoutMs,
      );
      this.pending.push({resolve, reject, timer});
      this.socket.write(data);
    });
  }

  close() {
    try {
      this.socket?.destroy?.();
    } catch {
      /* noop */
    }
  }
}

// ---------- Función principal ----------

export const enviarCorreoSMTP = async (
  params: EnvioCorreoParams,
): Promise<string> => {
  const {
    host,
    port,
    ssl = true,
    usuario,
    password,
    destinatarios,
  } = params;

  if (!host) throw new Error('Host SMTP no configurado.');
  if (!usuario || !password) throw new Error('Credenciales SMTP no configuradas.');

  const rcps = parseRecipients(destinatarios);
  if (rcps.length === 0) throw new Error('No hay destinatarios.');

  console.log('[smtp] Destinatarios reales:', rcps);
  console.log('[smtp] Remitente:', usuario, 'Host:', host);

  const usePort = Number(port) || (ssl ? 465 : 587);

  // Decidir modo TLS:
  //   - Puerto 465 con ssl=true → SSL directo (implicit TLS)
  //   - Puerto 587 con ssl=true → STARTTLS (empezamos plano y actualizamos)
  //   - Puerto 587 sin ssl → plano (sin cifrado)
  const useStartTLS = ssl && usePort === 587;
  const useImplicitTLS = ssl && !useStartTLS;

  console.log('[smtp] puerto:', usePort, 'ssl:', ssl, 'startTLS:', useStartTLS);

  const conn = new SmtpConnection(host, usePort, useImplicitTLS);

  try {
    const greeting = await conn.connect();
    console.log('[smtp] greeting:', greeting.trim());

    // EHLO con FQDN válido derivado del dominio del remitente.
    const ehloName = usuario.split('@')[1] || 'localhost';
    const ehlo = await conn.send(`EHLO ${ehloName}`);
    console.log('[smtp] EHLO:', ehlo.trim());

    // STARTTLS si aplica
    if (useStartTLS) {
      const startResp = await conn.send('STARTTLS');
      console.log('[smtp] STARTTLS:', startResp.trim());
      await conn.upgradeToTLS(host);
      console.log('[smtp] TLS handshake OK, re-EHLO');
      // Después de STARTTLS hay que mandar EHLO otra vez
      const ehlo2 = await conn.send(`EHLO ${ehloName}`);
      console.log('[smtp] EHLO (post-TLS):', ehlo2.trim());
    }

    await conn.send('AUTH LOGIN');
    await conn.send(b64encode(usuario));
    await conn.send(b64encode(password));

    await conn.send(`MAIL FROM:<${usuario}>`);
    for (const rcp of rcps) {
      await conn.send(`RCPT TO:<${rcp}>`);
    }

    await conn.send('DATA');

    const message = buildMessage(params, rcps);
    const escaped = message.replace(/\r?\n\./g, `${CRLF}..`);
    const dataResp = await conn.sendRaw(escaped + CRLF + '.' + CRLF);
    console.log('[smtp] DATA response:', dataResp.trim());

    try {
      await conn.send('QUIT', 5000);
    } catch {
      /* noop */
    }

    return 'Correo enviado correctamente.';
  } finally {
    conn.close();
  }
};
