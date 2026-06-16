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

interface EnquiryEmailContext {
  ownerEmail: string;
  ownerName: string;
  enquirerName: string;
  enquirerEmail: string;
  message: string;
  listingTitle: string;
  listingSlug: string;
}

export function sendEnquiryNotificationEmail(context: EnquiryEmailContext) {
  const dashboardUrl = `${getAppBaseUrl()}/dashboard`;
  const listingUrl = `${getAppBaseUrl()}/listings/${context.listingSlug}`;
  const safeOwner = escapeHtml(context.ownerName);
  const safeEnquirer = escapeHtml(context.enquirerName);
  const safeEnquirerEmail = escapeHtml(context.enquirerEmail);
  const safeTitle = escapeHtml(context.listingTitle);
  const safeMessage = escapeHtml(context.message).replaceAll("\n", "<br />");

  return sendTransactionalEmail({
    to: context.ownerEmail,
    subject: `New enquiry for ${context.listingTitle}`,
    text: `Hi ${context.ownerName}, ${context.enquirerName} (${context.enquirerEmail}) enquired about "${context.listingTitle}":\n\n${context.message}\n\nReply from your dashboard: ${dashboardUrl}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h1>New enquiry for ${safeTitle}</h1>
        <p>Hi ${safeOwner}, you have a new enquiry on LeaseMate.</p>
        <p><strong>${safeEnquirer}</strong> (<a href="mailto:${safeEnquirerEmail}">${safeEnquirerEmail}</a>) wrote:</p>
        <blockquote style="border-left:3px solid #0f9f8f;margin:0;padding:8px 16px;color:#374151">${safeMessage}</blockquote>
        <p><a href="${escapeHtml(dashboardUrl)}" style="background:#0f9f8f;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none">Reply from your dashboard</a></p>
        <p style="color:#6b7280;font-size:14px">Listing: <a href="${escapeHtml(listingUrl)}">${safeTitle}</a></p>
      </div>
    `,
  });
}

export function sendEnquiryConfirmationEmail(context: Pick<EnquiryEmailContext, "enquirerName" | "enquirerEmail" | "listingTitle" | "listingSlug" | "message">) {
  const listingUrl = `${getAppBaseUrl()}/listings/${context.listingSlug}`;
  const safeName = escapeHtml(context.enquirerName);
  const safeTitle = escapeHtml(context.listingTitle);
  const safeMessage = escapeHtml(context.message).replaceAll("\n", "<br />");

  return sendTransactionalEmail({
    to: context.enquirerEmail,
    subject: `We've sent your enquiry for ${context.listingTitle}`,
    text: `Hi ${context.enquirerName}, we've sent your enquiry about "${context.listingTitle}" to the lister. They'll be in touch by email.\n\nYour message:\n${context.message}\n\nView the listing: ${listingUrl}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h1>Your enquiry is on its way</h1>
        <p>Hi ${safeName}, we've sent your enquiry about <strong>${safeTitle}</strong> to the lister. They'll reply to you by email.</p>
        <p style="color:#374151"><strong>Your message:</strong></p>
        <blockquote style="border-left:3px solid #0f9f8f;margin:0;padding:8px 16px;color:#374151">${safeMessage}</blockquote>
        <p><a href="${escapeHtml(listingUrl)}" style="background:#0f9f8f;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none">View the listing</a></p>
      </div>
    `,
  });
}

export function sendEnquiryReplyEmail(context: {
  enquirerName: string;
  enquirerEmail: string;
  listingTitle: string;
  listingSlug: string;
  replyText: string;
}) {
  const listingUrl = `${getAppBaseUrl()}/listings/${context.listingSlug}`;
  const safeName = escapeHtml(context.enquirerName);
  const safeTitle = escapeHtml(context.listingTitle);
  const safeReply = escapeHtml(context.replyText).replaceAll("\n", "<br />");

  return sendTransactionalEmail({
    to: context.enquirerEmail,
    subject: `Reply to your enquiry about ${context.listingTitle}`,
    text: `Hi ${context.enquirerName}, the lister replied to your enquiry about "${context.listingTitle}":\n\n${context.replyText}\n\nView the listing: ${listingUrl}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h1>You've got a reply</h1>
        <p>Hi ${safeName}, the lister replied to your enquiry about <strong>${safeTitle}</strong>:</p>
        <blockquote style="border-left:3px solid #0f9f8f;margin:0;padding:8px 16px;color:#374151">${safeReply}</blockquote>
        <p><a href="${escapeHtml(listingUrl)}" style="background:#0f9f8f;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none">View the listing</a></p>
      </div>
    `,
  });
}
