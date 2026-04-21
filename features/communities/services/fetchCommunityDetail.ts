import { supabase } from '@/lib/supabase';

export interface GroupDetail {
  id: string;
  name: string;
  image_url: string | null;
  emoji: string | null;
  members_count: number;
  description: string | null;
}

export async function fetchCommunityDetail(id: string): Promise<GroupDetail | null> {
  const { data } = await supabase
    .from('groups')
    .select('id, name, image_url, emoji, members_count, description')
    .eq('id', id)
    .single();

  return data ?? null;
}
