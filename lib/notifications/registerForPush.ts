import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';

export async function registerForPushNotifications(userId: string): Promise<string | null> {
  try {
    const Notifications = await import('expo-notifications');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? undefined;
    const { data: tokenData } = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData;

    await supabase.from('profiles').update({ expo_push_token: token }).eq('id', userId);
    return token;
  } catch (error) {
    console.log('Push notifications setup failed (expected in dev-client):', error);
    return null;
  }
}
