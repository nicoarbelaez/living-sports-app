import { handleCors } from '../_shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { createSupabaseClient, extractBearerToken } from '../_shared/supabase-client.ts';

interface RedeemBody {
  token: string;
}

interface GroupInvite {
  id: string;
  group_id: string;
  channel: string;
  expires_at: string;
  used_count: number;
  max_uses: number;
}

export async function handler(req: Request): Promise<Response> {
  const preflight = handleCors(req);
  if (preflight) return preflight;

  try {
    const authHeader = req.headers.get('Authorization');
    const token = extractBearerToken(authHeader);
    const supabase = createSupabaseClient(authHeader!);

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) throw new Error('Usuario no autenticado.');
    const userId = userData.user.id;

    const body: RedeemBody = await req.json();
    const inviteToken = body.token?.trim();
    if (!inviteToken) throw new Error('token es requerido.');

    // Find invite by token (UUID cast handled by Postgres)
    const { data: invite, error: inviteError } = await supabase
      .from('group_invites')
      .select('id, group_id, channel, expires_at, used_count, max_uses')
      .eq('token', inviteToken)
      .single<GroupInvite>();

    if (inviteError || !invite) throw new Error('Invitación no encontrada o inválida.');

    // Validate expiry
    if (new Date(invite.expires_at) < new Date()) throw new Error('La invitación ha expirado.');

    // Validate max uses
    if (invite.used_count >= invite.max_uses) throw new Error('Esta invitación ya alcanzó el límite de usos.');

    // Check user not already member
    const { data: existing } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', invite.group_id)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) throw new Error('Ya eres miembro de esta comunidad.');

    // Add user as member
    const { error: memberError } = await supabase.from('group_members').insert({
      group_id: invite.group_id,
      user_id: userId,
      role: 'member',
      status: 'active',
    });

    if (memberError) throw new Error(memberError.message ?? 'No se pudo unir a la comunidad.');

    // Increment used_count
    await supabase
      .from('group_invites')
      .update({ used_count: invite.used_count + 1 })
      .eq('id', invite.id);

    // Record redemption
    await supabase.from('group_invite_redemptions').insert({
      invite_id: invite.id,
      user_id: userId,
    });

    return jsonResponse({ message: 'Invitación canjeada exitosamente.', group_id: invite.group_id });
  } catch (error) {
    return errorResponse(error);
  }
}

Deno.serve(handler);
