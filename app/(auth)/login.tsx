import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import { MapPin, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react-native';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, loginGoogle, loginDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real Google Auth Session Provider
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '1058846613358-kla3rlhm1mgjln8cin78boo485tj23af.apps.googleusercontent.com',
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '1058846613358-kla3rlhm1mgjln8cin78boo485tj23af.apps.googleusercontent.com',
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
    redirectUri: AuthSession.makeRedirectUri({
      native: 'https://auth.expo.io/@anonymous/civiclens',
    }),
  });

  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      handleGoogleTokenSuccess(response.authentication.accessToken);
    }
  }, [response]);

  const handleGoogleTokenSuccess = async (accessToken: string) => {
    setIsSubmitting(true);
    try {
      const userInfoRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (userInfoRes.ok) {
        const data = await userInfoRes.json();
        await loginGoogle({
          name: data.name || data.email?.split('@')[0] || 'Google Citizen',
          email: data.email,
          photoUrl: data.picture,
        });
        router.replace('/(tabs)');
      } else {
        throw new Error('Could not fetch profile from Google.');
      }
    } catch (error: any) {
      Alert.alert('Google Sign-In Error', error?.message || 'Failed to authenticate with Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleButtonPress = async () => {
    setIsSubmitting(true);
    try {
      if (request) {
        const res = await promptAsync();
        if (res?.type === 'success' && res.authentication?.accessToken) {
          await handleGoogleTokenSuccess(res.authentication.accessToken);
          return;
        }
      }
    } catch (err: any) {
      console.warn('Browser prompt notice:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Sign In', 'Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Sign In', error?.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    try {
      await loginDemo();
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Demo Error', error?.message || 'Unable to start demo mode.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'ios' ? 12 : 20) }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Minimal Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MapPin size={26} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>CivicLens</Text>
          <Text style={styles.subtitle}>Community Road Intelligence</Text>
        </View>

        {/* Minimal Auth Form */}
        <View style={styles.form}>
          {/* Google Sign In */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogleButtonPress}
            disabled={!request || isSubmitting}
            activeOpacity={0.8}
          >
            <View style={styles.googleIconBox}>
              <Text style={styles.googleGText}>G</Text>
            </View>
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email Input */}
          <View style={styles.inputBox}>
            <Mail size={16} color="#94A3B8" />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputBox}>
            <Lock size={16} color="#94A3B8" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleLogin}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.primaryBtnText}>Sign In</Text>
                <ArrowRight size={16} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>

          {/* Instant Demo Link */}
          <TouchableOpacity
            style={styles.demoLink}
            onPress={handleDemoLogin}
            activeOpacity={0.7}
          >
            <Sparkles size={14} color={COLORS.primary} />
            <Text style={styles.demoLinkText}>Instant Demo Access</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logoContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...SHADOWS.subtle,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  form: {
    gap: 12,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 13,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    ...SHADOWS.subtle,
  },
  googleIconBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EA4335',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleGText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  googleBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  dividerText: {
    fontSize: 11.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '500',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.full,
    gap: 8,
    marginTop: 4,
    ...SHADOWS.small,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  demoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
    alignSelf: 'center',
  },
  demoLinkText: {
    color: COLORS.primary,
    fontSize: 12.5,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  footerText: {
    fontSize: 12.5,
    color: '#64748B',
  },
  footerLink: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
});
