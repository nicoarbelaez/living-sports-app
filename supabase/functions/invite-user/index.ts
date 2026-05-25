import { handleCors } from '../_shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { authenticateUser } from '../_shared/auth.ts';

interface InviteBody {
  group_id: string;
  channel: 'link' | 'nickname';
  target_username?: string;
}

export async function handler(req: Request): Promise<Response> {
  const preflight = handleCors(req);
  if (preflight) return preflight;

  try {
    const authHeader = req.headers.get('Authorization');
    const { userId, supabase } = await authenticateUser(authHeader, { request: req });

    const body: InviteBody = await req.json();
    const groupId = body.group_id?.trim();
    const channel = body.channel;
    const targetUsername = body.target_username?.trim();

    if (!groupId) throw new Error('group_id es requerido.');
    if (!channel || !['link', 'nickname'].includes(channel))
      throw new Error("channel debe ser 'link' o 'nickname'.");
    if (channel === 'nickname' && !targetUsername)
      throw new Error('target_username es requerido para channel=nickname.');

    // Validate user is owner
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id')
      .eq('id', groupId)
      .eq('owner_id', userId)
      .single();

    if (groupError || !group) throw new Error('No tienes permiso para invitar a esta comunidad.');

    let inviteeId: string | null = null;
    if (channel === 'nickname' && targetUsername) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', targetUsername)
        .single();

      if (profileError || !profile) throw new Error(`Usuario '${targetUsername}' no encontrado.`);
      inviteeId = profile.id;
    }

    // Expires in 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: invite, error: inviteError } = await supabase
      .from('group_invites')
      .insert({
        group_id: groupId,
        created_by: userId,
        channel,
        invitee_id: inviteeId,
        expires_at: expiresAt,
      })
      .select('id, token, group_id, channel, expires_at')
      .single();

    if (inviteError || !invite) {
      throw new Error(inviteError?.message ?? 'No se pudo crear la invitación.');
    }

    return jsonResponse({ invite });
  } catch (error) {
    return errorResponse(error);
  }
}

Deno.serve(handler);
