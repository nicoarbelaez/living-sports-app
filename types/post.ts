import { Tables } from "../database.types";

export type Media = {
  url: string;
  type: 'image' | 'video';
};

export interface Post {
  id: string;
  user: string;
  time: string; // Relative time (e.g. "Hace 2 min")
  createdAt: string; // ISO timestamp
  avatar: string;
  media: Media[];
  text: string;
}

// Helper to convert DB Profile to UI Name
export function getProfileFullName(profile: Partial<Tables<"profiles">> | null) {
  if (!profile) return "Atleta";
  const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  return name || profile.username || "Atleta";
}
