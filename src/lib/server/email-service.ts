import type { User } from "@prisma/client";

interface TransactionalEmailInput {
  to: string;
  subject: string;
  text: string;
  html: string;
}

function getAppBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

function buildUrl(path: string, token: string) {
  const url = new URL(path, getAppBaseUrl());
  url.searchParams.set("token", token);
  return url.toString();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendTransactionalEmail(input: TransactionalEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "LeaseMate <onboarding@resend.dev>";

  if (!apiKey) {
    console.info("[email:dev]", {
      to: input.to,
      subject: input.subject,
      text: input.text,
    });
    return { ok: true as const, skipped: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
      }),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      console.error("[email:resend]", response.status, details);
      return { ok: false as const, error: "Email could not be sent" };
    }

    return { ok: true as const, skipped: false };
  } catch (error) {
    console.error("[email:resend]", error);
    return { ok: false as const, error: "Email could not be sent" };
  }
}

export function sendVerificationEmail(user: Pick<User, "email" | "name">, token: string) {
  const url = buildUrl("/verify-email", token);
  const safeName = escapeHtml(user.name);
  const safeUrl = escapeHtml(url);
  return sendTransactionalEmail({
    to: user.email,
    subject: "Verify your LeaseMate email",
    text: `Hi ${user.name}, verify your LeaseMate email address: ${url}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h1>Verify your LeaseMate email</h1>
        <p>Hi ${safeName}, confirm your email address to finish securing your LeaseMate account.</p>
        <p><a href="${safeUrl}" style="background:#0f9f8f;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none">Verify email</a></p>
        <p>If the button does not work, open this link: ${safeUrl}</p>
      </div>
    `,
  });
}

export function sendPasswordResetEmail(user: Pick<User, "email" | "name">, token: string) {
  const url = buildUrl("/reset-password", token);
  const safeName = escapeHtml(user.name);
  const safeUrl = escapeHtml(url);
  return sendTransactionalEmail({
    to: user.email,
    subject: "Reset your LeaseMate password",
    text: `Hi ${user.name}, reset your LeaseMate password: ${url}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h1>Reset your LeaseMate password</h1>
        <p>Hi ${safeName}, use this secure link to choose a new password. It expires shortly.</p>
        <p><a href="${safeUrl}" style="background:#0f9f8f;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none">Reset password</a></p>
        <p>If the button does not work, open this link: ${safeUrl}</p>
      </div>
    `,
  });
}
