# Membership rules (enforced in code)

- **Multiple clubs:** A user can be a member of multiple clubs (multiple `ClubMembership` rows per user). Enforced by schema: `@@unique([userId, clubId])` allows many memberships per user, one per club.

- **Multiple teams in a club (over time):** A user can be in multiple teams within the same club across different rounds. Each round can have a different team assignment. Enforced by storing `roundId` on `TeamMembership` and allowing multiple `TeamMembership` rows per user (for different rounds).

- **One team per club per round:** For a given round in a club, a user can be in only one team. Enforced by:
  - **Schema:** `TeamMembership` has `@@unique([userId, roundId])` (round is per club, so this is per club per round).
  - **Service:** `TeamService.addMemberToTeam` checks for an existing membership for `(userId, roundId)` before creating and returns a clear validation error if the user is already on a team for that round.

These rules are implemented in `prisma/schema.prisma` and `src/services/team.service.ts`.
