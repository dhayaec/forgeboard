/**
 * Email delivery via nodemailer (SMTP).
 *
 * Server-only. Never import from client code.
 */
import 'server-only';
import nodemailer from 'nodemailer';
import { envServer } from '@/lib/env';
import { logger } from '@/lib/logging/logger';

/** Singleton transporter, created on first send. */
let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (_transporter) return _transporter;

  if (envServer.SMTP_HOST && envServer.SMTP_PORT) {
    _transporter = nodemailer.createTransport({
      host: envServer.SMTP_HOST,
      port: envServer.SMTP_PORT,
      secure: envServer.SMTP_PORT === 465,
      auth: envServer.SMTP_USER
        ? { user: envServer.SMTP_USER, pass: envServer.SMTP_PASSWORD }
        : undefined,
    });
    logger.info({ event: 'email.transport.initialized', host: envServer.SMTP_HOST, port: envServer.SMTP_PORT }, 'SMTP transport created');
  } else if (process.env.EMAIL_MODE === 'log') {
    logger.info({ event: 'email.transport.log_mode' }, 'Email transport in log-only mode');
  } else {
    logger.warn({ event: 'email.transport.none' }, 'No SMTP config found — emails will not be sent');
  }

  return _transporter ?? createLogOnlyTransport();
}

/** In-memory transport that logs emails instead of sending them (dev/preview). */
function createLogOnlyTransport(): nodemailer.Transporter {
  return nodemailer.createTransport({
    jsonTransport: true,
  });
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<void> {
  const log = logger.child({ event: 'email.send', to, subject });

  const transporter = getTransporter();
  const from = envServer.SMTP_FROM ?? 'noreply@forgeboard.example';

  try {
    const info = await transporter.sendMail({ from, to, subject, html, text });
    log.info({ messageId: info.messageId }, 'Email sent');
  } catch (err) {
    log.error({ err }, 'Failed to send email');
    throw err;
  }
}

export { renderWelcomeEmail } from './templates/welcome';
export { renderPasswordResetEmail } from './templates/password-reset';
export { renderInviteEmail } from './templates/invite';
