export type CompetitionStatus = 'draft' | 'active' | 'finished' | 'cancelled';
export type EntryValidationStatus = 'pending' | 'approved' | 'rejected' | 'resubmitted';

export interface Competition {
  id: string;
  groupId: string;
  createdBy: string;
  title: string;
  description: string | null;
  exerciseId: string;
  exerciseName: string;
  startDate: string;
  endDate: string;
  status: CompetitionStatus;
  createdAt: string;
}

export interface CompetitionEntry {
  id: string;
  competitionId: string;
  userId: string;
  videoUrl: string;
  prValue: number;
  description: string | null;
  validationStatus: EntryValidationStatus;
  approvalsCount: number;
  rejectionsCount: number;
  createdAt: string;
  user?: {
    username: string;
    avatarUrl: string | null;
  };
}

export interface RankingEntry {
  userId: string;
  username: string;
  avatarUrl: string | null;
  points: number;
}

export function mapCompetition(row: any): Competition {
  return {
    id: row.id,
    groupId: row.group_id,
    createdBy: row.created_by,
    title: row.title,
    description: row.description ?? null,
    exerciseId: row.exercise_id,
    exerciseName: row.exercises?.name ?? '',
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function mapEntry(row: any): CompetitionEntry {
  return {
    id: row.id,
    competitionId: row.competition_id,
    userId: row.user_id,
    videoUrl: row.video_url,
    prValue: Number(row.pr_value),
    description: row.description ?? null,
    validationStatus: row.validation_status,
    approvalsCount: row.approvals_count ?? 0,
    rejectionsCount: row.rejections_count ?? 0,
    createdAt: row.created_at,
    user: row.profiles
      ? { username: row.profiles.username, avatarUrl: row.profiles.avatar_url }
      : undefined,
  };
}
