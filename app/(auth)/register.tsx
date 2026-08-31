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
  const [focusedInput, setFocusedInput] = useState<'name' | 'email' | 'password' | null>(null);
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
        message: 'Unable to connect to Google OAuth. Please check network connection.',
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
        message: err.message || 'Failed to register with Google.',
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
          message: 'Google registration is initializing. Please tap again.',
          icon: 'info',
          confirmText: 'OK',
          onConfirm: () => setAlertConfig(null),
        });
      }
    } catch (error: any) {
      console.warn('[Register Google Error]:', error);
      setAlertConfig({
        visible: true,
        title: 'Sign Up Failed',
        message: error.message || 'Google registration was cancelled.',
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
      setAlertConfig({
        visible: true,
        title: 'Missing Fields',
        message: 'Please fill in your name, email, and password.',
        icon: 'info',
        confirmText: 'OK',
        onConfirm: () => setAlertConfig(null),
      });
      return;
    }

    if (password.length < 6) {
      setAlertConfig({
        visible: true,
        title: 'Weak Password',
        message: 'Password must be at least 6 characters long.',
        icon: 'warning',
        confirmText: 'OK',
        onConfirm: () => setAlertConfig(null),
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await register(email.trim(), password, name.trim());
      router.replace('/(tabs)');
    } catch (error: any) {
      setAlertConfig({
        visible: true,
        title: 'Registration Failed',
        message: error.message || 'Could not create account. Please try a different email.',
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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + (Platform.OS === 'ios' ? 12 : 20),
            paddingBottom: insets.bottom + 32,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
      >
        {/* Back Navigation Button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#1C1C1E" />
          <Text style={styles.backBtnText}>Back to Sign In</Text>
        </TouchableOpacity>

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

          <Text style={styles.headline}>Create Account</Text>
          <Text style={styles.subheadline}>
            Join thousands of active citizens reporting & verifying road safety hazards.
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
            <Text style={styles.dividerLabel}>OR REGISTER WITH EMAIL</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Full Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>FULL NAME</Text>
            <View style={[styles.inputWrapper, focusedInput === 'name' && styles.inputWrapperFocused]}>
              <User size={16} color={focusedInput === 'name' ? '#007AFF' : '#64748B'} style={styles.inputLeadingIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Alex Morgan"
                placeholderTextColor="#94A3B8"
                autoCapitalize="words"
                value={name}
                onChangeText={setName}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
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
            <Text style={styles.inputLabel}>PASSWORD</Text>
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
            onPress={handleRegister}
            disabled={isSubmitting || isGoogleLoading}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Create Account</Text>
                <ArrowRight size={17} color="#FFFFFF" strokeWidth={2.4} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Navigation */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.footerAction}>Sign In</Text>
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  headerSection: {
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  brandIconBox: {
    width: 40,
    height: 40,
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
