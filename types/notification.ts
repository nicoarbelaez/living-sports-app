export type NotificationType = 'like' | 'comment' | 'response' | 'community' | 'profile';

export interface Notification {
  id: string;
  type: NotificationType;
  /** Display name of the user who triggered this notification */
  actorName: string;
  actorAvatar?: string;
  /** ID of the user who triggered this notification (for profile navigation) */
  actorId?: string;
  /** Short descriptive body text */
  body: string;
  /** ISO timestamp */
  createdAt: string;
  /** Relative time string, e.g. "hace 5 min" */
  timeAgo: string;
  read: boolean;
  /** Optional: reference IDs so the user can navigate to the related content */
  postId?: string;
  communityId?: string;
}

