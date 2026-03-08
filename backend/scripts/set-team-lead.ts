/**
 * Set one user as team lead for their team in a round (and clear isLeader for other members).
 * Use when TeamMembership.isLeader is out of sync.
 *
 * Run from backend/: npx ts-node scripts/set-team-lead.ts <userEmail> <roundId>
 * Example: npx ts-node scripts/set-team-lead.ts nitinp@fc.com 4
 *
 * To find roundId: psql $DATABASE_URL -c "SELECT id, name, \"clubId\" FROM \"Round\" WHERE status = 'active';"
 */

import prisma from '../src/config/database';

async function main() {
  const email = process.argv[2]?.trim()?.toLowerCase();
  const roundId = process.argv[3]?.trim();

  if (!email || !roundId) {
    console.error('Usage: npx ts-node scripts/set-team-lead.ts <userEmail> <roundId>');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error('User not found:', email);
    process.exit(1);
  }

  const membership = await prisma.teamMembership.findUnique({
    where: { userId_roundId: { userId: user.id, roundId } },
    include: { Team: true },
  });
  if (!membership) {
    console.error('User is not in a team for this round.');
    process.exit(1);
  }

  // Clear isLeader for all other members of this team
  await prisma.teamMembership.updateMany({
    where: { teamId: membership.teamId, roundId },
    data: { isLeader: false },
  });

  // Set this user as leader
  await prisma.teamMembership.update({
    where: { userId_roundId: { userId: user.id, roundId } },
    data: { isLeader: true },
  });

  console.log(`Set ${email} as team lead for team "${membership.Team.name}" in round ${roundId}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
