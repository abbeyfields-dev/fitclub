/**
 * Add a user to a club by email and club ID.
 * Use when a user (e.g. nitinp@fc.com) has no clubs because they have no ClubMembership.
 *
 * Run from backend/: npx ts-node scripts/add-user-to-club.ts <email> <clubId> [role]
 * Example: npx ts-node scripts/add-user-to-club.ts nitinp@fc.com <club-uuid> member
 * Role defaults to "member"; use "admin" or "team_lead" if needed.
 *
 * To find club IDs: psql $DATABASE_URL -c "SELECT id, name FROM \"Club\";"
 */

import prisma from '../src/config/database';

async function main() {
  const email = process.argv[2]?.trim()?.toLowerCase();
  const clubId = process.argv[3]?.trim();
  const role = (process.argv[4]?.trim() as 'admin' | 'team_lead' | 'member') || 'member';

  if (!email || !clubId) {
    console.error('Usage: npx ts-node scripts/add-user-to-club.ts <email> <clubId> [role]');
    console.error('Example: npx ts-node scripts/add-user-to-club.ts nitinp@fc.com <club-uuid> member');
    process.exit(1);
  }

  if (!['admin', 'team_lead', 'member'].includes(role)) {
    console.error('role must be one of: admin, team_lead, member');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    console.error('User not found with email:', email);
    process.exit(1);
  }

  const club = await prisma.club.findUnique({
    where: { id: clubId },
  });
  if (!club) {
    console.error('Club not found with id:', clubId);
    process.exit(1);
  }

  const existing = await prisma.clubMembership.findUnique({
    where: { userId_clubId: { userId: user.id, clubId } },
  });
  if (existing) {
    console.log('User', email, 'is already in club', club.name, 'with role', existing.role);
    return;
  }

  await prisma.clubMembership.create({
    data: { userId: user.id, clubId, role },
  });

  console.log('Added', email, 'to club', club.name, 'as', role);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
