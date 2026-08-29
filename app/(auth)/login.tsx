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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { useAuth } from '@/contexts/AuthContext';
import { executeGoogleAuth } from '@/services/auth/googleAuthService';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import { GoogleIcon } from '@/components/ui/GoogleIcon';
import { ModernAlertModal, ModernAlertConfig } from '@/components/ui/ModernAlertModal';
import {
  Compass,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react-native';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, loginGoogle, loginDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState<ModernAlertConfig | null>(null);

  const redirectUri = AuthSession.makeRedirectUri({
    native: 'https://auth.expo.io/@ashishshankar26/civiclens',
  });

  // Real Google Auth Session Provider
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '207567085375-5f9tgbkigp9mm8blqjf116bh6lu8719r.apps.googleusercontent.com',
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '207567085375-5f9tgbkigp9mm8blqjf116bh6lu8719r.apps.googleusercontent.com',
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '207567085375-5f9tgbkigp9mm8blqjf116bh6lu8719r.apps.googleusercontent.com',
    scopes: ['openid', 'profile', 'email'],
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      handleGoogleTokenSuccess(response.authentication.accessToken);
    } else if (response?.type === 'error') {
      setAlertConfig({
        visible: true,
        title: 'Google Sign-In Error',
        message: 'Unable to connect to Google OAuth. Please check your network or try email login.',
        icon: 'warning',
        confirmText: 'OK',
        confirmVariant: 'danger',
        onConfirm: () => setAlertConfig(null),
      });
    }
  }, [response]);

  const handleGoogleTokenSuccess = async (accessToken: string) => {
    setIsGoogleLoading(true);
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
      setAlertConfig({
        visible: true,
        title: 'Google Sign-In Error',
        message: error?.message || 'Failed to authenticate with Google.',
        icon: 'warning',
        confirmText: 'OK',
        confirmVariant: 'danger',
        onConfirm: () => setAlertConfig(null),
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleButtonPress = async () => {
    setIsGoogleLoading(true);
    try {
      const userProfile = await executeGoogleAuth();
      if (userProfile) {
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      console.warn('[Google Auth Error]:', err);
      setAlertConfig({
        visible: true,
        title: 'Google Sign-In Error',
        message: err?.message || 'Failed to complete Google OAuth sign-in session.',
        icon: 'warning',
        confirmText: 'OK',
        confirmVariant: 'danger',
        onConfirm: () => setAlertConfig(null),
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setAlertConfig({
        visible: true,
        title: 'Missing Fields',
        message: 'Please enter your email and password to continue.',
        icon: 'info',
        confirmText: 'OK',
        onConfirm: () => setAlertConfig(null),
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (error: any) {
      setAlertConfig({
        visible: true,
        title: 'Authentication Failed',
        message: error?.message || 'Invalid email or password. Please try again.',
        icon: 'warning',
        confirmText: 'Try Again',
        confirmVariant: 'danger',
        onConfirm: () => setAlertConfig(null),
      });
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
      setAlertConfig({
        visible: true,
        title: 'Demo Error',
        message: error?.message || 'Unable to start demo mode.',
        icon: 'warning',
        confirmText: 'OK',
        confirmVariant: 'danger',
        onConfirm: () => setAlertConfig(null),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + (Platform.OS === 'ios' ? 24 : 32),
            paddingBottom: insets.bottom + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Header */}
        <View style={styles.headerSection}>
          <View style={styles.brandRow}>
            <View style={styles.brandIconBox}>
              <Compass size={24} color="#FFFFFF" strokeWidth={2.4} />
            </View>
            <View>
              <Text style={styles.brandName}>CivicLens</Text>
              <Text style={styles.brandTagline}>ROAD SAFETY NETWORK</Text>
            </View>
          </View>

          {/* Decorative Accent Line */}
          <View style={styles.accentLine} />

          <Text style={styles.headline}>Sign In</Text>
          <Text style={styles.subheadline}>
            Access community road reports, live civic alerts, and verification tools.
          </Text>
        </View>

        {/* Auth Body */}
        <View style={styles.formSection}>
          {/* Official Google Button */}
          <TouchableOpacity
            style={[styles.googleButton, (!request || isGoogleLoading) && styles.buttonDisabled]}
            onPress={handleGoogleButtonPress}
            disabled={!request || isGoogleLoading || isSubmitting}
            activeOpacity={0.8}
          >
            {isGoogleLoading ? (
              <ActivityIndicator size="small" color="#475569" />
            ) : (
              <>
                <GoogleIcon size={18} />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>OR CONTINUE WITH EMAIL</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <View style={styles.inputWrapper}>
              <Mail size={16} color="#64748B" style={styles.inputLeadingIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="name@example.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <View style={styles.passwordLabelRow}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
            </View>
            <View style={styles.inputWrapper}>
              <Lock size={16} color="#64748B" style={styles.inputLeadingIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <EyeOff size={16} color="#64748B" />
                ) : (
                  <Eye size={16} color="#64748B" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isSubmitting || isGoogleLoading}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Sign In</Text>
                <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.5} />
              </>
            )}
          </TouchableOpacity>

          {/* Demo Account Access Card */}
          <TouchableOpacity
            style={styles.demoCard}
            onPress={handleDemoLogin}
            disabled={isSubmitting || isGoogleLoading}
            activeOpacity={0.75}
          >
            <View style={styles.demoAccentStripe} />
            <View style={styles.demoIconCircle}>
              <ShieldCheck size={16} color={COLORS.primary} strokeWidth={2.2} />
            </View>
            <View style={styles.demoTextCol}>
              <Text style={styles.demoTitle}>Instant Demo Account</Text>
              <Text style={styles.demoSubtitle}>Explore with preloaded sample reports</Text>
            </View>
            <ArrowRight size={14} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Footer Navigation */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>New to CivicLens?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.footerAction}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modern Alert Modal (replaces native Alert.alert) */}
      {alertConfig && (
        <ModernAlertModal
          {...alertConfig}
          visible={Boolean(alertConfig)}
          onConfirm={alertConfig.onConfirm || (() => setAlertConfig(null))}
          onCancel={alertConfig.onCancel || (() => setAlertConfig(null))}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFC',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 26,
    justifyContent: 'center',
  },
  headerSection: {
    marginBottom: 28,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  brandIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0066FF',
    letterSpacing: 1,
  },
  accentLine: {
    height: 3,
    width: 40,
    borderRadius: 1.5,
    backgroundColor: COLORS.primary,
    marginBottom: 18,
    opacity: 0.6,
  },
  headline: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  subheadline: {
    fontSize: 14.5,
    color: '#64748B',
    lineHeight: 21,
    fontWeight: '400',
  },
  formSection: {
    gap: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    ...SHADOWS.small,
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    letterSpacing: -0.2,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.6,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 50,
    ...SHADOWS.subtle,
  },
  inputLeadingIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
    height: '100%',
  },
  eyeBtn: {
    padding: 4,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 14,
    gap: 8,
    marginTop: 4,
    ...SHADOWS.medium,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: -0.2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    marginTop: 2,
    ...SHADOWS.subtle,
    overflow: 'hidden',
    position: 'relative',
  },
  demoAccentStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  demoIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  demoTextCol: {
    flex: 1,
  },
  demoTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  demoSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 28,
  },
  footerText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  footerAction: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
});
