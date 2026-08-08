import nodemailer from "nodemailer";

export interface EmailSendResult {
  sent: boolean;
  error?: string;
}

const FROM_NAME = "Thuan Naga Restaurant";

/**
 * Sends a login OTP code to the customer's inbox.
 *
 * Two providers are supported, tried in order:
 *   1. SMTP (recommended: Gmail) — SMTP_HOST, SMTP_USER, SMTP_PASS (+ SMTP_PORT/SMTP_SECURE)
 *   2. Resend — RESEND_API_KEY (+ RESEND_FROM)
 *
 * If neither is configured, returns sent:false so the caller can fall back
 * to showing the code on screen.
 */
export async function sendOtpEmail(to: string, code: string): Promise<EmailSendResult> {
  const subject = `${code} is your Thuan Naga Restaurant login code`;
  const text = [
    `Hello,`,
    ``,
    `Your login code for Thuan Naga Restaurant is: ${code}`,
    ``,
    `Enter this 6-digit code on the website to log in. It expires in 10 minutes.`,
    `If you didn't try to log in, you can safely ignore this email.`,
    ``,
    `— Thuan Naga Restaurant, Tamenglong, Manipur`,
  ].join("\n");

  // 1) SMTP (Gmail app password recommended)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail({
        from: `"${FROM_NAME}" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
      });
      return { sent: true };
    } catch (e) {
      return { sent: false, error: e instanceof Error ? e.message : "SMTP delivery failed" };
    }
  }

  // 2) Resend API
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || "Thuan Naga Restaurant <onboarding@resend.dev>",
          to,
          subject,
          text,
        }),
      });
      if (!res.ok) {
        return { sent: false, error: `Email service error (${res.status})` };
      }
      return { sent: true };
    } catch (e) {
      return { sent: false, error: e instanceof Error ? e.message : "Email service error" };
    }
  }

  return { sent: false, error: "No email service configured" };
}
