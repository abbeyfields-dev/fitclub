import prisma from '../config/database';

/**
 * Register or update push token for the current user.
 * Replaces any existing token for the same user+token (upsert by unique).
 */
export async function upsertPushToken(userId: string, token: string, platform?: string) {
  const trimmed = token.trim();
  if (!trimmed) throw new Error('Token is required.');

  await prisma.pushToken.upsert({
    where: {
      userId_token: { userId, token: trimmed },
    },
    create: { userId, token: trimmed, platform: platform ?? null },
    update: { platform: platform ?? undefined },
  });
  return { success: true };
}
