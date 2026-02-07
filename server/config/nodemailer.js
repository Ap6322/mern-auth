import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true only for port 465
  auth: {
    user: process.env.SMTP_USER || "apikey",
    pass: process.env.SMTP_PASSWORD, // SMTP Key from Brevo
  },
});

transporter.verify()
  .then(() => {
    console.log("✅ SMTP transporter is ready");
  })
  .catch((err) => {
    console.error("❌ SMTP transporter verification failed:", err.message);
  });
