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
import { MapPin, User, Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react-native';

WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { register, loginGoogle } = useAuth();
  const [name, setName] = useState('');
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
      Alert.alert('Google Sign-Up Error', error?.message || 'Failed to register with Google.');
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

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Sign Up', 'Please enter your name, email, and password.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password Length', 'Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Registration Failed', error?.message || 'Unable to create account.');
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
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={16} color="#64748B" />
          <Text style={styles.backText}>Sign In</Text>
        </TouchableOpacity>

        {/* Minimal Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MapPin size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join your neighborhood road community</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Google Button */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogleButtonPress}
            disabled={!request || isSubmitting}
            activeOpacity={0.8}
          >
            <View style={styles.googleIconBox}>
              <Text style={styles.googleGText}>G</Text>
            </View>
            <Text style={styles.googleBtnText}>Sign up with Google</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Full Name */}
          <View style={styles.inputBox}>
            <User size={16} color="#94A3B8" />
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="#94A3B8"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Email Address */}
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

          {/* Password */}
          <View style={styles.inputBox}>
            <Lock size={16} color="#94A3B8" />
            <TextInput
              style={styles.input}
              placeholder="Password (min. 6 characters)"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleRegister}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.primaryBtnText}>Create Account</Text>
                <ArrowRight size={16} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.footerLink}>Sign In</Text>
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
    gap: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  header: {
    alignItems: 'center',
    marginBottom: 4,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    ...SHADOWS.subtle,
  },
  title: {
    fontSize: 22,
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
