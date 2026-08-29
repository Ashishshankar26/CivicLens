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
  User,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-react-native';

WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { register, loginGoogle } = useAuth();
  const [name, setName] = useState('');
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
        title: 'Google Sign-Up Error',
        message: 'Unable to connect to Google OAuth. Please check your network or try email registration.',
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
      setAlertConfig({ visible: true, title: 'Google Sign-Up Error', message: error?.message || 'Failed to register with Google.', icon: 'warning', confirmText: 'OK', confirmVariant: 'danger', onConfirm: () => setAlertConfig(null) });
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
        title: 'Google Sign-Up Error',
        message: err?.message || 'Failed to complete Google OAuth registration session.',
        icon: 'warning',
        confirmText: 'OK',
        confirmVariant: 'danger',
        onConfirm: () => setAlertConfig(null),
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setAlertConfig({ visible: true, title: 'Missing Fields', message: 'Please enter your full name, email, and password.', icon: 'info', confirmText: 'OK', onConfirm: () => setAlertConfig(null) });
      return;
    }

    if (password.length < 6) {
      setAlertConfig({ visible: true, title: 'Security Requirement', message: 'Password must be at least 6 characters for account safety.', icon: 'info', confirmText: 'OK', onConfirm: () => setAlertConfig(null) });
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      router.replace('/(tabs)');
    } catch (error: any) {
      setAlertConfig({ visible: true, title: 'Registration Failed', message: error?.message || 'Unable to create account.', icon: 'warning', confirmText: 'Try Again', confirmVariant: 'danger', onConfirm: () => setAlertConfig(null) });
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
            paddingTop: insets.top + (Platform.OS === 'ios' ? 16 : 24),
            paddingBottom: insets.bottom + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Row */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={16} color="#64748B" />
          <Text style={styles.backButtonText}>Back to Sign In</Text>
        </TouchableOpacity>

        {/* Brand Header */}
        <View style={styles.headerSection}>
          <View style={styles.brandRow}>
            <View style={styles.brandIconBox}>
              <Compass size={24} color="#FFFFFF" strokeWidth={2.4} />
            </View>
            <View>
              <Text style={styles.brandName}>CivicLens</Text>
              <Text style={styles.brandTagline}>COMMUNITY CITIZEN ENROLLMENT</Text>
            </View>
          </View>

          <Text style={styles.headline}>Create Account</Text>
          <Text style={styles.subheadline}>
            Join your neighborhood network to report civic issues and verify street safety.
          </Text>
        </View>

        {/* Form Body */}
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
                <Text style={styles.googleButtonText}>Sign Up with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>OR ENROLL WITH EMAIL</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Full Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>FULL NAME</Text>
            <View style={styles.inputWrapper}>
              <User size={16} color="#64748B" style={styles.inputLeadingIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Jane Doe"
                placeholderTextColor="#94A3B8"
                autoCapitalize="words"
                value={name}
                onChangeText={setName}
              />
            </View>
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
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <Lock size={16} color="#64748B" style={styles.inputLeadingIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="At least 6 characters"
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
            onPress={handleRegister}
            disabled={isSubmitting || isGoogleLoading}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Create Citizen Account</Text>
                <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.5} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Navigation */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Already enrolled?</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.footerAction}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modern Alert Modal */}
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  headerSection: {
    marginBottom: 24,
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
    fontSize: 8.5,
    fontWeight: '800',
    color: '#0066FF',
    letterSpacing: 0.8,
  },
  headline: {
    fontSize: 30,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.7,
    marginBottom: 6,
  },
  subheadline: {
    fontSize: 13.5,
    color: '#64748B',
    lineHeight: 19,
    fontWeight: '400',
  },
  formSection: {
    gap: 15,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    ...SHADOWS.subtle,
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
    marginVertical: 2,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 48,
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
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 4,
    ...SHADOWS.small,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14.5,
    letterSpacing: -0.2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 24,
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
