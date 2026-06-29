import nodemailer from 'nodemailer';
import logger from '../config/logger';

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

let transporter: nodemailer.Transporter | null = null;

function isSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter(): nodemailer.Transporter | null {
  if (!isSmtpConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const from = process.env.SMTP_FROM || 'TuTurno <noreply@tuturno.local>';
  const transport = getTransporter();

  if (!transport) {
    logger.info('emailService (log-only): sin SMTP configurado', {
      to: input.to,
      subject: input.subject,
      htmlLength: input.html.length,
    });
    return;
  }

  await transport.sendMail({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });

  logger.info('emailService: enviado', { to: input.to, subject: input.subject });
}
