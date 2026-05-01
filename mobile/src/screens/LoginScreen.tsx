import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';

type LoginStep = 'credentials' | 'otp';

export default function LoginScreen({ navigation }: any) {
  const auth = useAuth();
  const [step, setStep] = useState<LoginStep>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await auth.login(email.trim(), password);
      if (result === 'OTP_REQUIRED') {
        setStep('otp');
      } else if (result === true) {
        navigation.goBack();
      } else {
        setError('Invalid email or password');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.trim().length < 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const ok = await auth.verifyOTP(email.trim(), otp.trim());
      if (ok) {
        navigation.goBack();
      } else {
        setError('Invalid or expired OTP');
      }
    } catch {
      setError('OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.surface} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.logo}>⚡</Text>
          <Text style={styles.title}>
            {step === 'otp' ? 'Verify OTP' : 'Welcome Back'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'otp'
              ? `Enter the 6-digit code sent to ${email}`
              : 'Sign in to access bookmarks & more'}
          </Text>
        </View>

        {/* Error */}
        {error.length > 0 && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {step === 'credentials' ? (
          <>
            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.onSurfaceVariant}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Your password"
                  placeholderTextColor={colors.onSurfaceVariant}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  style={styles.toggleBtn}
                  onPress={() => setShowPassword((v) => !v)}
                >
                  <Text style={styles.toggleBtnText}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* OTP input */}
            <View style={styles.field}>
              <Text style={styles.label}>One-Time Password</Text>
              <TextInput
                style={[styles.input, styles.otpInput]}
                value={otp}
                onChangeText={(v) => setOtp(v.replace(/\D/g, '').slice(0, 6))}
                placeholder="● ● ● ● ● ●"
                placeholderTextColor={colors.onSurfaceVariant}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleVerifyOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>Verify OTP</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => { setStep('credentials'); setOtp(''); setError(''); }}
            >
              <Text style={styles.linkText}>← Back to login</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Register link */}
        {step === 'credentials' && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 48 },
  backBtn: {
    marginTop: 56,
    marginBottom: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  backIcon: { color: colors.white, fontSize: 18, fontWeight: '700' },
  hero: { alignItems: 'center', paddingVertical: 32 },
  logo: { fontSize: 52, marginBottom: 12 },
  title: { color: colors.white, fontSize: 28, fontWeight: '900', marginBottom: 8 },
  subtitle: { color: colors.onSurfaceVariant, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  errorBox: {
    backgroundColor: colors.error + '22',
    borderWidth: 1,
    borderColor: colors.error + '55',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: colors.error, fontSize: 13, fontWeight: '600' },
  field: { marginBottom: 16 },
  label: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.onSurface,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 },
  toggleBtn: {
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
  },
  toggleBtnText: { fontSize: 18 },
  otpInput: { textAlign: 'center', fontSize: 22, letterSpacing: 8, fontWeight: '800' },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: colors.white, fontSize: 16, fontWeight: '800' },
  linkRow: { alignItems: 'center', paddingVertical: 8 },
  linkText: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', paddingTop: 16 },
  footerText: { color: colors.onSurfaceVariant, fontSize: 14 },
  footerLink: { color: colors.primary, fontSize: 14, fontWeight: '800' },
});
