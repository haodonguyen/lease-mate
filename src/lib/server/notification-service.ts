import { prisma } from "./db";

export async function queueNotification(input: {
  type: string;
  recipient: string;
  subject: string;
  body: string;
  userId?: string;
}) {
  const notification = await prisma.notification.create({
    data: {
      ...input,
      channel: "console",
      status: "SENT",
    },
  });

  console.info(`[LeaseMate notification] ${notification.subject} -> ${notification.recipient}`);
  return notification;
}
