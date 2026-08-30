import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { UserProfile } from '@/types/user';
import { loginWithGoogle } from './authService';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';

/**
 * Executes Google OAuth sign-in flow
 */
export async function executeGoogleAuth(): Promise<UserProfile | null> {
  try {
    const redirectUri = 'https://auth.expo.io/@ashishshankar26/civiclens';

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=token` +
      `&scope=${encodeURIComponent('openid profile email')}` +
      `&prompt=select_account`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success' && result.url) {
      const hashParams = new URLSearchParams(result.url.split('#')[1] || result.url.split('?')[1]);
      const accessToken = hashParams.get('access_token');

      if (accessToken) {
        const userInfoRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (userInfoRes.ok) {
          const googleData = await userInfoRes.json();
          return await loginWithGoogle({
            email: googleData.email,
            name: googleData.name || googleData.email.split('@')[0],
            photoUrl: googleData.picture,
          });
        }
      }
    }

    if (result.type === 'cancel' || result.type === 'dismiss') {
      return null;
    }

    return null;
  } catch (error) {
    console.warn('[Google Auth] Error during OAuth session:', error);
    return null;
  }
}
