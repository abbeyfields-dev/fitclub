export type TeamMember = {
  id: string;
  userId?: string;
  name: string;
  avatar?: string | null;
  points: number;
  /** 0–100, share of team total */
  contributionPercent: number;
  isCurrentUser?: boolean;
  /** From TeamMembership.isLeader; only one member per team should be lead. */
  isTeamLead?: boolean;
};

export type TeamDetail = {
  id: string;
  name: string;
  rank: number;
  totalPoints: number;
  members: TeamMember[];
};
