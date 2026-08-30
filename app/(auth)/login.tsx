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
  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState<ModernAlertConfig | null>(null);

  const redirectUri = AuthSession.makeRedirectUri({
    native: 'https://auth.expo.io/@ashishshankar26/civiclens',
  });

  // Real Google Auth Session Provider
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
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
        message: 'Unable to connect to Google OAuth. Please try again or use email sign in.',
        icon: 'warning',
        confirmText: 'OK',
        confirmVariant: 'danger',
        onConfirm: () => setAlertConfig(null),
      });
    }
  }, [response]);

  const handleGoogleTokenSuccess = async (token: string) => {
    setIsGoogleLoading(true);
    try {
      const userInfoRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const gData = await userInfoRes.json();
      await loginGoogle({ email: gData.email || 'user@gmail.com', name: gData.name || 'Google User', photoUrl: gData.picture });
      router.replace('/(tabs)');
    } catch (err: any) {
      setAlertConfig({
        visible: true,
        title: 'Authentication Failed',
        message: err.message || 'Failed to authenticate with Google.',
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
      const userObj = await executeGoogleAuth();
      if (userObj) {
        router.replace('/(tabs)');
        return;
      }
      if (request) {
        await promptAsync();
      } else {
        setAlertConfig({
          visible: true,
          title: 'Google Auth Unavailable',
          message: 'Google Sign-In is initializing. Please tap again in a moment.',
          icon: 'info',
          confirmText: 'OK',
          onConfirm: () => setAlertConfig(null),
        });
      }
    } catch (error: any) {
      console.warn('[Login Google Error]:', error);
      setAlertConfig({
        visible: true,
        title: 'Sign In Failed',
        message: error.message || 'Google Sign-In was cancelled or failed.',
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
        message: 'Please enter your email and password to sign in.',
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
        title: 'Sign In Failed',
        message: error.message || 'Invalid credentials. Please verify your email and password.',
        icon: 'warning',
        confirmText: 'Try Again',
        confirmVariant: 'danger',
        onConfirm: () => setAlertConfig(null),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignIn = async () => {
    setIsSubmitting(true);
    try {
      await loginDemo();
      router.replace('/(tabs)');
    } catch (error: any) {
      setAlertConfig({
        visible: true,
        title: 'Demo Access Error',
        message: 'Unable to start demo session.',
        icon: 'warning',
        confirmText: 'OK',
        onConfirm: () => setAlertConfig(null),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + (Platform.OS === 'ios' ? 16 : 24),
            paddingBottom: insets.bottom + 32,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
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

          <Text style={styles.headline}>Sign In</Text>
          <Text style={styles.subheadline}>
            Access community road reports, live civic alerts, and AI hazard tools.
          </Text>
        </View>

        {/* Apple Structured Auth Card */}
        <View style={styles.cardFormContainer}>
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
            <Text style={styles.dividerLabel}>OR SIGN IN WITH EMAIL</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <View style={[styles.inputWrapper, focusedInput === 'email' && styles.inputWrapperFocused]}>
              <Mail size={16} color={focusedInput === 'email' ? '#007AFF' : '#64748B'} style={styles.inputLeadingIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="name@example.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <View style={styles.passwordLabelRow}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
            </View>
            <View style={[styles.inputWrapper, focusedInput === 'password' && styles.inputWrapperFocused]}>
              <Lock size={16} color={focusedInput === 'password' ? '#007AFF' : '#64748B'} style={styles.inputLeadingIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
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
                <ArrowRight size={17} color="#FFFFFF" strokeWidth={2.4} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Demo Fast Track Card */}
        <TouchableOpacity
          style={styles.demoCard}
          onPress={handleDemoSignIn}
          disabled={isSubmitting || isGoogleLoading}
          activeOpacity={0.85}
        >
          <View style={styles.demoIconCircle}>
            <ShieldCheck size={18} color="#007AFF" />
          </View>
          <View style={styles.demoTextCol}>
            <Text style={styles.demoTitle}>Instant Citizen Demo</Text>
            <Text style={styles.demoSubtitle}>Explore map alerts & AI analytics instantly</Text>
          </View>
          <ArrowRight size={16} color="#007AFF" />
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.footerAction}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Alert Modal */}
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
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  headerSection: {
    marginBottom: 20,
    marginTop: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  brandIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.4,
  },
  brandTagline: {
    fontSize: 9,
    fontWeight: '800',
    color: '#007AFF',
    letterSpacing: 1,
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  subheadline: {
    fontSize: 13.5,
    color: '#8E8E93',
    lineHeight: 19,
    fontWeight: '400',
  },
  cardFormContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(210, 210, 215, 0.6)',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
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
    backgroundColor: '#E5E5EA',
  },
  dividerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.6,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#3C3C4399',
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
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    height: 48,
  },
  inputWrapperFocused: {
    borderColor: '#007AFF',
    backgroundColor: '#FFFFFF',
  },
  inputLeadingIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#1C1C1E',
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
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 4,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
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
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(210, 210, 215, 0.6)',
    gap: 12,
    marginTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  demoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBF5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoTextCol: {
    flex: 1,
  },
  demoTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  demoSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  footerAction: {
    fontSize: 13,
    fontWeight: '800',
    color: '#007AFF',
  },
});
