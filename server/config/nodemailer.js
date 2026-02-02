import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port : 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    }
});

// Verify transporter configuration on startup and log detailed errors
transporter.verify()
  .then(() => {
    console.log('✅ SMTP transporter is ready');
  })
  .catch((err) => {
    console.error('❌ SMTP transporter verification failed:', err);
  });

// Non-sensitive debug: show which SMTP-related environment variables are present (do NOT log passwords)
console.log('SMTP debug:', {
  smtp_user: process.env.SMTP_USER ? process.env.SMTP_USER : 'not set',
  smtp_password_set: !!process.env.SMTP_PASSWORD,
  sender_email: process.env.SENDER_EMAIL ? process.env.SENDER_EMAIL : 'not set',
  smtp_host: process.env.SMTP_HOST ? process.env.SMTP_HOST : 'smtp-relay.brevo.com',
  smtp_port: process.env.SMTP_PORT ? process.env.SMTP_PORT : 587
});